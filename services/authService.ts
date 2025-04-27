import {apiRequest} from '@/services/apiClient';

interface LoginError {
    status: number;
    message: string;
    detail?: any;
}
interface RegisterData {
    username: string;
    email: string;
    password: string;
    invitation_code: string;
}

export class AuthService {
    static async login(username: string, password: string): Promise<{ access_token: string, user: any }> {
        const url = '/api/v1/auth/login';
        const formData = new URLSearchParams({
            username,
            password,
        });

        try {
            const options: RequestInit = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            };

            return await apiRequest<{ access_token: string, user: any }>(url, options);
        } catch (error: any) {
            // 转换错误信息为统一格式
            const loginError: LoginError = {
                status: error.status || 500,
                message: error.message || '未知错误'
            };

            if (error.detail) {
                loginError.detail = error.detail;
            }

            throw loginError;
        }
    }
    static async register(data: RegisterData): Promise<any> {
        const url = '/api/v1/auth/register';
        
        try {
            const options: RequestInit = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            };

            return await apiRequest<any>(url, options);
        } catch (error: any) {
            const registerError: LoginError = {
                status: error.status || 500,
                message: error.message || '未知错误'
            };

            if (error.detail) {
                registerError.detail = error.detail;
            }

            throw registerError;
        }
    }
    static async getCurrentUser(): Promise<any> {
        const url = '/api/v1/auth/me';
        
        try {
            return await apiRequest<any>(url);
        } catch (error: any) {
            const userError: LoginError = {
                status: error.status || 500,
                message: error.message || '获取用户信息失败'
            };

            if (error.detail) {
                userError.detail = error.detail;
            }

            throw userError;
        }
    }
} 