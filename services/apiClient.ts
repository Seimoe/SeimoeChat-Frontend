/**
 * 封装 API 请求（包括普通请求和流式请求）
 */


interface ApiError extends Error {
    status?: number;
    detail?: any;
}


export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {

    try {
        const response = await fetch(path, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
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

        return response.json();
    } catch (error) {
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
    }, error?: string) => void
): Promise<string> {
    const response = await fetch(path, options);

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