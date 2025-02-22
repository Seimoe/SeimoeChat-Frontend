import {useRef, useCallback, useEffect, useState} from 'react';
import {Message} from '@/types/chat';

export const useChatScroll = (messages: Message[]) => {
    const parentRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

    // 检查是否在底部附近（允许一定误差）
    const isNearBottom = useCallback(() => {
        const container = parentRef.current;
        if (!container) return false;

        const threshold = 30; // 调低误差范围，只有在非常接近底部（不足10px）时返回true
        const distanceFromBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;

        return distanceFromBottom <= threshold;
    }, []);

    const scrollToBottom = useCallback(() => {
        if (!parentRef.current || !shouldAutoScroll) return;
        parentRef.current.scrollTop = parentRef.current.scrollHeight;
    }, [shouldAutoScroll]);

    // 处理滚动事件——每次滚动时立即检测是否接近底部
    const handleScroll = useCallback(() => {
        const nearBottom = isNearBottom();
        setShouldAutoScroll(nearBottom);
    }, [isNearBottom]);

    // 处理滚动事件
    useEffect(() => {
        const container = parentRef.current;
        if (!container) return;

        // 使用 passive 选项以提升滚动性能
        container.addEventListener('scroll', handleScroll, {passive: true});
        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    // 处理新消息，直接检测当前是否接近底部，如果是则自动滚动
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage) return;

        if (isNearBottom()) {
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        }
    }, [messages, scrollToBottom, isNearBottom]);

    return {
        parentRef,
        bottomRef,
        scrollToBottom,
        isNearBottom,
        shouldAutoScroll
    };
}; 