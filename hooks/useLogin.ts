import React from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import useUserStore from '@/stores/userStore';
import Cookies from 'js-cookie';
import {AuthService} from '@/services/authService';

export type LoginFormData = {
    username: string;
    password: string;
}

export type LoginError = {
    type: 'auth' | 'network' | 'validation' | 'server';
    message: string;
}

const useLogin = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const login = useUserStore(state => state.login);
    const [loginStatus, setLoginStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [loginError, setLoginError] = React.useState<LoginError | null>(null);

    // 注意：setFormError 类型由 react-hook-form 提供，这里使用 any 类型
    const onLogin = async (data: LoginFormData, setFormError: any) => {
        try {
            setLoginStatus('loading');
            setLoginError(null);

            const result = await AuthService.login(data.username, data.password);
            setLoginStatus('success');

            // 设置 cookie
            Cookies.set('token', result.access_token, {
                expires: 7,
                path: '/'
            });

            // 更新用户登录状态
            login({token: result.access_token, ...result.user});

            // 延时跳转显示成功动画
            setTimeout(() => {
                const from = searchParams?.get('from') || '/';
                router.push(from);
                router.refresh();
            }, 1000);
        } catch (error: any) {
            console.error('登录错误:', error);
            setLoginStatus('error');

            if (error.status === 401) {
                setLoginError({
                    type: 'auth',
                    message: '用户名或密码错误'
                });
            } else if (error.status === 422) {
                if (error.detail) {
                    // 如果是字段验证错误
                    error.detail.forEach((err: any) => {
                        const field = err.loc[err.loc.length - 1];
                        setFormError(field, {
                            type: 'server',
                            message: err.msg
                        });
                    });
                    setLoginError({
                        type: 'validation',
                        message: '请检查输入内容是否正确'
                    });
                } else {
                    setLoginError({
                        type: 'validation',
                        message: error.message || '输入格式不正确'
                    });
                }
            } else if (error.status === 403) {
                setLoginError({
                    type: 'auth',
                    message: '账号已被禁用，请联系管理员'
                });
            } else if (error.status === 429) {
                setLoginError({
                    type: 'auth',
                    message: '登录尝试次数过多，请稍后再试'
                });
            } else if (!navigator.onLine) {
                setLoginError({
                    type: 'network',
                    message: '网络连接失败，请检查网络设置'
                });
            } else {
                setLoginError({
                    type: 'network',
                    message: error.message || '服务器连接失败，请稍后重试'
                });
            }

            // 如非验证错误则自动重置状态
            if (error.status !== 422) {
                setTimeout(() => {
                    setLoginStatus('idle');
                    setLoginError(null);
                }, 3000);
            }
        }
    };

    return {onLogin, loginStatus, loginError};
};

export default useLogin; 