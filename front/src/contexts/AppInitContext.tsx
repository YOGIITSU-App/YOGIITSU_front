import React, { createContext, useContext, useRef, useState } from 'react';

type AppInitCtx = {
  mapReady: boolean;
  markMapReady: () => void;
  resetMapReady: () => void;
};

const Ctx = createContext<AppInitCtx>({
  mapReady: false,
  markMapReady: () => {},
  resetMapReady: () => {},
});

export const AppInitProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mapReady, setMapReady] = useState(false);
  const firedRef = useRef(false);

  const markMapReady = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    setMapReady(true);
  };

  const resetMapReady = () => {
    firedRef.current = false;
    setMapReady(false);
  };

  return (
    <Ctx.Provider value={{ mapReady, markMapReady, resetMapReady }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAppInit = () => useContext(Ctx);
