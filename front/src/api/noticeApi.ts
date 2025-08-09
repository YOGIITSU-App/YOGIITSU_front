import axiosInstance from './axiosInstance';

export type Notice = {
  noticeId: number;
  noticeTitle: string;
  noticeContent?: string;
  noticeAt: string;
};

export const mapToNotice = (item: {
  noticeId: number;
  noticeTitle: string;
  noticeContent?: string;
  noticeAt: string;
}): Notice => ({
  noticeId: item.noticeId,
  noticeTitle: item.noticeTitle,
  noticeContent: item.noticeContent ?? undefined,
  noticeAt: item.noticeAt?.split('T')[0]?.replace(/-/g, '.') || '',
});

export type NoticeDetail = {
  id: number;
  title: string;
  content: string;
  date: string;
};

export const mapToNoticeDetail = (item: any): NoticeDetail => ({
  id: item.noticeId,
  title: item.noticeTitle,
  content: item.noticeContent,
  date: item.noticeAt.split('T')[0].replace(/-/g, '.'),
});

const noticeApi = {
  getAll: async () => {
    try {
      const res = await axiosInstance.get('/notices');
      return res;
    } catch (e) {
      console.error('공지사항 목록 조회 실패:', e);
      throw e;
    }
  },
  getById: async (noticeId: number) => {
    try {
      const response = await axiosInstance.get(`/notices/${noticeId}`);
      return response;
    } catch (error) {
      console.error('공지사항 상세 조회 실패:', error);
      throw error;
    }
  },
};

export default noticeApi;
