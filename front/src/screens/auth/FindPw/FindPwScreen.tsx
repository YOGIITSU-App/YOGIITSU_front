import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useEffect} from 'react';
import {Dimensions, SafeAreaView, View, Text, StyleSheet} from 'react-native';
import CustomBotton from '../../../components/CustomButton';
import CustomText from '../../../components/CustomText';
import InputField from '../../../components/inputField';
import {colors} from '../../../constants';
import useForm from '../../../hooks/useForms';
import {validatePwConfirm} from '../../../utils';
import {AuthStackParamList} from '../../../navigations/stack/AuthStackNavigator';

const deviceWidth = Dimensions.get('screen').width;

function FindPwScreen() {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();

  const pwconfirmcheak = useForm({
    initialValue: {
      password: '',
      passwordConfirm: '',
    },
    validate: validatePwConfirm,
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.guideContainer}>
        <Text style={styles.guideText}>
          <Text style={styles.highlightedText}>새로운 비밀번호</Text>
          를설정해주세요
        </Text>
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.pwBigInputfield}>
          <InputField
            placeholder="비밀번호"
            inputMode="text"
            secureTextEntry
            touched={pwconfirmcheak.touched.password}
            error={pwconfirmcheak.errors.password}
            {...pwconfirmcheak.getTextInputProps('password')}
          />
        </View>
        <View style={styles.errorMessageContainer}>
          <CustomText
            text="영문, 숫자, 특수문자를 포함한 8자리 이상"
            touched={pwconfirmcheak.touched.password}
            error={pwconfirmcheak.errors.password}
          />
        </View>
        <View style={styles.pwBigInputfield}>
          <InputField
            placeholder="비밀번호 확인"
            inputMode="text"
            secureTextEntry
            touched={pwconfirmcheak.touched.passwordConfirm}
            error={pwconfirmcheak.errors.passwordConfirm}
            {...pwconfirmcheak.getTextInputProps('passwordConfirm')}
          />
        </View>
        <View style={styles.errorMessageContainer}>
          <CustomText
            text="위의 비밀번호와 일치하지 않습니다"
            touched={pwconfirmcheak.touched.passwordConfirm}
            error={pwconfirmcheak.errors.passwordConfirm}
          />
        </View>
        <View style={styles.enterButton}>
          <CustomBotton
            label="변경"
            variant="filled"
            size="large"
            inValid={!pwconfirmcheak.isFormValid} // 폼이 유효하지 않으면 버튼 비활성화
            onPress={() => {
              if (pwconfirmcheak.isFormValid) {
                navigation.navigate('FindPwComplete');
              }
            }}
          />
        </View>
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
  pwBigInputfield: {
    paddingTop: 30, // 위쪽 여백 조정
    gap: 15,
  },
  errorMessageContainer: {
    alignSelf: 'flex-start',
    marginLeft: deviceWidth * 0.04,
    // marginBottom: '3%',
  },
  enterButton: {
    marginTop: '15%',
  },
});

export default FindPwScreen;
