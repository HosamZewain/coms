import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: {
        id: string;
        name: string;
        permissions: string[];
    };
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    checkPermission: (module: string, action: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: (user, token) => set({ user, token, isAuthenticated: true }),
            logout: () => set({ user: null, token: null, isAuthenticated: false }),
            checkPermission: (module, action) => {
                const user = get().user;
                if (!user || !user.role || !user.role.permissions) return false;

                const required = `${module}:${action}`;
                return user.role.permissions.includes(required) || user.role.permissions.includes('*:*');
            }
        }),
        {
            name: 'auth-storage', // unique name
        }
    )
);
