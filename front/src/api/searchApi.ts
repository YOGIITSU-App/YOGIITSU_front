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
};

export default searchApi;
