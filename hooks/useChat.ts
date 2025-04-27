import {useState, useCallback, useEffect, useRef} from 'react';
import {useChatStore} from '@/stores/chatStore';
import {chatService} from '@/services/chatService';
import {nanoid} from 'nanoid';
import {retry} from '@/utils/retry';
import {useRouter} from 'next/navigation';

const useChat = () => {
    const router = useRouter();
    const messages = useChatStore((state) => state.messages);
    const addMessage = useChatStore((state) => state.addMessage);
    const currentTopicId = useChatStore((state) => state.currentTopicId);
    const currentTopicTitle = useChatStore((state) => state.currentTopicTitle);
    const fetchTopics = useChatStore((state) => state.fetchTopics);
    const topics = useChatStore((state) => state.topics);
    
    // 输入框状态
    const [localInputValue, setLocalInputValue] = useState('');

    // 添加请求标记，避免重复请求
    const isLoadingTopics = useRef(false);
    const topicsLastFetched = useRef(0);

    // 修改加载话题列表，添加缓存控制
    useEffect(() => {
        const now = Date.now();
        // 如果上次请求在3秒内，不再重复请求
        if (!isLoadingTopics.current && (now - topicsLastFetched.current > 3000)) {
            isLoadingTopics.current = true;
            fetchTopics().finally(() => {
                isLoadingTopics.current = false;
                topicsLastFetched.current = Date.now();
            });
        }
    }, [fetchTopics]);

    // 切换话题时避免立即刷新topics列表
    const switchTopic = useCallback(async (topicId: string) => {
        try {
            // 清空当前消息列表
            useChatStore.getState().clearMessages();
            
            // 获取话题详情并设置临时话题标题
            const topic = topics.find(t => t.id === topicId);
            if (topic) {
                // 先设置临时标题进行过渡
                useChatStore.getState().setCurrentTopic(topic.id, topic.title);
            }
            
            // 获取话题消息
            await useChatStore.getState().fetchTopicMessages(topicId);
            
            // 添加立即刷新话题列表的逻辑，更新last_active_at
            fetchTopics();
            
        } catch (error) {
            console.error('切换话题失败:', error);
        }
    }, [topics, fetchTopics]);

    // 创建新话题
    const createNewChat = useCallback(() => {
        // 先设置临时标题为 null
        useChatStore.getState().setCurrentTopic(null, null);
        useChatStore.getState().clearMessages();
    }, []);

    const sendMessage = useCallback(async (text: string, images: string[] = [], retryCount = 3) => {
        if (!text.trim() && images.length === 0) return;

        // 添加用户消息
        addMessage({
            text,
            isAi: false,
            type: images.length > 0 ? 'image' : 'text',
            status: 'sent',
            metadata: images.length > 0 ? {
                imageUrls: images
            } : undefined,
        });

        const aiMessageId = nanoid();

        addMessage({
            id: aiMessageId,
            text: '',
            isAi: true,
            type: 'text',
            status: 'sending',
            metadata: {modelId: useChatStore.getState().currentModel},
        });

        try {
            await retry(
                async () => {
                    try {
                        return await chatService.sendMessage(
                            text,
                            useChatStore.getState().currentModel,
                            useChatStore.getState().messages,
                            images,
                            currentTopicId,
                            (partialUpdate, error) => {
                                if (error) {
                                    useChatStore.getState().updateMessage(aiMessageId, {
                                        text: error,
                                        status: 'error',
                                    });
                                } else {
                                    // 如果收到话题ID和标题，更新当前话题
                                    if (partialUpdate.topicId && partialUpdate.topicTitle) {
                                        useChatStore.getState().setCurrentTopic(
                                            partialUpdate.topicId,
                                            partialUpdate.topicTitle
                                        );
                                        
                                        // 刷新话题列表
                                        fetchTopics();
                                    }
                                    
                                    // 如果只有思考内容且正式回复尚未开始，则仅更新 metadata
                                    if (partialUpdate.reasoning && !partialUpdate.reasoningCompleted) {
                                        useChatStore.getState().updateMessage(aiMessageId, {
                                            metadata: {reasoning_content: partialUpdate.reasoning},
                                        });
                                    }
                                    // 一旦正式回复开始返回
                                    if (partialUpdate.content) {
                                        useChatStore.getState().updateMessage(aiMessageId, {
                                            text: partialUpdate.content,
                                            status: 'sending',
                                            metadata: {
                                                reasoning_content: partialUpdate.reasoning,
                                                reasonCompleted: true
                                            },
                                        });
                                    }
                                }
                            }
                        );
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : '未知错误';

                        if (errorMessage.includes('登录')) {
                            throw new Error(errorMessage);
                        }

                        throw error;
                    }
                },
                retryCount,
                (attempt) => 1000 * attempt
            );

            if (useChatStore.getState().messages.find(m => m.id === aiMessageId)?.status !== 'error') {
                useChatStore.getState().updateMessage(aiMessageId, {status: 'sent'});
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '发送失败';
            console.error('发送失败', errorMessage);

            useChatStore.getState().updateMessage(
                aiMessageId,
                {
                    text: `抱歉，${errorMessage}`,
                    status: 'error',
                }
            );
        }

        setLocalInputValue('');
    }, [addMessage, currentTopicId, fetchTopics, setLocalInputValue]);

    // 重试消息生成函数
    const retryMessage = useCallback(async (aiMessageId: string) => {
        const currentMessages = useChatStore.getState().messages;
        const messageIndex = currentMessages.findIndex(m => m.id === aiMessageId);
        
        if (messageIndex === -1) {
            console.error("没有找到要重试的消息");
            return;
        }
        
        // 获取上一条用户消息
        let userMessageIndex = messageIndex - 1;
        while (userMessageIndex >= 0) {
            if (!currentMessages[userMessageIndex].isAi) {
                break;
            }
            userMessageIndex--;
        }
        
        if (userMessageIndex < 0) {
            console.error("找不到对应的用户消息");
            return;
        }
        
        const userMessage = currentMessages[userMessageIndex];
        const userText = userMessage.text;
        const images = userMessage.metadata?.imageUrls || [];
        
        // 从这条AI消息开始截断后续所有消息
        const newMessages = currentMessages.slice(0, messageIndex);
        useChatStore.getState().clearMessages();
        newMessages.forEach(msg => useChatStore.getState().addMessage(msg));
        
        // 创建新的AI回复消息
        const newAiMessageId = nanoid();
        useChatStore.getState().addMessage({
            id: newAiMessageId,
            text: '',
            isAi: true,
            type: 'text',
            status: 'sending',
            metadata: {modelId: useChatStore.getState().currentModel},
        });

        try {
            await retry(
                async () => {
                    try {
                        return await chatService.sendMessage(
                            userText,
                            useChatStore.getState().currentModel,
                            useChatStore.getState().messages.slice(0, -1), // 不包括新添加的空AI消息
                            images,
                            currentTopicId,
                            (partialUpdate, error) => {
                                if (error) {
                                    useChatStore.getState().updateMessage(newAiMessageId, {
                                        text: error,
                                        status: 'error',
                                    });
                                } else {
                                    if (partialUpdate.reasoning && !partialUpdate.reasoningCompleted) {
                                        useChatStore.getState().updateMessage(newAiMessageId, {
                                            metadata: {reasoning_content: partialUpdate.reasoning},
                                        });
                                    }
                                    if (partialUpdate.content) {
                                        useChatStore.getState().updateMessage(newAiMessageId, {
                                            text: partialUpdate.content,
                                            status: 'sending',
                                            metadata: {
                                                reasoning_content: partialUpdate.reasoning,
                                                reasonCompleted: true,
                                            },
                                        });
                                    }
                                }
                            }
                        );
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : '未知错误';
                        if (errorMessage.includes('登录')) {
                            throw new Error(errorMessage);
                        }
                        throw error;
                    }
                },
                3,
                (attempt) => 1000 * attempt
            );

            if (useChatStore.getState().messages.find(m => m.id === newAiMessageId)?.status !== 'error') {
                useChatStore.getState().updateMessage(newAiMessageId, {status: 'sent'});
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '发送失败';
            console.error('重试失败', errorMessage);
            useChatStore.getState().updateMessage(newAiMessageId, {
                text: `抱歉，${errorMessage}`,
                status: 'error',
            });
        }
    }, [currentTopicId]);

    // 删除话题
    const deleteTopic = useCallback(async (topicId: string) => {
        try {
            // 确认是否要删除
            if (!window.confirm('确定要删除此对话吗？此操作不可撤销。')) {
                return;
            }
            
            await chatService.deleteTopic(topicId);
            
            // 刷新话题列表
            await fetchTopics();
            
            // 如果删除的是当前话题，则创建新聊天
            if (topicId === currentTopicId) {
                createNewChat();
            }
        } catch (error) {
            console.error('删除话题失败:', error);
        }
    }, [currentTopicId, fetchTopics, createNewChat]);

    return {
        messages,
        addMessage,
        inputValue: localInputValue,
        setInputValue: setLocalInputValue,
        sendMessage,
        retryMessage,
        currentTopicId,
        currentTopicTitle,
        topics,
        switchTopic,
        createNewChat,
        deleteTopic,
    };
};

export default useChat;