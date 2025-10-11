// components/mypage/MypageProfileCard.tsx
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants';

export type SocialType = 'local' | 'google' | 'kakao' | 'apple';

export type ProfileData = {
  name: string;
  email?: string;
  provider: SocialType;
  providerId?: string; // 예: google_123, kakao_xxx
  photoUrl?: string; // 소셜 프로필 이미지
};

// components/mypage/MypageProfileCard.tsx (핵심 부분만)
export default function MypageProfileCard({ data }: { data: ProfileData }) {
  const defaultImg = require('../assets/default_profile.png');

  return (
    <View style={styles.card}>
      {/* 좌측: 이름 + 이메일/아이디 */}
      <View style={styles.left}>
        <Text style={styles.name}>{data.name || '사용자'}</Text>

        {!!data.email && (
          <View style={styles.row}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>이메일</Text>
            </View>
            <Text style={styles.value} numberOfLines={1}>
              {data.email}
            </Text>
          </View>
        )}
        {!!data.providerId && (
          <View style={styles.row}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>아이디</Text>
            </View>
            <Text style={styles.value} numberOfLines={1}>
              {data.providerId}
            </Text>
          </View>
        )}
      </View>

      {/* 우측: 프로필 이미지 (상단 정렬) */}
      <View style={styles.avatarCol}>
        <View style={styles.avatarWrapper}>
          <Image
            source={data.photoUrl ? { uri: data.photoUrl } : defaultImg}
            style={styles.avatarImg}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}

const AVATAR = 52;

const styles = StyleSheet.create({
  card: {
    alignSelf: 'center',
    width: '92%',
    maxWidth: 560,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginTop: 19,
    marginBottom: 11,
    borderRadius: 6,
    backgroundColor: colors.GRAY_100,
  },
  left: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BLACK_900,
    marginBottom: 10,
    marginLeft: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 6,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.WHITE,
  },
  badgeText: {
    fontSize: 11,
    color: colors.GRAY_500,
  },
  value: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 14,
    color: colors.BLACK_500,
  },
  avatarCol: {
    alignSelf: 'flex-start',
  },
  avatarWrapper: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: colors.GRAY_400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: 22,
    height: 22,
  },
});
