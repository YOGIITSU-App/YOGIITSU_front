import {useCallback, useState} from 'react';
import favoriteApi from '../api/favoriteApi';

export type FavoriteItem = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

export const useFavoriteBottomSheet = () => {
  const [visible, setVisible] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // ✅ 즐겨찾기 바텀시트 열기 + 데이터 불러오기
  const open = useCallback(async () => {
    try {
      const res = await favoriteApi.getFavorites();
      const list = res.data.buildings.map((b: any) => ({
        id: b.buildingId,
        name: b.buildingName,
        latitude: b.latitude ?? 0,
        longitude: b.longitude ?? 0,
      }));
      setFavorites(list);
      setVisible(true);
    } catch (e) {
      console.error('즐겨찾기 불러오기 실패', e);
    }
  }, []);

  // ✅ 닫기 함수도 useCallback 처리 (불필요한 재생성 방지)
  const close = useCallback(() => {
    setVisible(false);
  }, []);

  return {
    visible,
    open,
    close,
    favorites,
  };
};
