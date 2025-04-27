/**
 * 封装 API 请求（包括普通请求和流式请求）
 */

import { API_CONFIG } from '@/config/apiConfig';

interface ApiError extends Error {
    status?: number;
    detail?: any;
}

export const requestCache = {
    topics: {
        data: null as any | null,
        timestamp: 0,
        pending: false
    }
};

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    // 为 topics 请求添加缓存
    if (path.startsWith('/api/v1/topics/') && path.indexOf('/messages') === -1 && !options.method) {
        // 如果正在请求中，等待请求完成
        if (requestCache.topics.pending) {
            await new Promise(resolve => {
                const checkInterval = setInterval(() => {
                    if (!requestCache.topics.pending) {
                        clearInterval(checkInterval);
                        resolve(true);
                    }
                }, 50);
            });
            return requestCache.topics.data;
        }
        
        // 如果在缓存有效期内，返回缓存数据
        if (requestCache.topics.data && Date.now() - requestCache.topics.timestamp < 3000) {
            return requestCache.topics.data as T;
        }
        
        // 否则发起新请求并缓存
        requestCache.topics.pending = true;
    }
    
    const url = API_CONFIG.BASE_URL + path;
    const token = typeof window !== 'undefined' ? document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1") : null;
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                ...options.headers,
            }
        });

        if (!response.ok) {
            const error = new Error(response.statusText) as ApiError;
            error.status = response.status;
            try {
                error.detail = await response.json();
            } catch {
            }
            throw error;
        }

        const data = await response.json();
        
        // 缓存 topics 请求结果
        if (path.startsWith('/api/v1/topics/') && path.indexOf('/messages') === -1 && !options.method) {
            requestCache.topics.data = data;
            requestCache.topics.timestamp = Date.now();
            requestCache.topics.pending = false;
        }
        
        return data;
    } catch (error) {
        if (path.startsWith('/api/v1/topics/') && path.indexOf('/messages') === -1 && !options.method) {
            requestCache.topics.pending = false;
        }
        throw error;
    }
}

export async function apiStreamRequest(
    path: string,
    options: RequestInit,
    onStream: (partialUpdate: {
        content?: string;
        reasoning?: string;
        reasoningCompleted?: boolean;
        topicId?: string;
        topicTitle?: string;
        topic_id?: string;
        topic_title?: string;
    }, error?: string) => void
): Promise<string> {
    const url = API_CONFIG.BASE_URL + path;
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`请求失败: ${response.statusText}`);
    }
    if (!response.body) {
        throw new Error("Response body is empty");
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulatedContent = '';
    let accumulatedReasoning = '';
    let contentStarted = false;
    let shouldStop = false;

    while (!shouldStop) {
        const {done, value} = await reader.read();
        if (done) break;

        const rawText = decoder.decode(value, {stream: true});
        const events = rawText.split("\n\n");

        for (const eventData of events) {
            const trimmedEvent = eventData.trim();
            if (!trimmedEvent) continue;

            if (trimmedEvent.startsWith('data:')) {
                const jsonStr = trimmedEvent.substring(5).trim();
                if (jsonStr === "[DONE]") {
                    shouldStop = true;
                    break;
                }
                try {
                    const data = JSON.parse(jsonStr);
                    if (data.error) {
                        onStream({}, data.error);
                        shouldStop = true;
                        return accumulatedContent;
                    }
                    
                    // 检查是否有话题相关信息
                    if (data.topic_id && data.topic_title) {
                        onStream({
                            topic_id: data.topic_id,
                            topic_title: data.topic_title
                        });
                    }
                    
                    if (data.reasoning_content) {
                        accumulatedReasoning += data.reasoning_content;
                        onStream({reasoning: accumulatedReasoning});
                    }
                    if (data.content) {
                        if (!contentStarted) {
                            contentStarted = true;
                        }
                        accumulatedContent += data.content;
                        onStream({
                            content: accumulatedContent,
                            reasoning: accumulatedReasoning,
                            reasoningCompleted: true,
                        });
                    }
                    if (data.is_last) {
                        shouldStop = true;
                        break;
                    }
                } catch (err) {
                    console.warn("解析流数据时出错，跳过此块", err);
                }
            }
        }
    }
    return accumulatedContent;
}