import axiosInstance from './axiosInstance';

export type MypageProfileResponse = {
  memberId: string;
  userName: string;
  email: string;
};

export async function getMypageProfile(): Promise<MypageProfileResponse> {
  const { data } = await axiosInstance.get<MypageProfileResponse>(
    '/mypage/profile',
  );
  return data;
}
