import {apiRequest} from '@/services/apiClient';

interface LoginError {
    status: number;
    message: string;
    detail?: any;
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
} 