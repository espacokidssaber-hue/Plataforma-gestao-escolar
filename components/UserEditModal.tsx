import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface UserEditModalProps {
    userToEdit: User | null;
    onClose: () => void;
}

const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.022 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeSlashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.022-7 9.542-7 .847 0 1.669.105 2.458.303M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2 2l20 20" />
  </svg>
);


const UserEditModal: React.FC<UserEditModalProps> = ({ userToEdit, onClose }) => {
    const { addUser, updateUser, passwords } = useAuth();
    
    const isEditing = !!userToEdit;
    const [username, setUsername] = useState('');
    const [role, setRole] = useState<UserRole>('educator');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    useEffect(() => {
        if (isEditing && userToEdit) {
            setUsername(userToEdit.username);
            setRole(userToEdit.role);
            const currentPassword = passwords[userToEdit.username] || '';
            setPassword(currentPassword);
            setConfirmPassword(currentPassword);
        } else {
            setUsername('');
            setRole('educator');
            setPassword('');
            setConfirmPassword('');
        }
        setError('');
    }, [userToEdit, isEditing, passwords]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (username.trim() === '') {
            setError("O nome de usuário não pode ser vazio.");
            return;
        }

        if (password.length < 3) {
            setError("A senha deve ter pelo menos 3 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        
        try {
            if (isEditing && userToEdit) {
                updateUser({ ...userToEdit, username, role }, password);
            } else {
                addUser({ username, role }, password);
            }
            onClose();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</h2>
                </header>
                <main className="p-6 space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome de Usuário</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Papel</label>
                        <select
                            id="role"
                            value={role}
                            onChange={e => setRole(e.target.value as UserRole)}
                            className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white"
                        >
                            <option value="educator">Educador</option>
                            <option value="secretary">Secretária(o)</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="password"  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                        <div className="relative">
                            <input
                                id="password"
                                type={isPasswordVisible ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setIsPasswordVisible(prev => !prev)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400"
                                aria-label={isPasswordVisible ? "Esconder senha" : "Mostrar senha"}
                            >
                                {isPasswordVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="confirmPassword"  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Senha</label>
                         <div className="relative">
                            <input
                                id="confirmPassword"
                                type={isConfirmPasswordVisible ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setIsConfirmPasswordVisible(prev => !prev)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400"
                                aria-label={isConfirmPasswordVisible ? "Esconder senha" : "Mostrar senha"}
                            >
                                {isConfirmPasswordVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>}
                </main>
                <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-teal-600 font-semibold text-white rounded-lg">Salvar</button>
                </footer>
            </form>
        </div>
    );
};

export default UserEditModal;