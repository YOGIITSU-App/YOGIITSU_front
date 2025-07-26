import axiosInstance from './axiosInstance';

export type SearchSuggestion = {
  keyword: string;
  buildingId: number;
  tags: string[];
  bookmarked: boolean;
};

export type RecentKeyword = {
  keyword: string;
  searchedAt: string;
  buildingId: number;
};

const searchApi = {
  // 검색
  getSuggestions: (query: string) =>
    axiosInstance.get<SearchSuggestion[]>('/search/suggestions', {
      params: {query},
    }),

  // 최근 검색어 조회
  getRecentKeywords: () => axiosInstance.get<RecentKeyword[]>('/search/recent'),

  // 최근 검색어 저장
  saveKeyword: (keyword: string) =>
    axiosInstance.post('/search/save', {keyword}),

  // 최근 검색어 전체 삭제
  deleteAllRecentKeywords: () => axiosInstance.delete('/search/deleteAll'),

  // 최근 검색어 단건 삭제
  deleteRecentKeywordByBuildingId: (buildingId: number) =>
    axiosInstance.delete(`/search/delete/${buildingId}`),
};

export default searchApi;
