import {Zap, Puzzle} from 'lucide-react';
import '@/app/globals.css';
import {MODEL_GRADIENTS} from './gradients';
import GeminiIcon from '@/components/icons/GeminiIcon';
import GPTIcon from '@/components/icons/GPTIcon';
import DeepSeekIcon from '@/components/icons/DeepSeekIcon';

export interface ModelConfig {
    id: string;
    name: string;
    description: string;
    provider: 'Gemini' | 'GPT' | 'DeepSeek'; 
    icon: React.ElementType;
    color: string;
    supportsImageInput: boolean;
    supportsStreaming: boolean;
    supportsDeepThinking: boolean;
    supportsThinkingEffort: boolean;
    contextWindow: number;       // 新增：上下文窗口大小
    responseSpeed: '快' | '中' | '慢';  // 新增：响应速度
    useCases: string[];          // 新增：适用场景
    tokenLimit?: number;         // 新增：令牌限制
    isNew?: boolean;             // 新增：是否是新模型
    isPreview?: boolean;         // 新增：是否是预览版模型
}

export const modelConfigs: ModelConfig[] = [
    {
        id: 'gemini-2.0-flash',
        name: '2.0 Flash',
        description: '日常聊天模型',
        provider: 'Gemini',
        icon: GeminiIcon,
        color: MODEL_GRADIENTS.default,
        supportsImageInput: true,
        supportsStreaming: true,
        supportsDeepThinking: false,
        supportsThinkingEffort: false,
        contextWindow: 1000000,
        responseSpeed: '快',
        useCases: ['日常对话', '信息查询', '快速回复'],
    },
    {
        id: 'gemini-2.5-flash-preview-04-17',
        name: '2.5 Flash',
        description: '全新混合推理模型',
        provider: 'Gemini',
        icon: GeminiIcon,
        color: MODEL_GRADIENTS.default,
        supportsImageInput: true,
        supportsStreaming: true,
        supportsDeepThinking: true,
        supportsThinkingEffort: false,
        contextWindow: 1050000,
        responseSpeed: '中',
        useCases: ['日常对话', '长文本处理', '代码分析'],
        isNew: true,
        isPreview: true,
    },
    {
        id: 'gemini-2.5-pro-exp-03-25',
        name: '2.5 Pro',
        description: '高级推理模型',
        provider: 'Gemini',
        icon: GeminiIcon,
        color: MODEL_GRADIENTS.default,
        supportsImageInput: true,
        supportsStreaming: true,
        supportsDeepThinking: true,
        supportsThinkingEffort: false,
        contextWindow: 1050000,
        responseSpeed: '中',
        useCases: ['高级对话', '长文本处理', '数据分析', '复杂推理'],
        isPreview: true
    },
    {
        id: 'deepseek-v3',
        name: 'V3',
        description: '聊天模型',
        provider: 'DeepSeek',
        icon: DeepSeekIcon,
        color: MODEL_GRADIENTS.green,
        supportsImageInput: false,
        supportsStreaming: true,
        supportsDeepThinking: false,
        supportsThinkingEffort: false,
        contextWindow: 64000,
        responseSpeed: '快',
        useCases: ['中文对话', '语言处理', '内容摘要'],
    },
    {
        id: 'deepseek-r1',
        name: 'R1',
        description: '深度思考模型，能显示思考过程',
        provider: 'DeepSeek',
        icon: DeepSeekIcon,
        color: MODEL_GRADIENTS.green,
        supportsImageInput: false,
        supportsStreaming: true,
        supportsDeepThinking: true,
        supportsThinkingEffort: false,
        contextWindow: 64000,
        responseSpeed: '慢',
        useCases: ['逻辑推理', '复杂问题分析', '决策支持'],
    },
    {
        id: 'gpt-4.1',
        name: '4.1',
        description: '聊天模型',
        provider: 'GPT',
        icon: GPTIcon,
        color: MODEL_GRADIENTS.purple,
        supportsImageInput: true,
        supportsStreaming: true,
        supportsDeepThinking: false,
        supportsThinkingEffort: false,
        contextWindow: 128000,
        responseSpeed: '快',
        useCases: ['通用对话', '写作', '多语言交流'],
        isNew: true
    },
    {
        id: 'gpt-4.5-preview',
        name: '4.5 Preview',
        description: '最新大型非推理模型',
        provider: 'GPT',
        icon: GPTIcon,
        color: MODEL_GRADIENTS.purple,
        supportsImageInput: true,
        supportsStreaming: true,
        supportsDeepThinking: false,
        supportsThinkingEffort: false,
        contextWindow: 128000,
        responseSpeed: '中',
        useCases: ['通用对话', '创意写作', '情感交流'],
        isPreview: true
    },
    {
        id: 'o4-mini',
        name: 'o4-mini',
        description: '快速推理模型',
        provider: 'GPT',
        icon: GPTIcon,
        color: MODEL_GRADIENTS.purple,
        supportsImageInput: false,
        supportsStreaming: true,
        supportsDeepThinking: true,
        supportsThinkingEffort: true,
        contextWindow: 64000,
        responseSpeed: '中',
        useCases: ['数学问题', '代码分析', '逻辑推理'],
        isNew: true
    },
    {
        id: 'o3',
        name: 'o3',
        description: '高级推理模型',
        provider: 'GPT',
        icon: GPTIcon,
        color: MODEL_GRADIENTS.purple,
        supportsImageInput: true,
        supportsStreaming: true,
        supportsDeepThinking: true,
        supportsThinkingEffort: true,
        contextWindow: 128000,
        responseSpeed: '慢',
        useCases: ['研究分析', '创新思考', '科学问题', '复杂推理'],
        isNew: true
    },
];