import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { NotificationType } from '../../types';

interface RequestToSecretaryModalProps {
    onClose: () => void;
}

const RequestToSecretaryModal: React.FC<RequestToSecretaryModalProps> = ({ onClose }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const { user } = useAuth();
    const { addNotification } = useNotification();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) {
            alert("Por favor, preencha o assunto e a mensagem.");
            return;
        }
        setIsSending(true);

        setTimeout(() => {
            addNotification({
                type: NotificationType.COMMUNICATION,
                title: `Nova Solicitação de ${user?.username || 'Educador(a)'}: ${subject}`,
                message: message,
            });
            setIsSending(false);
            alert("Sua solicitação foi enviada para a secretaria!");
            onClose();
        }, 500);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Enviar Solicitação à Secretaria</h2>
                </header>
                <main className="p-6 space-y-4">
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assunto</label>
                        <input
                            type="text"
                            id="subject"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            required
                            className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mensagem</label>
                        <textarea
                            id="message"
                            rows={5}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            required
                            className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white"
                        />
                    </div>
                </main>
                <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white">Cancelar</button>
                    <button type="submit" disabled={isSending} className="px-4 py-2 bg-blue-600 font-semibold text-white rounded-lg w-28">
                        {isSending ? 'Enviando...' : 'Enviar'}
                    </button>
                </footer>
                 <style>{`
                    @keyframes fade-in {
                        from { opacity: 0; transform: scale(0.98); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                `}</style>
            </form>
        </div>
    );
};

export default RequestToSecretaryModal;