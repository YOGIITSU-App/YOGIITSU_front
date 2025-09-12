// screens/map/AceMealScreen.tsx
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

export default function AceMealScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.buildingTitle}>종합강의동</Text>
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
        <Text style={styles.subTitle}>학생 식당</Text>
        <Text style={styles.menu}>
          아비꼬카레/가라아게, 양배추샐러드, 백미밥, 가스오장국, 단무지,
          배추김치
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.subTitle}>교직원 식당</Text>
        <Text style={styles.menu}>
          흑미밥/백미밥, 황태무국, 대파제육볶음, 고등어무조림, 매콤쫄면,
          아삭이오이고추된장무침, 콩나물무침, 쌈채소, 건강샐러드, 국내산김치2종,
          후식차
        </Text>
      </View>

      <View style={{ height: 46 }} />

      {/* 이용 안내 */}
      <Text style={styles.infoTitle}>이용안내</Text>
      <Text style={styles.infoSubTitle}>학생식당</Text>
      {/* <View style={styles.infoTextBox}> */}
      <Text style={styles.infoText}>일품코너 : 6,500원 (돈까스, 덮밥류)</Text>
      <Text style={styles.infoText}>간편식 샐러드 : 5,800원</Text>
      <Text style={styles.infoText}>
        즉석 셀프 라면 : 4,500원 (밥, 토핑 포함)
      </Text>
      {/* </View> */}

      <View style={{ height: 18 }} />

      <Text style={styles.infoSubTitle}>교직원식당</Text>
      <Text style={styles.infoText}>한식과 직화 일품뚝배기 : 9,000원</Text>
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
    marginBottom: 24,
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
    alignSelf: 'stretch',
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
    marginBottom: 18,
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
  infoTextBox: {
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.GRAY_500,
    marginBottom: 4,
  },
});
