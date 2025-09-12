// screens/map/AmaranthMealScreen.tsx
import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { colors } from '../../constants';

export default function AmaranthMealScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.buildingTitle}>아마란스홀</Text>
          <Text style={styles.dateLabel}>9월 8일 월요일</Text>
        </View>
        <View style={styles.dateNavBox}>
          <Pressable style={styles.navBtn}>
            <Image
              source={require('../../assets/back-icon.png')}
              style={{ width: 7, height: 11 }}
            />
          </Pressable>
          <View style={styles.navDivider} />
          <Pressable style={styles.navBtn}>
            <Image
              source={require('../../assets/back-icon.png')}
              style={{ width: 7, height: 11, transform: [{ scaleX: -1 }] }}
            />
          </Pressable>
        </View>
      </View>

      {/* 점심 */}
      <Text style={styles.sectionTitle}>점심</Text>
      <Text style={styles.timeText}>11:30 - 14:00</Text>

      <View style={styles.card}>
        <Text style={styles.subTitle}>선택메뉴</Text>
        <Text style={styles.menu}>
          수제돈까스, 햄김치볶음밥, 마제덮밥, 지코바치킨덮밥, 왕새우튀김우동
        </Text>

        <View style={styles.divider} />

        <Text style={styles.subTitle}>공통찬</Text>
        <Text style={styles.menu}>
          불어묵강정, 숙주오이무침, 배추김치, 가쓰오장국
        </Text>
      </View>

      <View style={{ height: 32 }} />

      {/* 저녁 */}
      <View style={styles.cardBox}>
        <Text style={styles.sectionTitle}>저녁</Text>
        <Text style={styles.timeText}>18:00 - 19:00</Text>

        <View style={styles.card}>
          <Text style={styles.menu}>
            햄모듬김치찌개, 백미밥, 너비아니파채무침, 불닭팽이버섯찜,
            모듬콩조림, 배추김치
          </Text>
        </View>
      </View>

      {/* 이용 안내 */}
      <Text style={styles.infoTitle}>이용안내</Text>
      <Text style={styles.infoSubTitle}>학생식당</Text>
      <Text style={styles.infoText}>Mom’s Cook : 6,500원</Text>
      <Text style={styles.infoText}>돈까스코너 : 6,500원</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24, // Ace와 동일
  },
  buildingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.BLACK_900,
  },
  dateLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: colors.GRAY_500,
  },
  dateNavBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EBEDF0',
  },
  navBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  navDivider: {
    width: 1,
    alignSelf: 'stretch', // 부모 높이에 맞춤 (Ace와 동일)
    backgroundColor: '#EBEDF0',
  },
  sectionTitle: {
    color: colors.BLUE_700,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.GRAY_500,
    marginBottom: 18, // Ace와 동일
  },
  cardBox: {
    marginBottom: 46, // Ace와 동일 섹션 간 간격
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.GRAY_500,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#EBEDF0',
    marginVertical: 12,
  },
  menu: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
    color: colors.BLACK_900,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BLACK_900,
    marginBottom: 12,
  },
  infoSubTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.BLACK_500,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.GRAY_500,
    marginBottom: 4,
  },
});
