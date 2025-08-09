import React, {useLayoutEffect} from 'react';
import {Dimensions, Image, StyleSheet, Text, View} from 'react-native';
import {colors} from '../../../constants';
import {useNavigation} from '@react-navigation/native';
import CustomBotton from '../../../components/CustomButton';
import {StackNavigationProp} from '@react-navigation/stack';
import {MypageStackParamList} from '../../../navigations/stack/MypageStackNavigator';
import {useTabOptions} from '../../../constants/tabOptions';
import AppScreenLayout from '../../../components/common/AppScreenLayout';

const deviceWidth = Dimensions.get('screen').width;

const deviceHeight = Dimensions.get('screen').height;

function DeleteAccountWarningScreen() {
  const tabOptions = useTabOptions();

  const navigation = useNavigation<StackNavigationProp<MypageStackParamList>>();

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({tabBarStyle: {display: 'none'}});

    return () => {
      parent?.setOptions({tabBarStyle: tabOptions.tabBarStyle});
    };
  }, [navigation]);

  return (
    <AppScreenLayout disableTopInset>
      <View style={styles.guideContainer}>
        <Text style={styles.guideText}>
          <Text style={styles.highlightedText}>잠시만요,</Text>
        </Text>
        <Text style={styles.guideText}>정말 탈퇴하시나요?</Text>
      </View>
      <View style={styles.centeredContainer}>
        <View style={styles.warningBox}>
          <Image
            source={require('../../../assets/Warning-icon-black.png')}
            style={styles.warningIcon}
          />
          <Text style={styles.warningText}> 탈퇴 전에 꼭 확인해주세요</Text>
        </View>
      </View>
      <View style={styles.guideContainer}>
        <Text style={styles.infoText}>
          - 탈퇴 후 7일 동안 가입이 제한됩니다
        </Text>
        <Text style={styles.infoText}>
          - 데이터가 모두 삭제되며, 복구가 불가능합니다
        </Text>
        <Text style={styles.infoText}>
          - 자세한 내용은 개인정보처리방침을 확인해주세요
        </Text>
      </View>
      <View style={styles.centeredContainer}>
        <CustomBotton
          label="확인했습니다"
          onPress={() => navigation.navigate('DeleteAccount')}
        />
      </View>
    </AppScreenLayout>
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
    marginBottom: '10%',
  },
  guideText: {
    fontSize: 24,
    color: colors.BLACK_700,
    fontWeight: '700',
  },
  highlightedText: {
    color: colors.BLUE_700,
  },
  centeredContainer: {
    alignItems: 'center', // 가로 중앙 정렬
  },
  warningBox: {
    backgroundColor: colors.GRAY_100, // 연한 회색 배경
    padding: 15,
    borderRadius: 10, // 모서리 둥글게
    flexDirection: 'row', // 아이콘 + 텍스트 가로 정렬
    alignItems: 'center',
    marginBottom: 15,
    width: deviceWidth * 0.84,
    height: deviceHeight * 0.06,
  },
  warningIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  warningText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999999',
    lineHeight: 20, // 아이콘 크기와 맞추기 위해 줄 간격 설정
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.GRAY_500,
  },
});

export default DeleteAccountWarningScreen;
