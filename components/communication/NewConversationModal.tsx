import React, { useMemo } from 'react';
import { useAuth, User } from '../../contexts/AuthContext';

interface NewConversationModalProps {
    onClose: () => void;
    onStartConversation: (recipient: User) => void;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({ onClose, onStartConversation }) => {
    const { user: currentUser, users } = useAuth();
    
    const availableRecipients = useMemo(() => {
        if (!currentUser) return [];
        switch (currentUser.role) {
            case 'admin':
                return users.filter(u => u.id !== currentUser.id); // Admin can message anyone
            case 'secretary':
                 // Secretary can message admin, educators, and other secretaries
                return users.filter(u => u.id !== currentUser.id && (u.role === 'admin' || u.role === 'educator' || u.role === 'secretary'));
            case 'educator':
                 // Educator can message admin and secretary
                return users.filter(u => u.id !== currentUser.id && (u.role === 'admin' || u.role === 'secretary'));
            default:
                return [];
        }
    }, [currentUser, users]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Iniciar Nova Conversa</h2>
                    <button type="button" onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <div className="p-4 max-h-80 overflow-y-auto">
                    {availableRecipients.map(user => (
                        <button 
                            key={user.id} 
                            onClick={() => onStartConversation(user)}
                            className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <span className="font-semibold text-gray-800 dark:text-white">{user.username}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 capitalize">({user.role})</span>
                        </button>
                    ))}
                </div>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default NewConversationModal;