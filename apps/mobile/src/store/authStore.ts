import { create } from 'zustand';
import { getToken, setToken, removeToken } from '../lib/storage';
import client from '../api/client';

interface User {
  id: string;
  email: string;
  display_name: string;
  xp: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, display_name: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await client.post('/auth/login', { email, password });
      const token = response.data.access_token;
      await setToken(token);
      set({ token, isLoading: false });
      return true;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  register: async (email, display_name, password) => {
  set({ isLoading: true });
  try {
    const response = await client.post('/auth/register', { email, display_name, password });
    const token = response.data.access_token;
    await setToken(token);
    set({ token, isLoading: false });
    return true;
  } catch (error: any) {
    set({ isLoading: false });
    console.log('Register error:', JSON.stringify(error?.response?.data));
    console.log('Register error status:', error?.response?.status);
    console.log('Register error message:', error?.message);
    return false;
  }
},

  logout: async () => {
    await removeToken();
    set({ token: null, user: null });
  },

  loadToken: async () => {
    try {
      const token = await getToken();
      set({ token });
    } catch {
      set({ token: null });
    }
  },
}));

export default useAuthStore;
