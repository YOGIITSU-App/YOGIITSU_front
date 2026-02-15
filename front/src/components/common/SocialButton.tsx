import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  Platform,
} from 'react-native';

type Provider = 'kakao' | 'google' | 'apple';

const META: Record<
  Provider,
  {
    label: string;
    bg: string;
    fg: string;
    border?: string;
    icon: any;
  }
> = {
  kakao: {
    label: '카카오 로그인',
    bg: '#FEE500', // Kakao Yellow
    fg: '#181600',
    border: '#E0C700',
    icon: require('../../assets/brand/kakao.png'),
  },
  google: {
    label: '구글 로그인',
    bg: '#FFFFFF',
    fg: '#1F1F1F',
    border: '#E5E7EB',
    icon: require('../../assets/brand/google.png'),
  },
  apple: {
    label: 'Apple로 로그인',
    bg: '#000000',
    fg: '#FFFFFF',
    // 검은 버튼은 보더 없음(투명 보더 처리)
    // border: undefined,
    icon: require('../../assets/brand/apple.png'), // 하얀 로고 PNG 준비
  },
};

type Props = {
  provider: Provider;
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
};

export default function SocialButton({
  provider,
  onPress,
  label,
  disabled,
  loading,
  style,
  testID,
}: Props) {
  const meta = META[provider];

  return (
    <Pressable
      testID={testID}
      disabled={disabled || loading}
      onPress={onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: meta.bg, borderColor: meta.border ?? 'transparent' },
        pressed && Platform.OS === 'ios' && { opacity: 0.85 },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label ?? meta.label}
    >
      {/* 좌측 아이콘 */}
      <View style={styles.iconWrap}>
        <Image source={meta.icon} style={styles.icon} resizeMode="contain" />
      </View>

      {/* 텍스트/로딩 */}
      <View style={styles.labelWrap}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={[styles.text, { color: meta.fg }]} numberOfLines={1}>
            {label ?? meta.label}
          </Text>
        )}
      </View>

      {/* 우측 균형용 더미 */}
      <View style={styles.iconWrap} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    paddingLeft: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'android' ? { elevation: 0 } : { shadowOpacity: 0 }),
  },
  labelWrap: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  iconWrap: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 9,
  },
  icon: { width: 20, height: 20 },
});
