import React, {useContext} from 'react';
import {SafeAreaView, StyleSheet, Text, View, Image} from 'react-native';
import CustomBotton from '../../../components/CustomButton';
import {colors} from '../../../constants';
import {AuthContext} from '../../../navigations/root/Rootnavigator';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MypageStackParamList} from '../../../navigations/stack/MypageStackNavigator';

function ChangeEmailCompleteScreen() {
  const navigation = useNavigation<StackNavigationProp<MypageStackParamList>>();

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ 체크 아이콘 */}
      <View style={styles.iconContainer}>
        <Image
          style={styles.warningIcon}
          source={require('../../../assets/Warning-icon-gray.png')}
        />
      </View>

      {/* ✅ 안내 문구 */}
      <Text style={styles.title}>변경이 완료되었습니다</Text>

      {/* ✅ 확인 버튼 */}
      <CustomBotton
        label="확인"
        variant="filled"
        size="large"
        onPress={() => {
          navigation.navigate('MypageHome'); // ✅ MypageHomeScreen으로 이동
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
    alignItems: 'center',
  },
  iconContainer: {
    borderRadius: 50,
    padding: 15,
    marginTop: 30,
    marginBottom: 25,
  },
  warningIcon: {
    width: 38,
    height: 38,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.BLACK_700,
    marginBottom: 50,
    lineHeight: 30,
  },
});

export default ChangeEmailCompleteScreen;
