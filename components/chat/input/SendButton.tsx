'use client'
import React from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {Send, Square} from 'lucide-react';

interface SendButtonProps {
    isGenerating: boolean;
    onSend: () => void;
    onStop: () => void;
}

const SendButton: React.FC<SendButtonProps> = ({isGenerating, onSend, onStop}) => {
    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.button
                key={isGenerating ? "stop" : "send"}
                initial={{scale: 0.8, opacity: 0}}
                animate={{scale: 1, opacity: 1}}
                exit={{scale: 0.8, opacity: 0}}
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
                transition={{duration: 0.15}}
                className={`p-1.5 sm:p-2 rounded-xl mr-0.5 mb-2 mt-auto
                    ${isGenerating
                    ? 'bg-gradient-to-br from-orange-50 to-rose-50 border border-rose-200/70 shadow-sm'
                    : 'bg-gradient-to-br from-orange-400 to-rose-400 shadow-lg'
                } transition-colors duration-200`}
                onClick={isGenerating ? onStop : onSend}
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
        </AnimatePresence>
    );
};

export default SendButton; 