import api from './index';

export const AuthService = {
    login: (credentials: any) => api.post('/auth/login', credentials),
};
