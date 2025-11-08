import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: async (email, password) => {
                try {
                    const response = await api.post('/auth/login', { email, password });
                    const { token, ...userData } = response.data;

                    localStorage.setItem('token', token);
                    set({ user: userData, token, isAuthenticated: true });
                    return response.data;
                } catch (error) {
                    throw error.response?.data || error;
                }
            },

            register: async (userData) => {
                try {
                    const response = await api.post('/auth/register', userData);
                    const { token, ...user } = response.data;

                    localStorage.setItem('token', token);
                    set({ user, token, isAuthenticated: true });
                    return response.data;
                } catch (error) {
                    throw error.response?.data || error;
                }
            },

            logout: () => {
                localStorage.removeItem('token');
                set({ user: null, token: null, isAuthenticated: false });
            },

            updateUser: (userData) => {
                set((state) => ({
                    user: { ...state.user, ...userData }
                }));
            },
        }),
        {
            name: 'auth-storage',
            getStorage: () => localStorage,
        }
    )
);

export default useAuthStore;
