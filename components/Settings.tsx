import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../contexts/AuthContext';
import UserEditModal from './UserEditModal';
import { UserRole, SchoolInfo } from '../types';
import { useEnrollment } from '../contexts/EnrollmentContext';

const roleDisplayMap: Record<UserRole, { name: string; className: string }> = {
    admin: { name: 'Administrador', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' },
    educator: { name: 'Educador', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
    secretary: { name: 'Secretária(o)', className: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' }
};

const SchoolIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path d="M12 14l9-5-9-5-9-5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-9.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-9.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20M1 12l11 6 11-6M1 12v6a2 2 0 002 2h18a2 2 0 002-2v-6" />
    </svg>
);


const Settings: React.FC = () => {
    const { user: currentUser, users, removeUser } = useAuth();
    const { schoolInfo, updateSchoolInfo } = useEnrollment();

    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [isAddingUser, setIsAddingUser] = useState(false);
    
    // Local state for editing school info
    const [localInfo, setLocalInfo] = useState<SchoolInfo>(schoolInfo);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLocalInfo(schoolInfo);
    }, [schoolInfo]);

    const hasInfoChanges = useMemo(() => JSON.stringify(localInfo) !== JSON.stringify(schoolInfo), [localInfo, schoolInfo]);

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const base64Url = loadEvent.target?.result as string;
                setLocalInfo(prev => ({ ...prev, logo: base64Url }));
            };
            reader.readAsDataURL(file);
        } else {
            alert('Por favor, selecione um arquivo de imagem válido.');
        }
    };

    const handleSaveSchoolInfo = () => {
        updateSchoolInfo(localInfo);
        alert('Informações da instituição salvas com sucesso!');
    };


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
                
                <div className="space-y-8">
                    {/* School Info Section */}
                    <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Informações da Instituição</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1 flex flex-col items-center">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logotipo</label>
                                <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center border border-gray-300 dark:border-gray-600">
                                    {localInfo.logo ? (
                                        <img src={localInfo.logo} alt="Logo" className="w-full h-full object-contain rounded-full" />
                                    ) : (
                                        <SchoolIcon className="w-16 h-16 text-gray-400" />
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                                    Alterar Logo
                                </button>
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <div>
                                    <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Escola</label>
                                    <input type="text" id="schoolName" name="name" value={localInfo.name} onChange={handleInfoChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                                </div>
                                {/* Add other school info fields here if needed in the future */}
                            </div>
                        </div>
                         <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700/50">
                            <button onClick={handleSaveSchoolInfo} disabled={!hasInfoChanges} className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                                Salvar Alterações
                            </button>
                        </div>
                    </div>

                    {/* User Management Section */}
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