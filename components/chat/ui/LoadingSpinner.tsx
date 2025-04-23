import React from 'react';
import {motion} from 'framer-motion';

const LoadingSpinner: React.FC = () => (
    <motion.div
        className="flex items-center gap-2 text-gray-600"
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        exit={{opacity: 0}}
    >
        <motion.div
            className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"
            animate={{rotate: 360}}
            transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
            }}
        />
        <span className="text-sm">正在思考</span>
    </motion.div>
);

export default LoadingSpinner; 