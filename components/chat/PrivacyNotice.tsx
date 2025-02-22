import React from 'react';
import {motion} from 'framer-motion';

const PrivacyNotice: React.FC = () => {
    return (
        <motion.div
            initial={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.6}}
            className="flex justify-center max-w-2xl mx-auto px-4 pb-4"
        >
            <motion.div
                whileHover={{scale: 1.01}}
                className="bg-white/40 backdrop-blur-md rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm shadow-lg border border-white/20 inline-flex items-center"
            >
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                    <div
                        className="min-w-4 h-4 sm:min-w-5 sm:h-5 rounded-full bg-orange-200/60 flex items-center justify-center">
                        <span className="text-orange-600 text-[10px] sm:text-xs">!</span>
                    </div>
                    <p className="text-gray-700/90 font-medium">
                        开发版本。希茉使用AI生成内容，请勿输入任何隐私或敏感信息。
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default PrivacyNotice; 