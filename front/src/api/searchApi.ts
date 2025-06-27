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
  getSuggestions: (query: string) =>
    axiosInstance.get<SearchSuggestion[]>('/search/suggestions', {
      params: {query},
    }),

  getRecentKeywords: () => axiosInstance.get<RecentKeyword[]>('/search/recent'),

  saveKeyword: (keyword: string) =>
    axiosInstance.post('/search/save', {keyword}),
};

export default searchApi;
