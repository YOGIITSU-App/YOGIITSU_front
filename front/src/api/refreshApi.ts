import axios from 'axios';

export const refreshToken = async (
  accessToken: string,
  refreshToken: string,
) => {
  return axios.post('http://43.200.10.184:8080/auth/reissue', null, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Refresh-Token': refreshToken,
    },
  });
};
