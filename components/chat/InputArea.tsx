'use client'
import React, {useState, useCallback, useRef} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {Send, Image, Mic, Square, RotateCcw, Expand, Brain, X} from 'lucide-react';
import FullscreenEditor from './FullscreenEditor';
import debounce from 'lodash/debounce';
import {useChatStore} from '@/stores/chatStore';
import {modelConfigs} from '@/config/modelConfigs';
import Tooltip from '@/components/ui/Tooltip';

interface InputAreaProps {
    inputValue: string;
    setInputValue: (value: string) => void;
    onSend: (text: string, images?: string[]) => void;
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isFullscreenEditorOpen, setIsFullscreenEditorOpen] = useState(false);
    const [isThinkingMenuOpen, setIsThinkingMenuOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const currentModel = useChatStore((state) => state.currentModel);
    const reasoningEffort = useChatStore((state) => state.reasoningEffort);
    const setReasoningEffort = useChatStore((state) => state.setReasoningEffort);
    const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const currentModelConfig = modelConfigs.find(m => m.id === currentModel);
    const showThinkingButton = currentModelConfig?.supportsThinkingEffort;
    const supportsImages = currentModelConfig?.supportsImageInput;

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
                if (inputValue.trim() !== '' || selectedImages.length > 0) {
                    onSend(inputValue, selectedImages);
                    setInputValue('');
                    setSelectedImages([]);
                    setShowExpandButton(false);
                    setIsLongContent(false);
                    if (textareaRef.current) {
                        textareaRef.current.blur();
                        textareaRef.current.style.height = 'auto';
                    }
                }
            }
        }
    }, [inputValue, onSend, setInputValue, selectedImages]);

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

    // 图片上传相关处理
    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !supportsImages) return;

        const imageProcessPromises = Array.from(files).map(file => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target?.result) {
                        resolve(e.target.result as string);
                    }
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(imageProcessPromises).then(imageDataUrls => {
            setSelectedImages(prev => [...prev, ...imageDataUrls]);
        });

        // 清空输入，以便再次选择相同的文件
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [supportsImages]);

    // 处理粘贴图片
    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        if (!supportsImages) return;
        
        const items = e.clipboardData.items;
        const imageItems = Array.from(items).filter(item => item.type.startsWith('image'));
        
        if (imageItems.length === 0) return;
        
        imageItems.forEach(item => {
            const file = item.getAsFile();
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target?.result) {
                        setSelectedImages(prev => [...prev, e.target!.result as string]);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }, [supportsImages]);

    // 处理拖放图片
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!supportsImages) return;
        
        const files = e.dataTransfer.files;
        if (!files || files.length === 0) return;
        
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image'));
        
        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setSelectedImages(prev => [...prev, e.target!.result as string]);
                }
            };
            reader.readAsDataURL(file);
        });
    }, [supportsImages]);
    
    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!supportsImages) return;
        setIsDraggingOver(true);
    }, [supportsImages]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!supportsImages) return;
        // 确保鼠标真的离开了元素而不是进入了子元素
        const relatedTarget = e.relatedTarget as Node;
        if (e.currentTarget.contains(relatedTarget)) return;
        setIsDraggingOver(false);
    }, [supportsImages]);

    // 使用 useEffect 添加全局拖拽事件监听
    React.useEffect(() => {
        if (!supportsImages) return;
        
        const handleGlobalDragEnter = (e: DragEvent) => {
            if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
                setIsDraggingGlobal(true);
            }
        };
        
        const handleGlobalDragLeave = (e: DragEvent) => {
            // 只有当拖拽离开窗口时才重置状态
            if (e.clientX <= 0 || e.clientY <= 0 || 
                e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
                setIsDraggingGlobal(false);
            }
        };
        
        const resetDragStates = () => {
            setIsDraggingGlobal(false);
            setIsDraggingOver(false);
        };
        
        const handleGlobalDrop = resetDragStates;
        const handleGlobalDragEnd = resetDragStates;
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                resetDragStates();
            }
        };

        document.addEventListener('dragenter', handleGlobalDragEnter);
        document.addEventListener('dragleave', handleGlobalDragLeave);
        document.addEventListener('drop', handleGlobalDrop);
        document.addEventListener('dragend', handleGlobalDragEnd);
        document.addEventListener('keydown', handleKeyDown);
        
        return () => {
            document.removeEventListener('dragenter', handleGlobalDragEnter);
            document.removeEventListener('dragleave', handleGlobalDragLeave);
            document.removeEventListener('drop', handleGlobalDrop);
            document.removeEventListener('dragend', handleGlobalDragEnd);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [supportsImages]);

    // 删除图片
    const removeImage = useCallback((index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    }, []);

    return (
        <div 
            className={`relative p-3 pb-4 sm:p-4 sm:pb-6 transition-all duration-300 ${
                isDraggingGlobal && !isDraggingOver ? 'bg-orange-50/30' : ''
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* 全局拖拽提示 */}
            <AnimatePresence>
                {isDraggingGlobal && !isDraggingOver && supportsImages && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="absolute inset-0 border-2 border-dashed border-orange-200 rounded-lg flex items-center justify-center z-30 pointer-events-none"
                    >
                        <motion.div 
                            animate={{y: [0, -10, 0]}}
                            transition={{repeat: Infinity, duration: 2}}
                            className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md text-center"
                        >
                            <Image size={32} className="mx-auto mb-2 text-orange-400" strokeWidth={1.5} />
                            <p className="text-orange-500 font-medium">拖拽到此处添加图片</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <div className="mx-auto max-w-2xl">
                {/* 图片预览区域 */}
                {selectedImages.length > 0 && (
                    <motion.div 
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: 10}}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60 p-3 mb-3 overflow-x-auto"
                    >
                        <div className="flex gap-2 flex-wrap">
                            {selectedImages.map((image, index) => (
                                <div key={index} className="relative group">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                        <img 
                                            src={image} 
                                            alt={`预览图 ${index+1}`} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <motion.button
                                        whileHover={{scale: 1.1}}
                                        whileTap={{scale: 0.9}}
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-80 hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </motion.button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
                
                {/* 拖拽提示覆盖层 - 当拖拽到输入区域上时显示 */}
                <AnimatePresence>
                    {isDraggingOver && supportsImages && (
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            className="absolute inset-0 bg-orange-50/80 backdrop-blur-sm flex items-center justify-center rounded-lg border-2 border-dashed border-orange-300 z-50"
                        >
                            <motion.div 
                                className="text-orange-500 flex flex-col items-center"
                                animate={{scale: [1, 1.05, 1]}}
                                transition={{repeat: Infinity, duration: 1.5}}
                            >
                                <Image size={40} strokeWidth={1.5} />
                                <p className="mt-2 font-medium">释放鼠标添加图片</p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <motion.div
                    initial={{y: 20, opacity: 0}}
                    animate={{
                        y: 0, 
                        opacity: 1,
                        boxShadow: isDraggingGlobal && !isDraggingOver 
                            ? '0 0 0 2px rgba(249, 115, 22, 0.3), 0 8px 32px rgba(0, 0, 0, 0.08)'
                            : '0 8px 32px rgba(0, 0, 0, 0.08)'
                    }}
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

                    {supportsImages && (
                        <motion.button
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            className="p-2 sm:p-2.5 self-stretch flex items-center justify-center"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Image size={22} className="sm:w-7 sm:h-7 text-gray-700" strokeWidth={1.5}/>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                accept="image/*" 
                                onChange={handleImageUpload}
                                className="hidden"
                                multiple
                            />
                        </motion.button>
                    )}

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
                                                ].map(option => (
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
                        onPaste={handlePaste}
                        placeholder={"给希茉发消息..."}
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
                                {(inputValue || isGenerating || selectedImages.length > 0) && (
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
                                            if (inputValue.trim() !== '' || selectedImages.length > 0) {
                                                onSend(inputValue, selectedImages);
                                                setInputValue('');
                                                setSelectedImages([]);
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
                    {!inputValue && !isGenerating && selectedImages.length === 0 && (
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
                onSend={(text) => {
                    onSend(text, selectedImages);
                    setSelectedImages([]);
                }}
            />
        </div>
    );
};

export default React.memo(InputArea);