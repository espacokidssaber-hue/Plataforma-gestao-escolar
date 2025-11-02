import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../contexts/AuthContext';
import UserEditModal from './UserEditModal';
import { UserRole } from '../types';

const roleDisplayMap: Record<UserRole, { name: string; className: string }> = {
    admin: { name: 'Administrador', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' },
    educator: { name: 'Educador', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
    secretary: { name: 'Secretária(o)', className: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' }
};


const Settings: React.FC = () => {
    const { user: currentUser, users, removeUser } = useAuth();
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [isAddingUser, setIsAddingUser] = useState(false);

    const handleRemove = (userToRemove: User) => {
        if (userToRemove.id === currentUser?.id) {
            alert("Você não pode remover seu próprio usuário.");
            return;
        }
        if (window.confirm(`Tem certeza de que deseja remover o usuário "${userToRemove.username}"? Esta ação não pode ser desfeita.`)) {
            removeUser(userToRemove.id);
        }
    };
    
    const openAddModal = () => {
        setUserToEdit(null);
        setIsAddingUser(true);
    };

    const openEditModal = (user: User) => {
        setIsAddingUser(false);
        setUserToEdit(user);
    };

    const closeModal = () => {
        setUserToEdit(null);
        setIsAddingUser(false);
    };


    if (currentUser?.role !== 'admin') {
        return (
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold text-red-500">Acesso Negado</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Você não tem permissão para acessar esta página.</p>
            </div>
        );
    }
    
    return (
        <>
            <div>
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie usuários e outras configurações do sistema.</p>
                </header>
                
                <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerenciamento de Usuários</h2>
                        <button onClick={openAddModal} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500">
                            + Novo Usuário
                        </button>
                    </div>

                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                    <th className="p-3">ID</th>
                                    <th className="p-3">Nome de Usuário</th>
                                    <th className="p-3">Papel</th>
                                    <th className="p-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => {
                                    const display = roleDisplayMap[u.role] || { name: u.role, className: 'bg-gray-100 text-gray-700' };
                                    return (
                                        <tr key={u.id} className="border-b border-gray-200 dark:border-gray-700/50">
                                            <td className="p-3 text-gray-500 dark:text-gray-400">{u.id}</td>
                                            <td className="p-3 font-semibold text-gray-800 dark:text-white">{u.username}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${display.className}`}>
                                                    {display.name}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right space-x-2">
                                                <button onClick={() => openEditModal(u)} className="text-sm text-blue-500 hover:underline">Editar</button>
                                                <button onClick={() => handleRemove(u)} className="text-sm text-red-500 hover:underline">Remover</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {(userToEdit || isAddingUser) && (
                <UserEditModal 
                    userToEdit={userToEdit}
                    onClose={closeModal}
                />
            )}
        </>
    );
};

export default Settings;