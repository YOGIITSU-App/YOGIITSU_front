import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';
import { colors } from '../../constants';
import { useUser } from '../../contexts/UserContext';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function LoginRequiredModal({ visible, onClose }: Props) {
  const { logout } = useUser();

  const handleLoginPress = async () => {
    await logout(); // 게스트 해제 → RootNavigator가 로그인 화면으로 이동
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.4)" barStyle="light-content" />
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Image
            source={require('../../assets/Warning-icon-blue.png')}
            style={styles.icon}
          />
          <Text style={styles.message}>로그인이 필요한 기능입니다</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.text}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLoginPress}
            >
              <Text style={styles.text}>로그인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '84.4%',
    backgroundColor: '#fff',
    borderRadius: 6,
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 20,
  },
  icon: {
    width: 28,
    height: 28,
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: colors.BLACK_700,
    fontWeight: '600',
    marginBottom: 29,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '88%',
    justifyContent: 'space-between',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    height: 49,
    backgroundColor: colors.GRAY_700,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    flex: 2.27,
    height: 49,
    backgroundColor: colors.BLUE_500,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
});
