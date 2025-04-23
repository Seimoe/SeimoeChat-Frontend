'use client'
import React, {lazy, Suspense, useState, useCallback} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {Message} from '@/types/chat';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import rehypePrism from 'rehype-prism-plus';
import {AlertCircle} from 'lucide-react';
import CodeBlock from './CodeBlock';
import ThinkingProcess from './ThinkingProcess';
import {modelConfigs} from '@/config/modelConfigs';
import LoadingSpinner from '../ui/LoadingSpinner';
import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism-tomorrow.css';





const LazyReactMarkdown = lazy(() => import('react-markdown'));

interface MessageContentProps {
    message: Message;
}

// 创建一个包装CodeBlock的组件以解决类型错误
const CodeBlockWrapper = (props: any) => {
    const {children, ...rest} = props;
    if (!children) return null;
    return <CodeBlock {...rest}>{children}</CodeBlock>;
};

const MessageContent: React.FC<MessageContentProps> = ({message}) => {
    const messageModelConfig = modelConfigs.find(model => model.id === message.metadata?.modelId) || modelConfigs[0];
    const [isThinkingExpanded, setIsThinkingExpanded] = useState(true);
    
    const handleToggleThinking = useCallback(() => {
        setIsThinkingExpanded(prev => !prev);
    }, []);
    
    // 检查是否有思考过程内容
    const hasReasoningContent = message.metadata?.reasoning_content !== undefined && 
                               message.metadata.reasoning_content.trim() !== '';
    
    // 判断是否应该显示思考过程 (有reasoning_content时始终显示)
    const shouldShowThinking = message.isAi && 
                              messageModelConfig.supportsDeepThinking && 
                              (hasReasoningContent || (message.status === 'sending' && message.text.trim() === ''));
    
    // 判断是否显示加载状态 (模型不支持思考过程时显示spinner)
    const shouldShowLoading = message.isAi && 
                             !messageModelConfig.supportsDeepThinking && 
                             message.status === 'sending' && 
                             message.text.trim() === '';
    
    return (
        <div className="flex flex-col gap-3">
            {/* 使用AnimatePresence包装所有动态内容 */}
            <AnimatePresence mode="wait">
                {/* 显示思考过程 */}
                {shouldShowThinking && (
                    <motion.div
                        key="thinking-process"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.3}}
                    >
                        <ThinkingProcess
                            content={message.metadata?.reasoning_content || ''}
                            isThinking={!message.metadata?.reasonCompleted}
                            isExpanded={isThinkingExpanded}
                            onToggle={handleToggleThinking}
                        />
                    </motion.div>
                )}

                {/* 显示消息内容 */}
                {shouldShowLoading ? (
                    <motion.div
                        key="loading"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.3}}
                    >
                        <LoadingSpinner />
                    </motion.div>
                ) : message.status === 'error' ? (
                    <motion.div
                        key="error"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.3}}
                        className="flex items-center gap-2 text-orange-600"
                    >
                        <AlertCircle size={16}/>
                        <span>{message.text}</span>
                    </motion.div>
                ) : message.type === 'image' && message.metadata?.imageUrls?.length ? (
                    <motion.div
                        key="image-content"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.3}}
                        className={`space-y-2 w-full ${!message.isAi ? 'flex flex-col items-end' : ''}`}
                    >
                        {message.text && (
                            <div className={`mb-2 ${!message.isAi ? 'text-right' : ''}`}>{message.text}</div>
                        )}
                        <div className={`flex flex-wrap gap-2 ${!message.isAi ? 'justify-end' : ''}`}>
                            {message.metadata.imageUrls.map((img: string, index: number) => (
                                <div key={index} className="relative">
                                    <img 
                                        src={img} 
                                        alt="用户上传图片" 
                                        className="max-w-full rounded-lg max-h-64 object-contain"
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : message.text.trim() !== '' && (
                    <motion.div
                        key="text-content"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.3}}
                        className="prose prose-sm sm:prose max-w-none"
                    >
                        <Suspense fallback={<div>加载内容中...</div>}>
                            <LazyReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex, [rehypePrism, { ignoreMissing: true }]]}
                                components={{
                                    code: CodeBlockWrapper,
                                    p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                                    ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-1.5">{children}</ul>,
                                    ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-1.5">{children}</ol>,
                                    li: ({children}) => <li className="mb-1">{children}</li>,
                                    a: ({href, children}) => (
                                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            {children}
                                        </a>
                                    ),
                                }}
                            >
                                {message.text}
                            </LazyReactMarkdown>
                        </Suspense>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default React.memo(MessageContent); 