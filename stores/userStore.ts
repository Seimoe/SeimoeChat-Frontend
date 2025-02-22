import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import Cookies from 'js-cookie';

interface UserState {
    isAuthenticated: boolean;
    token: string | null;
    userInfo: Record<string, any> | null;
    login: (data: { token: string } & Record<string, any>) => void;
    logout: () => void;
}

const customStorage = {
    getItem: (name: string) => {
        // 在服务器端返回null
        if (typeof window === 'undefined') return null;
        return window.localStorage.getItem(name);
    },
    setItem: (name: string, value: string) => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(name, value);
        }
    },
    removeItem: (name: string) => {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(name);
        }
    },
};

const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            token: null,
            userInfo: null,
            login: (data) => {
                // 设置cookie
                Cookies.set('token', data.token, {
                    expires: 7,
                    path: '/'
                });
                set({
                    isAuthenticated: true,
                    token: data.token,
                    userInfo: data
                });
            },
            logout: () => {
                Cookies.remove('token');
                set({
                    isAuthenticated: false,
                    token: null,
                    userInfo: null
                });
            },
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => customStorage),
            // 只持久化这些字段
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                token: state.token,
                userInfo: state.userInfo,
            }),
            // 确保在客户端才进行hydration
            skipHydration: true,
        }
    )
);

export default useUserStore; 