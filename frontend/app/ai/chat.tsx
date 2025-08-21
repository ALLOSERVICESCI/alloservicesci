import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../../src/i18n/i18n';

// Simple message type
type Msg = { id: string; role: 'user' | 'assistant' | 'system'; content: string; ts: number };

export default function LayahChat() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 'welcome',
      role: 'assistant',
      ts: Date.now(),
      content: "Bonjour, je suis Layah — l’assistant IA d’Allô Services CI. Posez-moi vos questions en lien avec la Côte d’Ivoire ou demandez un document (CV, lettre, ordre de mission…).",
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    const userMsg: Msg = { id: String(Date.now()), role: 'user', content: text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // TODO: Replace with real API call /api/ai/chat
    setTimeout(() => {
      const reply: Msg = {
        id: String(Date.now() + 1),
        role: 'assistant',
        ts: Date.now() + 1,
        content: "Merci. Dès que l’agent est branché, je répondrai dans le strict périmètre Côte d’Ivoire (CI) et générerai vos documents au format local (dates FR, +225, FCFA).",
      };
      setMessages((prev) => [...prev, reply]);
      setSending(false);
      listRef.current?.scrollToEnd({ animated: true });
    }, 400);
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
          <Text style={styles.headerTitle}>Layah — Assistant IA</Text>
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
