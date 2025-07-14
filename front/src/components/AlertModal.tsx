import React from 'react';
import {Modal, View, Text, StyleSheet, Dimensions} from 'react-native';
import CustomBotton from './CustomButton';
import {colors} from '../constants';

const {width: W, height: H} = Dimensions.get('screen');

type ButtonConfig = {
  label: string;
  onPress: () => void;
  style?: object;
};

type AlertModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  message: string;
  buttons: ButtonConfig[];
};

export default function AlertModal({
  visible,
  onRequestClose,
  message,
  buttons,
}: AlertModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onRequestClose}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.text}>{message}</Text>
          <View style={styles.row}>
            {buttons.map((b, i) => (
              <CustomBotton
                key={i}
                label={b.label}
                onPress={b.onPress}
                style={[styles.btn, b.style]}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: W * 0.85,
    height: H * 0.19375,
    padding: 20,
    backgroundColor: colors.WHITE,
    borderRadius: 6,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BLACK_500,
    marginTop: 18,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 17,
  },
  btn: {
    flex: 1,
    width: W * 0.35,
    height: H * 0.06125,
    marginHorizontal: 7,
    justifyContent: 'center',
    borderRadius: 6,
  },
});
