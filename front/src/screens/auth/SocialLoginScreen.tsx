import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authNavigations, colors } from '../../constants';
import { useUser } from '../../contexts/UserContext';
import {
  configureSocial,
  signInWithGoogle,
  signInWithKakao,
  signInWithApple,
} from '../../api/socialAuth';
import SocialButton from '../../components/common/SocialButton';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SocialLoginScreen() {
  const navigation = useNavigation<any>();
  const { login } = useUser();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState<null | 'kakao' | 'google' | 'apple'>(
    null,
  );

  const normalizeRole = (role: unknown): 'USER' | 'ADMIN' =>
    String(role).toUpperCase().includes('ADMIN') ? 'ADMIN' : 'USER';

  useEffect(() => {
    configureSocial();
  }, []);

  const onKakao = async () => {
    try {
      setLoading('kakao');
      const r = await signInWithKakao();
      if (r.userId && r.role) login({ userId: r.userId, role: r.role });
    } catch (e) {
      console.warn('[Kakao SignIn] failed', e);
      Alert.alert('카카오 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(null);
    }
  };

  const onGoogle = async () => {
    try {
      setLoading('google');
      const r = await signInWithGoogle();
      if (r.userId && r.role) login({ userId: r.userId, role: r.role });
    } catch (e) {
      console.warn('[Google SignIn] failed', e);
      Alert.alert('구글 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(null);
    }
  };

  const onApple = async () => {
    try {
      setLoading('apple');
      const r = await signInWithApple();
      if (r.userId && r.role) {
        const role = normalizeRole(r.role);
        login({ userId: r.userId, role });
      }
    } catch (e) {
      console.warn('[Apple SignIn] failed', e);
      Alert.alert('애플 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <AppScreenLayout disableTopInset>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: 24 + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* 상단 카피 */}
        <Image
          source={require('../../assets/bootsplash/logo.png')}
          style={styles.brandLogo}
          resizeMode="contain"
          accessible
          accessibilityLabel="요기있수"
        />

        {/* 말풍선 */}
        <View style={styles.bubbleWrap}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>⚡ 10초만에 가입하기</Text>
          </View>
          <View style={styles.bubbleTail} />
        </View>
        <View style={styles.main}>
          {Platform.OS === 'ios' && (
            <SocialButton
              provider="apple"
              onPress={onApple}
              loading={loading === 'apple'}
              disabled={loading !== null}
            />
          )}
          <SocialButton
            provider="kakao"
            onPress={onKakao}
            loading={loading === 'kakao'}
            disabled={loading !== null}
          />
          <SocialButton
            provider="google"
            onPress={onGoogle}
            loading={loading === 'google'}
            disabled={loading !== null}
          />
        </View>

        {/* 구분선 + 링크 */}
        <View style={styles.orWrap}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>또는</Text>
          <View style={styles.orLine} />
        </View>

        <Text
          style={styles.link}
          onPress={() => navigation.navigate(authNavigations.AUTH_HOME)}
        >
          ID 로그인/회원가입
        </Text>
      </ScrollView>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.BLUE_700,
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 24,
    alignItems: 'center',
  },
  brandLogo: {
    flex: 1,
    marginBottom: '5%',
  },
  main: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  // 말풍선
  bubbleWrap: { alignItems: 'center' },
  bubble: {
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
  },
  bubbleText: {
    fontSize: 12,
    color: colors.BLUE_700,
    fontWeight: '700',
    lineHeight: 16,
  },
  bubbleTail: {
    width: 0,
    height: 0,
    marginTop: -1,
    marginBottom: 3,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
  },
  orWrap: {
    width: '100%',
    marginVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  orText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  link: {
    alignSelf: 'center',
    color: 'white',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});
