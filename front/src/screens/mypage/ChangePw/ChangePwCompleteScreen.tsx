import React, {useContext} from 'react';
import {SafeAreaView, StyleSheet, Text, View, Image} from 'react-native';
import CustomBotton from '../../../components/CustomButton';
import {colors} from '../../../constants';
import {AuthContext} from '../../../navigations/root/Rootnavigator';
import CompleteCheck from '../../../assets/CompleteCheck.svg';

function ChangePwCompleteScreen() {
  const authContext = useContext(AuthContext); // ✅ Context 가져오기
  if (!authContext) return null; // ✅ null 체크 (안전한 코드)

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ 체크 아이콘 */}
      <View style={styles.iconContainer}>
        <CompleteCheck width={38} height={38} />
      </View>

      {/* ✅ 안내 문구 */}
      <Text style={styles.title}>변경이 완료되었습니다</Text>
      <Text style={styles.subtitle}>새로운 비밀번호로 로그인해 주세요</Text>

      {/* ✅ 확인 버튼 */}
      <CustomBotton
        label="확인"
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

export default ChangePwCompleteScreen;
