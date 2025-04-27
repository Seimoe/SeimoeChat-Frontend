'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import useRegister from '@/hooks/useRegister';
import "@/app/globals.css";
import { Loader2, AlertCircle, CheckCircle2, User2, KeyRound, X, Mail, Ticket, ArrowRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import BackgroundImage1 from '@/public/login-bg-3.png';
import Link from 'next/link';

interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    invitationCode: string;
}

const RegisterForm: React.FC = () => {
    const [isImageLoaded, setIsImageLoaded] = React.useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 2;

    const {
        register,
        handleSubmit,
        setError,
        trigger,
        formState: { errors, isSubmitting, isValid }
    } = useForm<RegisterFormData>({
        mode: 'onChange'
    });

    const { onRegister, registerStatus, registerError } = useRegister();

    const onSubmit = async (data: RegisterFormData) => {
        await onRegister(data, setError);
    };

    const handleNextStep = async () => {
        // 验证当前步骤的字段
        let fieldsToValidate: (keyof RegisterFormData)[] = [];

        if (currentStep === 1) {
            fieldsToValidate = ['username', 'email'];
        }

        const isStepValid = await trigger(fieldsToValidate);
        if (isStepValid) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    return (
        <div className="min-h-screen w-full relative flex">
            {/* 背景图片优化 */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={BackgroundImage1}
                    alt="注册背景"
                    fill
                    priority
                    className="object-cover will-change-[transform,opacity]"
                    quality={85}
                    onLoadingComplete={() => setIsImageLoaded(true)}
                />
            </div>

            {/* 注册区域 */}
            <div className="w-full md:w-[40%] min-h-screen relative z-10 flex items-center justify-center">
                {/* 毛玻璃效果背景 */}
                <div className="absolute inset-0">
                    <div className={`absolute inset-0 will-change-[backdrop-filter] transition-all duration-700 ${isImageLoaded
                            ? 'bg-white/30 backdrop-blur-xl'
                            : 'bg-white/80'
                        }`} />
                    {/* 右侧边界线 - 仅在桌面端显示 */}
                    <div
                        className={`absolute right-0 top-0 bottom-0 w-[1px] transition-all duration-700 hidden md:block ${isImageLoaded
                                ? 'bg-white/30 shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                                : 'bg-gray-200'
                            }`} />
                </div>

                {/* 注册表单容器 */}
                <div className="w-full max-w-md px-6 md:pl-[15%] md:pr-[10%] py-8 md:py-12 relative z-20">
                    <motion.div
                        className="bg-white/70 backdrop-blur-lg p-6 md:p-8 rounded-3xl shadow-2xl border border-white/50"
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        {/* Logo区域 */}
                        <div className="mb-6 md:mb-8 text-center">
                            <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4">
                                <div
                                    className="absolute inset-0 bg-gradient-to-br from-orange-400 to-pink-400 rounded-2xl blur-lg opacity-50" />
                                <div
                                    className="relative w-full h-full rounded-2xl bg-gradient-to-br from-orange-400 to-pink-400 shadow-lg flex items-center justify-center">
                                    <span className="text-3xl font-bold text-white">图</span>
                                </div>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                                创建账号
                            </h2>
                            <p className="mt-1.5 md:mt-2 text-sm md:text-base text-gray-600">注册希茉聊天</p>
                        </div>

                        {/* 步骤指示器 - 优雅现代设计 */}
                        <div className="mb-10 mt-2">
                            <div className="relative py-3">
                                <div className="flex justify-center gap-16 items-center relative">
                                    {/* 步骤1 */}
                                    <div className="flex flex-col items-center relative">
                                        <motion.div
                                            className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full z-10 ${currentStep >= 1
                                                    ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-lg shadow-orange-200/50'
                                                    : 'bg-white border-2 border-gray-200 text-gray-400'
                                                }`}
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                        >
                                            {currentStep > 1 ? (
                                                <CheckCircle2 size={20} className="text-white" />
                                            ) : (
                                                <User2 size={20} />
                                            )}
                                        </motion.div>
                                        <span className={`mt-2 text-sm font-medium ${currentStep >= 1 ? 'text-orange-500' : 'text-gray-400'
                                            }`}>账号信息</span>
                                    </div>

                                     {/* 连接条 */}
                                     <div className="absolute left-[48%] top-4 md:top-5 -translate-x-1/2 w-14 md:w-14 h-[10px] bg-gray-200 rounded-full z-0">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-orange-400 to-pink-400 rounded-full z-10"
                                            initial={{ width: '0%' }}
                                            animate={{ width: currentStep > 1 ? '100%' : '0%' }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>

                                    {/* 步骤2 */}
                                    <div className="flex flex-col items-center">
                                        <motion.div
                                            className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full z-10 ${currentStep >= 2
                                                    ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-lg shadow-orange-200/50'
                                                    : 'bg-white border-2 border-gray-200 text-gray-400'
                                                }`}
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                        >
                                            <KeyRound size={20} />
                                        </motion.div>
                                        <span className={`mt-2 text-sm font-medium ${currentStep >= 2 ? 'text-orange-500' : 'text-gray-400'
                                            }`}>密码与邀请码</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 表单部分 */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-5">
                            <AnimatePresence mode="wait" initial={false}>
                                {currentStep === 1 && (
                                    <motion.div
                                        key="step1"
                                        layout
                                        initial={{ opacity: 0, x: currentStep > 1 ? -20 : 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-4"
                                    >
                                        {/* 用户名 */}
                                        <div className="group">
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none 
                                                                group-focus-within:text-orange-500 transition-colors">
                                                    <User2 size={18} strokeWidth={2} />
                                                </div>
                                                <input
                                                    {...register('username', {
                                                        required: '请输入用户名',
                                                        minLength: {
                                                            value: 3,
                                                            message: '用户名至少3个字符'
                                                        }
                                                    })}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl 
                                                              bg-white text-gray-800 
                                                              placeholder:text-gray-400
                                                              border border-gray-100
                                                              ring-0
                                                              focus:ring-2 focus:ring-orange-500/50 
                                                              focus:border-orange-500
                                                              transition-all duration-300
                                                              shadow-sm
                                                              hover:border-orange-500/30"
                                                    placeholder="用户名（至少3个字符）"
                                                />
                                            </div>
                                            <AnimatePresence mode="wait">
                                                {errors.username && (
                                                    <motion.p
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-1.5 text-sm text-red-500 flex items-center gap-1 overflow-hidden"
                                                    >
                                                        <AlertCircle size={14} />
                                                        {errors.username.message}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* 邮箱 */}
                                        <div className="group">
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none 
                                                                group-focus-within:text-orange-500 transition-colors">
                                                    <Mail size={18} strokeWidth={2} />
                                                </div>
                                                <input
                                                    type="email"
                                                    {...register('email', {
                                                        required: '请输入邮箱',
                                                        pattern: {
                                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                            message: '邮箱格式不正确'
                                                        }
                                                    })}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl 
                                                              bg-white text-gray-800 
                                                              placeholder:text-gray-400
                                                              border border-gray-100
                                                              ring-0
                                                              focus:ring-2 focus:ring-orange-500/50 
                                                              focus:border-orange-500
                                                              transition-all duration-300
                                                              shadow-sm
                                                              hover:border-orange-500/30"
                                                    placeholder="邮箱地址"
                                                />
                                            </div>
                                            <AnimatePresence mode="wait">
                                                {errors.email && (
                                                    <motion.p
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-1.5 text-sm text-red-500 flex items-center gap-1 overflow-hidden"
                                                    >
                                                        <AlertCircle size={14} />
                                                        {errors.email.message}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                )}

                                {currentStep === 2 && (
                                    <motion.div
                                        key="step2"
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-4"
                                    >
                                        {/* 密码 */}
                                        <div className="group">
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none 
                                                                group-focus-within:text-orange-500 transition-colors">
                                                    <KeyRound size={18} strokeWidth={2} />
                                                </div>
                                                <input
                                                    type="password"
                                                    {...register('password', {
                                                        required: '请输入密码',
                                                        minLength: {
                                                            value: 6,
                                                            message: '密码至少6个字符'
                                                        }
                                                    })}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl 
                                                              bg-white text-gray-800 
                                                              placeholder:text-gray-400
                                                              border border-gray-100
                                                              ring-0
                                                              focus:ring-2 focus:ring-orange-500/50 
                                                              focus:border-orange-500
                                                              transition-all duration-300
                                                              shadow-sm
                                                              hover:border-orange-500/30"
                                                    placeholder="密码（至少6个字符）"
                                                />
                                            </div>
                                            <AnimatePresence mode="wait">
                                                {errors.password && (
                                                    <motion.p
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-1.5 text-sm text-red-500 flex items-center gap-1 overflow-hidden"
                                                    >
                                                        <AlertCircle size={14} />
                                                        {errors.password.message}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* 确认密码 */}
                                        <div className="group">
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none 
                                                                group-focus-within:text-orange-500 transition-colors">
                                                    <KeyRound size={18} strokeWidth={2} />
                                                </div>
                                                <input
                                                    type="password"
                                                    {...register('confirmPassword', {
                                                        required: '请确认密码',
                                                        minLength: {
                                                            value: 6,
                                                            message: '密码至少6个字符'
                                                        }
                                                    })}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl 
                                                              bg-white text-gray-800 
                                                              placeholder:text-gray-400
                                                              border border-gray-100
                                                              ring-0
                                                              focus:ring-2 focus:ring-orange-500/50 
                                                              focus:border-orange-500
                                                              transition-all duration-300
                                                              shadow-sm
                                                              hover:border-orange-500/30"
                                                    placeholder="确认密码"
                                                />
                                            </div>
                                            <AnimatePresence mode="wait">
                                                {errors.confirmPassword && (
                                                    <motion.p
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-1.5 text-sm text-red-500 flex items-center gap-1 overflow-hidden"
                                                    >
                                                        <AlertCircle size={14} />
                                                        {errors.confirmPassword.message}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* 邀请码 */}
                                        <div className="group">
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none 
                                                                group-focus-within:text-orange-500 transition-colors">
                                                    <Ticket size={18} strokeWidth={2} />
                                                </div>
                                                <input
                                                    {...register('invitationCode', {
                                                        required: '请输入邀请码'
                                                    })}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl 
                                                              bg-white text-gray-800 
                                                              placeholder:text-gray-400
                                                              border border-gray-100
                                                              ring-0
                                                              focus:ring-2 focus:ring-orange-500/50 
                                                              focus:border-orange-500
                                                              transition-all duration-300
                                                              shadow-sm
                                                              hover:border-orange-500/30"
                                                    placeholder="邀请码"
                                                />
                                            </div>
                                            <AnimatePresence mode="wait">
                                                {errors.invitationCode && (
                                                    <motion.p
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-1.5 text-sm text-red-500 flex items-center gap-1 overflow-hidden"
                                                    >
                                                        <AlertCircle size={14} />
                                                        {errors.invitationCode.message}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* 错误信息展示 */}
                            <AnimatePresence mode="wait">
                                {registerStatus === 'error' && registerError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={`p-3.5 rounded-xl border text-sm flex items-center gap-2 ${registerError.type === 'auth'
                                                ? 'bg-red-50 border-red-100 text-red-500'
                                                : registerError.type === 'network'
                                                    ? 'bg-orange-50 border-orange-100 text-orange-500'
                                                    : 'bg-yellow-50 border-yellow-100 text-yellow-600'
                                            }`}
                                    >
                                        <AlertCircle size={16} />
                                        <span className="flex-1">{registerError.message}</span>
                                        <button
                                            onClick={() => {
                                            }}
                                            className="p-1 hover:bg-black/5 rounded-full transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* 按钮区域 - 优化版 */}
                            <div className="flex gap-3 mt-6">
                                {currentStep > 1 && (
                                    <motion.button
                                        type="button"
                                        onClick={handlePrevStep}
                                        className="flex-1 h-12 bg-gray-100 text-gray-700 rounded-xl font-medium shadow-sm transition-all duration-300 hover:bg-gray-200 flex items-center justify-center"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <ArrowLeft size={16} className="mr-1.5" />
                                        <span className="whitespace-nowrap">上一步</span>
                                    </motion.button>
                                )}

                                {currentStep < totalSteps ? (
                                    <motion.button
                                        type="button"
                                        onClick={handleNextStep}
                                        className={`${currentStep > 1 ? 'flex-1' : 'w-full'} h-12 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-xl font-medium shadow-lg transition-all duration-300 hover:shadow-xl hover:from-orange-500 hover:to-pink-500 flex items-center justify-center`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="whitespace-nowrap">下一步</span>
                                        <ArrowRight size={16} className="ml-1.5" />
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting || registerStatus === 'success'}
                                        className="flex-1 relative h-12 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-xl font-medium shadow-lg disabled:opacity-50 transition-all duration-300 hover:shadow-xl hover:from-orange-500 hover:to-pink-500 overflow-hidden"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="absolute inset-0 flex items-center justify-center">注册</span>

                                        {registerStatus === 'loading' && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Loader2 className="w-5 h-5 animate-spin text-white" />
                                            </div>
                                        )}
                                        {registerStatus === 'success' && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <CheckCircle2 className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                    </motion.button>
                                )}
                            </div>

                            {/* 登录链接 */}
                            <div className="text-center mt-3">
                                <Link href="/login" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">
                                    已有账号？点击登录
                                </Link>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>

            {/* 右侧装饰区域 - 在移动端隐藏 */}
            <div className="flex-1 relative z-10 hidden md:block">
                <div className="absolute bottom-12 right-12 text-white text-right">
                    <h1 className="text-5xl font-bold mb-4">
                        希茉聊天
                    </h1>
                    <p className="text-xl text-white/80">
                        与多模型对话
                    </p>
                </div>
            </div>

            {/* 底部装饰 */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent z-10" />
        </div>
    );
};

export default RegisterForm;