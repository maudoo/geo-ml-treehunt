import axios from 'axios';
import { getToken } from '../storage';

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

export default client;
