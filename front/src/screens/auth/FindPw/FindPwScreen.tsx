import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {
  Dimensions,
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import CustomBotton from '../../../components/CustomButton';
import CustomText from '../../../components/CustomText';
import InputField from '../../../components/inputField';
import {colors} from '../../../constants';
import useForm from '../../../hooks/useForms';
import {validatePwConfirm} from '../../../utils';
import {AuthStackParamList} from '../../../navigations/stack/AuthStackNavigator';
import authApi from '../../../api/authApi'; // ✅ 비밀번호 변경 API

const deviceWidth = Dimensions.get('screen').width;

function FindPwScreen() {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'FindPw'>>(); // ✅ route로 email 받기
  const {email} = route.params; // ✅ 이메일 꺼내기

  const pwconfirmcheak = useForm({
    initialValue: {
      password: '',
      passwordConfirm: '',
    },
    validate: validatePwConfirm,
  });

  const handleChangePassword = async () => {
    try {
      const {password, passwordConfirm} = pwconfirmcheak.values;
      // ✅ API 호출: 이메일 + 새로운 비밀번호
      await authApi.resetPassword(email, password, passwordConfirm);
      navigation.navigate('FindPwComplete');
    } catch (err) {
      Alert.alert('비밀번호 변경 실패', '다시 시도해주세요!');
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.guideContainer}>
        <Text style={styles.guideText}>
          <Text style={styles.highlightedText}>새로운 비밀번호</Text>를
          설정해주세요
        </Text>
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.pwBigInputfield}>
          <InputField
            placeholder="비밀번호"
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
            inValid={!pwconfirmcheak.isFormValid}
            onPress={handleChangePassword}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
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
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  pwBigInputfield: {
    paddingTop: 30,
    gap: 15,
  },
  errorMessageContainer: {
    alignSelf: 'flex-start',
    marginLeft: deviceWidth * 0.04,
  },
  enterButton: {
    marginTop: '15%',
  },
});

export default FindPwScreen;
