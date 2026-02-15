import axiosInstance from './axiosInstance';

export type Facility = {
  name: string;
  latitude: number;
  longitude: number;
  buildingId: number;
  type: string;
  id: number;
  stopId?: string;
};

export const fetchFacilities = async (type: string): Promise<Facility[]> => {
  const res = await axiosInstance.get('/facilities', {
    params: { type },
  });
  return res.data;
};
