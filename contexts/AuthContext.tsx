import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { UserRole } from '../types';

// FIX: Define and export the User interface and mock user data to be accessible by other components.
export interface User {
    id: number;
    username: string;
    role: UserRole;
}

export const MOCK_USERS: User[] = [
    { id: 1, username: 'admin', role: 'admin' },
    { id: 2, username: 'secretaria', role: 'educator' },
];

// MOCK PASSWORDS - in a real app, this would be handled by a backend
const MOCK_PASSWORDS: Record<string, string> = {
    admin: '123',
    secretaria: '123',
};


// FIX: Update AuthContextType to provide a full authentication state and functions, including `isAuthenticated`, `user`, `login`, and `logout`.
interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (username: string, password: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // FIX: Manage the full authenticated user object instead of just a role. State is persisted to localStorage.
    const [user, setUser] = useState<User | null>(() => {
        try {
            const savedUser = localStorage.getItem('authUser');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('authUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('authUser');
        }
    }, [user]);

    // FIX: Implement login logic to validate credentials and set the user state.
    const login = (username: string, password: string) => {
        const foundUser = MOCK_USERS.find(u => u.username.toLowerCase() === username.toLowerCase());
        if (foundUser && MOCK_PASSWORDS[foundUser.username] === password) {
            setUser(foundUser);
        } else {
            throw new Error('Usuário ou senha inválidos.');
        }
    };

    // FIX: Implement logout logic to clear the user state.
    const logout = () => {
        setUser(null);
    };

    return (
        // FIX: Provide the complete authentication object, including the derived `isAuthenticated` flag.
        <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
