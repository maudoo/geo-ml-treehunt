import * as SecureStore from 'expo-secure-store';

export const getToken = () => SecureStore.getItemAsync('token');
export const setToken = (token: string) => SecureStore.setItemAsync('token', token);
export const removeToken = () => SecureStore.deleteItemAsync('token');
