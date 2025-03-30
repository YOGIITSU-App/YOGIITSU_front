import React, {useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import CustomBotton from '../../../components/CustomButton';
import {colors} from '../../../constants';
import {useInquiry} from '../../../contexts/InquiryContext';
import {MypageStackParamList} from '../../../navigations/stack/MypageStackNavigator';
import {StackNavigationProp} from '@react-navigation/stack';

function InquiryScreen() {
  const navigation = useNavigation<StackNavigationProp<MypageStackParamList>>();
  const {inquiries} = useInquiry(); // ✅ Context에서 상태 받아옴

  useEffect(() => {
    // ✅ 화면에 들어오면 바텀 탭 숨기기
    navigation.getParent()?.setOptions({tabBarStyle: {display: 'none'}});

    return () => {
      // ✅ 화면을 떠나면 바텀 탭 다시 보이게 설정
      navigation.getParent()?.setOptions({tabBarStyle: undefined});
    };
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {inquiries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.iconContainer}>
            <Image
              source={require('../../../assets/Warning-icon-gray.png')}
              style={styles.warningIcon}
            />
          </View>
          <Text style={styles.title}>문의 내용이 없습니다</Text>
          <Text style={styles.subtitle}>이용 중 불편한 점이 있으셨다면</Text>
          <Text style={styles.subtitle}>
            아래 등록 버튼을 눌러 문의를 접수해주세요
          </Text>
        </View>
      ) : (
        <FlatList
          data={inquiries}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <View style={styles.item}>
              <Text>{item.title}</Text>
              <Text>{item.date}</Text>
            </View>
          )}
        />
      )}
      <View style={styles.buttonContainer}>
        <CustomBotton
          label="문의 등록하기"
          onPress={() => navigation.navigate('InquiryWrite')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    borderRadius: 50,
    padding: 15,
    marginTop: 30,
    marginBottom: 20,
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
    lineHeight: 26,
  },
  warningIcon: {
    width: 38,
    height: 38,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  buttonContainer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
});

export default InquiryScreen;
