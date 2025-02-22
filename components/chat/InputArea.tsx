'use client'
import React, {useState, useCallback} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {Send, Plus, Mic, Square, RotateCcw, Expand, Brain} from 'lucide-react';
import FullscreenEditor from './FullscreenEditor';
import debounce from 'lodash/debounce';
import {useChatStore} from '@/stores/chatStore';
import {modelConfigs} from '@/config/modelConfigs';
import Tooltip from '@/components/ui/Tooltip';

interface InputAreaProps {
    inputValue: string;
    setInputValue: (value: string) => void;
    onSend: (text: string) => void;
    isGenerating?: boolean;
    onStop?: () => void;
    onClear?: () => void;
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

const InputArea: React.FC<InputAreaProps> = ({
                                                 inputValue,
                                                 setInputValue,
                                                 onSend,
                                                 isGenerating = false,
                                                 onStop,
                                                 onClear
                                             }) => {
    const [rotateCount, setRotateCount] = useState(0);
    const [showExpandButton, setShowExpandButton] = useState(false);
    const [isLongContent, setIsLongContent] = useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const [isFullscreenEditorOpen, setIsFullscreenEditorOpen] = useState(false);
    const [isThinkingMenuOpen, setIsThinkingMenuOpen] = useState(false);
    const currentModel = useChatStore((state) => state.currentModel);
    const reasoningEffort = useChatStore((state) => state.reasoningEffort);
    const setReasoningEffort = useChatStore((state) => state.setReasoningEffort);

    const currentModelConfig = modelConfigs.find(m => m.id === currentModel);
    const showThinkingButton = currentModelConfig?.supportsThinkingEffort;

    const adjustTextareaHeight = useCallback(
        debounce(() => {
            const textarea = textareaRef.current;
            if (textarea) {
                textarea.style.height = 'auto';
                const newHeight = textarea.scrollHeight;
                textarea.style.height = `${newHeight}px`;

                // 获取真实的上下内边距，确保行数计算准确
                const style = window.getComputedStyle(textarea);
                const paddingTop = parseFloat(style.paddingTop);
                const paddingBottom = parseFloat(style.paddingBottom);
                const verticalPadding = paddingTop + paddingBottom;

                const lineHeight = 24;
                const contentHeight = newHeight - verticalPadding;
                const lines = Math.floor(contentHeight / lineHeight);

                // 当行数大于 2 时（即 3 行及以上）显示 expand 按钮
                setShowExpandButton(lines > 2);
                setIsLongContent(lines > 5);
            }
        }, 50),
        []
    );

    React.useEffect(() => {
        if (inputValue === '') {
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
            setShowExpandButton(false);
            setIsLongContent(false);
        } else {
            adjustTextareaHeight();
        }
    }, [inputValue, adjustTextareaHeight]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
        adjustTextareaHeight();
    }, [setInputValue, adjustTextareaHeight]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            if (e.ctrlKey || e.metaKey) {
                const target = e.currentTarget;
                const start = target.selectionStart;
                const end = target.selectionEnd;
                const value = target.value;
                setInputValue(value.substring(0, start) + '\n' + value.substring(end));
                setTimeout(() => {
                    target.selectionStart = target.selectionEnd = start + 1;
                }, 0);
            } else if (!e.shiftKey) {
                e.preventDefault();
                if (inputValue.trim() !== '') {
                    onSend(inputValue);
                    setInputValue('');
                    setShowExpandButton(false);
                    setIsLongContent(false);
                    if (textareaRef.current) {
                        textareaRef.current.blur();
                        textareaRef.current.style.height = 'auto';
                    }
                }
            }
        }
    }, [inputValue, onSend, setInputValue]);

    const handleClearClick = useCallback(() => {
        setRotateCount(prev => prev - 1);
        onClear?.();
    }, [onClear]);

    const resetTextarea = useCallback(() => {
        if (textareaRef.current) {
            textareaRef.current.blur();
            textareaRef.current.style.height = 'auto';
        }
        setShowExpandButton(false);
        setIsLongContent(false);
    }, []);

    return (
        <div className="relative p-3 pb-4 sm:p-4 sm:pb-6">
            <div className="mx-auto max-w-2xl">
                <motion.div
                    initial={{y: 20, opacity: 0}}
                    animate={{y: 0, opacity: 1}}
                    transition={{
                        duration: 0.4,
                        type: "spring",
                        stiffness: 260,
                        damping: 20
                    }}
                    className="bg-white/50 backdrop-blur-xl rounded-[20px] sm:rounded-[24px] shadow-[0_8px_32px_rgb(0,0,0,0.08)] border border-white/60 p-2 sm:p-3 flex items-center gap-1.5 sm:gap-2 will-change-transform"
                >
                    <motion.button
                        whileHover={{scale: 1.05}}
                        whileTap={{scale: 0.95}}
                        animate={{rotate: rotateCount * 360}}
                        onClick={handleClearClick}
                        transition={{
                            rotate: {
                                duration: 0.5,
                                ease: "easeOut"
                            }
                        }}
                        className="p-1 sm:p-2.5 self-stretch flex items-center justify-center"
                    >
                        <RotateCcw size={16} className="sm:w-6 sm:h-6 text-gray-700" strokeWidth={1.5}/>
                    </motion.button>

                    <motion.button
                        whileHover={{scale: 1.05}}
                        whileTap={{scale: 0.95}}
                        className="p-2 sm:p-2.5 self-stretch flex items-center justify-center"
                    >
                        <Plus size={22} className="sm:w-7 sm:h-7 text-gray-700" strokeWidth={1.5}/>
                    </motion.button>

                    {showThinkingButton && (
                        <motion.div className="relative">
                            <motion.button
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                                onClick={() => setIsThinkingMenuOpen(!isThinkingMenuOpen)}
                                className="p-2 sm:p-2.5 self-stretch flex items-center justify-center gap-2"
                            >
                                <Brain size={20} className="sm:w-6 sm:h-6 text-gray-700" strokeWidth={1.5}/>
                                <div className="flex items-center gap-0.5">
                                    {[...Array(reasoningEffort === 'low' ? 1 : reasoningEffort === 'medium' ? 2 : 3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-1 h-1 rounded-full ${
                                                reasoningEffort === 'low'
                                                    ? 'bg-blue-400'
                                                    : reasoningEffort === 'medium'
                                                        ? 'bg-indigo-400'
                                                        : 'bg-purple-400'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </motion.button>

                            <AnimatePresence>
                                {isThinkingMenuOpen && (
                                    <>
                                        <motion.div
                                            initial={{opacity: 0}}
                                            animate={{opacity: 1}}
                                            exit={{opacity: 0}}
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsThinkingMenuOpen(false)}
                                        />
                                        <motion.div
                                            initial={{opacity: 0, y: 10}}
                                            animate={{opacity: 1, y: 0}}
                                            exit={{opacity: 0, y: 10}}
                                            className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-3 min-w-[240px] z-50"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-medium text-gray-700">思考深度</span>
                                                <Tooltip
                                                    content={
                                                        <div className="space-y-3">
                                                            <p className="font-medium text-gray-900">关于思考深度</p>
                                                            <p className="text-sm text-gray-600">
                                                                思考深度是OpenAI推理模型特有的参数，用于控制AI回答问题前思考花费的时间:
                                                            </p>
                                                            <ul className="text-sm space-y-2.5">
                                                                <li className="flex items-start gap-2.5">
                                                                    <span className="flex gap-0.5 mt-1.5">
                                                                        <div
                                                                            className="w-1.5 h-1.5 rounded-full bg-blue-400"/>
                                                                    </span>
                                                                    <div className="space-y-0.5">
                                                                        <span
                                                                            className="font-medium text-gray-800">低</span>
                                                                        <p className="text-gray-600 text-[13px]">快速回答，适合简单明确的问题</p>
                                                                    </div>
                                                                </li>
                                                                <li className="flex items-start gap-2.5">
                                                                    <span className="flex gap-0.5 mt-1.5">
                                                                        <div
                                                                            className="w-1.5 h-1.5 rounded-full bg-indigo-400"/>
                                                                        <div
                                                                            className="w-1.5 h-1.5 rounded-full bg-indigo-400"/>
                                                                    </span>
                                                                    <div className="space-y-0.5">
                                                                        <span
                                                                            className="font-medium text-gray-800">中</span>
                                                                        <p className="text-gray-600 text-[13px]">平衡深度与速度，适合一般性问题</p>
                                                                    </div>
                                                                </li>
                                                                <li className="flex items-start gap-2.5">
                                                                    <span className="flex gap-0.5 mt-1.5">
                                                                        <div
                                                                            className="w-1.5 h-1.5 rounded-full bg-purple-400"/>
                                                                        <div
                                                                            className="w-1.5 h-1.5 rounded-full bg-purple-400"/>
                                                                        <div
                                                                            className="w-1.5 h-1.5 rounded-full bg-purple-400"/>
                                                                    </span>
                                                                    <div className="space-y-0.5">
                                                                        <span
                                                                            className="font-medium text-gray-800">高</span>
                                                                        <p className="text-gray-600 text-[13px]">花费尽可能多的时间进行思考，当你认为问题较复杂时使用</p>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                            <div className="pt-1 mt-1 border-t border-gray-100">
                                                                <p className="text-[13px] text-gray-500">提示：思考深度越高，回答质量越高</p>
                                                            </div>
                                                        </div>
                                                    }
                                                    position="left"
                                                    maxWidth="320px"
                                                >
                                                    <button
                                                        className="ml-2 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full flex items-center gap-1.5 transition-colors"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <span>什么是思考深度</span>
                                                        <span
                                                            className="w-4 h-4 rounded-full border border-current flex items-center justify-center">?</span>
                                                    </button>
                                                </Tooltip>
                                            </div>
                                            <div className="space-y-1">
                                                {[
                                                    {
                                                        value: 'low',
                                                        label: '低',
                                                        desc: '简单思考，快速回答',
                                                        dots: 1,
                                                        color: 'bg-blue-400'
                                                    },
                                                    {
                                                        value: 'medium',
                                                        label: '中',
                                                        desc: '平衡深度与速度',
                                                        dots: 2,
                                                        color: 'bg-indigo-400'
                                                    },
                                                    {
                                                        value: 'high',
                                                        label: '高',
                                                        desc: '思考至确定答案为止',
                                                        dots: 3,
                                                        color: 'bg-purple-400'
                                                    }
                                                ].map((option) => (
                                                    <motion.button
                                                        key={option.value}
                                                        whileHover={{backgroundColor: 'rgba(0,0,0,0.03)'}}
                                                        onClick={() => {
                                                            setReasoningEffort(option.value as 'low' | 'medium' | 'high');
                                                            setIsThinkingMenuOpen(false);
                                                        }}
                                                        className={`w-full px-4 py-2.5 text-left rounded-xl transition-colors
                                                            ${reasoningEffort === option.value ? 'bg-gray-50' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex gap-0.5">
                                                                {[...Array(option.dots)].map((_, i) => (
                                                                    <div
                                                                        key={i}
                                                                        className={`w-1.5 h-1.5 rounded-full ${
                                                                            reasoningEffort === option.value
                                                                                ? option.color
                                                                                : 'bg-gray-300'
                                                                        }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className={`font-medium ${
                                                                reasoningEffort === option.value
                                                                    ? 'text-gray-900'
                                                                    : 'text-gray-600'
                                                            }`}>
                                                                {option.label}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1 ml-4">
                                                            {option.desc}
                                                        </div>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

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
                            ref={textareaRef}
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="给希茉发消息..."
                            rows={1}
                            className="bg-transparent outline-none text-gray-600/90 placeholder:text-gray-500/60 w-full px-3 sm:px-4 py-2.5 text-base sm:text-base resize-none overflow-hidden mr-2"
                            style={{
                                maxHeight: '200px',
                            }}
                        />

                        <div
                            className="flex flex-col justify-between items-center w-12 sm:w-14 pl-1 bg-gradient-to-r from-transparent via-gray-100/50 to-gray-100/50">
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
                                        onClick={() => setIsFullscreenEditorOpen(true)}
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

                            <AnimatePresence mode="wait" initial={false}>
                                {(inputValue || isGenerating) && (
                                    <motion.button
                                        key={isGenerating ? "stop" : "send"}
                                        initial={{scale: 0.8, opacity: 0}}
                                        animate={{scale: 1, opacity: 1}}
                                        exit={{scale: 0.8, opacity: 0}}
                                        whileHover={{scale: 1.05}}
                                        whileTap={{scale: 0.95}}
                                        transition={{duration: 0.15}}
                                        className={`p-1.5 sm:p-2 rounded-xl mr-0.5
                                            ${showExpandButton ? 'mb-2' : 'mt-auto mb-2'}  
                                            ${isGenerating
                                            ? 'bg-gradient-to-br from-orange-50 to-rose-50 border border-rose-200/70 shadow-sm'
                                            : 'bg-gradient-to-br from-orange-400 to-rose-400 shadow-lg'
                                        } transition-colors duration-200`}
                                        onClick={isGenerating ? () => {
                                            onStop?.();
                                            setInputValue('');
                                            resetTextarea();
                                        } : () => {
                                            if (inputValue.trim() !== '') {
                                                onSend(inputValue);
                                                setInputValue('');
                                                resetTextarea();
                                            }
                                        }}
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

                    {!inputValue && !isGenerating && (
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

            <FullscreenEditor
                isOpen={isFullscreenEditorOpen}
                onClose={() => setIsFullscreenEditorOpen(false)}
                value={inputValue}
                onChange={setInputValue}
                onSend={onSend}
            />
        </div>
    );
};

export default React.memo(InputArea);