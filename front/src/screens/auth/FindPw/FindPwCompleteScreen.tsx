import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useEffect, useLayoutEffect} from 'react';
import {BackHandler, SafeAreaView, View, Text, StyleSheet} from 'react-native';
import CustomBotton from '../../../components/CustomButton';
import {authNavigations, colors} from '../../../constants';
import CompleteCheck from '../../../assets/CompleteCheck.svg';
import {AuthStackParamList} from '../../../navigations/stack/AuthStackNavigator';

function FindPwCompleteScreen() {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();

  useEffect(() => {
    // 안드로이드 하드웨어 뒤로가기 차단
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        return true; // 뒤로가기 무시!
      },
    );
    return () => {
      backHandler.remove();
    };
  }, [navigation]);

  // 헤더 왼쪽 ← 버튼 없애기
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null, // ← 버튼 제거!
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconContainer}>
        <CompleteCheck width={38} height={38} />
      </View>
      <Text style={styles.title}>변경이 완료되었습니다</Text>
      <Text style={styles.subtitle}>새로운 비밀번호로 로그인해 주세요</Text>
      <CustomBotton
        label="확인"
        variant="filled"
        size="large"
        onPress={() => {
          navigation.navigate(authNavigations.AUTH_HOME);
        }}
      />
    </SafeAreaView>
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
    marginBottom: 15,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.GRAY_500,
    marginBottom: 40,
    lineHeight: 19.2,
  },
});

export default FindPwCompleteScreen;
