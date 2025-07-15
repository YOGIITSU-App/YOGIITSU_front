import axiosInstance from './axiosInstance';

export type Notice = {
  noticeId: number;
  noticeTitle: string;
  noticeContent?: string;
  noticeAt: string;
};

export const mapToNotice = (item: any): Notice => ({
  noticeId: item.noticeId,
  noticeTitle: item.noticeTitle,
  noticeContent: item.noticeContent ?? undefined,
  noticeAt: item.noticeAt.split('T')[0].replace(/-/g, '.'),
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
  getAll: () => {
    return axiosInstance.get('/notices');
  },
  getById: (noticeId: number) => {
    return axiosInstance.get(`/notices/${noticeId}`);
  },
};

export default noticeApi;
