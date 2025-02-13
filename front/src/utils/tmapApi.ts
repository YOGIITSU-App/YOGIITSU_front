import axios from 'axios';
import {TMAP_API_KEY} from '@env';

// ✅ 위치 정보를 담을 타입 정의
interface Location {
  latitude: number;
  longitude: number;
}

// ✅ Tmap 대중교통 경로 API 호출 함수
export const fetchTransitRoute = async (
  startLocation: Location,
  endLocation: Location,
) => {
  const url = `https://apis.openapi.sk.com/tmap/routes/transit?version=1`;
  const headers = {
    appKey: TMAP_API_KEY,
    'Content-Type': 'application/json',
  };

  // ✅ API 요청에 맞게 변환
  const body = {
    startX: startLocation.longitude,
    startY: startLocation.latitude,
    endX: endLocation.longitude,
    endY: endLocation.latitude,
  };

  try {
    const response = await axios.post(url, body, {headers});
    return response.data.routeList;
  } catch (error) {
    console.error('대중교통 경로 요청 실패:', error);
    return [];
  }
};
