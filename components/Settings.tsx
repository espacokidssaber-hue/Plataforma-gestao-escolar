import React, { useState } from 'react';
import { useAuth, MOCK_USERS } from '../contexts/AuthContext';
import { User } from '../contexts/AuthContext';

const Settings: React.FC = () => {
    const { user } = useAuth();
    // In a real app, this would come from an API
    const [users, setUsers] = useState<User[]>(MOCK_USERS); 
    
    // This is a placeholder for future functionality
    const handleAddUser = () => {
        alert("Funcionalidade de adicionar novo usuário em desenvolvimento.");
    };

    if (user?.role !== 'admin') {
        return (
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold text-red-500">Acesso Negado</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Você não tem permissão para acessar esta página.</p>
            </div>
        );
    }
    
    return (
        <div>
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie usuários e outras configurações do sistema.</p>
            </header>
            
            <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerenciamento de Usuários</h2>
                    <button onClick={handleAddUser} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500">
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
                            {users.map(u => (
                                <tr key={u.id} className="border-b border-gray-200 dark:border-gray-700/50">
                                    <td className="p-3 text-gray-500 dark:text-gray-400">{u.id}</td>
                                    <td className="p-3 font-semibold text-gray-800 dark:text-white">{u.username}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                                            {u.role === 'admin' ? 'Administrador' : 'Educador'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right space-x-2">
                                        <button className="text-sm text-blue-500 hover:underline">Editar</button>
                                        <button className="text-sm text-red-500 hover:underline">Remover</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Settings;
