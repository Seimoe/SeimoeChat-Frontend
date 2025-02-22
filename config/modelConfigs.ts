import {Sparkle, Zap, Sparkles, Puzzle} from 'lucide-react';
import '@/app/globals.css';
import {MODEL_GRADIENTS} from './gradients';

export interface ModelConfig {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    color: string;
    supportsImageInput: boolean;
    supportsStreaming: boolean;
    supportsDeepThinking: boolean;
    supportsThinkingEffort: boolean;
}

export const modelConfigs: ModelConfig[] = [
    {
        id: 'gemini-2.0-flash',
        name: 'SG2-lite',
        description: 'Google日常聊天模型',
        icon: Sparkle,
        color: MODEL_GRADIENTS.default,
        supportsImageInput: false,
        supportsStreaming: true,
        supportsDeepThinking: false,
        supportsThinkingEffort: false,
    },
    {
        id: 'gemini-2.0-flash-thinking-exp-01-21',
        name: 'SG2-thinking-lite',
        description: 'Google深度思考模型，擅长复杂推理与计算',
        icon: Zap,
        color: MODEL_GRADIENTS.default,
        supportsImageInput: false,
        supportsStreaming: true,
        supportsDeepThinking: true,
        supportsThinkingEffort: false,
    },
    {
        id: 'gemini-2.0-pro-exp-02-05',
        name: 'SG2-pro',
        description: 'Google聊天模型，知识广泛',
        icon: Sparkles,
        color: MODEL_GRADIENTS.default,
        supportsImageInput: true,
        supportsStreaming: true,
        supportsDeepThinking: false,
        supportsThinkingEffort: false,
    },
    {
        id: 'deepseek-v3',
        name: 'SDSeek-V3',
        description: 'DeepSeek聊天模型',
        icon: Sparkles,
        color: MODEL_GRADIENTS.green,
        supportsImageInput: false,
        supportsStreaming: true,
        supportsDeepThinking: false,
        supportsThinkingEffort: false,
    },
    {
        id: 'deepseek-r1',
        name: 'SDSeek-R1',
        description: 'DeepSeek深度思考模型，能显示思考过程',
        icon: Puzzle,
        color: MODEL_GRADIENTS.green,
        supportsImageInput: false,
        supportsStreaming: true,
        supportsDeepThinking: true,
        supportsThinkingEffort: false,
    },
    {
        id: 'gpt-4o',
        name: 'SGPT-4o',
        description: 'OpenAI聊天模型',
        icon: Sparkles,
        color: MODEL_GRADIENTS.purple,
        supportsImageInput: true,
        supportsStreaming: true,
        supportsDeepThinking: false,
        supportsThinkingEffort: false,
    },
    {
        id: 'o3-mini',
        name: 'SGPT-o3-mini',
        description: 'OpenAI深度思考模型',
        icon: Zap,
        color: MODEL_GRADIENTS.purple,
        supportsImageInput: false,
        supportsStreaming: true,
        supportsDeepThinking: true,
        supportsThinkingEffort: true,
    },
    {
        id: 'o1',
        name: 'SGPT-o1',
        description: 'OpenAI深度思考模型，知识广泛',
        icon: Puzzle,
        color: MODEL_GRADIENTS.purple,
        supportsImageInput: true,
        supportsStreaming: true,
        supportsDeepThinking: true,
        supportsThinkingEffort: true,
    },
];
