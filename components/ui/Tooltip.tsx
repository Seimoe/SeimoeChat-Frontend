'use client'

import React, {useState, useRef, useEffect} from 'react';
import {createPortal} from 'react-dom';
import {motion, AnimatePresence} from 'framer-motion';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    maxWidth?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
                                             content,
                                             children,
                                             position = 'top',
                                             maxWidth = '280px'
                                         }) => {
    const [isVisible, setIsVisible] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [tooltipPosition, setTooltipPosition] = useState({x: 0, y: 0});

    useEffect(() => {
        if (isVisible && triggerRef.current && tooltipRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();

            let x = 0;
            let y = 0;

            switch (position) {
                case 'top':
                    x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
                    y = triggerRect.top - tooltipRect.height - 8;
                    break;
                case 'bottom':
                    x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
                    y = triggerRect.bottom + 8;
                    break;
                case 'left':
                    x = triggerRect.left - tooltipRect.width - 8;
                    y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
                    break;
                case 'right':
                    x = triggerRect.right + 8;
                    y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
                    break;
            }

            // 确保 tooltip 不会超出视窗
            const padding = 16;
            x = Math.min(Math.max(padding, x), window.innerWidth - tooltipRect.width - padding);
            y = Math.min(Math.max(padding, y), window.innerHeight - tooltipRect.height - padding);

            setTooltipPosition({x, y});
        }
    }, [isVisible, position]);

    // 点击外部关闭
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tooltipRef.current && triggerRef.current &&
                !tooltipRef.current.contains(event.target as Node) &&
                !triggerRef.current.contains(event.target as Node)) {
                setIsVisible(false);
            }
        };

        if (isVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isVisible]);

    return (
        <div ref={triggerRef} className="inline-block">
            <div
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={(e) => {
                    // 只在鼠标不是移动到 tooltip 本身时关闭
                    const relatedTarget = e.relatedTarget as Node;
                    if (!tooltipRef.current?.contains(relatedTarget)) {
                        setIsVisible(false);
                    }
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsVisible(!isVisible);
                }}
            >
                {children}
            </div>
            {createPortal(
                <AnimatePresence>
                    {isVisible && (
                        <motion.div
                            ref={tooltipRef}
                            initial={{opacity: 0, scale: 0.95}}
                            animate={{opacity: 1, scale: 1}}
                            exit={{opacity: 0, scale: 0.95}}
                            transition={{duration: 0.15}}
                            style={{
                                position: 'fixed',
                                left: tooltipPosition.x,
                                top: tooltipPosition.y,
                                maxWidth,
                                zIndex: 100,
                            }}
                            className="bg-white rounded-xl shadow-lg border border-gray-100 p-4"
                            onMouseEnter={() => setIsVisible(true)}
                            onMouseLeave={() => setIsVisible(false)}
                        >
                            {content}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default Tooltip; 