import React, {useEffect, useLayoutEffect} from 'react';
import {BackHandler, StyleSheet, Text, View} from 'react-native';
import CustomBotton from '../../../components/CustomButton';
import {colors} from '../../../constants';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MypageStackParamList} from '../../../navigations/stack/MypageStackNavigator';
import CompleteCheck from '../../../assets/CompleteCheck.svg';
import AppScreenLayout from '../../../components/common/AppScreenLayout';

function ChangeEmailCompleteScreen() {
  const navigation = useNavigation<StackNavigationProp<MypageStackParamList>>();

  useEffect(() => {
    // 안드로이드 하드웨어 뒤로가기 차단
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        return true; // 뒤로가기 무시
      },
    );
    return () => {
      backHandler.remove();
    };
  }, [navigation]);

  // 헤더 왼쪽 ← 버튼 없애기
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null, // ← 버튼 제거
    });
  }, [navigation]);

  return (
    <AppScreenLayout disableTopInset>
      <View style={styles.iconContainer}>
        <CompleteCheck width={38} height={38} />
      </View>
      <Text style={styles.title}>변경이 완료되었습니다</Text>
      <CustomBotton
        label="확인"
        variant="filled"
        size="large"
        onPress={() => {
          navigation.navigate('MypageHome');
        }}
      />
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
    alignItems: 'center',
  },
  iconContainer: {
    borderRadius: 50,
    padding: 15,
    marginTop: 30,
    marginBottom: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.BLACK_700,
    marginBottom: 50,
    lineHeight: 30,
  },
});

export default ChangeEmailCompleteScreen;
