import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import inquiryApi from '../api/inquiryApi';

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

// Context 타입 정의
type InquiryContextType = {
  inquiries: Inquiry[];
  fetchInquiries: () => Promise<void>;
  addInquiry: (title: string, content: string) => Promise<void>;
  editInquiry: (id: number, title: string, content: string) => Promise<void>;
  deleteInquiry: (id: number) => Promise<void>;
  getInquiryById: (id: number) => Inquiry | undefined;
  getInquiryFromServer: (id: number) => Promise<Inquiry | null>;
};

const InquiryContext = createContext<InquiryContextType | undefined>(undefined);

// Provider 컴포넌트
export const InquiryProvider = ({children}: {children: ReactNode}) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  // API 응답 → Inquiry 타입으로 매핑
  const mapToInquiry = (item: any): Inquiry => ({
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

  // 전체 문의 목록 가져오기
  const fetchInquiries = async () => {
    try {
      const res = await inquiryApi.getAll();
      const mapped = res.data.map(mapToInquiry);
      setInquiries(mapped);
    } catch (error) {
      console.error('문의 불러오기 실패:', error);
      throw error;
    }
  };

  // 단일 문의 서버에서 직접 가져오기
  const getInquiryFromServer = async (id: number): Promise<Inquiry | null> => {
    try {
      const res = await inquiryApi.getById(id);
      return mapToInquiry(res.data);
    } catch (error) {
      console.error('서버 문의 조회 실패:', error);
      throw error;
    }
  };

  // 문의 등록
  const addInquiry = async (title: string, content: string) => {
    try {
      await inquiryApi.create(title, content);
      await fetchInquiries();
    } catch (error) {
      console.error('문의 등록 실패:', error);
      throw error;
    }
  };

  // 문의 수정
  const editInquiry = async (id: number, title: string, content: string) => {
    try {
      await inquiryApi.update(id, title, content);
      await fetchInquiries();
    } catch (error) {
      console.error('문의 수정 실패:', error);
      throw error;
    }
  };

  // 문의 삭제
  const deleteInquiry = async (id: number) => {
    try {
      await inquiryApi.remove(id);
      setInquiries(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('문의 삭제 실패:', error);
    }
  };

  // id로 Inquiry 하나 가져오기
  const getInquiryById = (id: number) => {
    return inquiries.find(inquiry => inquiry.id === id);
  };

  // 초기 데이터 불러오기
  useEffect(() => {
    fetchInquiries();
  }, []);

  return (
    <InquiryContext.Provider
      value={{
        inquiries,
        fetchInquiries,
        addInquiry,
        editInquiry,
        deleteInquiry,
        getInquiryById,
        getInquiryFromServer,
      }}>
      {children}
    </InquiryContext.Provider>
  );
};

// 커스텀 훅
export const useInquiry = () => {
  const context = useContext(InquiryContext);
  if (!context) {
    throw new Error('useInquiry는 InquiryProvider 안에서 사용해야 해요!');
  }
  return context;
};
