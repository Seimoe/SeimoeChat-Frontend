'use client'
import React, {useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {Check, Copy, RefreshCw} from 'lucide-react';
import {Message} from '@/types/chat';

interface MessageActionsProps {
    message: Message;
    onRetry: () => void;
}

const MessageActions: React.FC<MessageActionsProps> = ({message, onRetry}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("复制失败", error);
        }
    };

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            className="mt-1 flex gap-2"
        >
            <motion.button
                onClick={handleCopy}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
                title="复制消息"
            >
                <AnimatePresence mode="wait" initial={false}>
                    {copied ? (
                        <motion.div
                            key="check"
                            initial={{scale: 0.8, opacity: 0}}
                            animate={{scale: 1, opacity: 1}}
                            exit={{scale: 0.8, opacity: 0}}
                            transition={{duration: 0.15}}
                            className="text-emerald-500"
                        >
                            <Check size={16}/>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="copy"
                            initial={{scale: 0.8, opacity: 0}}
                            animate={{scale: 1, opacity: 1}}
                            exit={{scale: 0.8, opacity: 0}}
                            transition={{duration: 0.15}}
                        >
                            <Copy size={16}/>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            <motion.button
                onClick={onRetry}
                className={`p-1.5 rounded-lg transition-colors ${
                    message.status === 'error'
                        ? 'text-orange-500 hover:text-orange-600 hover:bg-orange-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
                title="重新生成"
            >
                <motion.div
                    animate={message.status === 'error' ? {
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.7, 1]
                    } : {}}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <RefreshCw size={16}/>
                </motion.div>
            </motion.button>
        </motion.div>
    );
};

export default React.memo(MessageActions); 