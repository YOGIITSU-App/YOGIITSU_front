// TermsDetailScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {TERMS_CONTENT} from '../../constants/terms';
import {colors} from '../../constants';
import {AuthStackParamList} from '../../navigations/stack/AuthStackNavigator';
import AppScreenLayout from '../../components/common/AppScreenLayout';

// 타입 명시
const TermsDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<AuthStackParamList, 'TermsDetail'>>();
  const {type} = route.params;
  const content = TERMS_CONTENT[type];

  const getTitle = (key: string) => {
    switch (key) {
      case 'age':
        return '연령 동의';
      case 'terms':
        return '서비스 이용약관';
      case 'privacy':
        return '개인정보 처리방침';
      case 'loc':
        return '위치기반 서비스 이용약관';
      default:
        return '약관';
    }
  };

  return (
    <AppScreenLayout>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../../assets/back-icon.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.title}>{getTitle(type)}</Text>
        <View style={{width: 24}} />
      </View>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{paddingBottom: 30}}>
        <Text style={styles.contentText}>{content}</Text>
      </ScrollView>
    </AppScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.GRAY_100,
  },
  backIcon: {
    width: 9,
    height: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BLACK,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.BLACK_500,
  },
});

export default TermsDetailScreen;
