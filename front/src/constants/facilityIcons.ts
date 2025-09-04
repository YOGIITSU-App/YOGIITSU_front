import { ImageSourcePropType } from 'react-native';

export type FacilityType =
  | 'PARKING'
  | 'READING_ROOM'
  | 'VENDING_MACHINE'
  | 'PRINTER'
  | 'UNMANNED_LOCKER'
  | 'NURSE_OFFICE'
  | 'POWER_BANK'
  | 'STUDY_ROOM'
  | 'CAFETERIA'
  | 'ELEVATOR'
  | 'MICROWAVE'
  | 'ICE_MAKER'
  | 'CAFE'
  | 'CONVENIENCE_STORE'
  | 'GYM';

export const defaultFacilityIcon = require('../assets/facilities-icon/facility-default.png');

// type 기반 매핑
export const facilityIconByType: Record<FacilityType, ImageSourcePropType> = {
  PARKING: require('../assets/facilities-icon/parking.png'),
  READING_ROOM: require('../assets/facilities-icon/reading-room.png'),
  VENDING_MACHINE: require('../assets/facilities-icon/vending-machine.png'),
  PRINTER: require('../assets/facilities-icon/printer.png'),
  UNMANNED_LOCKER: require('../assets/facilities-icon/unmanned-locker.png'),
  NURSE_OFFICE: require('../assets/facilities-icon/nurse-office.png'),
  POWER_BANK: require('../assets/facilities-icon/power-bank.png'),
  STUDY_ROOM: require('../assets/facilities-icon/study-room.png'),
  CAFETERIA: require('../assets/facilities-icon/cafeteria.png'),
  ELEVATOR: require('../assets/facilities-icon/elevator.png'),
  MICROWAVE: require('../assets/facilities-icon/microwave.png'),
  ICE_MAKER: require('../assets/facilities-icon/ice-maker.png'),
  CAFE: require('../assets/facilities-icon/cafe.png'),
  CONVENIENCE_STORE: require('../assets/facilities-icon/convenience-store.png'),
  GYM: require('../assets/facilities-icon/gym.png'),
};

// name 기반 매핑
export const facilityIconByName: Record<string, ImageSourcePropType> = {
  주차장: require('../assets/facilities-icon/parking.png'),
  열람실: require('../assets/facilities-icon/reading-room.png'),
  자판기: require('../assets/facilities-icon/vending-machine.png'),
  프린터기: require('../assets/facilities-icon/printer.png'),
  무인택배함: require('../assets/facilities-icon/unmanned-locker.png'),
  보건실: require('../assets/facilities-icon/nurse-office.png'),
  보조배터리: require('../assets/facilities-icon/power-bank.png'),
  스터디룸: require('../assets/facilities-icon/study-room.png'),
  식당: require('../assets/facilities-icon/cafeteria.png'),
  엘리베이터: require('../assets/facilities-icon/elevator.png'),
  전자레인지: require('../assets/facilities-icon/microwave.png'),
  제빙기: require('../assets/facilities-icon/ice-maker.png'),
  카페: require('../assets/facilities-icon/cafe.png'),
  편의점: require('../assets/facilities-icon/convenience-store.png'),
  헬스장: require('../assets/facilities-icon/gym.png'),
};

// 공용 헬퍼: type 우선, 없으면 name fallback
export const getFacilityIcon = (fac: { type?: string; name?: string }) => {
  if (fac.type && facilityIconByType[fac.type as FacilityType]) {
    return facilityIconByType[fac.type as FacilityType];
  }
  if (fac.name && facilityIconByName[fac.name]) {
    return facilityIconByName[fac.name];
  }
  return defaultFacilityIcon;
};
