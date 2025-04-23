'use client'
import React from 'react';
import {motion} from 'framer-motion';
import {Brain, ChevronDown} from 'lucide-react';

interface ThinkingProcessProps {
    content: string;
    isThinking: boolean;
    isExpanded: boolean;
    onToggle: () => void;
}

const ThinkingProcess: React.FC<ThinkingProcessProps> = ({
    content, 
    isThinking, 
    isExpanded, 
    onToggle
}) => {
    if (!content && !isThinking) return null;

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{
                opacity: 1,
                transition: {
                    opacity: {duration: 0.3, ease: 'easeOut'}
                }
            }}
            exit={{
                opacity: 0,
                transition: {
                    opacity: {duration: 0.2, ease: 'easeIn'}
                }
            }}
            className="mb-2"
        >
            <motion.div className="rounded-2xl border border-white/60 bg-white/30 backdrop-blur-sm overflow-hidden shadow-sm">
                <motion.button
                    onClick={onToggle}
                    className={`w-full flex items-center justify-between text-sm transition-colors
                        ${isExpanded ? 'px-4 py-2.5' : 'p-2 sm:p-2.5'}`}
                    whileHover={{backgroundColor: 'rgba(255, 255, 255, 0.3)'}}
                    transition={{duration: 0.2}}
                    layout="position"
                >
                    <motion.div
                        className="flex items-center gap-2.5"
                        layout="position"
                    >
                        {isThinking ? (
                            <motion.div
                                className="w-4 h-4 border-2 border-orange-300/80 border-t-orange-500 rounded-full"
                                animate={{rotate: 360}}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            />
                        ) : (
                            <motion.div
                                initial={{scale: 0.8, opacity: 0}}
                                animate={{scale: 1, opacity: 1}}
                                transition={{
                                    duration: 0.3,
                                    ease: [0.23, 1, 0.32, 1]
                                }}
                            >
                                <Brain className="w-4 h-4 text-orange-500"/>
                            </motion.div>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="text-gray-700 font-medium whitespace-nowrap">
                                {isThinking ? "深度思考中..." : "思考过程"}
                            </span>
                            {!isExpanded && content && (
                                <span className="text-gray-500 text-xs max-w-[120px] truncate hidden sm:inline-block">
                                    {content}
                                </span>
                            )}
                        </div>
                    </motion.div>
                    {content && (
                        <motion.div
                            animate={{rotate: isExpanded ? 180 : 0}}
                            transition={{
                                duration: 0.4,
                                ease: [0.23, 1, 0.32, 1]
                            }}
                            layout="position"
                        >
                            <ChevronDown size={16} className="text-gray-500"/>
                        </motion.div>
                    )}
                </motion.button>

                {content && (
                    <motion.div
                        initial={false}
                        animate={{
                            height: isExpanded ? 'auto' : 0,
                            opacity: isExpanded ? 1 : 0
                        }}
                        transition={{
                            height: {
                                duration: 0.4,
                                ease: [0.23, 1, 0.32, 1]
                            },
                            opacity: {
                                duration: 0.3,
                                delay: isExpanded ? 0.1 : 0
                            }
                        }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 py-3 text-sm text-gray-600 whitespace-pre-wrap border-t border-white/60 bg-white/20">
                            {content}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default React.memo(ThinkingProcess); 