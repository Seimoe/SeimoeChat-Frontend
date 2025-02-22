import {useVirtualizer} from '@tanstack/react-virtual';
import {Message} from '@/types/chat';
import React from 'react';

export const useChatVirtualizer = (messages: Message[], parentRef: React.RefObject<HTMLDivElement | null>) => {
    const rowVirtualizer = useVirtualizer({
        count: messages.length,
        getScrollElement: () => parentRef.current,
        estimateSize: (index) => {
            const msg = messages[index];
            if (msg.isAi) {
                return msg.text.length > 500 ? 200 : 120;
            }
            return 80;
        },
        overscan: 3,
        paddingStart: 16,
        paddingEnd: 16,
    });

    const virtualizedMessages = React.useMemo(() =>
            rowVirtualizer.getVirtualItems().map((virtualRow) => ({
                ...virtualRow,
                message: messages[virtualRow.index]
            }))
        , [rowVirtualizer.getVirtualItems(), messages]);

    return {
        rowVirtualizer,
        virtualizedMessages
    };
}; 