// AppScreenLayout.tsx
import React, {ReactNode} from 'react';
import {View, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  disableTopInset?: boolean; // ✨ 추가
};

export default function AppScreenLayout({
  children,
  disableTopInset = false,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {paddingTop: disableTopInset ? 0 : insets.top},
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
