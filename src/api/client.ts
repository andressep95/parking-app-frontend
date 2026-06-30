import axios from 'axios';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken?.toString();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Sign out clears Amplify tokens so the next load shows the login form,
      // not another redirect loop caused by a still-valid cached session.
      await signOut({ global: false }).catch(() => {});
      window.location.href = '/';
    }
    return Promise.reject(error);
  },
);
