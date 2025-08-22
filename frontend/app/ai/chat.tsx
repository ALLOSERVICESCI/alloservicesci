import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Simple message type
type Msg = { id: string; role: 'user' | 'assistant' | 'system'; content: string; ts: number };

const IA_DOWN_MSG = 'Service IA indisponible. Réessayez plus tard.';

export default function ChatAIA() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 'welcome',
      role: 'assistant',
      ts: Date.now(),
      content: "Bonjour, je suis Allô IA — l’assistant IA d’Allô Services CI. Posez‑moi vos questions en lien avec la Côte d’Ivoire ou demandez un document (CV, lettre, ordre de mission…).",
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const pushAssistant = (content: string) => {
    const msg: Msg = { id: String(Date.now() + Math.random()), role: 'assistant', content, ts: Date.now() };
    setMessages((prev) => [...prev, msg]);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    const userMsg: Msg = { id: String(Date.now()), role: 'user', content: text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      // Try streaming first; if it fails, fallback to non-streaming
      const ok = await tryStream([...messages, userMsg]);
      if (!ok) {
        await tryComplete([...messages, userMsg]);
      }
    } catch (e) {
      pushAssistant('Désolé, une erreur est survenue. Réessayez dans un instant.');
    } finally {
      setSending(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  const tryStream = async (conv: Msg[]): Promise<boolean> => {
    try {
      const resp = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conv.map(m => ({ role: m.role, content: m.content })),
          stream: true,
          temperature: 0.5,
          max_tokens: 1000,
        }),
      });

      if (!resp.ok) {
        if (resp.status >= 500) {
          pushAssistant(IA_DOWN_MSG);
          return true; // handled with explicit message; do not fallback
        }
        return false; // allow fallback for non-500
      }
      if (!resp.body) return false;

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
            if (data === '[DONE]') {
              return true;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                // backend sent error during stream
                asst.content = IA_DOWN_MSG;
                setMessages((prev) => prev.map(m => m.id === asst.id ? { ...m, content: asst.content } : m));
                return true;
              }
              if (parsed.content) {
                asst.content += parsed.content;
                setMessages((prev) => prev.map(m => m.id === asst.id ? { ...m, content: asst.content } : m));
              }
            } catch {}
          }
        }
      }
      return true;
    } catch (e) {
      return false; // fallback to non-streaming
    }
  };

  const tryComplete = async (conv: Msg[]) => {
    try {
      const resp = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conv.map(m => ({ role: m.role, content: m.content })), stream: false, temperature: 0.5, max_tokens: 1000 }),
      });

      if (!resp.ok) {
        if (resp.status >= 500) {
          pushAssistant(IA_DOWN_MSG);
          return;
        }
        // Try to parse error detail for non-500
        let detail = '';
        try {
          const err = await resp.json();
          detail = err?.detail || '';
        } catch {}
        pushAssistant(detail || 'Une erreur est survenue.');
        return;
      }

      const data = await resp.json();
      const content = data?.content || data?.detail || '';
      pushAssistant(content || '');
    } catch (e) {
      pushAssistant('Une erreur est survenue.');
    }
  };

  const renderItem = ({ item }: { item: Msg }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.bubbleText, isUser ? styles.userText : styles.assistantText]}>{item.content}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAF9' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Ionicons name="chatbubble-ellipses" size={22} color="#0A7C3A" />
          <Text style={styles.headerTitle}>Allô IA</Text>
        </View>
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ padding: 16 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Écrivez votre message (contexte CI uniquement)…"
            placeholderTextColor="#8AA39B"
            multiline
          />
          <TouchableOpacity onPress={send} style={[styles.sendBtn, sending && { opacity: 0.6 }]} disabled={sending}>
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
  headerTitle: { marginLeft: 8, fontSize: 16, fontWeight: '800', color: '#0A7C3A' },
  bubble: { maxWidth: '85%', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 10 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#DCFCE7' },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8F0E8' },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  userText: { color: '#0F5132' },
  assistantText: { color: '#1F2937' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E5E5' },
  input: { flex: 1, minHeight: 40, maxHeight: 120, borderWidth: 1, borderColor: '#E8F0E8', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, backgroundColor: '#F8FAF9' },
  sendBtn: { backgroundColor: '#0A7C3A', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12 },
});