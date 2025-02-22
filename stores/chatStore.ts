import {create} from 'zustand';
import {devtools, persist} from 'zustand/middleware';
import {ChatStore} from '@/types/chat';
import {nanoid} from 'nanoid';
import {produce} from 'immer';

const PAGE_SIZE = 50; // 每页显示的消息数量

const initialState = {
    messages: [],
    isLoading: false,
    currentModel: 'gemini-2.0-flash',
    error: null,
    currentPage: 1,
    abortController: null as AbortController | null, // 中断请求
    reasoningEffort: 'medium' as 'low' | 'medium' | 'high',
};

export const useChatStore = create<ChatStore>()(
    devtools(
        persist(
            (set, get) => ({
                ...initialState,

                addMessage: (message) =>
                    set(produce((state) => {
                        const newMessage = {
                            ...message,
                            id: message.id || nanoid(),
                            timestamp: message.timestamp || Date.now(),
                        };

                        const maxMessages = PAGE_SIZE * 3;
                        state.messages.push(newMessage);
                        if (state.messages.length > maxMessages) {
                            state.messages = state.messages.slice(-maxMessages);
                        }
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

                removeMessage: (id) =>
                    set(produce((state: ChatStore) => {
                        state.messages = state.messages.filter((message) => message.id !== id);
                    })),

                clearMessages: () => set({messages: []}),

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

                loadMoreMessages: () =>
                    set((state) => ({
                        currentPage: state.currentPage + 1,
                    })),

                getVisibleMessages: () => {
                    const state = get();
                    const endIndex = state.currentPage * PAGE_SIZE;
                    return state.messages.slice(-endIndex);
                },

                // 截断消息记录，从指定消息ID开始清除该消息及其之后的所有消息
                truncateMessagesFrom: (messageId: string) =>
                    set(produce((state: ChatStore) => {
                        const index = state.messages.findIndex((message) => message.id === messageId);
                        if (index !== -1) {
                            state.messages = state.messages.slice(0, index);
                        }
                    })),

                // 设置思考深度
                setReasoningEffort: (effort: 'low' | 'medium' | 'high') => set({reasoningEffort: effort}),
            }),
            {
                name: 'chat-storage',
                partialize: (state) => ({
                    messages: state.messages.slice(-PAGE_SIZE * 3),
                    currentModel: state.currentModel,
                }),
                storage: {
                    getItem: (name) => {
                        const str = localStorage.getItem(name);
                        try {
                            const data = JSON.parse(str || '');
                            if (data.state?.messages) {
                                data.state.messages = data.state.messages.slice(-PAGE_SIZE * 2);
                            }
                            return data;
                        } catch {
                            return null;
                        }
                    },
                    setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
                    removeItem: (name) => localStorage.removeItem(name),
                },
            }
        )
    )
); 