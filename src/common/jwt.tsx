import CryptoJS from 'crypto-js';

const SECRET_KEY = 'DS_RD_NITHI_SECRET_KEY_2024';

// Encrypt data
export const encrypt = (data: any): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

// Decrypt data
export const decrypt = (encryptedData: string): any => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// Store encrypted token
export const setToken = (token: string): void => {
  const encryptedToken = encrypt(token);
  localStorage.setItem('auth_token', encryptedToken);
};

// Get and decrypt token
export const getToken = (): string | null => {
  const encryptedToken = localStorage.getItem('auth_token');
  if (!encryptedToken) return null;
  try {
    return decrypt(encryptedToken);
  } catch (error) {
    return null;
  }
};

// Remove token
export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Store encrypted user data
export const setUser = (user: any): void => {
  const encryptedUser = encrypt(user);
  localStorage.setItem('auth_user', encryptedUser);
};

// Get and decrypt user data
export const getUser = (): any => {
  const encryptedUser = localStorage.getItem('auth_user');
  if (!encryptedUser) return null;
  try {
    return decrypt(encryptedUser);
  } catch (error) {
    return null;
  }
};

// Remove user data
export const removeUser = (): void => {
  localStorage.removeItem('auth_user');
};

// Clear all auth data
export const clearAuth = (): void => {
  removeToken();
  removeUser();
};
