import axiosInstance from './axiosInstance';

export interface CollegeBuilding {
  buildingId: number;
  buildingName: string;
  collegeId: number;
  collegeName: string;
  imageUrl: string;
  isFavorite: boolean;
}

// 전체 단과대/건물 목록 조회
export async function getAllBuildings(): Promise<CollegeBuilding[]> {
  const { data } = await axiosInstance.get<CollegeBuilding[]>('/buildings');
  return data;
}
