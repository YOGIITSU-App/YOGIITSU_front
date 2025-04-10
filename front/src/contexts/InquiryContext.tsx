import React, {createContext, useContext, useState, ReactNode} from 'react';

// 🔹 Inquiry 타입 정의
export type Inquiry = {
  id: number; // 문의 식별 key
  title: string;
  content: string;
  date: string;
  status: 'WAITING' | 'COMPLETE';
  author: string;
};

type InquiryContextType = {
  inquiries: Inquiry[];
  addInquiry: (inquiry: Inquiry) => void;
  editInquiry: (inquiry: Inquiry) => void;
  deleteInquiry: (id: number) => void;
  getInquiryById: (id: number) => Inquiry | undefined; // ✅ 추가됨
};

const InquiryContext = createContext<InquiryContextType | undefined>(undefined);

export const InquiryProvider = ({children}: {children: ReactNode}) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  const addInquiry = (inquiry: Inquiry) => {
    setInquiries(prev => [...prev, inquiry]);
  };

  const editInquiry = (updated: Inquiry) => {
    setInquiries(prev =>
      prev.map(item => (item.id === updated.id ? updated : item)),
    );
  };

  const deleteInquiry = (id: number) => {
    setInquiries(prev => prev.filter(item => item.id !== id));
  };

  // ✅ inquiry id로 찾아오는 함수
  const getInquiryById = (id: number) => {
    return inquiries.find(inquiry => inquiry.id === id);
  };

  return (
    <InquiryContext.Provider
      value={{
        inquiries,
        addInquiry,
        editInquiry,
        deleteInquiry,
        getInquiryById,
      }}>
      {children}
    </InquiryContext.Provider>
  );
};

export const useInquiry = () => {
  const context = useContext(InquiryContext);
  if (!context) {
    throw new Error('useInquiry must be used within an InquiryProvider');
  }
  return context;
};
