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

function EmailsettingScreen() {
  const emailcheak = useForm({
    initialValue: {
      email: '',
    },
    validate: validateEmail,
  });

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
    <SafeAreaView style={styles.container}>
      <View style={styles.guideContainer}>
        <Text style={styles.guideText}>이메일을 변경하기 위해</Text>
        <Text style={styles.guideText}>
          <Text style={styles.highlightedText}>가입 이메일</Text>을 입력해주세요
        </Text>
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.emailContainer}>
          <InputField
            placeholder="이메일 입력"
            inputMode="email"
            touched={emailcheak.touched.email}
            error={emailcheak.errors.email}
            {...emailcheak.getTextInputProps('email')}
          />
        </View>
        <View style={styles.errorMessageContainer}>
          <CustomText
            text="이메일 형식으로 입력해 주세요"
            touched={emailcheak.touched.email}
            error={emailcheak.errors.email}
            {...emailcheak.getTextInputProps('email')}
          />
        </View>
        <CustomBotton
          label="인증번호 전송"
          variant="filled"
          size="large"
          inValid={!emailcheak.isFormValid} // 폼이 유효하지 않으면 버튼 비활성화
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
  emailContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  errorMessageContainer: {
    alignSelf: 'flex-start',
    marginLeft: deviceWidth * 0.05,
    marginTop: 58,
    marginBottom: '15%',
  },
});

export default EmailsettingScreen;
