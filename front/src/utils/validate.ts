type UserInfomation = {
  id: string;
  password: string;
};

function validateLogin(values: UserInfomation) {
  const errors = {
    id: '',
    password: '',
  };

  // 유효성 검사
  if (values.id.length < 4) {
    errors.id = '아이디는 4자 이상이어야 합니다.';
  }

  if (values.password.length < 4) {
    errors.password = '비밀번호는 4자 이상이어야 합니다.';
  }

  return errors;
}

export {validateLogin};
