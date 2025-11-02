import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { UserRole, EducatorStatus } from '../types';
import { MOCK_EDUCATORS } from '../data/educatorsData';

export interface User {
    id: number;
    username: string;
    role: UserRole;
}

// Convert active educators to users who can log in
const educatorUsers: User[] = MOCK_EDUCATORS
    .filter(e => e.status === EducatorStatus.ACTIVE)
    .map(educator => ({
        id: educator.id,
        // Create a simple username from their first name, e.g., 'ana' from 'Prof. Ana Silva'
        username: educator.name.replace(/Prof\.?\s*/, '').split(' ')[0].toLowerCase(),
        // For now, all educators including coordinators get the 'educator' role for class-specific access
        role: 'educator',
    }));


// Initial mock users, which will be the default if nothing is in local storage
const INITIAL_MOCK_USERS: User[] = [
    { id: 1000, username: 'admin', role: 'admin' }, // Changed ID to avoid conflict with educator IDs
    { id: 1001, username: 'secretaria', role: 'secretary' },
    ...educatorUsers
];

// In a real app, this would be handled by a backend.
const MOCK_PASSWORDS: Record<string, string> = {
    admin: '123',
    secretaria: '123',
};
// Create a default password '123' for all educators
educatorUsers.forEach(user => {
    MOCK_PASSWORDS[user.username] = '123';
});


// Helper to get from local storage
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key ${key}:`, error);
        return defaultValue;
    }
};

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    users: User[];
    passwords: Record<string, string>;
    login: (username: string, password: string) => void;
    logout: () => void;
    updateUser: (user: User, newPassword?: string) => void;
    removeUser: (userId: number) => void;
    addUser: (user: Omit<User, 'id'>, password: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => getFromStorage('authUser', null));
    const [users, setUsers] = useState<User[]>(() => getFromStorage('app_users', INITIAL_MOCK_USERS));
    // Passwords are not persisted for security simulation. They reset on refresh.
    const [passwords, setPasswords] = useState(() => getFromStorage('app_passwords', MOCK_PASSWORDS));

    useEffect(() => {
        if (user) {
            localStorage.setItem('authUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('authUser');
        }
    }, [user]);

    useEffect(() => {
        localStorage.setItem('app_users', JSON.stringify(users));
        localStorage.setItem('app_passwords', JSON.stringify(passwords));
    }, [users, passwords]);


    const login = (username: string, password: string) => {
        const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        
        if (foundUser && passwords[foundUser.username] === password) {
            setUser(foundUser);
        } else {
            throw new Error('Usuário ou senha inválidos.');
        }
    };

    const logout = () => {
        setUser(null);
    };

    const addUser = (userData: Omit<User, 'id'>, password: string) => {
        if (users.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
            throw new Error('O nome de usuário já existe.');
        }
        const newUser: User = { ...userData, id: Date.now() };
        setUsers(prev => [...prev, newUser]);
        setPasswords(prev => ({ ...prev, [newUser.username]: password }));
    };
    
    const updateUser = (updatedUser: User, newPassword?: string) => {
        const oldUser = users.find(u => u.id === updatedUser.id);
        if (!oldUser) return;

        if (oldUser.username !== updatedUser.username) {
            if (users.some(u => u.id !== updatedUser.id && u.username.toLowerCase() === updatedUser.username.toLowerCase())) {
                 throw new Error('O nome de usuário já existe.');
            }
        }
        
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        
        setPasswords(prev => {
            const newPasswords = { ...prev };
            const currentPassword = newPasswords[oldUser.username];

            if (oldUser.username !== updatedUser.username) {
                delete newPasswords[oldUser.username];
                newPasswords[updatedUser.username] = newPassword || currentPassword;
            } 
            else if (newPassword) {
                newPasswords[updatedUser.username] = newPassword;
            }
            return newPasswords;
        });
        
        if (user && user.id === updatedUser.id) {
            setUser(updatedUser);
        }
    };

    const removeUser = (userId: number) => {
        const userToRemove = users.find(u => u.id === userId);
        if(userToRemove) {
            setUsers(prev => prev.filter(u => u.id !== userId));
            setPasswords(prev => {
                const newPasswords = { ...prev };
                delete newPasswords[userToRemove.username];
                return newPasswords;
            });
        }
    };


    return (
        <AuthContext.Provider value={{ 
            isAuthenticated: !!user, 
            user, 
            users, 
            passwords,
            login, 
            logout,
            addUser,
            updateUser,
            removeUser
        }}>
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