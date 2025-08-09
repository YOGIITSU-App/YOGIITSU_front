export const EmailVerificationPurpose = {
  SIGNUP: 'SIGNUP',
  EMAIL_CHANGE_NEW: 'EMAIL_CHANGE_NEW',
  EMAIL_CHANGE_OLD: 'EMAIL_CHANGE_OLD',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  FIND_ID: 'FIND_ID',
  FIND_PASSWORD: 'FIND_PASSWORD',
} as const;

export type EmailVerificationPurposeType =
  (typeof EmailVerificationPurpose)[keyof typeof EmailVerificationPurpose];
