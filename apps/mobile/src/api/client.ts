import axios from 'axios';
import { router } from 'expo-router';
import { getToken } from '../lib/storage';
import useAuthStore from '../store/authStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://geo-ml-treehunt-api-858416453237.us-east1.run.app';
const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 (expired/invalid JWT), clear auth state and bounce to login.
let redirecting = false;
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !redirecting) {
      redirecting = true;
      try {
        await useAuthStore.getState().logout();
        router.replace('/(auth)/login' as any);
      } finally {
        redirecting = false;
      }
    }
    return Promise.reject(error);
  }
);

export default client;
