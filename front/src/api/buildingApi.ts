import axiosInstance from './axiosInstance';

export type BuildingDetail = {
  buildingInfo: {
    name: string;
    tags: string[];
    imageUrl: string;
    latitude: number;
    longitude: number;
    facilities: {name: string; floor: string}[];
  };
  departments: {
    id: number;
    collegeName: string;
    departmentName: string;
    location: string;
    phone: string;
    fax: string;
    officeHours: string;
  }[];
  floorPlans: {floor: string; imageUrl: string}[];
  favorite: boolean;
};

const buildingApi = {
  getBuildingDetail: (id: number) =>
    axiosInstance.get<BuildingDetail>(`/buildings/${id}`),
};

export default buildingApi;
