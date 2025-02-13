import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../../constants/navigation';

// 네비게이션 타입 지정
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

  // ✅ 출발지 & 도착지 정보
  const [startLocation, setStartLocation] = useState(
    route.params?.startLocation || '',
  );
  const [startLocationName, setStartLocationName] = useState(
    route.params?.startLocationName || '출발지 선택',
  );
  const [endLocation, setEndLocation] = useState(
    route.params?.endLocation || '',
  );
  const [endLocationName, setEndLocationName] = useState(
    route.params?.endLocationName || '도착지 선택',
  );

  // ✅ 출발지 또는 도착지 선택 시 검색 화면으로 이동
  const handleSearchLocation = (type: 'start' | 'end') => {
    navigation.navigate(mapNavigation.SEARCH, {selectionType: type});
  };

  // ✅ 출발지 & 도착지가 모두 선택되면 자동으로 `RouteResultScreen`으로 이동
  useEffect(() => {
    if (startLocation && endLocation) {
      navigation.replace(mapNavigation.ROUTE_RESULT, {
        startLocation,
        startLocationName,
        endLocation,
        endLocationName,
      });
    }
  }, [startLocation, endLocation]);

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
