import api from '@/api';
import router from '@/router';
import { defineStore } from 'pinia';
import type { LoginRequest, ForgotPasswordRequest, UserRDto, ResetPasswordRequest } from '@/api/interfaces';

interface AuthState {
    currentUser: UserRDto | null;
    error: string | null;
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        currentUser: null,
        error: null
    }),

    actions: {
        async authenticate(credentials: LoginRequest) {
            try {
                await api.auth.login(credentials);
                await this.fetchCurrentUser();
                router.push('/');
            } catch (error) {
                throw error;
            }
        },

        async fetchCurrentUser() {
            try {
                const response = await api.user.getCurrentUser();
                this.currentUser = response.data;
            } catch (error) {
                throw error;
            }
        },

        async terminateSession() {
            try {
                await api.auth.logout();
            } finally {
                this.resetAuthState();
                router.replace('/login');
            }
        },

        async refreshAuthToken() {
            try {
                await api.auth.refreshToken();
                return true;
            } catch (error) {
                this.terminateSession();
                return false;
            }
        },

        resetAuthState() {
            this.currentUser = null;
            this.error = null;
        },

        sendPasswordResetLink(data: ForgotPasswordRequest) {
            return api.auth.forgotPassword(data);
        },

        resetPassword(data: ResetPasswordRequest) {
            return api.auth.resetPassword(data);
        }
    }
});