'use client'
import React, {useCallback, useRef, useEffect} from 'react';
import ReactDOM from 'react-dom';
import {motion, AnimatePresence} from 'framer-motion';
import {X, Send} from 'lucide-react';

interface FullscreenEditorProps {
    isOpen: boolean;
    onClose: () => void;
    value: string;
    onChange: (value: string) => void;
    onSend: (text: string) => void;
}

const FullscreenEditor: React.FC<FullscreenEditorProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               value,
                                                               onChange,
                                                               onSend
                                                           }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen && textareaRef.current) {
            textareaRef.current.focus();
            // 禁止背景滚动
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleSend = useCallback(() => {
        if (value.trim()) {
            onSend(value);
            onClose();
        }
    }, [value, onSend, onClose]);

    return typeof document !== 'undefined' ? ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    transition={{duration: 0.2}}
                    className="fixed inset-0 z-[110]"
                >
                    {/* 背景遮罩 */}
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
                        onClick={onClose}
                    />

                    {/* 编辑器容器 */}
                    <motion.div
                        initial={{y: "100%"}}
                        animate={{y: 0}}
                        exit={{y: "100%"}}
                        transition={{
                            type: "spring",
                            damping: 30,
                            stiffness: 300,
                            mass: 0.8
                        }}
                        className="absolute inset-x-0 bottom-0 sm:inset-6 bg-white rounded-t-2xl sm:rounded-[24px] shadow-2xl flex flex-col sm:overflow-hidden max-h-[calc(100%-env(safe-area-inset-top)-env(safe-area-inset-bottom))] sm:max-h-[calc(100%-3rem)]"
                    >
                        {/* 顶部栏 */}
                        <div
                            className="flex items-center justify-between px-3 py-3 sm:px-4 sm:py-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <motion.button
                                    whileHover={{scale: 1.05}}
                                    whileTap={{scale: 0.95}}
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    <X size={20} className="text-gray-600"/>
                                </motion.button>
                                <span className="text-gray-700 font-medium">编辑消息</span>
                            </div>
                            <motion.button
                                whileHover={{scale: 1.02}}
                                whileTap={{scale: 0.98}}
                                onClick={handleSend}
                                className="px-4 py-2 bg-gradient-to-r from-orange-400 to-rose-400 text-white rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
                            >
                                <Send size={16}/>
                                <span>发送</span>
                            </motion.button>
                        </div>

                        {/* 编辑区域 */}
                        <div className="flex-1 overflow-hidden">
                            <textarea
                                ref={textareaRef}
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                className="w-full h-full resize-none outline-none text-gray-700 placeholder:text-gray-400 p-4 sm:p-6"
                                placeholder="在这里编辑你的消息..."
                                style={{
                                    minHeight: '200px'
                                }}
                            />
                        </div>

                        {/* 底部安全区域 */}
                        <div className="h-[env(safe-area-inset-bottom)] bg-white sm:hidden"/>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    ) : null;
};

export default FullscreenEditor; 