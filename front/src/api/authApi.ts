import axiosInstance from './axiosInstance';

const authApi = {
  // [비로그인] 로그인
  login: (memberId: string, password: string) =>
    axiosInstance.post('/members/login', {
      memberId,
      password,
    }),

  // [비로그인] 회원가입
  signup: (
    memberId: string,
    password: string,
    email: string,
    userName: string,
  ) => {
    return axiosInstance.post('/members/signup', {
      memberId,
      password,
      email,
      userName,
    });
  },

  // [비로그인] 아이디 찾기
  findId: (email: string) => {
    return axiosInstance.post('/members/find-id', { email });
  },

  // [비로그인] 비밀번호 재설정 (이메일 인증 기반)
  resetPassword: (
    newPassword: string,
    confirmPassword: string,
    email: string,
  ) => {
    return axiosInstance.post('/members/find-password', {
      email,
      newPassword,
      confirmPassword,
    });
  },

  // [로그인] 비밀번호 변경
  changePassword: (newPassword: string, confirmPassword: string) => {
    return axiosInstance.patch('/members/change-password', {
      newPassword,
      confirmPassword,
    });
  },

  // [로그인] 회원 탈퇴
  deleteAccount: () => axiosInstance.delete('/members/delete'),
};

export default authApi;
