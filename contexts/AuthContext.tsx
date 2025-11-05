import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { UserRole, SchoolUnit } from '../types';

export interface User {
    id: number;
    username: string;
    role: UserRole;
    unit?: SchoolUnit;
}

// ==================================================================================
// AUTH DATA VERSIONING AND MIGRATION
// ==================================================================================

const CURRENT_AUTH_VERSION = "1.2.0"; // Version bump for unit property

const migrateAuthData = () => {
    // Check for very old, unversioned data and migrate it first
    const legacyUserKey = 'app_users';
    const legacyPasswordKey = 'app_passwords';
    
    if (localStorage.getItem(legacyUserKey)) {
        console.log("Legacy auth data found. Migrating to version 1.2.0...");
        const users = JSON.parse(localStorage.getItem(legacyUserKey) || '[]');
        const passwords = JSON.parse(localStorage.getItem(legacyPasswordKey) || '{}');
        
        const initialData = {
            users: users.length > 0 ? users.map((u: any) => ({...u, unit: u.role === 'secretary' ? SchoolUnit.MATRIZ : undefined})) : [
                { id: 1000, username: 'admin', role: 'admin' as UserRole },
            ],
            passwords: Object.keys(passwords).length > 0 ? passwords : {
                admin: '123',
            }
        };

        const versionedData = {
            version: CURRENT_AUTH_VERSION,
            data: initialData
        };
        
        localStorage.setItem('auth_data', JSON.stringify(versionedData));
        localStorage.removeItem(legacyUserKey);
        localStorage.removeItem(legacyPasswordKey);

        console.log("Auth data migration complete.");
        return initialData;
    }

    const storedDataJSON = localStorage.getItem('auth_data');
    if (storedDataJSON) {
        try {
            const storedData = JSON.parse(storedDataJSON);
            if (storedData.version === CURRENT_AUTH_VERSION) {
                return storedData.data;
            } else {
                 console.warn(`Auth data version mismatch. Found ${storedData.version}, expected ${CURRENT_AUTH_VERSION}. Applying migrations...`);
                 // Future migration logic would go here. For now, we just use the data as is, adding unit to secretaries if missing.
                 const migratedUsers = storedData.data.users.map((u: User) => {
                    if (u.role === 'secretary' && !u.unit) {
                        return {...u, unit: SchoolUnit.MATRIZ }; // Default to Matriz if unit is missing
                    }
                    return u;
                 });
                 return { ...storedData.data, users: migratedUsers };
            }
        } catch (e) {
            console.error("Failed to parse auth_data from localStorage, resetting to default.", e);
        }
    }
    
    // Default initial state if nothing exists
    return {
        users: [
            { id: 1000, username: 'admin', role: 'admin' as UserRole },
        ],
        passwords: {
            admin: '123',
        },
    };
};

// ==================================================================================
// AUTH CONTEXT
// ==================================================================================

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
    const [initialData] = useState(() => migrateAuthData());
    const [user, setUser] = useState<User | null>(() => JSON.parse(localStorage.getItem('authUser') || 'null'));
    const [users, setUsers] = useState<User[]>(initialData.users);
    const [passwords, setPasswords] = useState<Record<string, string>>(initialData.passwords);

    useEffect(() => {
        if (user) {
            localStorage.setItem('authUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('authUser');
        }
    }, [user]);

    // useEffect(() => {
    //     const versionedData = {
    //         version: CURRENT_AUTH_VERSION,
    //         data: { users, passwords }
    //     };
    //     localStorage.setItem('auth_data', JSON.stringify(versionedData));
    // }, [users, passwords]);


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
