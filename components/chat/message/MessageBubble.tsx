'use client'
import React, {useState, useCallback} from 'react';
import {motion} from 'framer-motion';
import {Message} from '@/types/chat';
import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism-tomorrow.css';
import useChat from '@/hooks/useChat';
import Image from "next/image";
import MessageContent from './MessageContent';
import MessageActions from './MessageActions';

interface MessageBubbleProps {
    message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({message}) => {
    const {retryMessage} = useChat();

    const handleRetry = useCallback(() => {
        retryMessage(message.id);
    }, [message.id, retryMessage]);

    return (
        <motion.div
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.3, ease: "easeOut"}}
            className={`my-2 ${message.isAi ? 'pr-4 sm:pr-8' : 'pl-4 sm:pl-8'}`}
            layout="position"
            style={{willChange: "transform, opacity"}}
        >
            <div className={`flex ${message.isAi ? 'flex-row' : 'flex-row-reverse'} gap-4 items-start ${message.isAi ? 'w-full' : 'max-w-full'}`}>
                {message.isAi && (
                    <motion.div
                        initial={{scale: 0}}
                        animate={{scale: 1}}
                        className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-lg shadow-sm border border-white/50 flex-shrink-0 flex items-center justify-center"
                    >
                        <Image
                            src="/avatar.png"
                            alt="AI"
                            width={64}
                            height={64}
                            className="w-10 h-10 rounded-full"
                        />
                    </motion.div>
                )}

                <div className={`flex flex-col gap-1 ${message.isAi ? 'items-start w-full' : 'items-end'} overflow-hidden`}>
                    <motion.div className={`text-sm ${message.isAi ? 'text-gray-600' : 'text-gray-500'}`}>
                        {message.isAi ? '希茉' : '你'}
                    </motion.div>

                    {/* 消息内容 */}
                    <div className={`${
                        message.isAi ? 'text-base text-gray-700 w-full' : 'text-base text-gray-800'
                    } overflow-hidden`}>
                        <MessageContent message={message} />
                    </div>

                    {/* 消息操作按钮 */}
                    {message.isAi && message.status !== 'sending' && (
                        <MessageActions 
                            message={message}
                            onRetry={handleRetry}
                        />
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default React.memo(MessageBubble, (prevProps, nextProps) => {
    // 避免不必要的重渲染
    const prevMessage = prevProps.message;
    const nextMessage = nextProps.message;

    return (
        prevMessage.id === nextMessage.id &&
        prevMessage.text === nextMessage.text &&
        prevMessage.status === nextMessage.status &&
        JSON.stringify(prevMessage.metadata) === JSON.stringify(nextMessage.metadata)
    );
});