import axios from 'axios';
import Config from 'react-native-config';

const rawAxios = axios.create({
  baseURL: Config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const refreshToken = async (
  accessToken: string,
  refreshToken: string,
) => {
  return rawAxios.post('/auth/reissue', null, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Refresh-Token': refreshToken,
    },
  });
};
