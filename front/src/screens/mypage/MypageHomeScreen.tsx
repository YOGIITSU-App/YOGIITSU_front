import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
} from 'react-native';
import { colors } from '../../constants';
import {
  CompositeNavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MypageStackParamList } from '../../navigations/stack/MypageStackNavigator';
import { RootStackParamList } from '../../navigations/root/Rootnavigator';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import MypageProfileCard, {
  ProfileData,
} from '../../components/MypageProfileCard';
import { getMypageProfile, MypageProfileResponse } from '../../api/mypageApi';
import CustomButton from '../../components/CustomButton';
import { logoutEmitter } from '../../utils/logoutEmitter';
import { useUser } from '../../contexts/UserContext';
import { signOutAll } from '../../api/socialAuth';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

type MypageNavigationProp = CompositeNavigationProp<
  StackNavigationProp<MypageStackParamList>,
  StackNavigationProp<RootStackParamList>
>;

function MypageHomeScreen() {
  const navigation = useNavigation<MypageNavigationProp>();
  const { isGuest, user, setGuest, logout } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  /** 앱 진입 직후 게스트 로그인 복구 */
  useEffect(() => {
    // RootNavigator에서 guest 상태로 들어왔을 경우 자동 세팅
    if (!isGuest) {
      (async () => {
        const saved = await import('react-native-encrypted-storage').then(m =>
          m.default.getItem('isGuest'),
        );
        if (saved === 'true') setGuest(true);
      })();
    }
  }, []);

  /** 로그인 유저 프로필 불러오기 */
  useEffect(() => {
    (async () => {
      if (isGuest || !user) return;

      try {
        const res: MypageProfileResponse = await getMypageProfile();
        setProfile({
          name: res.userName,
          email: res.email,
          provider: 'local',
          providerId: res.memberId,
        });
      } catch (err) {
        console.error('프로필 불러오기 실패', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [isGuest, user]);

  const handleLogout = async () => {
    try {
      setModalVisible(false);
      await signOutAll();
      logoutEmitter.emit('force-logout');
    } catch (err) {
      logoutEmitter.emit('force-logout');
    }
  };

  /** 게스트 모드 화면 */
  if (isGuest) {
    return (
      <AppScreenLayout disableTopInset>
        <ScrollView>
          <TouchableOpacity
            style={styles.loginPrompt}
            onPress={async () => {
              await signOutAll();
              await logout();
            }}
          >
            <View style={styles.guestBox}>
              <Text style={styles.loginText}>로그인 해주세요 </Text>
              <Image
                source={require('../../assets/right-arrow-icon2.png')}
                style={styles.arrowIcon}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.subContainer}>
            <Text style={styles.subTitleText}>이용 안내</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Notice')}
            >
              <Text style={styles.text}>공지사항</Text>
              <Text style={styles.arrow}>〉</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Inquiry')}
            >
              <Text style={styles.text}>문의</Text>
              <Text style={styles.arrow}>〉</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </AppScreenLayout>
    );
  }

  /** 로그인 유저 화면 */
  return (
    <AppScreenLayout disableTopInset>
      <ScrollView>
        {loading ? (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <ActivityIndicator size="large" color={colors.BLUE_700} />
          </View>
        ) : (
          profile && <MypageProfileCard data={profile} />
        )}

        <View style={styles.subContainer}>
          <Text style={styles.subTitleText}>계정</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('ChangePwCodeConfirm')}
          >
            <Text style={styles.text}>비밀번호 변경</Text>
            <Text style={styles.arrow}>〉</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('CurrentEmailCodeConfirm')}
          >
            <Text style={styles.text}>이메일 설정</Text>
            <Text style={styles.arrow}>〉</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.subContainer}>
          <Text style={styles.subTitleText}>이용 안내</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Notice')}
          >
            <Text style={styles.text}>공지사항</Text>
            <Text style={styles.arrow}>〉</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Inquiry')}
          >
            <Text style={styles.text}>문의</Text>
            <Text style={styles.arrow}>〉</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.subContainer}>
          <Text style={styles.subTitleText}>기타</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('DeleteAccountWarning')}
          >
            <Text style={styles.text}>회원탈퇴</Text>
            <Text style={styles.arrow}>〉</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.text}>로그아웃</Text>
            <Text style={styles.arrow}>〉</Text>
          </TouchableOpacity>
        </View>

        {/* 로그아웃 모달 */}
        <Modal
          animationType="fade"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <StatusBar
            backgroundColor="rgba(0,0,0,0.5)"
            barStyle="light-content"
          />
          <View style={styles.modalBackground}>
            <View style={styles.modalBox}>
              <Text style={styles.modalText}>로그아웃 하시겠어요?</Text>
              <View style={styles.buttonContainer}>
                <CustomButton
                  label="아니요"
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                />
                <CustomButton
                  label="네"
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleLogout}
                />
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  guestBox: {
    backgroundColor: colors.BLUE_100,
    marginTop: 19,
    width: '92%',
    alignSelf: 'center',
    padding: 16,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginPrompt: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  loginText: {
    fontSize: 16,
    lineHeight: 21,
    color: colors.BLACK_900,
    fontWeight: '600',
  },
  arrowIcon: {
    tintColor: colors.BLACK_900,
    marginLeft: 9,
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
    color: colors.BLACK_900,
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
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBox: {
    width: deviceWidth * 0.844,
    height: deviceHeight * 0.19375,
    backgroundColor: colors.WHITE,
    borderRadius: 6,
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 0,
  },
  modalText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BLACK_500,
    marginBottom: 20,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    height: deviceHeight * 0.07,
    position: 'absolute',
    bottom: 0,
  },
  modalButton: {
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

export default MypageHomeScreen;
