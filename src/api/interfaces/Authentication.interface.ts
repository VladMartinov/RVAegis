export interface LoginRequest {
    login?: string | null;
    password?: string | null;
}

export interface RefreshTokenResponse {
    token: string;
    refreshToken: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
    confirmPassword: string;
}