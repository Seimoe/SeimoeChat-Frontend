import React from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {X, LogOut, User, ChevronLeft, Menu} from 'lucide-react';
import useUserStore from '@/stores/userStore';
import {useRouter} from 'next/navigation';

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

const Sidebar: React.FC<SidebarProps> = ({
                                             isOpen,
                                             onClose,
                                             isCollapsed,
                                             onToggleCollapse,
                                             isDesktop,
                                         }) => {
    const router = useRouter();
    const {userInfo, logout} = useUserStore();

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
                <h2 className="text-lg font-medium text-gray-800">Seimoe Chat</h2>
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
                    <div
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white shadow-sm">
                        <User size={20}/>
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

            <div className="flex-1 mt-4 px-4">
                <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4"/>
                <div className="py-8 flex flex-col items-center justify-center text-gray-500 text-sm gap-2">
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{delay: 0.2}}
                        className="bg-gradient-to-br from-orange-200/60 to-pink-200/60 p-4 rounded-2xl border border-orange-200/50 w-full text-center shadow-sm"
                    >
                        即将推出话题功能...
                    </motion.div>
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