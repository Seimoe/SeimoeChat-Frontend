import React from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {Menu} from 'lucide-react';
import ModelSelector from './ModelSelector';
import {useMediaQuery} from '@/hooks/useMediaQuery';
import useChat from '@/hooks/useChat';

interface TopBarProps {
    onOpenSidebar?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({onOpenSidebar}) => {
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const {currentTopicTitle} = useChat();

    return (
        <div className={`${isDesktop ? "relative" : "fixed w-full"} flex-shrink-0 h-16 sm:h-20 px-4 py-3 z-[40]`}>
            <div className="max-w-2xl mx-auto">
                <motion.div
                    whileHover={{scale: 1.01}}
                    className="h-full bg-white/50 backdrop-blur-xl rounded-[20px] sm:rounded-[24px] shadow-[0_8px_32px_rgb(0,0,0,0.08)] border border-white/60 flex items-center justify-between"
                >
                    {/* 移动端侧边栏按钮 */}
                    {!isDesktop && (
                        <motion.button
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            onClick={onOpenSidebar}
                            className="p-2 hover:bg-white/30 rounded-xl transition-colors ml-2"
                        >
                            <Menu size={20} className="text-gray-700"/>
                        </motion.button>
                    )}

                    {/* 占位空间或显示话题标题 */}
                    <div className={`flex-1 flex ${isDesktop ? "justify-start ml-4" : "justify-center"} items-center`}>
                        <AnimatePresence mode="wait">
                            {currentTopicTitle ? (
                                <motion.div
                                    key={currentTopicTitle}
                                    initial={{opacity: 0, y: -10}}
                                    animate={{opacity: 1, y: 0}}
                                    exit={{opacity: 0, y: -10}}
                                    transition={{duration: 0.3}}
                                    className="font-medium text-gray-800 truncate max-w-[250px]"
                                >
                                    {currentTopicTitle}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="new-chat"
                                    initial={{opacity: 0, y: -10}}
                                    animate={{opacity: 1, y: 0}}
                                    exit={{opacity: 0, y: -10}}
                                    transition={{duration: 0.3}}
                                    className="font-medium text-gray-600"
                                >
                                    新对话
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Model Selector */}
                    <div className="px-2">
                        <ModelSelector/>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TopBar;