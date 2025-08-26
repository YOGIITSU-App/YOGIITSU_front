import React, { useLayoutEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../../../constants';
import { useNavigation } from '@react-navigation/native';
import CustomBotton from '../../../components/CustomButton';
import { StackNavigationProp } from '@react-navigation/stack';
import { MypageStackParamList } from '../../../navigations/stack/MypageStackNavigator';
import { useTabOptions } from '../../../constants/tabOptions';
import AppScreenLayout from '../../../components/common/AppScreenLayout';
import authApi from '../../../api/authApi';

const deviceWidth = Dimensions.get('screen').width;

const deviceHeight = Dimensions.get('screen').height;

function DeleteAccountWarningScreen() {
  const tabOptions = useTabOptions();
  const [modalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation<StackNavigationProp<MypageStackParamList>>();

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: 'none' } });

    return () => {
      parent?.setOptions({ tabBarStyle: tabOptions.tabBarStyle });
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
          - 데이터가 모두 삭제되며, 복구가 불가능합니다
        </Text>
        <Text style={styles.infoText}>
          - 자세한 내용은 개인정보처리방침을 확인해주세요
        </Text>
      </View>
      <View style={styles.centeredContainer}>
        <CustomBotton
          label="확인했습니다"
          onPress={() => setModalVisible(true)}
        />
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            {/* 아이콘 자리 */}
            <Image
              source={require('../../../assets/Warning-icon-gray.png')}
              style={styles.modalWarningIcon}
            />
            {/* 안내 문구 */}
            <Text style={styles.modalTitle}>
              정말로 <Text style={styles.highlightText}>탈퇴</Text>하시겠어요?
            </Text>
            <Text style={styles.modalSubtitle}>
              탈퇴 시 계정 복구가 불가능합니다
            </Text>
            {/* 버튼 컨테이너 */}
            <View style={styles.buttonContainer}>
              {/* 취소 버튼 */}
              <CustomBotton
                label="아니요"
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              />
              {/* 탈퇴 버튼 */}
              <CustomBotton
                label="네"
                style={[styles.button, styles.confirmButton]}
                onPress={async () => {
                  setModalVisible(false);
                  try {
                    await authApi.deleteAccount();
                    navigation.navigate('DeleteAccountComplete');
                  } catch (error: any) {
                    const msg =
                      error.response?.data?.message ?? '회원 탈퇴 실패';
                    Alert.alert('에러', msg);
                  }
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
  },
  warningBox: {
    backgroundColor: colors.GRAY_100,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
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
    lineHeight: 20,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.GRAY_500,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 배경
  },
  modalBox: {
    width: deviceWidth * 0.844,
    height: deviceHeight * 0.2725,
    backgroundColor: colors.WHITE,
    borderRadius: 6,
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 0,
  },
  modalWarningIcon: {
    width: 28,
    height: 28,
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.BLACK_500,
    marginBottom: 10,
    lineHeight: 21.6,
  },
  highlightText: {
    color: colors.BLUE_700,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.GRAY_500,
    lineHeight: 16.8,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    height: deviceHeight * 0.07,
    position: 'absolute',
    bottom: 0,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.GRAY_300,
    borderBottomLeftRadius: 6,
  },
  confirmButton: {
    backgroundColor: colors.BLUE_700,
    borderBottomRightRadius: 6,
  },
});

export default DeleteAccountWarningScreen;
