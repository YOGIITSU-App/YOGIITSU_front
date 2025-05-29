import axiosInstance from './axiosInstance';

const inquiryApi = {
  // 전체 문의 목록 조회
  getAll: () => {
    return axiosInstance.get('/inquiries');
  },

  // 문의 상세 조회
  getById: (inquiryId: number) => {
    return axiosInstance.get(`/inquiries/${inquiryId}`);
  },

  // 문의 등록
  create: (inquiryTitle: string, inquiryContent: string) => {
    return axiosInstance.post('/inquiries', {
      inquiryTitle,
      inquiryContent,
    });
  },

  // 문의 수정
  update: (inquiryId: number, inquiryTitle: string, inquiryContent: string) => {
    return axiosInstance.put(`/inquiries/${inquiryId}`, {
      inquiryTitle,
      inquiryContent,
    });
  },

  // 문의 삭제
  remove: (inquiryId: number) => {
    return axiosInstance.delete(`/inquiries/${inquiryId}`);
  },
};

export default inquiryApi;
