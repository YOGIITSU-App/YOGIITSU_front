import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';

type PlaceDetailScreenNavigationProp = StackNavigationProp<
  MapStackParamList,
  'PlaceDetail'
>;
type PlaceDetailScreenRouteProp = RouteProp<MapStackParamList, 'PlaceDetail'>;

function PlaceDetailScreen() {
  const navigation = useNavigation<PlaceDetailScreenNavigationProp>();
  const route = useRoute<PlaceDetailScreenRouteProp>();
  const {placeName} = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{placeName}</Text>
      <Text style={styles.subtitle}>#ICT융합대학 #수원대학교</Text>

      {/* 출발 / 도착 버튼 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate('MapHome', {startLocation: placeName})
          }>
          <Text style={styles.buttonText}>출발</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate('MapHome', {endLocation: placeName})
          }>
          <Text style={styles.buttonText}>도착</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: 'white'},
  title: {fontSize: 24, fontWeight: 'bold'},
  subtitle: {fontSize: 16, color: '#666', marginBottom: 20},
  buttonContainer: {flexDirection: 'row', justifyContent: 'space-around'},
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: 100,
    alignItems: 'center',
  },
  buttonText: {color: 'white', fontSize: 16},
});

export default PlaceDetailScreen;
