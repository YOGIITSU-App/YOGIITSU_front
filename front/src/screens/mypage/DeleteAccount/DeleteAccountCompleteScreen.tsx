import React, {useContext} from 'react';
import {SafeAreaView, StyleSheet, Text, View, Image} from 'react-native';
import CustomBotton from '../../../components/CustomButton';
import {colors} from '../../../constants';
import {AuthContext} from '../../../navigations/root/Rootnavigator';

function DeleteAccountCompleteScreen() {
  const authContext = useContext(AuthContext); // ✅ Context 가져오기
  if (!authContext) return null; // ✅ null 체크 (안전한 코드)

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ 체크 아이콘 */}
      <View style={styles.iconContainer}>
        <Image
          style={styles.warningIcon}
          source={require('../../../assets/Warning-icon-gray.png')}
        />
      </View>

      {/* ✅ 안내 문구 */}
      <Text style={styles.title}>회원탈퇴가 완료되었습니다</Text>
      <Text style={styles.subtitle}>요기있수를 이용해주셔서 감사합니다</Text>
      <Text style={styles.subtitleBottom}>꼭 다시 만나요!</Text>

      {/* ✅ 확인 버튼 */}
      <CustomBotton
        label="로그인 화면으로"
        variant="filled"
        size="large"
        onPress={() => {
          authContext.setIsLoggedIn(false); // ✅ 로그아웃 처리
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
