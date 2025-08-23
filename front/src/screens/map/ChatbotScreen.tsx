import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import { useNavigation } from '@react-navigation/native';

type Message = {
  id: string;
  role: 'user' | 'bot';
  text: string;
};

export default function ChatbotScreen() {
  const navigation = useNavigation();
  const PRESET: Array<{ test: RegExp; reply: string }> = [
    {
      test: /ict대학.*(길|가는.*길)/i,
      reply: 'ICT대학 가는 길을 안내할게. 현재 위치 기준 추천 경로를 보여줄게!',
    },
    {
      test: /프린터|출력/i,
      reply: '가장 가까운 프린터는 중앙도서관 1층 복사실이야.',
    },
    {
      test: /학생회관|학생회/i,
      reply:
        '학생회관 가는 길을 알려줄게. 가는 길에 가까운 편의점도 같이 표시할게!',
    },
  ];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  // 초기 안내 (힌트/시간/예시)
  useEffect(() => {
    const t = timestampText();
    setMessages([
      {
        id: 'ex',
        role: 'bot',
        text: '예: "ICT대학 가는 길 알려줘" 또는\n"가장 가까운 프린터 어디 있어?"',
      },
      {
        id: 'intro',
        role: 'bot',
        text: '안녕, 난 수원대학교 캠퍼스 길찾기 도우미야! 궁금한 게 있으면 언제든지 물어봐줘!',
      },
      { id: 'time', role: 'bot', text: `__time__${t}` },
    ]);
  }, []);

  // 스크롤 하단 유지
  useEffect(() => {
    const t = setTimeout(
      () => listRef.current?.scrollToOffset({ offset: 0, animated: true }),
      40,
    );
    return () => clearTimeout(t);
  }, [messages.length]);

  const findPreset = (text: string): string | null => {
    for (const p of PRESET) if (p.test.test(text)) return p.reply;
    return null;
  };

  const onSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: String(Date.now()),
      role: 'user',
      text: input.trim(),
    };
    setMessages(prev => [userMsg, ...prev]);
    setInput('');

    setIsTyping(true);
    setTimeout(() => {
      const reply = findPreset(userMsg.text) ?? '확인했어! 이어서 진행할게.';
      const botMsg: Message = {
        id: `${Date.now()}-bot`,
        role: 'bot',
        text: reply,
      };
      setMessages(prev => [botMsg, ...prev]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <AppScreenLayout>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 상단 앱바 */}
        <View style={styles.appbar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="뒤로가기"
            accessibilityRole="button"
          >
            <Image
              source={require('../../assets/back-icon.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.appbarTitle}>AI 챗봇</Text>
          {/* 우측 공간 맞춤용(타이틀 중앙정렬) */}
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.headerHint}>
          <Text style={styles.headerHintText}>
            AI 기반 챗봇에게 궁금한 내용을 물어보세요!
          </Text>
        </View>

        {/* 메시지 리스트 */}
        <FlatList
          ref={listRef}
          data={messages}
          inverted
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => renderRow(item)}
          ListHeaderComponent={isTyping ? <TypingDots /> : null}
        />

        {/* 입력 바 */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="궁금한 내용을 입력해 주세요"
            placeholderTextColor="#9AA0A6"
            onSubmitEditing={onSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={onSend}
            style={[styles.sendBtn, !input.trim() && { opacity: 0.5 }]}
            disabled={!input.trim()}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </AppScreenLayout>
  );
}

function renderRow(item: Message) {
  if (item.text.startsWith('__time__')) {
    return (
      <View style={styles.timeChipWrap}>
        <Text style={styles.timeChip}>{item.text.replace('__time__', '')}</Text>
      </View>
    );
  }
  if (item.text.startsWith('__hint__')) {
    return (
      <View style={styles.hintWrap}>
        <Text style={styles.hintText}>{item.text.replace('__hint__', '')}</Text>
      </View>
    );
  }

  const isUser = item.role === 'user';
  const isIntro = item.id === 'intro';
  const isExample = item.id === 'ex';

  return (
    <View style={[styles.bubbleRow, isUser ? styles.rightRow : styles.leftRow]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.botBubble,
          isIntro && styles.botIntroBubble,
          isExample && styles.exampleBubble,
        ]}
      >
        <Text
          style={[
            styles.text,
            isUser ? styles.userText : styles.botText,
            isIntro && styles.botIntroText,
            isExample && styles.exampleText,
          ]}
        >
          {item.text}
        </Text>
      </View>
      {isUser && <Text style={styles.metaText}>전송됨</Text>}
    </View>
  );
}

function TypingDots() {
  const [dots, setDots] = useState('.');
  useEffect(() => {
    const itv = setInterval(
      () => setDots(prev => (prev.length >= 3 ? '.' : prev + '.')),
      300,
    );
    return () => clearInterval(itv);
  }, []);
  return (
    <View style={styles.typingRow}>
      <View style={styles.typingBubble}>
        <Text style={styles.typingText}>···{dots}</Text>
      </View>
    </View>
  );
}

function timestampText() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const ampm = h < 12 ? '오전' : '오후';
  const hh = (h % 12 || 12).toString();
  const mm = m.toString().padStart(2, '0');
  return `${ampm} ${hh}:${mm}`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F6F8' },
  appbar: {
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    paddingHorizontal: 8,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomColor: '#E6E9ED',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  appbarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 18,
    height: 18,
    // PNG 색을 그대로 쓰고 싶으면 아래 tintColor는 지워도 돼
    tintColor: '#111827',
  },

  headerHint: {
    backgroundColor: '#EEF5FF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  headerHintText: {
    color: '#2563EB',
    fontSize: 13,
  },

  listContent: { paddingHorizontal: 12, paddingBottom: 12 },

  hintWrap: {
    backgroundColor: '#EEF5FF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'stretch',
  },
  hintText: { color: '#2563EB', fontSize: 13, textAlign: 'left' },

  timeChipWrap: { alignItems: 'center', marginVertical: 12 },
  timeChip: { fontSize: 12, color: '#9AA0A6' },

  bubbleRow: { marginTop: 8, marginBottom: 2, flexDirection: 'column' },
  leftRow: { alignItems: 'flex-start' },
  rightRow: { alignItems: 'flex-end' },

  bubble: {
    maxWidth: '78%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  botBubble: {
    backgroundColor: 'white',
    borderTopLeftRadius: 4,
    borderColor: '#E6E9ED',
    borderWidth: StyleSheet.hairlineWidth,
  },
  userBubble: { backgroundColor: '#2563EB', borderTopRightRadius: 4 },

  text: { fontSize: 15, lineHeight: 21 },
  botText: { color: '#111827' },
  userText: { color: 'white' },
  botIntroBubble: {
    backgroundColor: '#2563EB', // 진한 파랑
    borderTopLeftRadius: 4,
    borderWidth: 0, // 테두리 제거
  },
  botIntroText: { color: 'white' },

  exampleBubble: {
    backgroundColor: '#EAF2FF', // 연한 파랑
    borderTopLeftRadius: 4,
    borderWidth: 0,
  },
  exampleText: { color: '#2563EB' },

  metaText: {
    fontSize: 11,
    color: '#9AA0A6',
    marginTop: 4,
    marginHorizontal: 6,
  },

  typingRow: { alignItems: 'flex-start', marginTop: 8 },
  typingBubble: {
    backgroundColor: 'white',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderColor: '#E6E9ED',
    borderWidth: StyleSheet.hairlineWidth,
  },
  typingText: { color: '#6B7280' },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E6E9ED',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    color: '#111827',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderRadius: 12,
    marginRight: 8,
    fontSize: 15,
  },
  sendBtn: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
  },
  sendIcon: { color: 'white', fontWeight: '800', fontSize: 16 },
});
