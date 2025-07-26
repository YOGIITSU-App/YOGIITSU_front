import axiosInstance from './axiosInstance';

export type Inquiry = {
  id: number;
  title: string;
  content: string;
  date: string;
  status: 'PROCESSING' | 'COMPLETED';
  author: string;
  authorId: number;
  response?: string;
  responseDate?: string;
};

export const mapToInquiry = (item: any): Inquiry => ({
  id: item.inquiryId,
  title: item.inquiryTitle,
  content: item.inquiryContent,
  date: item.inquiryAt.split('T')[0].replace(/-/g, '.'),
  status: item.inquiryState,
  author: item.authorName,
  authorId: item.authorId,
  response: item.response ?? undefined,
  responseDate: item.responseAt
    ? item.responseAt.split('T')[0].replace(/-/g, '.')
    : undefined,
});

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
    if (!inquiryTitle.trim() || !inquiryContent.trim()) {
      throw new Error('제목과 내용은 필수 입력값입니다.');
    }

    return axiosInstance.post('/inquiries', {
      inquiryTitle,
      inquiryContent,
    });
  },

  // 문의 수정
  update: (inquiryId: number, inquiryTitle: string, inquiryContent: string) => {
    if (!inquiryTitle.trim() || !inquiryContent.trim()) {
      throw new Error('제목과 내용은 필수 입력값입니다.');
    }
    if (inquiryId <= 0) {
      throw new Error('유효하지 않은 문의 ID입니다.');
    }
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
