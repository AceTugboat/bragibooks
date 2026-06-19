import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { authApi } from '../api/services';

interface User {
    id: number;
    username: string;
    email: string;
    is_staff: boolean;
    is_superuser: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setupNeeded: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    refreshSetupStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [setupNeeded, setSetupNeeded] = useState(false);

    const isAuthenticated = user !== null;

    const checkAuth = async () => {
        try {
            const userData = await authApi.getCurrentUser();
            setUser(userData);
        } catch (err) {
            setUser(null);
        }
    };

    const refreshSetupStatus = async () => {
        try {
            const setupStatus = await authApi.checkSetup();
            setSetupNeeded(setupStatus.setup_needed);
        } catch (err) {
            console.error('Error checking setup status:', err);
        }
    };

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            await refreshSetupStatus();
            await checkAuth();
            setIsLoading(false);
        };
        init();
    }, []);

    const login = async (username: string, password: string) => {
        const userData = await authApi.login(username, password);
        setUser(userData);
        await refreshSetupStatus();
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                setupNeeded,
                login,
                logout,
                checkAuth,
                refreshSetupStatus,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
