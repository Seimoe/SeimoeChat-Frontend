import React from 'react';
import {motion} from 'framer-motion';
import {Trash2} from 'lucide-react';

interface ClearButtonProps {
    onClear: () => void;
}

const ClearButton: React.FC<ClearButtonProps> = ({onClear}) => {
    return (
        <motion.button
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.95}}
            onClick={onClear}
            className="p-1.5 hover:bg-white/30 rounded-lg transition-colors duration-200 group"
        >
            <Trash2
                size={16}
                className="text-gray-600/70 group-hover:text-gray-700 transition-colors duration-200"
                strokeWidth={1.5}
            />
        </motion.button>
    );
};

export default ClearButton; 