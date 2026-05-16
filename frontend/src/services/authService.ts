import api from './api';
import type { ApiResponse, AuthData } from '@/types';

export const authService = {
  async register(name: string, email: string, password: string, role?: string) {
    const { data } = await api.post<ApiResponse<AuthData>>('/auth/register', { name, email, password, role });
    return data.data!;
  },

  async login(email: string, password: string) {
    const { data } = await api.post<ApiResponse<AuthData>>('/auth/login', { email, password });
    return data.data!;
  },

  async getMe() {
    const { data } = await api.get<ApiResponse<AuthData['user']>>('/auth/me');
    return data.data!;
  },
};
