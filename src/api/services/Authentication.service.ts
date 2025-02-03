import type { LoginRequest, RefreshTokenResponse, ForgotPasswordRequest, ResetPasswordRequest } from "@/api/interfaces";

export default (api: any) => {
    api.auth = {
        login(credentials: LoginRequest): Promise<{ data: RefreshTokenResponse }> {
            return api.instance.post("/authentication/login", credentials);
        },

        logout(): Promise<void> {
            return api.instance.post("/authentication/logout");
        },

        refreshToken(): Promise<{ data: RefreshTokenResponse }> {
            return api.instance.post("/authentication/refresh-token");
        },

        forgotPassword(data: ForgotPasswordRequest): Promise<void> {
            return api.instance.post("/authentication/forgot-password", data);
        },

        resetPassword(data: ResetPasswordRequest): Promise<void> {
            return api.instance.post("/authentication/reset-password", data);
        },
    };
};