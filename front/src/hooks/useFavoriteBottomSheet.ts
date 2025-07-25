import {useCallback, useEffect, useState} from 'react';
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
  const [isLoading, setIsLoading] = useState(false); // 추가!

  // 열기
  const open = useCallback(async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 닫기
  const close = useCallback(() => {
    setVisible(false);
  }, []);

  // 글로벌 접근용 함수 등록
  useEffect(() => {
    globalThis.openFavoriteBottomSheet = open;
    globalThis.closeFavoriteBottomSheet = close;
    return () => {
      globalThis.openFavoriteBottomSheet = undefined;
      globalThis.closeFavoriteBottomSheet = undefined;
    };
  }, [open, close]);

  return {
    visible,
    open,
    close,
    favorites,
    isLoading,
  };
};
