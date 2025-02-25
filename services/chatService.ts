import {Message} from '@/types/chat';
import {useChatStore} from '@/stores/chatStore';
import {apiStreamRequest} from '@/services/apiClient';
import Cookies from 'js-cookie';
import {modelConfigs} from '@/config/modelConfigs';

export class ChatService {
    private static instance: ChatService;

    static getInstance(): ChatService {
        if (!ChatService.instance) {
            ChatService.instance = new ChatService();
        }
        return ChatService.instance;
    }

    async sendMessage(
        message: string,
        modelId: string,
        messageHistory: Message[] = [],
        images: string[] = [],
        onStream?: (partialUpdate: {
            content?: string;
            reasoning?: string;
            reasoningCompleted?: boolean
        }, error?: string) => void
    ): Promise<Message> {
        try {
            // 从 cookie 中获取 token
            const token = typeof window !== 'undefined' ? Cookies.get('token') : null;

            if (!token) {
                throw new Error("请先登录后再继续对话");
            }

            const abortController = new AbortController();

            // 确保在客户端才访问 store
            if (typeof window !== 'undefined') {
                useChatStore.getState().setAbortController(abortController);
                useChatStore.getState().setLoading(true);
            }

            // 构建消息历史，支持图片类型
            const messages = messageHistory
                .filter(msg => !(msg.isAi && msg.text === ''))
                .map(msg => {
                    const baseMessage = {
                        role: msg.isAi ? 'assistant' : 'user',
                        content: msg.text,
                    };

                    // 如果是用户消息且有图片，则使用OpenAI的多模态格式
                    if (!msg.isAi && msg.type === 'image' && msg.metadata?.imageUrls?.length) {
                        return {
                            role: 'user',
                            content: [
                                { type: 'text', text: msg.text },
                                ...msg.metadata.imageUrls.map((imageUrl: string) => ({
                                    type: 'image_url',
                                    image_url: {
                                        url: imageUrl
                                    }
                                }))
                            ]
                        };
                    }

                    return baseMessage;
                });

            // 如果当前消息有图片，将其作为最后一条消息添加
            if (images.length > 0) {
                // 如果已经有消息历史，则最后一条已经是当前用户消息，使用OpenAI多模态格式
                const lastUserMessageIndex = messages.length - 1;
                if (lastUserMessageIndex >= 0 && messages[lastUserMessageIndex].role === 'user') {
                    messages[lastUserMessageIndex] = {
                        role: 'user',
                        content: [
                            { type: 'text', text: message || '' },
                            ...images.map(imageUrl => ({
                                type: 'image_url',
                                image_url: {
                                    url: imageUrl
                                }
                            }))
                        ]
                    };
                } else {
                    // 否则添加新消息
                    messages.push({
                        role: 'user',
                        content: [
                            { type: 'text', text: message || '' },
                            ...images.map(imageUrl => ({
                                type: 'image_url',
                                image_url: {
                                    url: imageUrl
                                }
                            }))
                        ]
                    });
                }
            }

            const url = '/api/v1/chat/messages';

            // 构建请求 payload
            const payload: any = {
                messages: messages,
                model_id: modelId,
            };

            const modelConfig = modelConfigs.find((model) => model.id === modelId);
            if (modelConfig?.supportsThinkingEffort) {
                payload.reasoning_effort = useChatStore.getState().reasoningEffort;
            }

            const options: RequestInit = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
                signal: abortController.signal,
            };

            // 使用流式请求处理回复
            const accumulatedText = await apiStreamRequest(url, options, (partialUpdate, error) => {
                onStream?.(partialUpdate, error);
            });

            if (typeof window !== 'undefined') {
                useChatStore.getState().setAbortController(null);
                useChatStore.getState().setLoading(false);
            }

            return {
                id: '',
                text: accumulatedText,
                isAi: true,
                timestamp: Date.now(),
                status: 'sent',
                type: 'text',
            };
        } catch (error) {
            if (typeof window !== 'undefined') {
                useChatStore.getState().setAbortController(null);
                useChatStore.getState().setLoading(false);
            }

            if ((error as Error).name === 'AbortError') {
                return {
                    id: '',
                    text: '回复已中断',
                    isAi: true,
                    timestamp: Date.now(),
                    status: 'sent',
                    type: 'text',
                };
            }

            const errorMessage = error instanceof Error ? error.message : '发送消息失败';
            console.error('发送消息时出错:', errorMessage);

            if (errorMessage.includes('登录')) {
                if (typeof window !== 'undefined') {
                    window.location.href = '/login?from=' + encodeURIComponent(window.location.pathname);
                }
            }

            throw new Error(errorMessage);
        }
    }

}

export const chatService = ChatService.getInstance();
