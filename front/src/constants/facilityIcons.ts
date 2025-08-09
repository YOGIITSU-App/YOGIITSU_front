import {ImageSourcePropType} from 'react-native';

export const facilityIconMap: {[key: string]: ImageSourcePropType} = {
  카페: require('../assets/facilities-icon/cafe.png'),
  편의점: require('../assets/facilities-icon/convenience-store.png'),
  기숙사: require('../assets/facilities-icon/dormitory.png'),
  엘리베이터: require('../assets/facilities-icon/elevator.png'),
  헬스장: require('../assets/facilities-icon/gym.png'),
  주차장: require('../assets/facilities-icon/parking.png'),
  프린터기: require('../assets/facilities-icon/printer.png'),
  열람실: require('../assets/facilities-icon/reading-room.png'),
  식당: require('../assets/facilities-icon/restaurant.png'),
  스터디룸: require('../assets/facilities-icon/studyroom.png'),
  자판기: require('../assets/facilities-icon/vending-machine.png'),
  정수기: require('../assets/facilities-icon/water-purifier.png'),
};

export const defaultFacilityIcon = require('../assets/facilities-icon/vending-machine.png');
