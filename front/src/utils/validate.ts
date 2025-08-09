type UserInfomation = {
  id: string;
  password: string;
  username: string;
  email: string;
};

// 로그인 유효성 검사
type LoginInfo = Pick<UserInfomation, 'id' | 'password'>;

function validateLogin(values: LoginInfo) {
  const Loginerrors = {
    id: '',
    password: '',
  };

  if (!/^[a-zA-Z][a-zA-Z0-9]{3,19}$/.test(values.id)) {
    Loginerrors.id = '아이디는 4~20자의 영문 또는 영문+숫자 조합이어야 합니다.';
  }

  if (
    !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,16}$/.test(
      values.password,
    )
  ) {
    Loginerrors.password =
      '비밀번호는 8~16자이며 영문, 숫자, 특수문자를 포함해야 합니다.';
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

  if (!/^[a-zA-Z][a-zA-Z0-9]{3,19}$/.test(values.id)) {
    Iderrors.id = '아이디는 4~20자의 영문 또는 영문+숫자 조합이어야 합니다.';
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
    !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,16}$/.test(
      values.password,
    )
  ) {
    Pwerrors.password =
      '비밀번호는 8~16자이며 영문, 숫자, 특수문자를 포함해야 합니다.';
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
    !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,16}$/.test(
      values.password,
    )
  ) {
    PwConfirmerrors.password =
      '비밀번호는 8~16자이며 영문, 숫자, 특수문자를 포함해야 합니다.';
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

  if (!/^\d{6}$/.test(values.codemessage)) {
    CodeMessageErrors.codemessage = '인증번호는 6자리 숫자입니다.';
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

  if (!/^[가-힣a-zA-Z0-9]{2,8}$/.test(values.username)) {
    Signuperrors.username =
      '닉네임은 2~8자의 한글, 영문 또는 숫자여야 하며 특수문자는 사용할 수 없습니다.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    Signuperrors.email = '올바른 이메일 형식이 아닙니다.';
  }

  if (!/^[a-zA-Z][a-zA-Z0-9]{3,19}$/.test(values.id)) {
    Signuperrors.id =
      '아이디는 4~20자의 영문 또는 영문+숫자 조합이어야 합니다.';
  }

  if (
    !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,16}$/.test(
      values.password,
    )
  ) {
    Signuperrors.password =
      '비밀번호는 8~16자이며 영문, 숫자, 특수문자를 포함해야 합니다.';
  }

  if (values.password !== values.passwordConfirm) {
    Signuperrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
  }

  if (!/^\d{6}$/.test(values.codemessage)) {
    Signuperrors.codemessage = '인증번호는 6자리 숫자입니다.';
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
