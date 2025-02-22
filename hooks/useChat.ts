import {useState, useCallback} from 'react';
import {useChatStore} from '@/stores/chatStore';
import {chatService} from '@/services/chatService';
import {nanoid} from 'nanoid';
import {retry} from '@/utils/retry';
import {useRouter} from 'next/navigation';

const useChat = () => {
    const router = useRouter();
    const messages = useChatStore((state) => state.messages);
    const addMessage = useChatStore((state) => state.addMessage);

    // 输入框状态
    const [localInputValue, setLocalInputValue] = useState('');

    const sendMessage = useCallback(async (text: string, retryCount = 3) => {
        if (!text.trim()) return;

        // 添加用户消息
        addMessage({
            text,
            isAi: false,
            type: 'text',
            status: 'sent',
        });

        const aiMessageId = nanoid();

        // 修改前：添加 AI 消息时 metadata 为 {}
        // addMessage({
        //     id: aiMessageId,
        //     text: '',
        //     isAi: true,
        //     type: 'text',
        //     status: 'sending',
        //     metadata: {},
        // });
        // 修改后：保存当前模型 ID
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
                            (partialUpdate, error) => {
                                if (error) {
                                    useChatStore.getState().updateMessage(aiMessageId, {
                                        text: error,
                                        status: 'error',
                                    });
                                } else {
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
    }, [addMessage, setLocalInputValue]);

    // 新增：重试消息生成函数
    const retryMessage = useCallback(async (aiMessageId: string) => {
        useChatStore.getState().truncateMessagesFrom(aiMessageId);
        const currentMessages = useChatStore.getState().messages;
        const lastMessage = currentMessages[currentMessages.length - 1];
        if (!lastMessage || lastMessage.isAi) {
            console.error("没有找到可重新生成回复的用户消息");
            return;
        }
        const userText = lastMessage.text;
        const newAiMessageId = nanoid();

        // 修改前：未设置 modelId
        // useChatStore.getState().addMessage({
        //     id: newAiMessageId,
        //     text: '',
        //     isAi: true,
        //     type: 'text',
        //     status: 'sending',
        //     metadata: {},
        // });
        // 修改后：绑定当前模型
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
                            useChatStore.getState().messages,
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
    }, []);

    return {
        messages,
        addMessage,
        inputValue: localInputValue,
        setInputValue: setLocalInputValue,
        sendMessage,
        retryMessage,
    };
};

export default useChat; 