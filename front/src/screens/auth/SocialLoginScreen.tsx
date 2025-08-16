import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authNavigations, colors } from '../../constants';
import { useUser } from '../../contexts/UserContext';
import {
  configureSocial,
  signInWithGoogle,
  signInWithKakao,
} from '../../api/socialAuth';
import SocialButton from '../../components/common/SocialButton';
import AppScreenLayout from '../../components/common/AppScreenLayout';

export default function SocialLoginScreen() {
  const navigation = useNavigation<any>();
  const { login } = useUser();
  const [loading, setLoading] = useState<null | 'kakao' | 'google'>(null);

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

  return (
    <AppScreenLayout disableTopInset>
      <View style={styles.container}>
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

        {/* 버튼들 */}
        <View style={styles.buttons}>
          <SocialButton
            provider="kakao"
            onPress={onKakao}
            loading={loading === 'kakao'}
            disabled={loading !== null}
            style={{ marginBottom: 12 }}
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
      </View>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BLUE_700,
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 24,
    alignItems: 'center',
  },
  brandLogo: {
    height: '55%',
    marginBottom: '5%',
  },
  bubbleWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
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
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
  },
  buttons: {
    width: '100%',
    marginTop: 8,
  },
  orWrap: {
    width: '100%',
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 15,
    paddingBottom: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
  },
  orText: {
    color: 'rgba(255, 255, 255, 0.50)',
    fontSize: 13,
  },
  link: {
    color: 'white',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});
