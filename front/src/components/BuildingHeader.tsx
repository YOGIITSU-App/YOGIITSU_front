import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.wrapper, {top: insets.top}]}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => {
            navigation.navigate(mapNavigation.SEARCH, {
              selectionType: 'start',
              fromResultScreen: false,
            });
          }}>
          <Image
            source={require('../assets/back-icon.png')}
            style={styles.backIcon}
          />
          <Text style={styles.titleText} numberOfLines={1}>
            {buildingName || '건물 선택'}
          </Text>
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
    backgroundColor: colors.GRAY_100,
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  titleText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    color: colors.BLACK_900,
  },
});
