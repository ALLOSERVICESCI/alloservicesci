import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

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
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [temperature, setTemperature] = useState(0.5);
  const listRef = useRef&lt;FlatList&gt;(null);
  const abortRef = useRef&lt;AbortController | null&gt;(null);

  const scrollToEnd = () =&gt; setTimeout(() =&gt; listRef.current?.scrollToEnd({ animated: true }), 50);

  const pushAssistant = (content: string) =&gt; {
    const msg: Msg = { id: String(Date.now() + Math.random()), role: 'assistant', content, ts: Date.now() };
    setMessages((prev) =&gt; [...prev, msg]);
  };

  const copyMessage = async (text: string) =&gt; {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Copié', 'Le contenu a été copié dans le presse‑papier.');
    } catch (e) {
      // ignore
    }
  };

  const adjustTemp = (delta: number) =&gt; {
    setTemperature((prev) =&gt; {
      const next = Math.max(0, Math.min(2, parseFloat((prev + delta).toFixed(1))));
      return next;
    });
  };

  const stopStreaming = () =&gt; {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsStreaming(false);
  };

  const send = async () =&gt; {
    const text = input.trim();
    if (!text || sending || isStreaming) return;
    setSending(true);
    const userMsg: Msg = { id: String(Date.now()), role: 'user', content: text, ts: Date.now() };
    setMessages((prev) =&gt; [...prev, userMsg]);
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
      scrollToEnd();
    }
  };

  const tryStream = async (conv: Msg[]): Promise&lt;boolean&gt; =&gt; {
    try {
      setIsStreaming(true);
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      const resp = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({
          messages: conv.map(m =&gt; ({ role: m.role, content: m.content })),
          stream: true,
          temperature: temperature,
          max_tokens: 1000,
        }),
      });

      if (!resp.ok) {
        setIsStreaming(false);
        abortRef.current = null;
        if (resp.status &gt;= 500) {
          pushAssistant(IA_DOWN_MSG);
          return true; // handled with explicit message; do not fallback
        }
        return false; // allow fallback for non-500
      }
      if (!resp.body) {
        setIsStreaming(false);
        abortRef.current = null;
        return false;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();

      const asst: Msg = { id: String(Date.now() + 2), role: 'assistant', content: '', ts: Date.now() + 2 };
      setMessages((prev) =&gt; [...prev, asst]);

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
              setIsStreaming(false);
              abortRef.current = null;
              return true;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                asst.content = IA_DOWN_MSG;
                setMessages((prev) =&gt; prev.map(m =&gt; m.id === asst.id ? { ...m, content: asst.content } : m));
                setIsStreaming(false);
                abortRef.current = null;
                return true;
              }
              if (parsed.content) {
                asst.content += parsed.content;
                setMessages((prev) =&gt; prev.map(m =&gt; m.id === asst.id ? { ...m, content: asst.content } : m));
              }
            } catch {}
          }
        }
      }
      setIsStreaming(false);
      abortRef.current = null;
      return true;
    } catch (e: any) {
      setIsStreaming(false);
      abortRef.current = null;
      if (e?.name === 'AbortError') {
        // User stopped streaming; keep partial content if any
        return true;
      }
      return false; // fallback to non-streaming
    }
  };

  const tryComplete = async (conv: Msg[]) =&gt; {
    try {
      const resp = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conv.map(m =&gt; ({ role: m.role, content: m.content })), stream: false, temperature: temperature, max_tokens: 1000 }),
      });

      if (!resp.ok) {
        if (resp.status &gt;= 500) {
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

  const renderItem = ({ item }: { item: Msg }) =&gt; {
    const isUser = item.role === 'user';
    return (
      &lt;TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() =&gt; !isUser &amp;&amp; item.content ? copyMessage(item.content) : undefined}
      &gt;
        &lt;View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}&gt;
          &lt;Text style={[styles.bubbleText, isUser ? styles.userText : styles.assistantText]}&gt;{item.content}&lt;/Text&gt;
        &lt;/View&gt;
      &lt;/TouchableOpacity&gt;
    );
  };

  return (
    &lt;SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAF9' }}&gt;
      &lt;KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}&gt;
        {/* Header */}
        &lt;View style={styles.header}&gt;
          &lt;View style={{ flexDirection: 'row', alignItems: 'center' }}&gt;
            &lt;Ionicons name="chatbubble-ellipses" size={22} color="#0A7C3A" /&gt;
            &lt;Text style={styles.headerTitle}&gt;Allô IA&lt;/Text&gt;
          &lt;/View&gt;
          &lt;View style={styles.headerActions}&gt;
            &lt;View style={styles.tempPill}&gt;
              &lt;TouchableOpacity onPress={() =&gt; adjustTemp(-0.1)} style={styles.tempBtn}&gt;
                &lt;Ionicons name="remove" size={16} color="#0A7C3A" /&gt;
              &lt;/TouchableOpacity&gt;
              &lt;Text style={styles.tempText}&gt;Temp. {temperature.toFixed(1)}&lt;/Text&gt;
              &lt;TouchableOpacity onPress={() =&gt; adjustTemp(0.1)} style={styles.tempBtn}&gt;
                &lt;Ionicons name="add" size={16} color="#0A7C3A" /&gt;
              &lt;/TouchableOpacity&gt;
            &lt;/View&gt;
          &lt;/View&gt;
        &lt;/View&gt;

        {/* List */}
        &lt;FlatList
          ref={listRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(it) =&gt; it.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          onContentSizeChange={scrollToEnd}
        /&gt;

        {/* Typing indicator */}
        {(sending || isStreaming) &amp;&amp; (
          &lt;View style={styles.typingRow}&gt;
            &lt;ActivityIndicator size="small" color="#0A7C3A" /&gt;
            &lt;Text style={styles.typingText}&gt;Allô IA est en train d’écrire…&lt;/Text&gt;
          &lt;/View&gt;
        )}

        {/* Composer */}
        &lt;View style={styles.composer}&gt;
          &lt;TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Écrivez votre message (contexte CI uniquement)…"
            placeholderTextColor="#8AA39B"
            multiline
          /&gt;

          {isStreaming ? (
            &lt;TouchableOpacity onPress={stopStreaming} style={[styles.stopBtn]} disabled={!isStreaming}&gt;
              &lt;Ionicons name="stop" size={18} color="#fff" /&gt;
            &lt;/TouchableOpacity&gt;
          ) : (
            &lt;TouchableOpacity onPress={send} style={[styles.sendBtn, (sending) &amp;&amp; { opacity: 0.6 }]} disabled={sending}&gt;
              &lt;Ionicons name="send" size={18} color="#fff" /&gt;
            &lt;/TouchableOpacity&gt;
          )}
        &lt;/View&gt;
      &lt;/KeyboardAvoidingView&gt;
    &lt;/SafeAreaView&gt;
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
});