// components/chat/ModelInfoCard.tsx
import React from 'react';
import {ModelConfig} from '@/config/modelConfigs';
import {Image, Brain, Zap, Loader} from 'lucide-react';

const ModelInfoCard: React.FC<{model: ModelConfig}> = ({model}) => (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-xl border border-white/60 p-4 text-gray-800">
        <div className="flex items-center gap-3 mb-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${model.color}`}>
                <model.icon size={20} className="text-gray-700"/>
            </div>
            <div className="font-bold text-base">{model.name}</div>
        </div>
        <div className="text-xs text-gray-600 mb-2">{model.description}</div>
        <div className="flex flex-wrap gap-2 text-xs">
            <span className={model.supportsImageInput ? "text-green-600" : "text-gray-400"}>
                <Image size={14} className="inline mr-1"/>图片输入
            </span>
            <span className={model.supportsDeepThinking ? "text-blue-600" : "text-gray-400"}>
                <Brain size={14} className="inline mr-1"/>深度思考
            </span>
            <span className={model.supportsStreaming ? "text-orange-600" : "text-gray-400"}>
                <Loader size={14} className="inline mr-1"/>流式输出
            </span>
            <span className={model.supportsThinkingEffort ? "text-purple-600" : "text-gray-400"}>
                <Zap size={14} className="inline mr-1"/>思考过程
            </span>
        </div>
    </div>
);

export default ModelInfoCard;