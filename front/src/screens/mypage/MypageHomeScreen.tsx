import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../../constants';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MypageStackParamList} from '../../navigations/stack/MypageStackNavigator';

// 🔹 네비게이션 타입 정의
type MypageHomeScreenNavigationProp = StackNavigationProp<
  MypageStackParamList,
  'MypageHome'
>;

const deviceWidth = Dimensions.get('screen').width;

function MypageHomeScreen() {
  const navigation = useNavigation<MypageHomeScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.subContainer}>
        <Text style={styles.subTitleText}>계정</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ChangePwCodeConfirm')}>
          <Text style={styles.text}>비밀번호 변경</Text>
          <Text style={styles.arrow}>〉</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('EmailSetting')}>
          <Text style={styles.text}>이메일 설정</Text>
          <Text style={styles.arrow}>〉</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.subContainer}>
        <Text style={styles.subTitleText}>이용안내</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Notice')}>
          <Text style={styles.text}>공지사항</Text>
          <Text style={styles.arrow}>〉</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Inquiry')}>
          <Text style={styles.text}>문의</Text>
          <Text style={styles.arrow}>〉</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.subContainer}>
        <Text style={styles.subTitleText}>기타</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('DeleteAccountWarning')}>
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
    paddingHorizontal: deviceWidth * 0.04,
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
