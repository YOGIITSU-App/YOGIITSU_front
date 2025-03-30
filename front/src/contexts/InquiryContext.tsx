import React, {createContext, useContext, useState, ReactNode} from 'react';

export type Inquiry = {
  id: number; // 문의 식별 key
  title: string;
  content: string;
  date: string;
};

type InquiryContextType = {
  inquiries: Inquiry[];
  addInquiry: (inquiry: Inquiry) => void;
};

const InquiryContext = createContext<InquiryContextType | undefined>(undefined);

export const InquiryProvider = ({children}: {children: ReactNode}) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  const addInquiry = (inquiry: Inquiry) => {
    setInquiries(prev => [...prev, inquiry]);
  };

  return (
    <InquiryContext.Provider value={{inquiries, addInquiry}}>
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
