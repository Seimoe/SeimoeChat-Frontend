'use client'
import React, {forwardRef, useCallback, useEffect} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {Expand, Send, Square} from 'lucide-react';
import debounce from 'lodash/debounce';
import {processImage} from '@/utils/imageProcessor';
import {toast} from 'sonner';

interface MessageTextareaProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    onFullscreen: () => void;
    onPasteImage?: (image: string) => void;
    supportsImages?: boolean;
    isGenerating?: boolean;
    onStop?: () => void;
    hasImages?: boolean;
}

const expandButtonVariants = {
    initial: {opacity: 0, scale: 0.8},
    animate: (isLongContent: boolean) =>
        isLongContent
            ? {
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.1, 1],
                transition: {duration: 2, repeat: Infinity, ease: "easeInOut"},
            }
            : {opacity: 1, scale: 1, transition: {duration: 0.2}},
    exit: {opacity: 0, scale: 0.8, transition: {duration: 0.2}},
};

const MessageTextarea = forwardRef<HTMLTextAreaElement, MessageTextareaProps>(
    ({value, onChange, onSend, onFullscreen, onPasteImage, supportsImages, isGenerating = false, onStop, hasImages}, ref) => {
        const [showExpandButton, setShowExpandButton] = React.useState(false);
        const [isLongContent, setIsLongContent] = React.useState(false);
        
        // 调整文本区域高度
        const adjustTextareaHeight = useCallback(
            debounce(() => {
                const textarea = ref as React.MutableRefObject<HTMLTextAreaElement>;
                if (textarea?.current) {
                    textarea.current.style.height = 'auto';
                    const newHeight = textarea.current.scrollHeight;
                    textarea.current.style.height = `${newHeight}px`;

                    // 计算行高和行数
                    const style = window.getComputedStyle(textarea.current);
                    const paddingTop = parseFloat(style.paddingTop);
                    const paddingBottom = parseFloat(style.paddingBottom);
                    const verticalPadding = paddingTop + paddingBottom;

                    const lineHeight = 24;
                    const contentHeight = newHeight - verticalPadding;
                    const lines = Math.floor(contentHeight / lineHeight);

                    setShowExpandButton(lines > 2);
                    setIsLongContent(lines > 5);
                }
            }, 50),
            [ref]
        );
        
        // 处理输入变化
        const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
            onChange(e.target.value);
            adjustTextareaHeight();
        }, [onChange, adjustTextareaHeight]);
        
        // 处理按键
        const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter') {
                if (e.ctrlKey || e.metaKey) {
                    // 插入新行
                    const target = e.currentTarget;
                    const start = target.selectionStart;
                    const end = target.selectionEnd;
                    const newValue = target.value.substring(0, start) + '\n' + target.value.substring(end);
                    onChange(newValue);
                    setTimeout(() => {
                        target.selectionStart = target.selectionEnd = start + 1;
                    }, 0);
                } else if (!e.shiftKey) {
                    // 发送消息
                    e.preventDefault();
                    if (value.trim() !== '') {
                        onSend();
                    }
                }
            }
        }, [value, onSend, onChange]);
        
        // 处理粘贴图片
        const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
            if (!supportsImages || !onPasteImage) return;
            
            const items = e.clipboardData.items;
            const imageItems = Array.from(items).filter(item => item.type.startsWith('image'));
            
            if (imageItems.length === 0) return;
            
            for (const item of imageItems) {
                const file = item.getAsFile();
                if (file) {
                    const { dataUrl, error } = await processImage(file);
                    if (error) {
                        toast.error(error);
                    } else if (dataUrl) {
                        onPasteImage(dataUrl);
                    }
                }
            }
        }, [supportsImages, onPasteImage]);
        
        // 初始化和清空时重置高度
        useEffect(() => {
            if (value === '') {
                const textarea = ref as React.MutableRefObject<HTMLTextAreaElement>;
                if (textarea?.current) {
                    textarea.current.style.height = 'auto';
                }
                setShowExpandButton(false);
                setIsLongContent(false);
            } else {
                adjustTextareaHeight();
            }
        }, [value, adjustTextareaHeight, ref]);
        
        return (
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
                className="bg-white rounded-[14px] sm:rounded-[16px] shadow-sm flex items-stretch relative flex-1 min-h-[40px] sm:min-h-[48px] overflow-hidden"
            >
                <textarea
                    ref={ref}
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    placeholder={"给希茉发消息..."}
                    rows={1}
                    className="bg-transparent outline-none text-gray-600/90 placeholder:text-gray-500/60 w-full px-3 sm:px-4 py-2.5 text-base sm:text-base resize-none overflow-hidden mr-2"
                    style={{
                        maxHeight: '200px',
                    }}
                />
                <div className="flex flex-col justify-between items-center w-12 sm:w-14 pl-1 bg-gradient-to-r from-transparent via-gray-100/50 to-gray-100/50">
                    {showExpandButton && (
                        <AnimatePresence mode="wait">
                            <motion.button
                                custom={isLongContent}
                                variants={expandButtonVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className={`p-1.5 sm:p-2 mt-2 mr-0.5 rounded-lg transition-colors
                                    ${isLongContent
                                    ? 'bg-gradient-to-r from-orange-100 to-rose-100 shadow-sm'
                                    : 'hover:bg-white/80'
                                }`}
                                onClick={onFullscreen}
                            >
                                <Expand
                                    size={16}
                                    className={`sm:w-[18px] sm:h-[18px] ${
                                        isLongContent
                                            ? 'text-rose-500'
                                            : 'text-gray-500/80'
                                    }`}
                                />
                            </motion.button>
                        </AnimatePresence>
                    )}
                    
                    {/* 发送按钮或停止按钮 */}
                    <AnimatePresence mode="wait" initial={false}>
                        {(value || isGenerating || hasImages) && (
                            <motion.button
                                key={isGenerating ? "stop" : "send"}
                                initial={{scale: 0.8, opacity: 0}}
                                animate={{scale: 1, opacity: 1}}
                                exit={{scale: 0.8, opacity: 0}}
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                                transition={{duration: 0.15}}
                                className={`p-1.5 sm:p-2 rounded-xl mr-0.5 mb-2 mt-auto
                                    ${isGenerating
                                    ? 'bg-gradient-to-br from-orange-50 to-rose-50 border border-rose-200/70 shadow-sm'
                                    : 'bg-gradient-to-br from-orange-400 to-rose-400 shadow-lg'
                                } transition-colors duration-200`}
                                onClick={isGenerating ? onStop : onSend}
                            >
                                <motion.div
                                    initial={{rotate: -30, opacity: 0}}
                                    animate={{
                                        rotate: 0,
                                        opacity: 1,
                                        scale: isGenerating ? [1, 1.15, 1] : 1
                                    }}
                                    exit={{rotate: 30, opacity: 0}}
                                    transition={{
                                        duration: 0.2,
                                        ...(isGenerating && {
                                            scale: {
                                                repeat: Infinity,
                                                repeatType: "reverse",
                                                duration: 1.1,
                                                ease: "easeInOut"
                                            }
                                        })
                                    }}
                                >
                                    {isGenerating ? (
                                        <Square
                                            size={16}
                                            className="sm:w-[18px] sm:h-[18px] text-rose-500"
                                        />
                                    ) : (
                                        <Send
                                            size={16}
                                            className="sm:w-[18px] sm:h-[18px] text-white"
                                        />
                                    )}
                                </motion.div>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        );
    }
);

MessageTextarea.displayName = 'MessageTextarea';
export default MessageTextarea; 