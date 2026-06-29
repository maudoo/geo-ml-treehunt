import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://stubbed-blunt-retired.ngrok-free.dev';
const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
