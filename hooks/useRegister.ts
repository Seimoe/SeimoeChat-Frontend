'use client'
import {useState} from 'react';
import {AuthService} from '@/services/authService';
import {UseFormSetError} from 'react-hook-form';
import {useRouter} from 'next/navigation';

interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    invitationCode: string;
}

type RegisterStatus = 'idle' | 'loading' | 'success' | 'error';

interface RegisterError {
    type: 'auth' | 'network' | 'unknown';
    message: string;
}

export default function useRegister() {
    const [registerStatus, setRegisterStatus] = useState<RegisterStatus>('idle');
    const [registerError, setRegisterError] = useState<RegisterError | null>(null);
    const router = useRouter();

    const onRegister = async (
        data: RegisterFormData,
        setFormError: UseFormSetError<RegisterFormData>
    ) => {
        try {
            setRegisterStatus('loading');
            setRegisterError(null);

            // 验证密码一致性
            if (data.password !== data.confirmPassword) {
                setFormError('confirmPassword', {
                    type: 'manual',
                    message: '两次输入的密码不一致'
                });
                setRegisterStatus('error');
                return;
            }

            // 调用注册接口
            await AuthService.register({
                username: data.username,
                email: data.email,
                password: data.password,
                invitation_code: data.invitationCode
            });

            setRegisterStatus('success');
            
            // 注册成功后延迟跳转到登录页
            setTimeout(() => {
                router.push('/login');
            }, 1500);
        } catch (error: any) {
            setRegisterStatus('error');
            
            // 处理错误信息
            if (error.status === 400 || error.status === 401) {
                setRegisterError({
                    type: 'auth',
                    message: error.detail?.detail || error.message || '注册失败，请检查表单信息'
                });
                
                // 如果后端返回了字段级别的错误
                if (error.detail?.detail) {
                    if (typeof error.detail.detail === 'string' && error.detail.detail.includes('username')) {
                        setFormError('username', {
                            type: 'manual',
                            message: '用户名已存在'
                        });
                    }
                    if (typeof error.detail.detail === 'string' && error.detail.detail.includes('email')) {
                        setFormError('email', {
                            type: 'manual',
                            message: '邮箱已被使用'
                        });
                    }
                    if (typeof error.detail.detail === 'string' && error.detail.detail.includes('invitation')) {
                        setFormError('invitationCode', {
                            type: 'manual',
                            message: '邀请码无效'
                        });
                    }
                }
            } else if (error.status >= 500) {
                setRegisterError({
                    type: 'network',
                    message: '服务器错误，请稍后再试'
                });
            } else {
                setRegisterError({
                    type: 'unknown',
                    message: '注册失败，请重试'
                });
            }
        }
    };

    return {
        onRegister,
        registerStatus,
        registerError
    };
}