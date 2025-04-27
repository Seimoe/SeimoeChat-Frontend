'use client'
import React, {useEffect} from 'react';
import {motion} from 'framer-motion';
import MessageBubble from './message/MessageBubble';
import InputArea from './input/InputArea';
import useChat from '@/hooks/useChat';
import {useChatStore} from '@/stores/chatStore';
import 'katex/dist/katex.min.css';
import {useChatScroll} from '@/hooks/useChatScroll';
import {useChatVirtualizer} from '@/hooks/useChatVirtualizer';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import PrivacyNotice from './PrivacyNotice';
import {useMediaQuery} from '@/hooks/useMediaQuery';

const ChatInterface: React.FC = () => {
    const {messages, addMessage, inputValue, setInputValue, sendMessage, currentTopicId} = useChat();
    const clearMessages = useChatStore((state) => state.clearMessages);
    const isGenerating = useChatStore((state) => state.isLoading);
    const stopGenerating = useChatStore((state) => state.stopGenerating);

    const {parentRef, bottomRef, scrollToBottom, shouldAutoScroll} = useChatScroll(messages);
    const {rowVirtualizer, virtualizedMessages} = useChatVirtualizer(messages, parentRef);

    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
    const isDesktop = useMediaQuery('(min-width: 1024px)');

    // 首次加载时，在桌面端自动展开侧边栏
    useEffect(() => {
        if (isDesktop) {
            setIsSidebarCollapsed(false);
        } else {
            setIsSidebarCollapsed(true);
        }
    }, [isDesktop]);

    const toggleSidebarCollapse = React.useCallback(() => {
        setIsSidebarCollapsed(prev => !prev);
    }, []);

    // 当 isGenerating 状态由 true 变为 false（流式过程结束）后，再执行最后一次滚动到底部
    React.useEffect(() => {
        if (!isGenerating && shouldAutoScroll) {
            requestAnimationFrame(() => {
                scrollToBottom();
            });
        }
    }, [isGenerating, scrollToBottom, shouldAutoScroll]);

    // 监听话题变化，如果有新话题自动滚动到底部
    React.useEffect(() => {
        if (currentTopicId) {
            setTimeout(() => {
                scrollToBottom();
            }, 300);
        }
    }, [currentTopicId, scrollToBottom]);

    const chatVariants = {
        collapsed: {marginLeft: 0},
        expanded: {marginLeft: "350px"},
    };

    return (
        <>
            <div className="flex h-[100dvh] bg-gradient-to-br from-orange-100 via-red-100 to-pink-100">
                {/* 主要内容容器 */}
                <div className="flex flex-1 relative">
                    {/* 渐变背景 */}
                    <div
                        className={`absolute inset-0 bg-gradient-fixed`}
                    ></div>

                    {/* 侧边栏 */}
                    <Sidebar
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                        isCollapsed={isSidebarCollapsed}
                        onToggleCollapse={toggleSidebarCollapse}
                        isDesktop={isDesktop}
                    />

                    {/* 主聊天区域 */}
                    <motion.div
                        className="flex-1 flex flex-col relative overflow-hidden"
                        variants={chatVariants}
                        initial="collapsed"
                        animate={isDesktop && !isSidebarCollapsed ? "expanded" : "collapsed"}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 200,
                            mass: 0.8
                        }}
                    >
                        {/* TopBar */}
                        <motion.div
                            initial={{y: -20, opacity: 0}}
                            animate={{y: 0, opacity: 1}}
                            transition={{duration: 0.4, delay: 0.1}}
                            className="absolute left-0 right-0 "
                        >
                            <TopBar onOpenSidebar={() => setIsSidebarOpen(true)}/>
                        </motion.div>

                        {/* 消息区域 */}
                        <div className="absolute inset-0">
                            {/* 消息列表 */}
                            <motion.div
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{duration: 0.4, delay: 0.2}}
                                ref={parentRef}
                                className="absolute inset-0 overflow-y-auto overscroll-contain scroll-smooth"
                                style={{
                                    scrollbarGutter: 'stable',
                                    willChange: "transform",
                                    transform: "translateZ(0)"
                                }}
                            >
                                <div className="pt-20 pb-32 sm:pb-40">
                                    {/* 仅在未有话题时显示隐私声明 */}
                                    {!currentTopicId && <PrivacyNotice/>}

                                    <div
                                        className="max-w-4xl mx-auto px-4 relative"
                                        style={{
                                            height: `${rowVirtualizer.getTotalSize()}px`,
                                            width: '100%',
                                        }}
                                    >
                                        {virtualizedMessages.map((virtualRow) => (
                                            <div
                                                key={virtualRow.message.id}
                                                data-index={virtualRow.index}
                                                ref={rowVirtualizer.measureElement}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    transform: `translateY(${virtualRow.start}px)`,
                                                }}
                                            >
                                                <MessageBubble message={virtualRow.message}/>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div ref={bottomRef} className="h-0"/>
                            </motion.div>

                            {/* 底部输入dock */}
                            <div className="absolute bottom-0 left-0 right-0 z-10">
                                <InputArea
                                    inputValue={inputValue}
                                    setInputValue={setInputValue}
                                    onSend={(text, images) => sendMessage(text, images || [])}
                                    isGenerating={isGenerating}
                                    onStop={stopGenerating}
                                    onClear={clearMessages}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default React.memo(ChatInterface);