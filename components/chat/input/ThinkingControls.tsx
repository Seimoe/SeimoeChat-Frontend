'use client'
import React, {useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {Brain} from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import {useChatStore} from '@/stores/chatStore';

const ThinkingControls: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const reasoningEffort = useChatStore((state) => state.reasoningEffort);
    const setReasoningEffort = useChatStore((state) => state.setReasoningEffort);

    return (
        <motion.div className="relative">
            <motion.button
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 sm:p-2.5 self-stretch flex items-center justify-center gap-2"
            >
                <Brain size={20} className="sm:w-6 sm:h-6 text-gray-700" strokeWidth={1.5}/>
                <div className="flex items-center gap-0.5">
                    {[...Array(reasoningEffort === 'low' ? 1 : reasoningEffort === 'medium' ? 2 : 3)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-1 h-1 rounded-full ${
                                reasoningEffort === 'low'
                                    ? 'bg-blue-400'
                                    : reasoningEffort === 'medium'
                                        ? 'bg-indigo-400'
                                        : 'bg-purple-400'
                            }`}
                        />
                    ))}
                </div>
            </motion.button>

            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <motion.div
                            initial={{opacity: 0, y: 10}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: 10}}
                            className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-3 min-w-[240px] z-50"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-700">思考深度</span>
                                <Tooltip
                                    content={
                                        <div className="space-y-3">
                                            <p className="font-medium text-gray-900">关于思考深度</p>
                                            <p className="text-sm text-gray-600">
                                                思考深度是OpenAI推理模型特有的参数，用于控制AI回答问题前思考花费的时间:
                                            </p>
                                            <ul className="text-sm space-y-2.5">
                                                <li className="flex items-start gap-2.5">
                                                    <span className="flex gap-0.5 mt-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"/>
                                                    </span>
                                                    <div className="space-y-0.5">
                                                        <span className="font-medium text-gray-800">低</span>
                                                        <p className="text-gray-600 text-[13px]">快速回答，适合简单明确的问题</p>
                                                    </div>
                                                </li>
                                                <li className="flex items-start gap-2.5">
                                                    <span className="flex gap-0.5 mt-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"/>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"/>
                                                    </span>
                                                    <div className="space-y-0.5">
                                                        <span className="font-medium text-gray-800">中</span>
                                                        <p className="text-gray-600 text-[13px]">平衡深度与速度，适合一般性问题</p>
                                                    </div>
                                                </li>
                                                <li className="flex items-start gap-2.5">
                                                    <span className="flex gap-0.5 mt-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400"/>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400"/>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400"/>
                                                    </span>
                                                    <div className="space-y-0.5">
                                                        <span className="font-medium text-gray-800">高</span>
                                                        <p className="text-gray-600 text-[13px]">花费尽可能多的时间进行思考，当你认为问题较复杂时使用</p>
                                                    </div>
                                                </li>
                                            </ul>
                                            <div className="pt-1 mt-1 border-t border-gray-100">
                                                <p className="text-[13px] text-gray-500">提示：思考深度越高，回答质量越高</p>
                                            </div>
                                        </div>
                                    }
                                    position="left"
                                    maxWidth="320px"
                                >
                                    <button
                                        className="ml-2 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full flex items-center gap-1.5 transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <span>什么是思考深度</span>
                                        <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center">?</span>
                                    </button>
                                </Tooltip>
                            </div>
                            <div className="space-y-1">
                                {[
                                    {
                                        value: 'low',
                                        label: '低',
                                        desc: '简单思考，快速回答',
                                        dots: 1,
                                        color: 'bg-blue-400'
                                    },
                                    {
                                        value: 'medium',
                                        label: '中',
                                        desc: '平衡深度与速度',
                                        dots: 2,
                                        color: 'bg-indigo-400'
                                    },
                                    {
                                        value: 'high',
                                        label: '高',
                                        desc: '思考至确定答案为止',
                                        dots: 3,
                                        color: 'bg-purple-400'
                                    }
                                ].map(option => (
                                    <motion.button
                                        key={option.value}
                                        whileHover={{backgroundColor: 'rgba(0,0,0,0.03)'}}
                                        onClick={() => {
                                            setReasoningEffort(option.value as 'low' | 'medium' | 'high');
                                            setIsMenuOpen(false);
                                        }}
                                        className={`w-full px-4 py-2.5 text-left rounded-xl transition-colors
                                            ${reasoningEffort === option.value ? 'bg-gray-50' : ''}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-0.5">
                                                {[...Array(option.dots)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-1.5 h-1.5 rounded-full ${
                                                            reasoningEffort === option.value
                                                                ? option.color
                                                                : 'bg-gray-300'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className={`font-medium ${
                                                reasoningEffort === option.value
                                                    ? 'text-gray-900'
                                                    : 'text-gray-600'
                                            }`}>
                                                {option.label}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1 ml-4">
                                            {option.desc}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ThinkingControls; 