'use client'
import React from 'react';
import {motion} from 'framer-motion';
import {Mic} from 'lucide-react';

const VoiceButton: React.FC = () => {
    return (
        <motion.button
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.95}}
            className="p-2 sm:p-2.5 self-stretch flex items-center"
        >
            <Mic size={20} className="sm:w-6 sm:h-6 text-gray-700" strokeWidth={1.5}/>
        </motion.button>
    );
};

export default VoiceButton; 