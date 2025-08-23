const authNavigations = {
  SOCIAL_LOGIN: 'SocialLogin',
  AUTH_HOME: 'AuthHome',
  LOGIN: 'Login',
  SIGNUP: 'Signup',
  FINDID: 'FindId',
  FINDPW: 'FindPw',
  TERMS_DETAIL: 'TermsDetail',
} as const;

const mapNavigation = {
  MAPHOME: 'MapHome',
  SEARCH: 'Search',
  BUILDING_PREVIEW: 'BuildingPreview',
  BUILDING_DETAIL: 'BuildingDetail',
  ROUTE_SELECTION: 'RouteSelection',
  ROUTE_RESULT: 'RouteResult',
  SHUTTLE_DETAIL: 'ShuttleDetail',
  SHORTCUT_LIST: 'ShortcutList',
  SHORTCUT_DETAIL: 'ShortcutDetail',
  CHATBOT: 'Chatbot',
} as const;

export { authNavigations, mapNavigation };
