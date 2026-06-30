// Web has no SecureStore — localStorage is the browser equivalent for this app's needs.
export const getToken = async () => localStorage.getItem('token');
export const setToken = async (token: string) => {
  localStorage.setItem('token', token);
};
export const removeToken = async () => {
  localStorage.removeItem('token');
};
