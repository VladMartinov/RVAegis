import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
    type InternalAxiosRequestConfig
} from "axios";
import router from "@/router";

type ApiRequestConfig = AxiosRequestConfig & { 
    guid?: string;
    skipAuth?: boolean;
    onRetry?: (newToken: string) => void;
};

interface RefreshTokenResponse {
    token: string;
    refreshToken: string;
}

const API_BASE_URL = "https://localhost:7194/api";
const AUTH_ENDPOINTS = {
    LOGIN: "/authentication/login",
    REFRESH_TOKEN: "/authentication/refresh-token",
};
const DEFAULT_HEADERS = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
};

// Сервис для управления очередью запросов
class RequestQueue {
    private queue: Map<string, ApiRequestConfig> = new Map();

    add(config: ApiRequestConfig) {
        if (config.guid) {
            this.queue.set(config.guid, config);
        }
    }

    remove(guid?: string) {
        if (guid) {
            this.queue.delete(guid);
        }
    }

    get size() {
        return this.queue.size;
    }
}

// Сервис для обработки аутентификации
class AuthHandler {
    private isRefreshing = false;
    private queue = new RequestQueue();

    constructor(private axiosInstance: AxiosInstance) {}

    async handleUnauthorized(error: any): Promise<AxiosResponse> {
        const originalRequest = error.config as ApiRequestConfig;

        if (!this.isRefreshing) {
            this.isRefreshing = true;

            try {
                await this.axiosInstance.post<RefreshTokenResponse>(
                    AUTH_ENDPOINTS.REFRESH_TOKEN
                );

                this.isRefreshing = false;
                return this.axiosInstance(originalRequest);
            } catch (refreshError) {
                router.replace("/login");
                return Promise.reject(refreshError);
            }
        }

        return new Promise((resolve) => {
            const retryInterceptor = (newToken: string) => {
                originalRequest.headers!.Authorization = `Bearer ${newToken}`;
                resolve(this.axiosInstance(originalRequest));
            };

            this.queue.add({ 
                ...originalRequest,
                guid: originalRequest.guid,
                onRetry: retryInterceptor
            });
        });
    }
}

// Конфигурация Axios
function createAxiosInstance(): AxiosInstance {
    return axios.create({
        baseURL: API_BASE_URL,
        responseType: "json",
        headers: DEFAULT_HEADERS,
        withCredentials: true,
    });
}

// Настройка интерцепторов
function configureInterceptors(
    instance: AxiosInstance,
    authHandler: AuthHandler
) {
    // Request interceptor
    instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
        const guid = crypto.randomUUID();
        (config as ApiRequestConfig).guid = guid;
        return config;
    });

    // Response interceptor
    instance.interceptors.response.use(
        (response: AxiosResponse) => response,
        async (error) => {
            const { config, response } = error;

            if (response?.status === 401 && !config.url?.includes(AUTH_ENDPOINTS.LOGIN)) {
                return authHandler.handleUnauthorized(error);
            }

            return Promise.reject(error);
        }
    );
}

// Основной класс API
class ApiService {
    public readonly instance: AxiosInstance;
    private authHandler: AuthHandler;
    auth: any;
    history: any;
    image: any;
    user: any;

    constructor() {
        this.instance = createAxiosInstance();
        this.authHandler = new AuthHandler(this.instance);
        this.setupInterceptors();
        this.registerServices();
    }

    private setupInterceptors() {
        configureInterceptors(this.instance, this.authHandler);
    }

    private registerServices() {
        try {
            const modules = import.meta.glob('./services/*.service.ts', { 
                eager: true 
            });

            Object.values(modules).forEach((module: any) => {
                if (typeof module.default === 'function') {
                    module.default(this);
                }
            });
        } catch (error) {
            console.error('Failed to load API services:', error);
        }
    }

    install(app: any) {
        app.config.globalProperties.$api = this;
        app.provide('$api', this);
    }
}

export default new ApiService();