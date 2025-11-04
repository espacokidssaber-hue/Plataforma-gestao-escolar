import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth, User } from '../../contexts/AuthContext';
import { useCommunication } from '../../contexts/CommunicationContext';
import { InternalConversation } from '../../types';
import NewConversationModal from './NewConversationModal';

// --- AVATAR UTILS START ---
const getInitials = (name: string): string => { if (!name) return '?'; const words = name.trim().split(' ').filter(Boolean); if (words.length > 1) { return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase(); } if (words.length === 1 && words[0].length > 1) { return words[0].substring(0, 2).toUpperCase(); } if (words.length === 1) { return words[0][0].toUpperCase(); } return '?'; };
const stringToColor = (str: string): string => { let hash = 0; if (!str) return '#cccccc'; for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); hash = hash & hash; } let color = '#'; for (let i = 0; i < 3; i++) { const value = (hash >> (i * 8)) & 0xFF; const adjustedValue = 100 + (value % 156); color += ('00' + adjustedValue.toString(16)).substr(-2); } return color; };
const generateAvatar = (name: string): string => { const initials = getInitials(name); const color = stringToColor(name); const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150" fill="${color}"><rect width="100%" height="100%" fill="currentColor" /><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60" fill="#ffffff">${initials}</text></svg>`; return `data:image/svg+xml;base64,${btoa(svg)}`; };
// --- AVATAR UTILS END ---


const InternalMessages: React.FC = () => {
    const { user: currentUser, users } = useAuth();
    const { conversations, sendMessage, markConversationAsRead } = useCommunication();
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [messageText, setMessageText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const selectedConversation = useMemo(() => {
        return conversations.find(c => c.id === selectedConversationId);
    }, [selectedConversationId, conversations]);
    
    useEffect(() => {
        if (selectedConversationId) {
            markConversationAsRead(selectedConversationId);
        }
    }, [selectedConversationId, markConversationAsRead]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedConversation?.messages]);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim() || !selectedConversation || !currentUser) return;
        
        const recipientId = selectedConversation.participantIds.find(id => id !== currentUser.id);
        if (recipientId) {
            sendMessage(recipientId, messageText);
            setMessageText('');
        }
    };

    const handleStartConversation = (recipient: User) => {
        sendMessage(recipient.id, `Olá, ${recipient.username}!`);
        setIsModalOpen(false);
    }
    
    if (!currentUser) return null;

    return (
        <div className="flex h-[calc(100vh-250px)] bg-white dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700/50">
            {/* Conversation List */}
            <aside className="w-1/3 max-w-sm border-r border-gray-200 dark:border-gray-700/50 flex flex-col">
                <header className="p-4 border-b border-gray-200 dark:border-gray-700/50 flex justify-between items-center">
                    <h2 className="font-bold text-gray-900 dark:text-white">Conversas</h2>
                    <button onClick={() => setIsModalOpen(true)} className="p-2 text-teal-600 dark:text-teal-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    </button>
                </header>
                <div className="flex-grow overflow-y-auto">
                    {conversations.map(convo => {
                        const otherParticipantId = convo.participantIds.find(id => id !== currentUser.id);
                        const otherUser = users.find(u => u.id === otherParticipantId);
                        const lastMessage = convo.messages[convo.messages.length - 1];
                        const isUnread = lastMessage && lastMessage.senderId !== currentUser.id && !lastMessage.isRead;

                        return (
                            <button key={convo.id} onClick={() => setSelectedConversationId(convo.id)} className={`w-full text-left p-3 flex items-center space-x-3 ${selectedConversationId === convo.id ? 'bg-teal-50 dark:bg-teal-900/40' : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'}`}>
                                <img src={generateAvatar(otherUser?.username || '?')} alt={otherUser?.username} className="w-12 h-12 rounded-full flex-shrink-0" />
                                <div className="flex-grow overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <span className={`font-semibold truncate ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>{otherUser?.username || 'Usuário Removido'}</span>
                                        {isUnread && <span className="h-3 w-3 bg-teal-500 rounded-full flex-shrink-0"></span>}
                                    </div>
                                    <p className={`text-sm truncate ${isUnread ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>{lastMessage?.text || 'Nova conversa'}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* Message View */}
            <main className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <>
                        <header className="p-3 border-b border-gray-200 dark:border-gray-700/50 flex items-center space-x-3">
                           <img src={generateAvatar(users.find(u => u.id === selectedConversation.participantIds.find(id => id !== currentUser.id))?.username || '?')} alt="" className="w-10 h-10 rounded-full" />
                           <h3 className="font-bold text-gray-900 dark:text-white">{users.find(u => u.id === selectedConversation.participantIds.find(id => id !== currentUser.id))?.username}</h3>
                        </header>
                        <div className="flex-grow p-4 overflow-y-auto space-y-4">
                            {selectedConversation.messages.map(msg => {
                                const isSender = msg.senderId === currentUser.id;
                                const sender = users.find(u => u.id === msg.senderId);
                                return (
                                    <div key={msg.id} className={`flex items-end gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}>
                                        {!isSender && <img src={generateAvatar(sender?.username || '?')} alt={sender?.username} className="w-8 h-8 rounded-full" />}
                                        <div className={`max-w-md p-3 rounded-2xl ${isSender ? 'bg-teal-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                            <p className="text-sm">{msg.text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-gray-700/50 flex items-center space-x-2">
                            <input type="text" value={messageText} onChange={e => setMessageText(e.target.value)} placeholder="Digite sua mensagem..." className="flex-grow bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                            <button type="submit" className="p-2 bg-teal-600 text-white rounded-lg">Enviar</button>
                        </form>
                    </>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-center text-gray-500 dark:text-gray-400">
                        <p>Selecione uma conversa ou inicie uma nova.</p>
                    </div>
                )}
            </main>
            {isModalOpen && <NewConversationModal onClose={() => setIsModalOpen(false)} onStartConversation={handleStartConversation} />}
        </div>
    );
};

export default InternalMessages;