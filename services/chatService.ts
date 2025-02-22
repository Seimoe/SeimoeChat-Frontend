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

            const messages = messageHistory
                .filter(msg => !(msg.isAi && msg.text === ''))
                .map(msg => ({
                    role: msg.isAi ? 'assistant' : 'user',
                    content: msg.text,
                }));

            const url = '/api/v1/chat/messages';

            // 构建请求 payload，并根据模型配置判断是否需要加入 reasoning_effort 参数
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
