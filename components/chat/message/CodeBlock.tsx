'use client'
import React, {useEffect, useRef, useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {Check, Copy} from 'lucide-react';
import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism-tomorrow.css';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/plugins/autoloader/prism-autoloader';

interface CodeBlockProps {
    className?: string;
    children: React.ReactNode;
}

const CodeBlock: React.FC<CodeBlockProps> = ({className, children, ...props}) => {
    const codeRef = useRef<HTMLElement>(null)

    // 配置自动加载器
    useEffect(() => {
        if (typeof window !== 'undefined' && (Prism as any).plugins?.autoloader) {
            (Prism as any).plugins.autoloader.languages_path = 
                'https://cdn.jsdelivr.net/npm/prismjs@1/components/';
        }
    }, []);

    // 优化高亮处理逻辑
    useEffect(() => {
        const timer = setTimeout(() => {
            if (codeRef.current) {
                Prism.highlightElement(codeRef.current);
            }
        }, 0);
        return () => clearTimeout(timer);
    }, [children]);
  
    // 使用正则表达式检查是否是一个代码块 (有 language- 前缀)
    const isCodeBlock = className && /language-(\w+)/.test(className);
    // 如果不是代码块，则渲染为内联代码
    if (!isCodeBlock) {
        return (
            <code
                className="px-1.5 py-0.5 mx-0.5 rounded-md bg-gray-100 text-gray-800 text-sm font-mono"
                {...props}
            >
                {children}
            </code>
        );
    }
    
    // 以下是代码块的处理逻辑
    const [copied, setCopied] = useState(false);
    const match = /language-(\w+)(:[\w\/\.-]+)?/.exec(className || 'language-text');

    // 提取文本内容
    const extractTextContent = (node: any): string => {
        if (typeof node === 'string') return node;
        if (Array.isArray(node)) return node.map(extractTextContent).join('');
        if (node?.props?.children) return extractTextContent(node.props.children);
        return '';
    };

    const code = extractTextContent(children);

    const copyToClipboard = async () => {
        try {
            if (!code) {
                console.warn('No code content to copy');
                return;
            }
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <div className="relative group my-4">
            <div className="absolute top-2 right-2 flex gap-2 z-10">
                <div className="px-2 py-1 text-xs text-gray-300 bg-[#1a1b26]/70 rounded-lg">
                    {match ? (match[1] === 'text' ? 'plain' : match[1]) : 'plain'}
                </div>
                <motion.button
                    onClick={copyToClipboard}
                    className="p-1.5 text-gray-300 hover:text-gray-200 bg-[#1a1b26]/70 rounded-lg transition-colors"
                    whileHover={{scale: 1.05}}
                    whileTap={{scale: 0.95}}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {copied ? (
                            <motion.div
                                key="check"
                                initial={{scale: 0.8, opacity: 0}}
                                animate={{scale: 1, opacity: 1}}
                                exit={{scale: 0.8, opacity: 0}}
                                transition={{duration: 0.15}}
                                className="text-emerald-400"
                            >
                                <Check size={14}/>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="copy"
                                initial={{scale: 0.8, opacity: 0}}
                                animate={{scale: 1, opacity: 1}}
                                exit={{scale: 0.8, opacity: 0}}
                                transition={{duration: 0.15}}
                            >
                                <Copy size={14}/>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-[#1a1b26]">
                <pre className="!p-0 !m-0">
                    <code
                        ref={codeRef}
                        className={`${className || 'language-text'} block p-4 pt-12 overflow-x-auto text-gray-100 whitespace-pre-wrap break-words`}
                        style={{
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            maxWidth: '100%'
                        }}
                    >
                        {children}
                    </code>
                </pre>
            </div>
        </div>
    );
};

export default React.memo(CodeBlock); 