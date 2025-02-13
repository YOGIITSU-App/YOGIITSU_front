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
  PLACEDETAIL: 'PlaceDetail',
  ROUTE_SELECTION: 'RouteSelection',
  ROUTE_RESULT: 'RouteResult',
} as const;

export {authNavigations, mapNavigation};
