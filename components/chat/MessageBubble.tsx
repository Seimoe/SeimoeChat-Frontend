import React, {useState, lazy, Suspense, useMemo, useCallback} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {Message} from '@/types/chat';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import rehypePrism from 'rehype-prism-plus';
import {Check, Copy, AlertCircle, RefreshCw, Brain, ChevronUp, ChevronDown} from 'lucide-react';
import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism-tomorrow.css';
import useChat from '@/hooks/useChat';
import Image from "next/image";
import {modelConfigs} from '@/config/modelConfigs';

const LazyReactMarkdown = lazy(() => import('react-markdown'));

interface MessageBubbleProps {
    message: Message;
}

const CodeBlock = React.memo(({className, children, ...props}: any) => {
    const [copied, setCopied] = useState(false);
    const match = /language-(\w+)(:[\w\/\.-]+)?/.exec(className || 'language-text');

    // 提取文本内容
    const extractTextContent = (node: any): string => {
        if (typeof node === 'string') return node;
        if (Array.isArray(node)) return node.map(extractTextContent).join('');
        if (node?.props?.children) return extractTextContent(node.props.children);
        return '';
    };

    const code = extractTextContent(children);

    const copyToClipboard = async () => {
        try {
            if (!code) {
                console.warn('No code content to copy');
                return;
            }
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <div className="relative group my-4">
            <div className="absolute top-2 right-2 flex gap-2 z-10">
                <div
                    className="px-2 py-1 text-xs text-gray-300 bg-[#1a1b26]/70 rounded-lg"
                >
                    {match ? (match[1] === 'text' ? 'plain' : match[1]) : 'plain'}
                </div>
                <motion.button
                    onClick={copyToClipboard}
                    className="p-1.5 text-gray-300 hover:text-gray-200 bg-[#1a1b26]/70 rounded-lg transition-colors"
                    whileHover={{scale: 1.05}}
                    whileTap={{scale: 0.95}}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {copied ? (
                            <motion.div
                                key="check"
                                initial={{scale: 0.8, opacity: 0}}
                                animate={{scale: 1, opacity: 1}}
                                exit={{scale: 0.8, opacity: 0}}
                                transition={{duration: 0.15}}
                                className="text-emerald-400"
                            >
                                <Check size={14}/>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="copy"
                                initial={{scale: 0.8, opacity: 0}}
                                animate={{scale: 1, opacity: 1}}
                                exit={{scale: 0.8, opacity: 0}}
                                transition={{duration: 0.15}}
                            >
                                <Copy size={14}/>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-[#1a1b26]">
                <pre className="!p-0 !m-0">
                    <code
                        className={`${className || 'language-text'} block p-4 pt-12 overflow-x-auto text-gray-100 whitespace-pre-wrap break-words`}
                        style={{
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            maxWidth: '100%'
                        }}
                    >
                        {children}
                    </code>
                </pre>
            </div>
        </div>
    );
});

const LoadingSpinner = () => (
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

// 思考过程组件
const ThinkingProcess: React.FC<{
    content: string;
    isThinking: boolean;
    isExpanded: boolean;
    onToggle: () => void;
}> = React.memo(({content, isThinking, isExpanded, onToggle}) => {
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
            <motion.div
                className="rounded-2xl border border-white/60 bg-white/30 backdrop-blur-sm overflow-hidden shadow-sm"
            >
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
                        <div
                            className="px-4 py-3 text-sm text-gray-600 whitespace-pre-wrap border-t border-white/60 bg-white/20">
                            {content}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
});

const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({message}) => {
    const {retryMessage} = useChat();
    const [copied, setCopied] = useState(false);
    const [isThinkingExpanded, setIsThinkingExpanded] = useState(true);

    const messageModelConfig = modelConfigs.find(model => model.id === message.metadata?.modelId) || modelConfigs[0];

    const splitTextIntoChunks = useCallback((text: string) => {
        return Array.from(text.matchAll(/\p{Extended_Pictographic}|\S+|\s+/gu)).map(m => m[0]);
    }, []);

    const handleToggleThinking = useCallback(() => {
        setIsThinkingExpanded(prev => !prev);
    }, []);

    // 对 message.text 进行 memoized 拆分，只有在文本变化时重新计算
    const nonAiChunks = useMemo(() => splitTextIntoChunks(message.text), [message.text, splitTextIntoChunks]);

    const renderMessageContent = () => {
        if (message.status === 'sending' && message.text === '') {
            return (
                <motion.div
                    key="loading"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                >
                    <LoadingSpinner/>
                </motion.div>
            );
        }

        if (message.status === 'error') {
            return (
                <motion.div
                    key="error"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    className="flex items-center gap-2 text-orange-600"
                >
                    <AlertCircle size={16}/>
                    <span>{message.text}</span>
                </motion.div>
            );
        }

        // 图片消息渲染
        if (message.type === 'image' && message.metadata?.imageUrls?.length) {
            return (
                <motion.div
                    key="image-content"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
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
            );
        }

        // 文本消息渲染
        return (
            <motion.div
                key="text-content"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                className="prose prose-sm sm:prose max-w-none"
            >
                <Suspense fallback={<div>加载内容中...</div>}>
                    <LazyReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypePrism, rehypeKatex]}
                        components={{
                            code: CodeBlock,
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
        );
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("复制失败", error);
        }
    };

    const handleRetry = () => {
        retryMessage(message.id);
    };

    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -20}}
            className={`flex ${message.isAi ? 'justify-start pl-2 pr-4 sm:pr-24' : 'justify-end pl-4 sm:pl-24 pr-2'} max-w-3xl mx-auto w-full mb-6`}
        >
            <div
                className={`flex ${message.isAi ? 'flex-row' : 'flex-row-reverse'} gap-4 items-start ${message.isAi ? 'w-full' : 'max-w-full'}`}>
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

                <div
                    className={`flex flex-col gap-1 ${message.isAi ? 'items-start w-full' : 'items-end'} overflow-hidden`}>
                    <motion.div className={`text-sm ${message.isAi ? 'text-gray-600' : 'text-gray-500'}`}>
                        {message.isAi ? '希茉' : '你'}
                    </motion.div>

                    {/* 当消息状态不为'sending'且使用时支持深度思考时显示 ThinkingProcess 卡片 */}
                    {message.isAi && messageModelConfig.supportsDeepThinking && message.text.trim() !== '' && message.metadata?.reasoning_content !== undefined && (
                        <ThinkingProcess
                            content={message.metadata.reasoning_content || ''}
                            isThinking={!message.metadata?.reasonCompleted}
                            isExpanded={isThinkingExpanded}
                            onToggle={handleToggleThinking}
                        />
                    )}

                    <div className={`${
                        message.isAi ? 'text-lg text-gray-700 w-full' : 'text-base text-gray-800'
                    } overflow-hidden`}>
                        <AnimatePresence mode="wait">
                            {renderMessageContent()}
                        </AnimatePresence>
                    </div>

                    {/* 保留工具按钮区域 */}
                    {message.isAi && message.status !== 'sending' && (
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
                                onClick={handleRetry}
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
                    )}
                </div>
            </div>
        </motion.div>
    );
}, (prevProps, nextProps) => {
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

export default MessageBubble; 