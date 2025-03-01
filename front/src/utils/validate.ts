type UserInfomation = {
  id: string;
  password: string;
  username: string;
  email: string;
};

// 로그인 유효성 검사사
type LoginInfo = Pick<UserInfomation, 'id' | 'password'>;

function validateLogin(values: LoginInfo) {
  const Loginerrors = {
    id: '',
    password: '',
  };

  if (!/^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{4,10}$/.test(values.id)) {
    Loginerrors.id = '아이디는 4~10자의 영문과 숫자를 포함해야 합니다.';
  }

  if (
    !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z\d!@#$%^&*(),.?":{}|<>]{8,}$/.test(
      values.password,
    )
  ) {
    Loginerrors.password =
      '비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 포함해야 합니다.';
  }

  return Loginerrors;
}

///////////////////////////////////////////////////////////////////////////

// Id 유효성 검사
type IdInfo = Pick<UserInfomation, 'id'>;

function validateId(values: IdInfo) {
  const Iderrors = {
    id: '',
  };

  if (!/^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{4,10}$/.test(values.id)) {
    Iderrors.id = '아이디는 4~10자의 영문과 숫자를 포함해야 합니다.';
  }

  return Iderrors;
}

///////////////////////////////////////////////////////////////////////////

// Pw 유효성 검사
type PwInfo = Pick<UserInfomation, 'password'>;

function validatePw(values: PwInfo) {
  const Pwerrors = {
    password: '',
  };

  if (
    !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z\d!@#$%^&*(),.?":{}|<>]{8,}$/.test(
      values.password,
    )
  ) {
    Pwerrors.password =
      '비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 포함해야 합니다.';
  }

  return Pwerrors;
}

///////////////////////////////////////////////////////////////////////////

// PwConfirm 유효성 검사
function validatePwConfirm(values: PwInfo & {passwordConfirm: string}) {
  const PwConfirmerrors = {
    password: '',
    passwordConfirm: '',
  };

  if (
    !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z\d!@#$%^&*(),.?":{}|<>]{8,}$/.test(
      values.password,
    )
  ) {
    PwConfirmerrors.password =
      '비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 포함해야 합니다.';
  }

  if (values.password !== values.passwordConfirm) {
    PwConfirmerrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
  }

  return PwConfirmerrors;
}

///////////////////////////////////////////////////////////////////////////

// email 유효성 검사
type EmailInfo = Pick<UserInfomation, 'email'>;

function validateEmail(values: EmailInfo) {
  const Emailerrors = {
    email: '',
  };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    Emailerrors.email = '올바른 이메일 형식이 아닙니다.';
  }

  return Emailerrors;
}

///////////////////////////////////////////////////////////////////////////

type CodeInfo = {codemessage: string};

function validateCodeMessage(values: CodeInfo) {
  const CodeMessageErrors = {codemessage: ''};

  if (!/^[A-Z]{6}$/.test(values.codemessage)) {
    CodeMessageErrors.codemessage = '인증번호는 6자의 영문 대문자입니다.';
  }

  return CodeMessageErrors;
}

///////////////////////////////////////////////////////////////////////////

// 회원가입 유효성 검사
function validateSignup(
  values: UserInfomation & {passwordConfirm: string} & {codemessage: string},
) {
  const Signuperrors = {
    username: '',
    email: '',
    id: '',
    password: '',
    passwordConfirm: '',
    codemessage: '',
  };

  if (!/^[a-zA-Z가-힣]{2,}$/.test(values.username)) {
    Signuperrors.username =
      '사용자 이름은 영어 또는 한글 2자 이상이어야 합니다.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    Signuperrors.email = '올바른 이메일 형식이 아닙니다.';
  }
  if (!/^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{4,10}$/.test(values.id)) {
    Signuperrors.id = '아이디는 4~10자의 영문과 숫자를 포함해야 합니다.';
  }
  if (
    !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z\d!@#$%^&*(),.?":{}|<>]{8,}$/.test(
      values.password,
    )
  ) {
    Signuperrors.password =
      '비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 포함해야 합니다.';
  }
  if (values.password !== values.passwordConfirm) {
    Signuperrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
  }

  if (!/^[A-Z]{6}$/.test(values.codemessage)) {
    Signuperrors.codemessage = '인증번호는 6자의 영문 대문자입니다.';
  }

  return Signuperrors;
}

export {
  validateLogin,
  validateSignup,
  validateEmail,
  validateCodeMessage,
  validateId,
  validatePw,
  validatePwConfirm,
};
