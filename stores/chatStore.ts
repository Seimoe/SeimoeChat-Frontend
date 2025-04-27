import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import {ChatStore, Topic, Message} from '@/types/chat';
import {nanoid} from 'nanoid';
import {produce} from 'immer';
import {apiRequest} from '@/services/apiClient';

const initialState = {
    currentTopicId: null,
    currentTopicTitle: null,
    messages: [],
    topics: [],
    isLoading: false,
    currentModel: 'gemini-2.0-flash',
    error: null,
    abortController: null as AbortController | null,
    reasoningEffort: 'medium' as 'low' | 'medium' | 'high',
};

export const useChatStore = create<ChatStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            // 消息操作
            addMessage: (message) =>
                set(produce((state) => {
                    const newMessage = {
                        ...message,
                        id: message.id || nanoid(),
                        timestamp: message.timestamp || Date.now(),
                    };
                    state.messages.push(newMessage);
                })),

            updateMessage: (id, update) =>
                set(
                    produce((state: ChatStore) => {
                        const msg = state.messages.find((message) => message.id === id);
                        if (msg) {
                            if (update.text !== undefined) {
                                msg.text = update.text;
                            }
                            if (update.status) {
                                msg.status = update.status;
                            }
                            if (update.metadata !== undefined) {
                                msg.metadata = {
                                    ...msg.metadata,
                                    ...update.metadata,
                                };
                            }
                        }
                    })
                ),

            clearMessages: () =>
                set(produce((state) => {
                    state.messages = [];
                    state.isLoading = false;
                    state.currentTopicId = null;
                    state.currentTopicTitle = null;
                    
                    if (state.abortController) {
                        state.abortController.abort();
                        state.abortController = null;
                    }
                })),

            // 话题操作
            setCurrentTopic: (topicId, title) => 
                set({ currentTopicId: topicId, currentTopicTitle: title }),

            fetchTopics: async (archived = false) => {
                try {
                    const topics = await apiRequest<Topic[]>(`/api/v1/topics/?archived=${archived}`);
                    
                    // 使用 immer 确保状态正确更新
                    set(produce((state) => {
                        state.topics = topics;
                    }));
                    
                    return topics;
                } catch (error) {
                    console.error('获取话题列表失败:', error);
                    return [];
                }
            },

            createTopic: async (title) => {
                try {
                    const topic = await apiRequest<Topic>('/api/v1/topics/', {
                        method: 'POST',
                        body: JSON.stringify({ title }),
                    });
                    
                    set(produce((state) => {
                        state.topics = [topic, ...state.topics];
                    }));
                    
                    return topic;
                } catch (error) {
                    console.error('创建话题失败:', error);
                    throw error;
                }
            },

            fetchTopicMessages: async (topicId) => {
                try {
                    const apiMessages = await apiRequest<any[]>(`/api/v1/topics/${topicId}/messages`);
                    
                    // 将API返回的消息格式转换为前端使用的格式
                    const messages = apiMessages.map(msg => {
                        // 处理内容是数组（OpenAI格式）的情况
                        let text = '';
                        let type: 'text' | 'image' | 'audio' = 'text';
                        let imageUrls: string[] = [];
                        
                        if (Array.isArray(msg.content)) {
                            // 处理复合内容格式
                            msg.content.forEach((item: any) => {
                                if (item.type === 'text') {
                                    text = item.text || '';
                                } else if (item.type === 'image_url') {
                                    type = 'image';
                                    if (item.image_url?.url) {
                                        imageUrls.push(item.image_url.url);
                                    }
                                }
                            });
                        } else {
                            // 处理普通文本内容
                            text = msg.content || '';
                        }
                        
                        return {
                            id: msg.id,
                            text: text,
                            isAi: msg.is_ai,
                            type: type,
                            status: msg.status || 'sent',
                            timestamp: new Date(msg.created_at).getTime(),
                            metadata: {
                                modelId: msg.model_id,
                                ...(imageUrls.length > 0 ? { imageUrls } : {}),
                                ...msg.metadata
                            }
                        };
                    });
                    
                    set({ messages });
                    return messages;
                } catch (error) {
                    console.error(`获取话题消息失败 (${topicId}):`, error);
                    return [];
                }
            },

            setTopics: (topics) => set({ topics }),

            // 其他状态操作
            setLoading: (loading) => set({isLoading: loading}),

            setError: (error) => set({error}),

            setCurrentModel: (model) => set({currentModel: model}),

            setAbortController: (controller: AbortController | null) =>
                set({abortController: controller}),

            stopGenerating: () =>
                set(produce((state: ChatStore) => {
                    if (state.abortController) {
                        state.abortController.abort();
                        state.abortController = null;
                    }
                    state.isLoading = false;
                })),

            setReasoningEffort: (effort: 'low' | 'medium' | 'high') => 
                set({reasoningEffort: effort}),
        }),
    )
);