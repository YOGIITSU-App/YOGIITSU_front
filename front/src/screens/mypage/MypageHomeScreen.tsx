import React from 'react';
import {
  Button,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../../constants';

const deviceWidth = Dimensions.get('screen').width;

function MypageHomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.subContainer}>
        <Text style={styles.subTitleText}>계정</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => console.log('비밀번호 변경')}>
          <Text style={styles.text}>비밀번호 변경</Text>
          <Text style={styles.arrow}>〉</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => console.log('이메일 설정')}>
          <Text style={styles.text}>이메일 설정</Text>
          <Text style={styles.arrow}>〉</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.subContainer}>
        <Text style={styles.subTitleText}>이용안내</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => console.log('공지사항')}>
          <Text style={styles.text}>공지사항</Text>
          <Text style={styles.arrow}>〉</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => console.log('문의')}>
          <Text style={styles.text}>문의</Text>
          <Text style={styles.arrow}>〉</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.subContainer}>
        <Text style={styles.subTitleText}>기타</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => console.log('회원탈퇴')}>
          <Text style={styles.text}>회원탈퇴</Text>
          <Text style={styles.arrow}>〉</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => console.log('로그아웃')}>
          <Text style={styles.text}>로그아웃</Text>
          <Text style={styles.arrow}>〉</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  subContainer: {
    marginTop: 20,
    paddingHorizontal: deviceWidth * 0.04, // ✅ 내부 요소만 좌우 여백
    gap: 3,
    marginBottom: '5%',
    borderBottomWidth: 1,
    borderBottomColor: colors.GRAY_100,
  },
  subTitleText: {
    fontSize: 20,
    color: colors.BLACK_700,
    fontWeight: '600',
    marginBottom: 10,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  text: {
    fontSize: 16,
    color: colors.GRAY_800,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 16,
    color: colors.GRAY_800,
  },
});

export default MypageHomeScreen;
