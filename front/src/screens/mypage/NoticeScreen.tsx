import React, {useEffect} from 'react';
import {Dimensions, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import InputField from '../../components/inputField';
import CustomBotton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import {colors} from '../../constants';
import useForm from '../../hooks/useForms';
import {validateEmail} from '../../utils';
import {useNavigation} from '@react-navigation/native';

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

  return <View></View>;
}

const styles = StyleSheet.create({});

export default NoticeScreen;
