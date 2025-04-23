'use client'
import React, {useRef, useCallback, forwardRef, useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {Image, X, AlertTriangle} from 'lucide-react';
import {processImage} from '@/utils/imageProcessor';
import {toast} from 'sonner';

// 主组件接口
interface ImageUploaderProps {
    onImagesSelected: (images: string[]) => void;
}

// 创建具有静态属性的 forwardRef 组件类型
type ImageUploaderComponent = React.ForwardRefExoticComponent<
    ImageUploaderProps & React.RefAttributes<HTMLInputElement>
> & {
    Button: React.FC<ImageUploaderProps>;
    Preview: React.FC<{images: string[], onRemove: (index: number) => void}>;
    DragOverlay: React.FC<{isDraggingGlobal: boolean, isDraggingOver: boolean, supportsImages: boolean}>;
};

// 使用 forwardRef 重构主组件
const ImageUploader = forwardRef<HTMLInputElement, ImageUploaderProps>(
    ({onImagesSelected}, ref) => {
        const [isProcessing, setIsProcessing] = useState(false);
        
        const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;
            
            setIsProcessing(true);
            const processedImages: string[] = [];
            const errors: string[] = [];

            for (const file of Array.from(files)) {
                // 处理每个图片文件
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
            
            // 如果有成功处理的图片，返回给调用者
            if (processedImages.length > 0) {
                onImagesSelected(processedImages);
            }
            
            setIsProcessing(false);

            // 清空输入，以便再次选择相同的文件
            if (ref) {
                const inputRef = ref as React.MutableRefObject<HTMLInputElement>;
                if (inputRef.current) {
                    inputRef.current.value = '';
                }
            }
        }, [onImagesSelected, ref]);
    
        return (
            <div>
                <input 
                    type="file" 
                    ref={ref}
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="hidden"
                    multiple
                    disabled={isProcessing}
                />
            </div>
        );
    }
) as ImageUploaderComponent;

// 设置组件显示名称
ImageUploader.displayName = 'ImageUploader';

// 图片上传按钮组件
const ImageUploaderButton: React.FC<ImageUploaderProps> = ({onImagesSelected}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    return (
        <>
            <motion.button
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
                className="p-2 sm:p-2.5 self-stretch flex items-center justify-center"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
            >
                <Image size={22} className={`sm:w-7 sm:h-7 ${isProcessing ? 'text-gray-400' : 'text-gray-700'}`} strokeWidth={1.5}/>
            </motion.button>
            <ImageUploader 
                onImagesSelected={onImagesSelected} 
                ref={fileInputRef} 
            />
        </>
    );
};

// 图片预览组件
const ImagePreview: React.FC<{
    images: string[],
    onRemove: (index: number) => void
}> = ({images, onRemove}) => {
    if (images.length === 0) return null;
    
    return (
        <motion.div 
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: 10}}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60 p-3 mb-3 overflow-x-auto"
        >
            <div className="flex gap-2 flex-wrap">
                {images.map((image, index) => (
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
                            onClick={() => onRemove(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-80 hover:opacity-100 transition-opacity"
                        >
                            <X size={12} />
                        </motion.button>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

// 拖拽覆盖层组件
const DragOverlay: React.FC<{
    isDraggingGlobal: boolean, 
    isDraggingOver: boolean,
    supportsImages: boolean
}> = ({isDraggingGlobal, isDraggingOver, supportsImages}) => {
    if (!supportsImages) return null;
    
    return (
        <>
            <AnimatePresence>
                {isDraggingGlobal && !isDraggingOver && (
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
            
            <AnimatePresence>
                {isDraggingOver && (
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
        </>
    );
};

// 添加静态属性
ImageUploader.Button = ImageUploaderButton;
ImageUploader.Preview = ImagePreview;
ImageUploader.DragOverlay = DragOverlay;

export default ImageUploader; 