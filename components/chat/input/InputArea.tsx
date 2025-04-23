'use client'
import React, {useState, useCallback, useRef} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {RotateCcw} from 'lucide-react';
import {useChatStore} from '@/stores/chatStore';
import {modelConfigs} from '@/config/modelConfigs';
import ImageUploader from './ImageUploader';
import ThinkingControls from './ThinkingControls';
import MessageTextarea from './MessageTextarea';
import SendButton from './SendButton';
import VoiceButton from './VoiceButton';
import FullscreenEditor from '../FullscreenEditor';
import {processImage} from '@/utils/imageProcessor';
import {toast} from 'sonner';

interface InputAreaProps {
    inputValue: string;
    setInputValue: (value: string) => void;
    onSend: (text: string, images?: string[]) => void;
    isGenerating?: boolean;
    onStop?: () => void;
    onClear?: () => void;
}

const InputArea: React.FC<InputAreaProps> = ({
    inputValue,
    setInputValue,
    onSend,
    isGenerating = false,
    onStop,
    onClear
}) => {
    const [rotateCount, setRotateCount] = useState(0);
    const [isFullscreenEditorOpen, setIsFullscreenEditorOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [isProcessingImages, setIsProcessingImages] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const currentModel = useChatStore((state) => state.currentModel);
    const currentModelConfig = modelConfigs.find(m => m.id === currentModel);
    const supportsImages = currentModelConfig?.supportsImageInput;
    
    const handleClearClick = useCallback(() => {
        setRotateCount(prev => prev - 1);
        onClear?.();
    }, [onClear]);
    
    const resetTextarea = useCallback(() => {
        if (textareaRef.current) {
            textareaRef.current.blur();
            textareaRef.current.style.height = 'auto';
        }
    }, []);
    
    const handleSendMessage = useCallback(() => {
        if (inputValue.trim() !== '' || selectedImages.length > 0) {
            onSend(inputValue, selectedImages);
            setInputValue('');
            setSelectedImages([]);
            resetTextarea();
        }
    }, [inputValue, onSend, setInputValue, resetTextarea, selectedImages]);
    
    // 拖拽事件处理
    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!supportsImages) return;
        setIsDraggingOver(true);
    }, [supportsImages]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!supportsImages) return;
        const relatedTarget = e.relatedTarget as Node;
        if (e.currentTarget.contains(relatedTarget)) return;
        setIsDraggingOver(false);
    }, [supportsImages]);
    
    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        if (!supportsImages) return;
        setIsDraggingOver(false);
        
        const files = e.dataTransfer.files;
        if (!files || files.length === 0) return;
        
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image'));
        if (imageFiles.length === 0) return;
        
        setIsProcessingImages(true);
        const processedImages: string[] = [];
        const errors: string[] = [];
        
        for (const file of imageFiles) {
            const { dataUrl, error } = await processImage(file);
            if (error) {
                errors.push(error);
            } else if (dataUrl) {
                processedImages.push(dataUrl);
            }
        }
        
        // 显示任何处理错误
        if (errors.length > 0) {
            errors.forEach(error => toast.error(error));
        }
        
        // 添加成功处理的图片
        if (processedImages.length > 0) {
            setSelectedImages(prev => [...prev, ...processedImages]);
        }
        
        setIsProcessingImages(false);
    }, [supportsImages]);
    
    // 全局拖拽事件处理
    React.useEffect(() => {
        if (!supportsImages) return;
        
        const handleGlobalDragEnter = (e: DragEvent) => {
            if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
                setIsDraggingGlobal(true);
            }
        };
        
        const handleGlobalDragLeave = (e: DragEvent) => {
            if (e.clientX <= 0 || e.clientY <= 0 || 
                e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
                setIsDraggingGlobal(false);
            }
        };
        
        const resetDragStates = () => {
            setIsDraggingGlobal(false);
            setIsDraggingOver(false);
        };
        
        document.addEventListener('dragenter', handleGlobalDragEnter);
        document.addEventListener('dragleave', handleGlobalDragLeave);
        document.addEventListener('drop', resetDragStates);
        document.addEventListener('dragend', resetDragStates);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') resetDragStates();
        });
        
        return () => {
            document.removeEventListener('dragenter', handleGlobalDragEnter);
            document.removeEventListener('dragleave', handleGlobalDragLeave);
            document.removeEventListener('drop', resetDragStates);
            document.removeEventListener('dragend', resetDragStates);
            document.removeEventListener('keydown', (e) => {
                if (e.key === 'Escape') resetDragStates();
            });
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
            {/* 全局拖拽提示和拖拽覆盖层 */}
            <ImageUploader.DragOverlay 
                isDraggingGlobal={isDraggingGlobal} 
                isDraggingOver={isDraggingOver} 
                supportsImages={!!supportsImages} 
            />
            
            <div className="mx-auto max-w-2xl">
                {/* 图片预览区域 */}
                <ImageUploader.Preview 
                    images={selectedImages} 
                    onRemove={removeImage} 
                />
                
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
                    {/* 清除按钮 */}
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

                    {/* 图片上传按钮 */}
                    {supportsImages && (
                        <ImageUploader.Button 
                            onImagesSelected={(images) => setSelectedImages(prev => [...prev, ...images])} 
                        />
                    )}

                    {/* 思考深度控制 */}
                    {currentModelConfig?.supportsThinkingEffort && (
                        <ThinkingControls />
                    )}
                    
                    {/* 文本输入区域 - 现在包含发送/停止按钮 */}
                    <MessageTextarea 
                        ref={textareaRef}
                        value={inputValue}
                        onChange={setInputValue}
                        onSend={handleSendMessage}
                        onFullscreen={() => setIsFullscreenEditorOpen(true)}
                        onPasteImage={(image) => setSelectedImages(prev => [...prev, image])}
                        supportsImages={!!supportsImages}
                        isGenerating={isGenerating}
                        hasImages={selectedImages.length > 0}
                        onStop={() => {
                            onStop?.();
                            setInputValue('');
                            resetTextarea();
                        }}
                    />
                    
                    {/* 语音输入按钮 - 仅在没有输入内容且没有图片时显示 */}
                    {!inputValue && !isGenerating && selectedImages.length === 0 && (
                        <VoiceButton />
                    )}
                </motion.div>
            </div>

            {/* 全屏编辑器 */}
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