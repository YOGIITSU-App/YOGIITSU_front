import React, {useEffect, useLayoutEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  BackHandler,
} from 'react-native';
import CustomBotton from '../../../components/CustomButton';
import {colors} from '../../../constants';
import {RootStackParamList} from '../../../navigations/root/Rootnavigator';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {logoutEmitter} from '../../../utils/logoutEmitter';

function DeleteAccountCompleteScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

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
      {/* 체크 아이콘 */}
      <View style={styles.iconContainer}>
        <Image
          style={styles.warningIcon}
          source={require('../../../assets/Warning-icon-gray.png')}
        />
      </View>

      {/* 안내 문구 */}
      <Text style={styles.title}>회원탈퇴가 완료되었습니다</Text>
      <Text style={styles.subtitle}>요기있수를 이용해주셔서 감사합니다</Text>
      <Text style={styles.subtitleBottom}>꼭 다시 만나요!</Text>

      {/* 확인 버튼 */}
      <CustomBotton
        label="로그인 화면으로"
        variant="filled"
        size="large"
        onPress={() => {
          logoutEmitter.emit('force-logout');
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
  warningIcon: {
    width: 38,
    height: 38,
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
    marginBottom: 5,
    lineHeight: 19.2,
  },
  subtitleBottom: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.GRAY_500,
    marginBottom: 40,
    lineHeight: 19.2,
  },
});

export default DeleteAccountCompleteScreen;
