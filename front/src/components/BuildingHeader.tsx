import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {mapNavigation} from '../constants/navigation';
import {colors} from '../constants/colors';
import {StackNavigationProp} from '@react-navigation/stack';
import {MapStackParamList} from '../navigations/stack/MapStackNavigator';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type Props = {
  buildingName: string;
};

export default function BuildingHeader({buildingName}: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<MapStackParamList>>();

  const handleBack = () => navigation.goBack();

  // X 버튼 동작
  const handleClearAndGoSearch = () => {
    navigation.navigate(mapNavigation.MAPHOME);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.wrapper}>
        {/* ← 뒤로가기 버튼 */}
        <TouchableOpacity
          onPress={handleBack}
          style={{paddingRight: 6, paddingVertical: 6}}
          hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
          <Image
            source={require('../assets/back-icon.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        {/* 가운데: 건물 이름(탭해도 뒤로가기) */}
        <TouchableOpacity onPress={handleBack} style={{flex: 1}}>
          <Text style={styles.titleText} numberOfLines={1}>
            {buildingName || '건물 선택'}
          </Text>
        </TouchableOpacity>
        {/* 오른쪽: X 아이콘 */}
        <TouchableOpacity
          onPress={handleClearAndGoSearch}
          style={{paddingLeft: 6, paddingVertical: 6}}>
          <Text style={styles.closeIcon}>x</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.WHITE,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.GRAY_100,
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    width: 9,
    height: 15,
    marginRight: 15,
  },
  closeIcon: {
    fontSize: 20,
    lineHeight: 24,
  },
  titleText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    color: colors.BLACK_900,
  },
});
