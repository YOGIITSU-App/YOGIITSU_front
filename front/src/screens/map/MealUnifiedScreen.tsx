import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  TouchableOpacity,
} from 'react-native';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import { colors } from '../../constants';
import AceMealContent from './AceMealContent';
import AmaranthMealContent from './AmaranthMealContent';
import { useNavigation } from '@react-navigation/native';

type TabKey = 'ace' | 'amaranth';

export default function MealUnifiedScreen() {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState<TabKey>('ace');
  const [dateLabel, setDateLabel] = useState<string>('');

  return (
    <AppScreenLayout>
      <View style={{ flex: 1 }}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <Pressable
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Image
              source={require('../../assets/back-icon.png')}
              style={{ width: 9, height: 15, tintColor: colors.BLACK }}
              resizeMode="contain"
            />
          </Pressable>
          <Text style={styles.headerTitle}>학식</Text>
          <View style={styles.headerRight}>
            <Text style={styles.headerDate}>{dateLabel}</Text>
          </View>
        </View>

        <View style={styles.tabRow}>
          <Pressable
            style={[
              styles.tabBtn,
              selectedTab === 'ace' && styles.tabBtnActive,
            ]}
            onPress={() => setSelectedTab('ace')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'ace' && styles.tabTextActive,
              ]}
            >
              종합강의동
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.tabBtn,
              selectedTab === 'amaranth' && styles.tabBtnActive,
            ]}
            onPress={() => setSelectedTab('amaranth')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'amaranth' && styles.tabTextActive,
              ]}
            >
              아마란스 홀
            </Text>
          </Pressable>
        </View>

        {/* 탭별 콘텐츠 */}
        <View style={{ flex: 1 }}>
          {selectedTab === 'ace' ? (
            <AceMealContent onDateChange={setDateLabel} />
          ) : (
            <AmaranthMealContent onDateChange={setDateLabel} />
          )}
        </View>
      </View>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#EBEDF0',
    backgroundColor: colors.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 22,
    position: 'relative',
  },
  backBtn: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 10,
    elevation: 10,
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: colors.BLACK_900,
  },
  headerRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  headerDate: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.GRAY_500,
  },

  tabRow: {
    flexDirection: 'row',
  },
  tabBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: colors.GRAY_100,
  },
  tabBtnActive: {
    backgroundColor: colors.WHITE,
    borderBottomWidth: 2,
    borderColor: colors.BLUE_700,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: colors.BLACK_900,
    fontWeight: '600',
  },
});
