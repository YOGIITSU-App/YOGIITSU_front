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
  const [startBuildingId, setStartBuildingId] = useState<number | null>(null);
  const [endBuildingId, setEndBuildingId] = useState<number | null>(null);

  // 전달받은 route.params 값으로 출발지/도착지 정보 초기화
  useEffect(() => {
    const {
      startLocation,
      startLocationName,
      startBuildingId,
      endLocation,
      endLocationName,
      endBuildingId,
    } = route.params ?? {};

    if (startLocation !== undefined) {
      setStartLocation(startLocation);
      setStartLocationName(startLocationName || '출발지 선택');
    }

    if (startBuildingId !== undefined) {
      setStartBuildingId(startBuildingId);
    }

    if (endLocation !== undefined) {
      setEndLocation(endLocation);
      setEndLocationName(endLocationName || '도착지 선택');
    }

    if (endBuildingId !== undefined) {
      setEndBuildingId(endBuildingId);
    }
  }, [route.params]);

  // 출발+도착 모두 존재하고 편집했을 때 결과화면으로 이동
  useEffect(() => {
    if (startLocation && endLocation) {
      requestAnimationFrame(() => {
        navigation.navigate(mapNavigation.ROUTE_RESULT, {
          startLocation,
          startLocationName,
          endLocation,
          endLocationName,
          startBuildingId: startBuildingId ?? undefined,
          endBuildingId: endBuildingId ?? undefined,
        });
      });
    }
  }, [startLocation, endLocation]);

  const handleSearchLocation = (type: 'start' | 'end') => {
    navigation.push(mapNavigation.SEARCH, {
      selectionType: type,
      fromResultScreen: false,
      previousStartLocation: startLocation,
      previousStartLocationName: startLocationName,
      previousEndLocation: endLocation,
      previousEndLocationName: endLocationName,
      startBuildingId: startBuildingId ?? undefined,
      endBuildingId: endBuildingId ?? undefined,
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
