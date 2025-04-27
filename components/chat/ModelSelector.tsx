'use client'
import React, { useState, useCallback, useMemo } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Info, Image, Zap, Sparkles, Check, Globe, Clock, Database, Cpu, Tag, Brain, Waves, FlaskConical, ClipboardList, Wrench, CircleCheck } from 'lucide-react';
import { modelConfigs, ModelConfig } from '@/config/modelConfigs';
import '@/app/globals.css';
import { cn } from '@/utils/tailwind';
import GeminiIcon from '@/components/icons/GeminiIcon';
import GPTIcon from '@/components/icons/GPTIcon';
import DeepSeekIcon from '@/components/icons/DeepSeekIcon';
import { createPortal } from 'react-dom';
import ReactDOM from 'react-dom';

// 获取响应速度对应的图标和颜色
const getSpeedInfo = (speed: string) => {
  switch (speed) {
    case '快': 
      return { color: 'text-green-600', bgColor: 'bg-green-100', icon: <Clock size={14} /> };
    case '中': 
      return { color: 'text-amber-600', bgColor: 'bg-amber-100', icon: <Clock size={14} /> };
    case '慢': 
      return { color: 'text-red-600', bgColor: 'bg-red-100', icon: <Clock size={14} /> };
    default: 
      return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: <Clock size={14} /> };
  }
};

// 格式化上下文窗口大小
const formatContextWindow = (size: number) => {
  if (size >= 1000000) return `${(size / 1000000).toFixed(1)}M`;
  if (size >= 1000) return `${(size / 1000).toFixed(0)}K`;
  return size.toString();
};

// 模型信息卡组件
interface ModelInfoCardProps { model: ModelConfig; isMobile?: boolean }
const ModelInfoCard: React.FC<ModelInfoCardProps> = ({ model, isMobile = false }) => {
  const speedInfo = getSpeedInfo(model.responseSpeed);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: isMobile ? 0 : 10, y: isMobile ? 10 : 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: isMobile ? 0 : 5, y: isMobile ? 5 : 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 rounded-2xl p-5 border border-pink-200/50 shadow-md",
        isMobile ? "w-full" : "w-72"
      )}
    >
      <div className="flex items-start gap-3.5 mb-4">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", model.color)}>
          {React.createElement(model.icon, { size: 24, className: "text-gray-800" })}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate flex items-center gap-1.5">
            {model.name}
            <div className="flex gap-1">
              {model.isNew && (
                <span className="flex items-center border border-orange-300 bg-orange-50 text-orange-700 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm select-none gap-1 transition-all">
                  <span className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full" />
                  新!
                </span>
              )}
              {model.isPreview && (
                <span className="flex items-center border border-indigo-300 bg-gray-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm select-none gap-1 transition-all">
                  <FlaskConical size={10} />
                  预览版
                </span>
              )}
            </div>
          </h3>
          <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{model.description}</p>
        </div>
      </div>
      
      <div className="space-y-3.5">
        {/* 能力指标 */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
            <Cpu size={12} className="mr-1.5" />核心能力
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div className={cn(
              "flex items-center gap-1.5 p-2 rounded-lg text-xs whitespace-nowrap",
              model.supportsImageInput ? "text-blue-800 bg-blue-100" : "text-gray-500 bg-gray-100"
            )}>
              <Image size={13} className="flex-shrink-0" />
              <span className="truncate">图片输入</span>
              {model.supportsImageInput && <Check size={11} className="ml-auto flex-shrink-0 text-blue-600" />}
            </div>
            <div className={cn(
              "flex items-center gap-1.5 p-2 rounded-lg text-xs whitespace-nowrap",
              model.supportsDeepThinking ? "text-purple-800 bg-purple-100" : "text-gray-500 bg-gray-100"
            )}>
              <Zap size={13} className="flex-shrink-0" />
              <span className="truncate">深度思考</span>
              {model.supportsDeepThinking && <Check size={11} className="ml-auto flex-shrink-0 text-purple-600" />}
            </div>
            <div className={cn(
              "flex items-center gap-1.5 p-2 rounded-lg text-xs whitespace-nowrap",
              model.supportsStreaming ? "text-green-800 bg-green-100" : "text-gray-500 bg-gray-100"
            )}>
              <Waves size={13} className="flex-shrink-0" />
              <span className="truncate">流式输出</span>
              {model.supportsStreaming && <Check size={11} className="ml-auto flex-shrink-0 text-green-600" />}
            </div>
            <div className={cn(
              "flex items-center gap-1.5 p-2 rounded-lg text-xs whitespace-nowrap",
              model.supportsThinkingEffort ? "text-orange-800 bg-orange-100" : "text-gray-500 bg-gray-100"
            )}>
              <Brain size={13} className="flex-shrink-0" />
              <span className="truncate">推理预算</span>
              {model.supportsThinkingEffort && <Check size={11} className="ml-auto flex-shrink-0 text-orange-600" />}
            </div>
          </div>
        </div>
        
        {/* 技术规格 */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
            <ClipboardList size={12} className="mr-1.5" />技术规格
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-indigo-100 text-xs text-indigo-800 whitespace-nowrap">
              <Database size={13} className="flex-shrink-0" />
              <span className="truncate">上下文</span>
              <span className="ml-auto font-medium flex-shrink-0">{formatContextWindow(model.contextWindow)}</span>
            </div>
            <div className={cn(
              "flex items-center gap-1.5 p-2 rounded-lg text-xs whitespace-nowrap",
              speedInfo.bgColor, speedInfo.color
            )}>
              {speedInfo.icon}
              <span className="truncate">响应速度</span>
              <span className="ml-auto font-medium capitalize flex-shrink-0">{model.responseSpeed}</span>
            </div>
          </div>
        </div>
        
        {/* 应用场景 */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
            <Tag size={12} className="mr-1.5" />适用场景
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {model.useCases?.map((useCase, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md"
              >
                {useCase}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// 模型分组
const modelCategories = {
  Gemini: {
    name: "Gemini",
    bgColor: "bg-orange-100",
    iconColor: "text-orange-700"
  },
  GPT: {
    name: "GPT",
    bgColor: "bg-red-100",
    iconColor: "text-red-700"
  },
  DeepSeek: {
    name: "DeepSeek",
    bgColor: "bg-pink-100",
    iconColor: "text-pink-700"
  }
};

// 标签类型
type CategoryKey = keyof typeof modelCategories;

const ModelSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CategoryKey>('Gemini');
  const [hoveredModelId, setHoveredModelId] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [selectedModelForInfo, setSelectedModelForInfo] = useState<string | null>(null);
  
  const currentModel = useChatStore((state) => state.currentModel);
  const setCurrentModel = useChatStore((state) => state.setCurrentModel);

  const currentModelData = modelConfigs.find(m => m.id === currentModel) || modelConfigs[0];
  const hoveredModelData = useMemo(() => {
    return modelConfigs.find(m => m.id === hoveredModelId);
  }, [hoveredModelId]);
  
  const selectedModelData = useMemo(() => {
    return modelConfigs.find(m => m.id === selectedModelForInfo);
  }, [selectedModelForInfo]);
  
  // 按提供商分组模型
  const groupedModels = useMemo<Record<CategoryKey, ModelConfig[]>>(() => {
    return {
      Gemini: modelConfigs.filter(m => m.provider === 'Gemini'),
      GPT: modelConfigs.filter(m => m.provider === 'GPT'),
      DeepSeek: modelConfigs.filter(m => m.provider === 'DeepSeek')
    };
  }, []);
  
  const closeSelector = useCallback(() => {
    setIsOpen(false);
    setHoveredModelId(null);
  }, []);
  
  const handleSelectModel = useCallback((modelId: string) => {
    setCurrentModel(modelId);
    closeSelector();
  }, [setCurrentModel, closeSelector]);

  const handleShowModelInfo = useCallback((e: React.MouseEvent, modelId: string) => {
    e.stopPropagation();
    setSelectedModelForInfo(modelId);
  }, []);

  const closeModelInfo = useCallback(() => {
    setSelectedModelForInfo(null);
  }, []);

  // 点击外部关闭下拉菜单
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // 如果移动端信息卡正在打开，则不触发主菜单的关闭
      if (selectedModelForInfo) return;

      if (
        !target.closest('.model-selector-container') &&
        !target.closest('.model-info-card-container')
      ) {
        closeSelector();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeSelector, selectedModelForInfo]);

  // 检测屏幕宽度
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="relative h-full model-selector-container">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="group relative hover:bg-transparent rounded-[20px] sm:rounded-[24px] pl-12 sm:pl-16 pr-3 sm:pr-4 py-2 sm:py-2.5 transition-all h-full flex items-center"
      >
        <div className="absolute left-2 sm:left-3.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-medium text-gray-700 bg-orange-100 rounded-full border border-orange-200/50">
          模型
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${currentModelData.color}`}>
            {React.createElement(currentModelData.icon, { 
              size: 18, 
              className: "text-gray-800" 
            })}
          </div>
          <span className="text-gray-800 text-sm font-medium truncate">
            {currentModelData.name}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="opacity-60 group-hover:opacity-100 transition-opacity"
          >
            <ChevronDown size={16} className="text-gray-600 group-hover:text-gray-800" />
          </motion.div>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* 桌面信息卡 */}
            {!isMobileView && hoveredModelData && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                className="model-info-card-container absolute top-full mt-2.5 right-[350px] sm:right-[390px] z-50"
              >
                <ModelInfoCard model={hoveredModelData} />
              </motion.div>
            )}

            {/* 模型选择器 */}
            <motion.div
              className="absolute top-full mt-2.5 right-0 w-[340px] sm:w-[380px] z-50 bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 rounded-2xl shadow-md border border-pink-200/50"
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              onMouseLeave={() => setHoveredModelId(null)}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4 px-1">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center">
                    <Sparkles size={18} className="mr-2 text-orange-500" />
                    选择模型
                  </h2>
                  <button
                    onClick={closeSelector}
                    className="p-1.5 rounded-full text-gray-500 hover:text-gray-800 hover:bg-pink-200/40 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <div className="flex mb-4 rounded-xl p-1 bg-red-100/60 gap-1">
                  {Object.entries(modelCategories).map(([key, category]) => (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveTab(key as CategoryKey)}
                      className={cn(
                        "flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                        activeTab === key 
                          ? "bg-orange-50 text-gray-800 shadow-sm" 
                          : "text-gray-700 hover:bg-orange-50/80"
                      )}
                    >
                      {key === 'Gemini' && <GeminiIcon size={14} className="text-orange-600" />}
                      {key === 'GPT' && <GPTIcon size={14} className="text-red-600" />}
                      {key === 'DeepSeek' && <DeepSeekIcon size={14} className="text-pink-600" />}
                      {category.name}
                    </motion.button>
                  ))}
                </div>
                
                <div className={cn(
                  "overflow-y-auto overflow-x-hidden pr-1.5 -mr-1.5",
                  isMobileView ? "max-h-[60vh]" : "max-h-[320px]"
                )}>
                  <div className="space-y-2.5 custom-scrollbar">
                    {groupedModels[activeTab]?.map((model) => {
                      const isSelected = model.id === currentModel;
                      const speedInfo = getSpeedInfo(model.responseSpeed);
                      
                      return (
                        <motion.div
                          key={model.id}
                          whileHover={isSelected ? {} : { scale: 1.015 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            "relative group rounded-xl p-3.5 cursor-pointer transition-all border overflow-hidden",
                            isSelected 
                              ? "bg-orange-50 border-orange-300 shadow-sm" 
                              : "bg-pink-50/60 hover:bg-orange-50/80 border-transparent hover:border-pink-200/50"
                          )}
                          onClick={() => handleSelectModel(model.id)}
                          onMouseEnter={() => setHoveredModelId(model.id)}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className={cn(
                              "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                              model.color
                            )}>
                              {React.createElement(model.icon, { size: 24, className: "text-gray-800" })}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-800 flex items-center gap-1.5">
                                <span className="truncate">{model.name}</span>
                                <div className="flex gap-1">
                                  {model.isNew && (
                                    <span className="flex items-center border border-orange-300 bg-orange-50 text-orange-700 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm select-none gap-1 transition-all">
                                      <span className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full" />
                                      新!
                                    </span>
                                  )}
                                  {model.isPreview && (
                                    <span className="flex items-center border border-indigo-300 bg-gray-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm select-none gap-1 transition-all">
                                      <FlaskConical size={10} />
                                      预览版
                                    </span>
                                  )}
                                </div>
                                {isSelected && (
                                  <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{delay: 0.1}}
                                    className="bg-orange-500 text-white rounded-full p-0.5 flex items-center justify-center flex-shrink-0"
                                  >
                                    <Check size={10} strokeWidth={3}/>
                                  </motion.div>
                                )}

                                {/* 添加信息按钮 */}
                                {isMobileView && (
                                  <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => handleShowModelInfo(e, model.id)}
                                    className="ml-auto p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex-shrink-0"
                                  >
                                    <Info size={14} />
                                  </motion.button>
                                )}
                              </div>
                              
                              <div className="flex mt-1 items-center gap-2.5 text-xs">
                                <div className={cn(
                                  "inline-flex items-center px-1.5 py-0.5 rounded-md gap-1",
                                  speedInfo.bgColor, speedInfo.color
                                )}>
                                  {speedInfo.icon}
                                  <span className="capitalize">{model.responseSpeed}</span>
                                </div>
                                <div className="inline-flex items-center px-1.5 py-0.5 rounded-md gap-1 bg-indigo-100 text-indigo-700">
                                  <Database size={10} />
                                  <span>{formatContextWindow(model.contextWindow)}</span>
                                </div>
                              </div>
                              
                              <div className="flex mt-2 gap-1.5 items-center">
                              <CircleCheck size={14} className="text-gray-400 mr-1" />
                                {model.supportsImageInput && (
                                  <span className="bg-blue-100 p-1 rounded-md">
                                    <Image size={12} className="text-blue-600" />
                                  </span>
                                )}
                                {model.supportsDeepThinking && (
                                  <span className="bg-purple-100 p-1 rounded-md">
                                    <Zap size={12} className="text-purple-600" />
                                  </span>
                                )}
                                {model.supportsStreaming && (
                                  <span className="bg-green-100 p-1 rounded-md">
                                    <Waves size={12} className="text-green-600" />
                                  </span>
                                )}
                                {model.supportsThinkingEffort && (
                                  <span className="bg-orange-100 p-1 rounded-md">
                                    <Brain size={12} className="text-orange-600" />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* 移动设备全屏模型信息卡 - 使用Portal渲染到DOM根级别 */}
      {ReactDOM.createPortal(
      <AnimatePresence mode="wait">
        {selectedModelData && typeof window !== 'undefined' && (
          <motion.div 
            className="fixed inset-0 z-[110]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
              onClick={closeModelInfo}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
            <motion.div 
              className="fixed inset-0 z-10 flex items-center justify-center p-4" 
              onClick={closeModelInfo}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="w-full max-w-md relative"
                onClick={(e) => e.stopPropagation()}
              >
                <ModelInfoCard model={selectedModelData} isMobile={true} />
                <motion.button
                  onClick={closeModelInfo}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 text-gray-700 hover:bg-white shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={18} />
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )
      }
      {/* 全局样式 */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
          transition: all 0.3s;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
        }
      `}</style>
    </div>
  );
};

export default ModelSelector;