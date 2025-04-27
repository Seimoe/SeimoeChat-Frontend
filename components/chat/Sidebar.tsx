import React, {useEffect, useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {X, LogOut, User, ChevronLeft, Menu, Plus, Archive, ArrowUp, Trash2} from 'lucide-react';
import useUserStore from '@/stores/userStore';
import {useRouter} from 'next/navigation';
import useChat from '@/hooks/useChat';
import {format} from 'date-fns';
import {zhCN} from 'date-fns/locale';
import {AuthService} from '@/services/authService';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    isDesktop: boolean;
}

const ExpandButton: React.FC<{ isCollapsed: boolean; isDesktop: boolean; onToggleCollapse: () => void }> = React.memo(
    ({isCollapsed, isDesktop, onToggleCollapse}) => {
        return (
            <AnimatePresence>
                {isCollapsed && isDesktop && (
                    <motion.button
                        key="expand-button"
                        initial={{opacity: 0, x: -20}}
                        animate={{opacity: 1, x: 0}}
                        exit={{opacity: 0, x: -20}}
                        whileHover={{scale: 1.05}}
                        whileTap={{scale: 0.95}}
                        onClick={onToggleCollapse}
                        className="fixed top-4 left-4 p-3 bg-white/50 backdrop-blur-xl rounded-xl shadow-lg border border-white/60 z-[110] hover:bg-white/60 transition-colors"
                    >
                        <Menu size={20} className="text-gray-700"/>
                    </motion.button>
                )}
            </AnimatePresence>
        );
    }
);

const TopicItem = React.memo(({ 
    topic, 
    isActive, 
    onClick,
    onDelete,
    onClose,
    isDesktop
}: { 
    topic: { 
        id: string, 
        title: string, 
        last_active_at: string,
        is_archived?: boolean 
    }, 
    isActive: boolean, 
    onClick: (id: string) => void,
    onDelete: (id: string) => void,
    onClose: () => void,
    isDesktop: boolean
}) => {
    const formattedDate = format(new Date(topic.last_active_at), 'MM月dd日', {locale: zhCN});
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(topic.id);
    };
    
    const handleClick = () => {
        onClick(topic.id);
        // 在移动设备上点击后自动关闭侧边栏
        if (!isDesktop) {
            onClose();
        }
    };
    
    return (
        <motion.div
            layout
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 25,
                mass: 0.8,
                opacity: { duration: 0.2 },
                layout: { type: "spring", bounce: 0.25 }
            }}
            onClick={handleClick}
            className={`p-3 rounded-xl cursor-pointer mb-2 ${
                isActive 
                    ? 'bg-orange-200/60 border-orange-300/50' 
                    : 'hover:bg-white/40 border-transparent'
            } border transition-colors group`}
        >
            <div className="flex justify-between items-start">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${topic.id}-${topic.title}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium text-gray-800 line-clamp-1 flex-1"
                    >
                        {topic.title}
                    </motion.div>
                </AnimatePresence>
                <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-500">{formattedDate}</div>
                    <motion.button 
                        onClick={handleDelete}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={14} />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}, (prevProps, nextProps) => {
    // 仅在以下情况重新渲染:
    // 1. topic ID 发生变化
    // 2. topic 标题发生变化
    // 3. topic 的活跃时间发生变化
    // 4. 活跃状态发生变化
    return prevProps.topic.id === nextProps.topic.id && 
           prevProps.topic.title === nextProps.topic.title &&
           prevProps.topic.last_active_at === nextProps.topic.last_active_at &&
           prevProps.isActive === nextProps.isActive;
});

const Sidebar: React.FC<SidebarProps> = ({
                                             isOpen,
                                             onClose,
                                             isCollapsed,
                                             onToggleCollapse,
                                             isDesktop,
                                         }) => {
    const router = useRouter();
    const {userInfo, logout, updateUserInfo} = useUserStore();
    const {topics, currentTopicId, switchTopic, createNewChat, deleteTopic} = useChat();
    const [showArchived, setShowArchived] = React.useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(false);
    
    // 获取用户信息
    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!userInfo) return;
            
            setIsLoadingUser(true);
            try {
                const userData = await AuthService.getCurrentUser();
                updateUserInfo(userData);
            } catch (error: any) {
                console.error('获取用户信息失败:', error);
                // 如果是401错误，可能是token过期，重定向到登录页
                if (error.status === 401) {
                    logout();
                    router.push('/login');
                }
            } finally {
                setIsLoadingUser(false);
            }
        };
        
        fetchUserInfo();
    }, [userInfo?.id]);
    
    // 获取活跃话题和归档话题，按最后活跃时间排序
    const sortedTopics = [...topics].sort((a, b) => 
        new Date(b.last_active_at).getTime() - new Date(a.last_active_at).getTime()
    );
    
    const activeTopics = sortedTopics.filter(topic => !topic.is_archived);
    const archivedTopics = sortedTopics.filter(topic => topic.is_archived);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const CollapseButton = () => (
        <motion.button
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.95}}
            onClick={onToggleCollapse}
            className="p-2 hover:bg-black/5 rounded-xl transition-colors"
        >
            <ChevronLeft
                size={18}
                className={`text-gray-500 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            />
        </motion.button>
    );

    const handleNewChat = () => {
        createNewChat();
        // 在移动设备上点击后自动关闭侧边栏
        if (!isDesktop) {
            onClose();
        }
    };

    const sidebarContent = (
        <motion.div
            initial={isDesktop ? false : {x: '-110%'}}
            animate={
                isDesktop
                    ? {x: isCollapsed ? "-110%" : "0%", opacity: isCollapsed ? 0 : 1}
                    : {x: isOpen ? 0 : '-110%'}
            }
            exit={isDesktop ? undefined : {x: '-110%'}}
            transition={{
                type: "spring",
                damping: 25,
                stiffness: 200,
                mass: 0.8
            }}
            className={`
                ${isDesktop
                ? "absolute h-[calc(100%-2rem)] my-4"
                : "fixed top-4 left-4 h-[calc(100%-2rem)] z-[105]"}
                w-[clamp(300px,25vw,400px)]
                bg-white/50
                backdrop-blur-xl
                flex flex-col
                border border-white/60
                shadow-[0_8px_32px_rgba(0,0,0,0.08)]
                rounded-[24px]
                overflow-hidden
                mx-4
            `}
        >
            <div className="p-4 flex justify-between items-center bg-orange-100/50">
                <h2 className="text-lg font-medium text-gray-800">希茉</h2>
                {isDesktop ? (
                    <CollapseButton/>
                ) : (
                    <motion.button
                        onClick={onClose}
                        whileHover={{scale: 1.05}}
                        whileTap={{scale: 0.95}}
                        className="p-2 hover:bg-black/5 rounded-xl transition-colors"
                    >
                        <X size={18} className="text-gray-600"/>
                    </motion.button>
                )}
            </div>

            <motion.div
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.1}}
                className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-br from-orange-200/60 to-pink-200/60 border border-orange-200/50 shadow-sm"
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white shadow-sm">
                        {isLoadingUser ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <User size={20}/>
                        )}
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900">
                            {userInfo?.username || '用户'}
                        </h3>
                        <p className="text-xs text-gray-600">
                            {userInfo?.email || '未设置邮箱'}
                        </p>
                    </div>
                </div>
                
                <motion.button
                    onClick={handleLogout}
                    whileHover={{scale: 1.01}}
                    whileTap={{scale: 0.99}}
                    className="w-full p-2 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
                >
                    <LogOut size={14}/>
                    <span>退出登录</span>
                </motion.button>
            </motion.div>

            <div className="flex-1 mt-4 px-4 overflow-hidden flex flex-col">
                {/* 对话按钮 */}
                <motion.button
                    whileHover={{scale: 1.01}}
                    whileTap={{scale: 0.99}}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleNewChat}
                    className="mb-4 p-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-xl flex items-center justify-center gap-2 font-medium shadow-sm"
                >
                    <Plus size={18} />
                    <span>新建对话</span>
                </motion.button>
                
                <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4"/>
                
                {/* 话题列表 */}
                <div className="overflow-y-auto flex-1 pr-1">
                    <h3 className="text-sm font-medium text-gray-500 mb-2 px-1">对话历史</h3>
                    
                    {activeTopics.length > 0 ? (
                        <motion.div layout className="space-y-1">
                            <AnimatePresence mode="popLayout">
                                {activeTopics.map(topic => (
                                    <TopicItem 
                                        key={`active-${topic.id}`}
                                        topic={topic} 
                                        isActive={topic.id === currentTopicId}
                                        onClick={switchTopic}
                                        onDelete={deleteTopic}
                                        onClose={onClose}
                                        isDesktop={isDesktop}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">暂无对话历史</p>
                    )}
                    
                    {/* 归档话题切换 */}
                    {archivedTopics.length > 0 && (
                        <div className="mt-4">
                            <button 
                                onClick={() => setShowArchived(!showArchived)}
                                className="flex items-center gap-2 text-sm text-gray-600 p-2 rounded-lg hover:bg-white/40 w-full"
                            >
                                {showArchived ? <ArrowUp size={16} /> : <Archive size={16} />}
                                <span>{showArchived ? '收起归档对话' : '显示归档对话'}</span>
                            </button>
                            
                            {showArchived && (
                                <motion.div layout className="mt-2 space-y-1">
                                    <AnimatePresence mode="popLayout">
                                        {archivedTopics.map(topic => (
                                            <TopicItem 
                                                key={`archived-${topic.id}`}
                                                topic={topic} 
                                                isActive={topic.id === currentTopicId}
                                                onClick={switchTopic}
                                                onDelete={deleteTopic}
                                                onClose={onClose}
                                                isDesktop={isDesktop}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );

    return (
        <>
            <ExpandButton isCollapsed={isCollapsed} isDesktop={isDesktop} onToggleCollapse={onToggleCollapse}/>

            <AnimatePresence>
                {!isDesktop && isOpen && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[100]"
                    />
                )}
            </AnimatePresence>

            {isDesktop ? sidebarContent : (
                <AnimatePresence>
                    {isOpen && sidebarContent}
                </AnimatePresence>
            )}
        </>
    );
};

export default React.memo(Sidebar);