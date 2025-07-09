const authNavigations = {
  AUTH_HOME: 'AuthHome',
  LOGIN: 'Login',
  SIGNUP: 'Signup',
  FINDID: 'FindId',
  FINDPW: 'FindPw',
} as const;

const mapNavigation = {
  MAPHOME: 'MapHome',
  SEARCH: 'Search',
  BUILDING_PREVIEW: 'BuildingPreview',
  BUILDING_DETAIL: 'BuildingDetail',
  ROUTE_SELECTION: 'RouteSelection',
  ROUTE_RESULT: 'RouteResult',
  SHORTCUT_LIST: 'ShortcutList',
  SHORTCUT_DETAIL: 'ShortcutDetail',
} as const;

export {authNavigations, mapNavigation};
