export interface Message {
    id: string;
    text: string;
    isAi: boolean;
    timestamp: number;
    status: 'sending' | 'sent' | 'error';
    type: 'text' | 'image' | 'audio';
    metadata?: {
        modelId?: string;
        error?: string;
        audioUrl?: string;
        imageUrl?: string;
        imageUrls?: string[];
        reasoning_content?: string;
        reasonCompleted?: boolean;
    };
}

export interface ChatState {
    messages: Message[];
    isLoading: boolean;
    currentModel: string;
    error: string | null;
    currentPage: number;
    abortController: AbortController | null;
}

export interface ChatStore extends ChatState {
    addMessage: (message: Omit<Message, 'id' | 'timestamp'> & Partial<Pick<Message, 'id' | 'timestamp'>>) => void;
    updateMessage: (
        id: string,
        update: {
            text?: string;
            status?: 'sending' | 'sent' | 'error';
            metadata?: Partial<Message['metadata']>;
        }
    ) => void;
    removeMessage: (id: string) => void;
    clearMessages: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setCurrentModel: (model: string) => void;
    setAbortController: (controller: AbortController | null) => void;
    stopGenerating: () => void;
    loadMoreMessages: () => void;
    getVisibleMessages: () => Message[];
    truncateMessagesFrom: (messageId: string) => void;
    reasoningEffort: 'low' | 'medium' | 'high';
    setReasoningEffort: (effort: 'low' | 'medium' | 'high') => void;
}

export interface ChatHistory {
    messages: Message[];
} 