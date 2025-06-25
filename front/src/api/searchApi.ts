import axiosInstance from './axiosInstance';

export type SearchSuggestion = {
  keyword: string;
  buildingId: number;
  tags: string[];
  bookmarked: boolean;
};

const searchApi = {
  getSuggestions: (query: string) =>
    axiosInstance.get<SearchSuggestion[]>('/search/suggestions', {
      params: {query},
    }),
  getRecentKeywords: () =>
    axiosInstance.get<{keyword: string; searchedAt: string}[]>(
      '/search/recent',
    ),

  saveKeyword: (keyword: string) =>
    axiosInstance.post('/search/save', {keyword}),
};

export default searchApi;
