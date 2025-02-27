import React from 'react';
import {Dimensions, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import InputField from '../../../components/inputField';
import CustomBotton from '../../../components/CustomButton';
import CustomText from '../../../components/CustomText';
import {colors} from '../../../constants';
import useForm from '../../../hooks/useForms';
import {validateEmail, validatePw} from '../../../utils';

const deviceWidth = Dimensions.get('screen').width;

function SignupScreen() {
  const pwcheak = useForm({
    initialValue: {
      password: '',
    },
    validate: validatePw,
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.guideContainer}>
        <Text style={styles.guideText}>회원탈퇴를 위해</Text>
        <Text style={styles.guideText}>
          <Text style={styles.highlightedText}>비밀번호</Text>를 입력해주세요
        </Text>
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.pwContainer}>
          <InputField
            placeholder="비밀번호 입력"
            inputMode="text"
            secureTextEntry
            {...pwcheak.getTextInputProps('password')}
          />
        </View>
        <CustomBotton
          label="확인"
          variant="filled"
          size="large"
          inValid={!pwcheak.isFormValid} // 폼이 유효하지 않으면 버튼 비활성화
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  guideContainer: {
    marginTop: 15,
    marginLeft: deviceWidth * 0.08,
    gap: 3,
    marginBottom: '5%',
  },
  guideText: {
    fontSize: 20,
    color: colors.BLACK_700,
    fontWeight: '700',
  },
  highlightedText: {
    color: colors.BLUE_700,
  },
  infoContainer: {
    justifyContent: 'flex-start', // 위쪽 정렬
    paddingTop: 20, // 위쪽 여백 조정
    paddingHorizontal: 20, // 상하 여백 조정
    alignItems: 'center',
    marginBottom: 15,
  },
  pwContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: '15%',
  },
  errorMessageContainer: {
    alignSelf: 'flex-start',
    marginLeft: deviceWidth * 0.05,
    marginTop: 58,
    marginBottom: '15%',
  },
});

export default SignupScreen;
