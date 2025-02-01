'use client'
import React, { useState } from 'react';
import { Send, Plus, Mic, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatInterface = () => {
    const [messages, setMessages] = useState([
        {
            text: '你好！我是希茉，希望你今天过得愉快。我可以为你做些什么呢？',
            isAi: true
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    React.useEffect(() => {
        // 原有的禁止缩放代码保持不变
        const preventDefault = (e: TouchEvent) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        };

        document.addEventListener('touchstart', preventDefault, { passive: false });
        document.addEventListener('dblclick', (e) => {
            e.preventDefault();
        });

        // 添加键盘事件监听
        const handleFocus = () => setIsKeyboardVisible(true);
        const handleBlur = () => setIsKeyboardVisible(false);

        // 监听可视区域变化
        const handleResize = () => {
            if (document.activeElement?.tagName === 'INPUT') {
                window.scrollTo(0, document.documentElement.scrollHeight);
            }
        };

        window.addEventListener('resize', handleResize);
        document.addEventListener('focus', handleFocus, true);
        document.addEventListener('blur', handleBlur, true);

        return () => {
            document.removeEventListener('touchstart', preventDefault);
            document.removeEventListener('dblclick', (e) => e.preventDefault());
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('focus', handleFocus, true);
            document.removeEventListener('blur', handleBlur, true);
        };
    }, []);

    return (
        <div
            className="flex flex-col h-[100dvh] bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 relative overflow-hidden">
            {/* Animated gradient background */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-orange-200/40 via-red-200/40 to-pink-200/40 filter blur-xl"
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.4, 0.5, 0.4],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Privacy Notice */}
            <motion.div
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6}}
                className="relative"
            >
                <div className="mx-auto max-w-xl px-3 py-2 sm:px-6 sm:py-3"> {/* 调整移动端padding */}
                    <motion.div
                        whileHover={{scale: 1.01}}
                        className="bg-white/40 backdrop-blur-md rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm shadow-lg border border-white/20 flex items-center gap-1.5 sm:gap-2.5 w-fit mx-auto"
                    >
                        <div className="min-w-4 h-4 sm:min-w-5 sm:h-5 rounded-full bg-orange-200/60 flex items-center justify-center">
                            <span className="text-orange-600 text-[10px] sm:text-xs">!</span>
                        </div>
                        <p className="text-gray-700/90 font-medium">
                            希茉使用AI来生成回复，请务必仔细核实回复内容的准确性。
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Login Button */}
            <motion.button
                whileHover={{scale: 1.02}}
                whileTap={{scale: 0.98}}
                className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-white/95 backdrop-blur-lg shadow-lg border border-white/50 text-gray-700 absolute top-3 sm:top-6 right-3 sm:right-6 z-10 text-sm sm:text-base"
            >
                <User size={16} className="sm:w-[18px] sm:h-[18px]"/>
                <span>登录</span>
            </motion.button>


            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 relative mt-2">
                <AnimatePresence>
                    {messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -20}}
                            className={`flex ${message.isAi ? 'justify-start' : 'justify-end'}`}
                        >
                            {message.isAi && (
                                <motion.div
                                    initial={{scale: 0}}
                                    animate={{scale: 1}}
                                    transition={{delay: 0.2}}
                                    className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-lg shadow-sm border border-white/50 flex items-center justify-center mr-3"
                                >
                                    <img src="/api/placeholder/32/32" alt="AI" className="w-5 h-5 rounded-full"/>
                                </motion.div>
                            )}
                            <div className={`max-w-[80%] ${message.isAi ? 'text-gray-800' : 'text-right'}`}>
                                {message.text}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Floating Dock Input Area */}
            <motion.div
                initial={{y: 100}}
                animate={{y: 0}}
                transition={{duration: 0.6}}
                className="relative p-3 pb-4 sm:p-4 sm:pb-6"
            >
                <div className="mx-auto max-w-2xl">
                    <motion.div
                        whileHover={{scale: 1.01}}
                        className="bg-white/50 backdrop-blur-xl rounded-[20px] sm:rounded-[24px] shadow-[0_8px_32px_rgb(0,0,0,0.08)] border border-white/60 p-2 sm:p-3 flex items-center gap-2 sm:gap-3"
                    >
                        <motion.button
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            className="p-2 sm:p-2.5 self-stretch flex items-center"
                        >
                            <Plus size={20} className="sm:w-6 sm:h-6 text-gray-700" strokeWidth={1.5}/>
                        </motion.button>

                        <motion.div
                            layout
                            initial={false}
                            animate={{width: "100%"}}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 25,
                                mass: 1.2
                            }}
                            className="bg-white rounded-[14px] sm:rounded-[16px] shadow-sm flex items-center relative flex-1 h-10 sm:h-12"
                        >
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="给希茉发消息..."
                                className="bg-transparent outline-none text-gray-600/90 placeholder:text-gray-500/60 w-full px-3 sm:px-4 h-full text-base sm:text-base "
                            />

                            <AnimatePresence mode="wait">
                                {inputValue && (
                                    <motion.button
                                        key="send"
                                        initial={{scale: 0, opacity: 0}}
                                        animate={{scale: 1, opacity: 1}}
                                        exit={{scale: 0, opacity: 0}}
                                        transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 30,
                                            mass: 1
                                        }}
                                        whileHover={{scale: 1.05}}
                                        whileTap={{scale: 0.95}}
                                        className="absolute right-1.5 sm:right-2 p-1 sm:p-1.5 bg-gray-100 rounded-lg border border-gray-200"
                                    >
                                        <Send size={16} className="sm:w-[18px] sm:h-[18px] text-gray-700"/>
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {!inputValue && (
                            <motion.button
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                                className="p-2 sm:p-2.5 self-stretch flex items-center"
                            >
                                <Mic size={20} className="sm:w-6 sm:h-6 text-gray-700" strokeWidth={1.5}/>
                            </motion.button>
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default ChatInterface;