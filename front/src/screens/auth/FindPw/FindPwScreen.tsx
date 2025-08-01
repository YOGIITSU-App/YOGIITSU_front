import React from 'react';
import {Alert, Dimensions, StyleSheet, Text, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';

import InputField from '../../../components/inputField';
import CustomBotton from '../../../components/CustomButton';
import CustomText from '../../../components/CustomText';

import {colors} from '../../../constants';
import useForm from '../../../hooks/useForms';
import {validatePwConfirm} from '../../../utils';
import {AuthStackParamList} from '../../../navigations/stack/AuthStackNavigator';
import authApi from '../../../api/authApi';
import AppScreenLayout from '../../../components/common/AppScreenLayout';

const deviceWidth = Dimensions.get('screen').width;

function FindPwScreen() {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'FindPw'>>();
  const {email: routeEmail} = route.params;

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

      if (!routeEmail) {
        Alert.alert('오류', '인증된 이메일이 없어요!');
        return;
      }

      await authApi.resetPassword(routeEmail, password, passwordConfirm);
      navigation.navigate('FindPwComplete');
    } catch (err) {
      Alert.alert('비밀번호 변경 실패', '다시 시도해주세요!');
      console.error(err);
    }
  };

  return (
    <AppScreenLayout disableTopInset>
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
            text="영문, 숫자, 특수문자를 포함한 8~16자리"
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
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  guideContainer: {
    marginTop: 15,
    marginLeft: deviceWidth * 0.08,
    gap: 3,
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
