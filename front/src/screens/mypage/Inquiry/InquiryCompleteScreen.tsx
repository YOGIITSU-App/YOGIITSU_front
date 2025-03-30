import React, {useContext} from 'react';
import {SafeAreaView, StyleSheet, Text, View, Image} from 'react-native';
import CustomBotton from '../../../components/CustomButton';
import {colors} from '../../../constants';
import CompleteCheck from '../../../assets/CompleteCheck.svg';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MypageStackParamList} from '../../../navigations/stack/MypageStackNavigator';
import InquiryScreen from './InquiryScreen';

function InquiryCompleteScreen() {
  const navigation = useNavigation<StackNavigationProp<MypageStackParamList>>();

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ 체크 아이콘 */}
      <View style={styles.iconContainer}>
        <CompleteCheck width={38} height={38} />
      </View>

      {/* ✅ 안내 문구 */}
      <Text style={styles.title}>문의가 접수 되었습니다</Text>
      <Text style={styles.subtitle}>
        내용 확인 후 신속하게 답변 드리겠습니다
      </Text>
      <Text style={styles.subtitleBottom}>문의 내역을 확인해 주세요 :)</Text>

      {/* ✅ 확인 버튼 */}
      <CustomBotton
        label="문의 내역으로"
        variant="filled"
        size="large"
        onPress={() => {
          navigation.navigate('Inquiry');
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.BLACK_700,
    marginBottom: 15,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.GRAY_500,
    marginBottom: 5,
    lineHeight: 19.2,
  },
  subtitleBottom: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.GRAY_500,
    marginBottom: 40,
    lineHeight: 19.2,
  },
});

export default InquiryCompleteScreen;
