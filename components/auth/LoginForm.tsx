'use client'
import React, {useEffect} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {useForm} from 'react-hook-form';
import useLogin from '@/hooks/useLogin';
import "@/app/globals.css";
import {Loader2, AlertCircle, CheckCircle2, User2, KeyRound, X} from 'lucide-react';
import Image from 'next/image';
import BackgroundImage1 from '@/public/login-bg-3.png';
import useUserStore from '@/stores/userStore';

interface LoginFormDataLocal {
    username: string;
    password: string;
}

const LoginForm: React.FC = () => {
    const [isImageLoaded, setIsImageLoaded] = React.useState(false);
    const {
        register,
        handleSubmit,
        setError: setFormError,
        formState: {errors, isSubmitting}
    } = useForm<LoginFormDataLocal>();
    const {onLogin, loginStatus, loginError} = useLogin();

    const onSubmit = async (data: LoginFormDataLocal) => {
        await onLogin(data, setFormError);
    };

    // 在客户端初始化时进行hydration
    useEffect(() => {
        useUserStore.persist.rehydrate();
    }, []);

    return (
        <div className="min-h-screen w-full relative flex">
            {/* 背景图片优化 */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={BackgroundImage1}
                    alt="登录背景"
                    fill
                    priority
                    className="object-cover will-change-[transform,opacity]"
                    quality={85}
                    onLoadingComplete={() => setIsImageLoaded(true)}
                />
            </div>

            {/* 登录区域 */}
            <div className="w-full md:w-[40%] min-h-screen relative z-10 flex items-center justify-center">
                {/* 毛玻璃效果背景 */}
                <div className="absolute inset-0">
                    <div className={`absolute inset-0 will-change-[backdrop-filter] transition-all duration-700 ${
                        isImageLoaded
                            ? 'bg-white/30 backdrop-blur-xl'
                            : 'bg-white/80'
                    }`}/>
                    {/* 右侧边界线 - 仅在桌面端显示 */}
                    <div
                        className={`absolute right-0 top-0 bottom-0 w-[1px] transition-all duration-700 hidden md:block ${
                            isImageLoaded
                                ? 'bg-white/30 shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                                : 'bg-gray-200'
                        }`}/>
                </div>

                {/* 登录表单容器 */}
                <div className="w-full max-w-md px-6 md:pl-[15%] md:pr-[10%] py-8 md:py-12 relative z-20">
                    <motion.div
                        className="bg-white/70 backdrop-blur-lg p-6 md:p-8 rounded-3xl shadow-2xl border border-white/50"
                        whileHover={{scale: 1.01}}
                        transition={{type: "spring", stiffness: 300, damping: 20}}
                    >
                        {/* Logo区域 */}
                        <div className="mb-6 md:mb-8 text-center">
                            <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4">
                                <div
                                    className="absolute inset-0 bg-gradient-to-br from-orange-400 to-pink-400 rounded-2xl blur-lg opacity-50"/>
                                <div
                                    className="relative w-full h-full rounded-2xl bg-gradient-to-br from-orange-400 to-pink-400 shadow-lg flex items-center justify-center">
                                    <span className="text-3xl font-bold text-white">图</span>
                                </div>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                                欢迎回来
                            </h2>
                            <p className="mt-1.5 md:mt-2 text-sm md:text-base text-gray-600">登录到希茉聊天</p>
                        </div>

                        {/* 表单部分 */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 md:space-y-6">
                            <div className="space-y-3 md:space-y-4">
                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        用户名
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none 
                                                        group-focus-within:text-orange-500 transition-colors">
                                            <User2 size={18} strokeWidth={2}/>
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
                                            placeholder="请输入用户名"
                                        />
                                    </div>
                                    <AnimatePresence mode="wait">
                                        {errors.username && (
                                            <motion.p
                                                initial={{opacity: 0, height: 0}}
                                                animate={{opacity: 1, height: 'auto'}}
                                                exit={{opacity: 0, height: 0}}
                                                className="mt-1.5 text-sm text-red-500 flex items-center gap-1 overflow-hidden"
                                            >
                                                <AlertCircle size={14}/>
                                                {errors.username.message}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        密码
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none 
                                                        group-focus-within:text-orange-500 transition-colors">
                                            <KeyRound size={18} strokeWidth={2}/>
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
                                            placeholder="请输入密码"
                                        />
                                    </div>
                                    <AnimatePresence mode="wait">
                                        {errors.password && (
                                            <motion.p
                                                initial={{opacity: 0, height: 0}}
                                                animate={{opacity: 1, height: 'auto'}}
                                                exit={{opacity: 0, height: 0}}
                                                className="mt-1.5 text-sm text-red-500 flex items-center gap-1 overflow-hidden"
                                            >
                                                <AlertCircle size={14}/>
                                                {errors.password.message}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* 错误信息展示 */}
                            <AnimatePresence mode="wait">
                                {loginStatus === 'error' && loginError && (
                                    <motion.div
                                        initial={{opacity: 0, y: -10}}
                                        animate={{opacity: 1, y: 0}}
                                        exit={{opacity: 0, y: -10}}
                                        className={`p-3.5 rounded-xl border text-sm flex items-center gap-2 ${
                                            loginError.type === 'auth'
                                                ? 'bg-red-50 border-red-100 text-red-500'
                                                : loginError.type === 'network'
                                                    ? 'bg-orange-50 border-orange-100 text-orange-500'
                                                    : 'bg-yellow-50 border-yellow-100 text-yellow-600'
                                        }`}
                                    >
                                        <AlertCircle size={16}/>
                                        <span className="flex-1">{loginError.message}</span>
                                        <button
                                            onClick={() => {
                                            }}
                                            className="p-1 hover:bg-black/5 rounded-full transition-colors"
                                        >
                                            <X size={14}/>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* 登录按钮 */}
                            <motion.button
                                type="submit"
                                disabled={isSubmitting || loginStatus === 'success'}
                                className="w-full relative h-12 px-6 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-xl font-medium shadow-lg disabled:opacity-50 transition-all duration-300 hover:shadow-xl hover:from-orange-500 hover:to-pink-500 overflow-hidden"
                                whileHover={{scale: 1.02}}
                                whileTap={{scale: 0.98}}
                            >
                                <AnimatePresence mode="wait">
                                    {loginStatus === 'loading' && (
                                        <motion.div
                                            initial={{opacity: 0}}
                                            animate={{opacity: 1}}
                                            exit={{opacity: 0}}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            <Loader2 className="w-5 h-5 animate-spin"/>
                                        </motion.div>
                                    )}
                                    {loginStatus === 'success' && (
                                        <motion.div
                                            initial={{opacity: 0, scale: 0.5}}
                                            animate={{opacity: 1, scale: 1}}
                                            exit={{opacity: 0, scale: 0.5}}
                                            className="absolute inset-0 flex items-center justify-center text-white"
                                        >
                                            <CheckCircle2 className="w-5 h-5"/>
                                            <span className="ml-2">登录成功,跳转中...</span>
                                        </motion.div>
                                    )}
                                    {(loginStatus === 'idle' || loginStatus === 'error') && (
                                        <motion.span
                                            initial={{opacity: 0}}
                                            animate={{opacity: 1}}
                                            exit={{opacity: 0}}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            登录
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
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
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent z-10"/>
        </div>
    );
};

export default LoginForm; 