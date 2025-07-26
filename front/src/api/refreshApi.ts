import axios from 'axios';
import {API_BASE_URL} from '@env';

const rawAxios = axios.create({
  baseURL: API_BASE_URL,
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
