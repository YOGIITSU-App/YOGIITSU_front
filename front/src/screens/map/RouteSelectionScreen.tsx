import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../../constants/navigation';

type RouteSelectionScreenNavigationProp = StackNavigationProp<
  MapStackParamList,
  typeof mapNavigation.ROUTE_SELECTION
>;
type RouteSelectionScreenRouteProp = RouteProp<
  MapStackParamList,
  typeof mapNavigation.ROUTE_SELECTION
>;

function RouteSelectionScreen() {
  const navigation = useNavigation<RouteSelectionScreenNavigationProp>();
  const route = useRoute<RouteSelectionScreenRouteProp>();

  const [startLocation, setStartLocation] = useState('');
  const [startLocationName, setStartLocationName] = useState('출발지 선택');
  const [endLocation, setEndLocation] = useState('');
  const [endLocationName, setEndLocationName] = useState('도착지 선택');

  // 🔸 route.params 가 바뀔 때마다 값 갱신 (이전 상태 유지 + 덮어쓰기)
  useEffect(() => {
    if (route.params?.startLocation) {
      setStartLocation(route.params.startLocation);
      setStartLocationName(route.params.startLocationName || '출발지 선택');
    }
    if (route.params?.endLocation) {
      setEndLocation(route.params.endLocation);
      setEndLocationName(route.params.endLocationName || '도착지 선택');
    }
  }, [route.params]);

  // 🔸 출발+도착 모두 존재 시 자동으로 길찾기 화면으로 이동
  useEffect(() => {
    if (startLocation && endLocation) {
      console.log('✅ 출발 좌표:', startLocation);
      console.log('✅ 도착 좌표:', endLocation);
      navigation.replace(mapNavigation.ROUTE_RESULT, {
        startLocation,
        startLocationName,
        endLocation,
        endLocationName,
      });
    }
  }, [startLocation, endLocation]);

  const handleSearchLocation = (type: 'start' | 'end') => {
    navigation.navigate(mapNavigation.SEARCH, {
      selectionType: type,
      previousStartLocation: startLocation,
      previousStartLocationName: startLocationName,
      previousEndLocation: endLocation,
      previousEndLocationName: endLocationName,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>출발지</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => handleSearchLocation('start')}>
        <Text>{startLocationName}</Text>
      </TouchableOpacity>
      <Text style={styles.label}>도착지</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => handleSearchLocation('end')}>
        <Text>{endLocationName}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: 'white'},
  label: {fontSize: 18, fontWeight: 'bold', marginBottom: 5},
  input: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    justifyContent: 'center',
    marginBottom: 20,
  },
});

export default RouteSelectionScreen;
