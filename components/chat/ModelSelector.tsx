import React, {useState} from 'react';
import {useChatStore} from '@/stores/chatStore';
import {motion, AnimatePresence} from 'framer-motion';
import {ChevronDown} from 'lucide-react';
import {modelConfigs} from '@/config/modelConfigs';
import '@/app/globals.css';
import {cn} from '@/utils/tailwind';


const ModelSelector: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const currentModel = useChatStore((state) => state.currentModel);
    const setCurrentModel = useChatStore((state) => state.setCurrentModel);

    const currentModelData = modelConfigs.find(m => m.id === currentModel) || modelConfigs[0];
    const Icon = currentModelData.icon;

    return (
        <div className="relative h-full">
            <motion.div
                className="relative h-full"
                initial={false}
            >
                <motion.button
                    whileHover={{scale: 1.02}}
                    whileTap={{scale: 0.98}}
                    onClick={() => setIsOpen(!isOpen)}
                    className="group relative hover:bg-white/30 rounded-[20px] sm:rounded-[24px] pl-12 sm:pl-16 pr-3 sm:pr-4 py-2 sm:py-2.5 transition-colors h-full flex items-center"
                >
                    <div
                        className="absolute left-2 sm:left-3.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 bg-white/80 rounded-full border border-white/60 pointer-events-none select-none">
                        模型
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <div
                            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br flex-shrink-0 flex items-center justify-center ${currentModelData.color}`}>
                            <Icon size={16} className="text-gray-700 sm:w-[18px] sm:h-[18px]"/>
                        </div>
                        <span className="text-gray-700 text-sm font-medium truncate">
                            {currentModelData.name}
                        </span>
                        <motion.div
                            animate={{rotate: isOpen ? 180 : 0}}
                            transition={{duration: 0.2}}
                            className="opacity-50 group-hover:opacity-100 transition-opacity"
                        >
                            <ChevronDown size={14} className="text-gray-500 sm:w-4 sm:h-4"/>
                        </motion.div>
                    </div>
                </motion.button>

                <AnimatePresence>
                    {isOpen && (
                        <>
                            <motion.div
                                className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[40]"
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                                onClick={() => setIsOpen(false)}
                                style={{
                                    top: '80px'
                                }}
                            />

                            <motion.div
                                initial={{opacity: 0, y: -10}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -10}}
                                transition={{duration: 0.2}}
                                className={`
                                    fixed sm:absolute 
                                    sm:top-full sm:right-0 sm:mt-2 
                                    top-[60%] sm:top-full left-4 right-4 -translate-y-1/2 sm:translate-y-0
                                    bg-gradient-to-br from-orange-50 via-red-50 to-pink-50
                                    backdrop-blur-xl
                                    rounded-[20px] sm:rounded-[24px] 
                                    shadow-[0_8px_32px_rgb(0,0,0,0.12)] 
                                    border border-white/60
                                    overflow-hidden z-[101]
                                    max-h-[80vh] sm:max-h-none sm:w-56
                                `}
                            >
                                <div className="divide-y divide-white/60">
                                    {modelConfigs.map((model) => {
                                        const ModelIcon = model.icon;
                                        return (
                                            <motion.button
                                                key={model.id}
                                                whileHover={{
                                                    backgroundColor: 'rgba(255,255,255,0.6)',
                                                    scale: 1.02
                                                }}
                                                className="w-full px-4 py-3 text-left flex items-start gap-3 transition-all duration-200"
                                                onClick={() => {
                                                    setCurrentModel(model.id);
                                                    setIsOpen(false);
                                                }}
                                            >
                                                <div className={cn(
                                                    'w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm',
                                                    model.color
                                                )}>
                                                    <ModelIcon size={18} className="text-gray-700"/>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-sm font-medium text-gray-700 truncate">
                                                        {model.name}
                                                    </div>
                                                    <div className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                                        {model.description}
                                                    </div>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ModelSelector; 