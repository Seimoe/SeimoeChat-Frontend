import React from 'react';
import {motion} from 'framer-motion';
import {Menu} from 'lucide-react';
import ModelSelector from './ModelSelector';
import {useMediaQuery} from '@/hooks/useMediaQuery';

interface TopBarProps {
    onOpenSidebar?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({onOpenSidebar}) => {
    const isDesktop = useMediaQuery('(min-width: 1024px)');

    return (
        <div className={`${isDesktop ? "relative" : "fixed w-full"} flex-shrink-0 h-16 sm:h-20 px-4 py-3 z-[98]`}>
            <div className="max-w-2xl mx-auto">
                <motion.div
                    whileHover={{scale: 1.01}}
                    className="h-full bg-white/50 backdrop-blur-xl rounded-[20px] sm:rounded-[24px] shadow-[0_8px_32px_rgb(0,0,0,0.08)] border border-white/60 flex items-center justify-between "
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

                    {/* 占位空间 */}
                    {isDesktop && <div className="w-10"/>}

                    {/* Model Selector */}
                    <div className="h-full">
                        <ModelSelector/>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TopBar; 