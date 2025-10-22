// ========== Token Utilities ==========
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const ACCESS_ROLE_KEY = 'access_role';

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setAccessToken = (token: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};
export const setRefreshToken = (token: string) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// ========== Role Utilities ==========
export const getAccessRole = () => localStorage.getItem(ACCESS_ROLE_KEY);
export const setAccessRole = (role: string) => localStorage.setItem(ACCESS_ROLE_KEY, role);
export const isAdmin = () => getAccessRole() === 'admin';
