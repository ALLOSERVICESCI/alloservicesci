import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';

const QUICK_PROMPTS: string[] = [
  "Rédige une demande d’attestation de travail adressée à mon employeur.",
  "Rédige une lettre pour demander un extrait de naissance à la mairie du Plateau.",
  "Écris un courrier de réclamation à la CIE suite à une coupure prolongée.",
  "Écris un courrier de réclamation à la SODECI pour une fuite d’eau non réparée.",
  "Explique les étapes pour renouveler la CNI (ONECI) et les pièces nécessaires.",
  "Donne les étapes pour créer et activer un compte e-Impôts (DGI).",
  "Rédige une lettre de motivation pour un poste d’assistant comptable à Abidjan.",
  "Rédige une lettre de demande de stage (niveau Licence) dans une entreprise à Cocody.",
  "Écris un CV simple (1 page) pour un technicien réseaux débutant.",
  "Donne la liste des pièces pour s’inscrire au BAC (DECO) et les échéances clés.",
  "Donne la procédure pour signaler une panne d’électricité à la CIE (numéros, liens).",
  "Donne la procédure pour signaler une fuite d’eau à la SODECI (numéros, liens).",
  "Propose un modèle de message WhatsApp pour prévenir le voisinage d’une inondation.",
  "Liste les vaccins de routine pour enfants selon le PNVSI (rappel succinct).",
  "Rédige une alerte \"Embouteillage important à Cocody Riviera 2, évitez la zone\" (courte et claire).",
  "Rédige une alerte \"Accident sur le Bd Latrille, secours contactés, prudence\" (ton neutre).",
  "Résume ce texte en 5 points clés (colle le texte ensuite).",
  "Reformule ce paragraphe en français simple (colle le texte ensuite).",
  "Traduis ce message du français vers l’anglais (colle le texte ensuite).",
];

// Simple message type
type Msg = { id: string; role: 'user' | 'assistant' | 'system'; content: string; ts: number };

const IA_DOWN_MSG = 'Service IA indisponible. Réessayez plus tard.';
const STORAGE_RECENTS = 'ai_quick_prompts_recent';
const MAX_RECENTS = 10;

export default function ChatAIA() {
  const { user } = useAuth();
  const isPremium = (user as any)?.is_premium === true;
  const router = useRouter();

  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 'welcome',
      role: 'assistant',
      ts: Date.now(),
      content: "Bonjour, je suis Allô IA — l'assistant IA d'Allô Services CI. Posez‑moi vos questions en lien avec la Côte d'Ivoire ou demandez un document (CV, lettre, ordre de mission…).",
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [temperature, setTemperature] = useState(0.5);
  const [recents, setRecents] = useState<string[]>([]);
  const listRef = useRef<FlatList>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_RECENTS);
        if (raw) setRecents(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  const pushRecent = async (prompt: string) => {
    try {
      const next = [prompt, ...recents.filter((p) => p !== prompt)].slice(0, MAX_RECENTS);
      setRecents(next);
      await AsyncStorage.setItem(STORAGE_RECENTS, JSON.stringify(next));
    } catch {}
  };

  const scrollToEnd = () => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);

  const pushAssistant = (content: string) => {
    const msg: Msg = { id: String(Date.now() + Math.random()), role: 'assistant', content, ts: Date.now() };
    setMessages((prev) => [...prev, msg]);
  };

  const copyMessage = async (text: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        Alert.alert('Copié', 'Le contenu a été copié dans le presse‑papier.');
      } else {
        Alert.alert('Copié', 'Le contenu a été copié dans le presse‑papier.');
      }
    } catch (e) {}
  };

  const adjustTemp = (delta: number) => {
    setTemperature((prev) => {
      const next = Math.max(0, Math.min(2, parseFloat((prev + delta).toFixed(1))));
      return next;
    });
  };

  const stopStreaming = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsStreaming(false);
  };

  const sendText = async (text: string) => {
    const content = text.trim();
    if (!content || sending || isStreaming) return;
    setSending(true);
    const userMsg: Msg = { id: String(Date.now()), role: 'user', content, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    await pushRecent(content);

    try {
      const ok = await tryStream([...messages, userMsg]);
      if (!ok) {
        await tryComplete([...messages, userMsg]);
      }
    } catch (e) {
      pushAssistant('Désolé, une erreur est survenue. Réessayez dans un instant.');
    } finally {
      setSending(false);
      scrollToEnd();
    }
  };

  const send = async () => sendText(input);

  const tryStream = async (conv: Msg[]): Promise<boolean> => {
    try {
      setIsStreaming(true);
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      const resp = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({
          messages: conv.map(m => ({ role: m.role, content: m.content })),
          stream: true,
          temperature: temperature,
          max_tokens: 1000,
        }),
      });

      if (!resp.ok) {
        setIsStreaming(false);
        abortRef.current = null;
        if (resp.status >= 500) { pushAssistant(IA_DOWN_MSG); return true; }
        return false;
      }
      if (!resp.body) { setIsStreaming(false); abortRef.current = null; return false; }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      const asst: Msg = { id: String(Date.now() + 2), role: 'assistant', content: '', ts: Date.now() + 2 };
      setMessages((prev) => [...prev, asst]);

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') { setIsStreaming(false); abortRef.current = null; return true; }
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) { asst.content = IA_DOWN_MSG; setMessages((prev) => prev.map(m => m.id === asst.id ? { ...m, content: asst.content } : m)); setIsStreaming(false); abortRef.current = null; return true; }
              if (parsed.content) { asst.content += parsed.content; setMessages((prev) => prev.map(m => m.id === asst.id ? { ...m, content: asst.content } : m)); }
            } catch {}
          }
        }
      }
      setIsStreaming(false); abortRef.current = null; return true;
    } catch (e: any) {
      setIsStreaming(false); abortRef.current = null; if (e?.name === 'AbortError') { return true; } return false;
    }
  };

  const tryComplete = async (conv: Msg[]) => {
    try {
      const resp = await fetch('/api/ai/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conv.map(m => ({ role: m.role, content: m.content })), stream: false, temperature: temperature, max_tokens: 1000 }),
      });
      if (!resp.ok) { if (resp.status >= 500) { pushAssistant(IA_DOWN_MSG); return; } let detail = ''; try { const err = await resp.json(); detail = err?.detail || ''; } catch {} pushAssistant(detail || 'Une erreur est survenue.'); return; }
      const data = await resp.json(); const content = data?.content || data?.detail || ''; pushAssistant(content || '');
    } catch (e) { pushAssistant('Une erreur est survenue.'); }
  };

  const renderItem = ({ item }: { item: Msg }) => {
    const isUser = item.role === 'user';
    return (
      <TouchableOpacity activeOpacity={0.8} onLongPress={() => !isUser && item.content ? copyMessage(item.content) : undefined}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.bubbleText, isUser ? styles.userText : styles.assistantText]}>{item.content}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!isPremium) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAF9' }}>
        <View style={styles.lockWrap}>
          <Ionicons name="lock-closed" size={28} color="#0A7C3A" />
          <Text style={styles.lockTitle}>Allô IA — réservé aux membres Premium</Text>
          <Text style={styles.lockDesc}>Abonnez‑vous à Premium pour accéder à Allô IA et profiter des réponses en français adaptées à la Côte d’Ivoire.</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/subscribe')} style={styles.subscribeBtn}>
            <Text style={styles.subscribeBtnText}>Devenir Premium</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAF9' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="chatbubble-ellipses" size={22} color="#0A7C3A" />
            <Text style={styles.headerTitle}>Allô IA</Text>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.tempPill}>
              <TouchableOpacity onPress={() => setTemperature(Math.max(0, parseFloat((temperature - 0.1).toFixed(1))))} style={styles.tempBtn}>
                <Ionicons name="remove" size={16} color="#0A7C3A" />
              </TouchableOpacity>
              <Text style={styles.tempText}>Temp. {temperature.toFixed(1)}</Text>
              <TouchableOpacity onPress={() => setTemperature(Math.min(2, parseFloat((temperature + 0.1).toFixed(1))))} style={styles.tempBtn}>
                <Ionicons name="add" size={16} color="#0A7C3A" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Prompts récents */}
        {recents.length > 0 && (
          <View style={{ paddingHorizontal: 12, paddingTop: 10 }}>
            <Text style={styles.sectionTitle}>Récents</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 6 }}>
              {recents.map((p, idx) => (
                <TouchableOpacity key={`r_${idx}`} onPress={() => sendText(p)} style={styles.quickBtn} accessibilityRole="button">
                  <Text style={styles.quickBtnText} numberOfLines={1}>{p}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Quick prompts */}
        <View style={{ paddingHorizontal: 12, paddingTop: 10 }}>
          <Text style={styles.sectionTitle}>Exemples</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 6 }}>
            {QUICK_PROMPTS.map((p, idx) => (
              <TouchableOpacity key={idx} onPress={() => sendText(p)} style={styles.quickBtn} accessibilityRole="button">
                <Text style={styles.quickBtnText} numberOfLines={1}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* List */}
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          onContentSizeChange={scrollToEnd}
        />

        {/* Typing indicator */}
        {(sending || isStreaming) && (
          <View style={styles.typingRow}>
            <ActivityIndicator size="small" color="#0A7C3A" />
            <Text style={styles.typingText}>Allô IA est en train d'écrire…</Text>
          </View>
        )}

        {/* Composer */}
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Écrivez votre message (contexte CI uniquement)…"
            placeholderTextColor="#8AA39B"
            multiline
          />

          {isStreaming ? (
            <TouchableOpacity onPress={stopStreaming} style={[styles.stopBtn]} disabled={!isStreaming}>
              <Ionicons name="stop" size={18} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={send} style={[styles.sendBtn, (sending) && { opacity: 0.6 }]} disabled={sending}>
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
  headerTitle: { marginLeft: 8, fontSize: 16, fontWeight: '800', color: '#0A7C3A' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  tempPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F1', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#DAE7DA' },
  tempBtn: { paddingHorizontal: 6, paddingVertical: 2 },
  tempText: { fontSize: 12, fontWeight: '700', color: '#0A7C3A' },
  bubble: { maxWidth: '85%', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 10 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#DCFCE7' },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8F0E8' },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  userText: { color: '#0F5132' },
  assistantText: { color: '#1F2937' },
  typingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6 },
  typingText: { marginLeft: 8, color: '#4B5563', fontSize: 13 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E5E5' },
  input: { flex: 1, minHeight: 40, maxHeight: 120, borderWidth: 1, borderColor: '#E8F0E8', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, backgroundColor: '#F8FAF9' },
  sendBtn: { backgroundColor: '#0A7C3A', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12 },
  stopBtn: { backgroundColor: '#EF4444', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12 },

  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#0A7C3A', marginBottom: 4 },
  quickBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8F0E8', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 16, marginRight: 8, maxWidth: 280 },
  quickBtnText: { color: '#0F5132', fontWeight: '600' },

  lockWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  lockTitle: { marginTop: 8, fontSize: 18, fontWeight: '800', color: '#0A7C3A', textAlign: 'center' },
  lockDesc: { marginTop: 6, color: '#334155', textAlign: 'center' },
  subscribeBtn: { marginTop: 16, backgroundColor: '#0A7C3A', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  subscribeBtnText: { color: '#fff', fontWeight: '800' },
});