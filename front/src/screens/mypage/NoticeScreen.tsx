import React, {useEffect} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AppScreenLayout from '../../components/common/AppScreenLayout';

const deviceWidth = Dimensions.get('screen').width;

function NoticeScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    // ✅ 화면에 들어오면 바텀 탭 숨기기
    navigation.getParent()?.setOptions({tabBarStyle: {display: 'none'}});

    return () => {
      // ✅ 화면을 떠나면 바텀 탭 다시 보이게 설정
      navigation.getParent()?.setOptions({tabBarStyle: undefined});
    };
  }, [navigation]);

  return (
    <AppScreenLayout disableTopInset>
      <View></View>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({});

export default NoticeScreen;
