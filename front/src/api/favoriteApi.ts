import axiosInstance from './axiosInstance';

const favoriteApi = {
  // 즐겨찾기 목록 조회
  getFavorites: () => axiosInstance.get('/favorites'),

  // 즐겨찾기 추가
  addFavorite: (buildingId: number) =>
    axiosInstance.post(`/favorites/${buildingId}`),

  // 즐겨찾기 삭제
  removeFavorite: (buildingId: number) =>
    axiosInstance.delete(`/favorites/${buildingId}`),
};

export default favoriteApi;
