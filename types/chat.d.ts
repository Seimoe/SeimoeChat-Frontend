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

export interface Topic {
    id: string;
    title: string;
    last_active_at: string;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
    metadata?: any;
}

export interface ChatState {
    currentTopicId: string | null;
    currentTopicTitle: string | null;
    messages: Message[];
    topics: Topic[];
    isLoading: boolean;
    currentModel: string;
    error: string | null;
    abortController: AbortController | null;
    reasoningEffort: 'low' | 'medium' | 'high';
}

export interface ChatStore extends ChatState {
    // 消息相关
    addMessage: (message: Omit<Message, 'id' | 'timestamp'> & Partial<Pick<Message, 'id' | 'timestamp'>>) => void;
    updateMessage: (id: string, update: {text?: string; status?: 'sending' | 'sent' | 'error'; metadata?: Partial<Message['metadata']>;}) => void;
    clearMessages: () => void;
    
    // 话题相关
    setCurrentTopic: (topicId: string | null, title: string | null) => void;
    fetchTopics: (archived?: boolean) => Promise<Topic[]>;
    createTopic: (title: string) => Promise<Topic>;
    fetchTopicMessages: (topicId: string) => Promise<Message[]>;
    setTopics: (topics: Topic[]) => void;
    
    // 其他状态
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setCurrentModel: (model: string) => void;
    setAbortController: (controller: AbortController | null) => void;
    stopGenerating: () => void;
    setReasoningEffort: (effort: 'low' | 'medium' | 'high') => void;
}