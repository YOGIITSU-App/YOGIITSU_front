import React, {createContext, useContext, useState, ReactNode} from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import FavoriteBottomSheetContent from '../components/FavoriteBottomSheetContent';
import favoriteApi from '../api/favoriteApi';

type FavoriteItem = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

type ContextValue = {
  open: () => void;
  close: () => void;
};

const FavoriteSheetContext = createContext<ContextValue | null>(null);

export const FavoriteSheetProvider = ({children}: {children: ReactNode}) => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<FavoriteItem[]>([]);

  const open = () => {
    // API 로딩
    favoriteApi.getFavorites().then(res => {
      setData(
        res.data.buildings.map((b: any) => ({
          id: b.buildingId,
          name: b.buildingName,
          latitude: 0,
          longitude: 0,
        })),
      );
      setVisible(true);
    });
  };
  const close = () => setVisible(false);

  return (
    <FavoriteSheetContext.Provider value={{open, close}}>
      {children}
      <BottomSheet
        index={visible ? 0 : -1}
        snapPoints={['40%', '90%']}
        enablePanDownToClose
        onClose={close}>
        <FavoriteBottomSheetContent
          favorites={data}
          onSelect={item => {
            /* 선택 처리 */
            close();
          }}
        />
      </BottomSheet>
    </FavoriteSheetContext.Provider>
  );
};

export const useFavoriteSheet = () => {
  const ctx = useContext(FavoriteSheetContext);
  if (!ctx)
    throw new Error(
      'useFavoriteSheet must be used inside FavoriteSheetProvider',
    );
  return ctx;
};
