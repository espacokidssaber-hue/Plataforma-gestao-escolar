import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Conversation } from '../../types';
import { useEnrollment } from '../../contexts/EnrollmentContext';
import EmojiPicker from './EmojiPicker';
import { streamDocumentText } from '../../services/geminiService';

// --- AVATAR UTILS START ---
const getInitials = (name: string): string => { if (!name) return '?'; const words = name.trim().split(' ').filter(Boolean); if (words.length > 1) { return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase(); } if (words.length === 1 && words[0].length > 1) { return words[0].substring(0, 2).toUpperCase(); } if (words.length === 1) { return words[0][0].toUpperCase(); } return '?'; };
const stringToColor = (str: string): string => { let hash = 0; if (!str) return '#cccccc'; for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); hash = hash & hash; } let color = '#'; for (let i = 0; i < 3; i++) { const value = (hash >> (i * 8)) & 0xFF; const adjustedValue = 100 + (value % 156); color += ('00' + adjustedValue.toString(16)).substr(-2); } return color; };
const generateAvatar = (name: string): string => { const initials = getInitials(name); const color = stringToColor(name); const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150" fill="${color}"><rect width="100%" height="100%" fill="currentColor" /><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60" fill="#ffffff">${initials}</text></svg>`; return `data:image/svg+xml;base64,${btoa(svg)}`; };
// --- AVATAR UTILS END ---

const WhatsAppIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className={className}>
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 .9c48.4 0 93.2 18.7 127.6 53.2 34.4 34.4 53.2 79.2 53.2 127.6s-18.8 93.2-53.2 127.6c-34.4 34.4-79.2 53.2-127.6 53.2h-.1c-33.8 0-66.3-9.3-94-26.4l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5zm101.2 138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
    </svg>
);

const MagicWandIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M3.5 2.5a.5.5 0 00-1 0v1a.5.5 0 001 0v-1zM6.5 6.5a.5.5 0 00-1 0v1a.5.5 0 001 0v-1zM3.5 9.5a.5.5 0 00-1 0v1a.5.5 0 001 0v-1zM9.5 3.5a.5.5 0 000-1h-1a.5.5 0 000 1h1zM6.5 3.5a.5.5 0 000-1h-1a.5.5 0 000 1h1zM9.5 6.5a.5.5 0 000-1h-1a.5.5 0 000 1h1zM12.5 9.5a.5.5 0 00-1 0v1a.5.5 0 001 0v-1zM9.5 9.5a.5.5 0 000-1h-1a.5.5 0 000 1h1zM12.5 6.5a.5.5 0 00-1 0v1a.5.5 0 001 0v-1zM15.5 3.5a.5.5 0 000-1h-1a.5.5 0 000 1h1zM12.5 3.5a.5.5 0 000-1h-1a.5.5 0 000 1h1zM15.5 6.5a.5.5 0 000-1h-1a.5.5 0 000 1h1z" />
        <path fillRule="evenodd" d="M5 2a.5.5 0 01.5-.5h9a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-9A.5.5 0 015 3V2zm11.5 2a.5.5 0 01.5.5v9a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5h1zM5 15a.5.5 0 01.5-.5h9a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5v-1zM3.5 5a.5.5 0 00-1 0v9a.5.5 0 001 0v-9z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M7 6a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
    </svg>
);


const LightBulbIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 14.95a1 1 0 001.414 1.414l.707-.707a1 1 0 00-1.414-1.414l-.707.707zM4 10a1 1 0 01-1 1H2a1 1 0 110-2h1a1 1 0 011 1zM10 18a1 1 0 011-1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM3.939 3.939a1 1 0 001.414 1.414l.707-.707A1 1 0 004.646 3.232l-.707.707z" />
        <path d="M10 14a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
);


const DirectMessages: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [message, setMessage] = useState('');
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const messageTextareaRef = useRef<HTMLTextAreaElement>(null);
    const { contacts } = useEnrollment();
    const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
    const [isSuggestingResponse, setIsSuggestingResponse] = useState(false);
    const [aiTopic, setAiTopic] = useState('');


    useEffect(() => {
        // Integrate contacts from EnrollmentContext into conversations
        const existingPhones = new Set(conversations.map(c => c.phone).filter(Boolean));
        const newConversations = contacts
            .filter(c => c.phone && !existingPhones.has(c.phone))
            .map((c, index) => ({
                id: Date.now() + index,
                contactName: c.name,
                contactAvatar: generateAvatar(c.name),
                lastMessage: 'Novo contato adicionado.',
                unreadCount: 0,
                phone: c.phone,
                email: c.email,
                messages: [],
            }));

        if (newConversations.length > 0) {
            setConversations(prev => [...prev, ...newConversations]);
        }
    }, [contacts]);


    const selectedConversation = useMemo(() => {
        return conversations.find(c => c.id === selectedConversationId);
    }, [selectedConversationId, conversations]);

    const handleGenerateWithAI = async () => {
        if (!aiTopic.trim()) {
            alert("Por favor, insira um tópico para a IA gerar a mensagem.");
            return;
        }
        setIsGeneratingMessage(true);
        setMessage(''); // Clear message box
        const promptText = `Escreva uma mensagem amigável para pais ou responsáveis de alunos sobre o seguinte tópico: "${aiTopic.trim()}". A mensagem deve ser clara, concisa e apropriada para ser enviada por WhatsApp.`;

        try {
            const stream = await streamDocumentText(promptText);
            for await (const chunk of stream) {
                setMessage(prev => prev + chunk.text);
            }
        } catch (error) {
            alert(`Ocorreu um erro ao gerar a mensagem: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsGeneratingMessage(false);
        }
    };

    const handleGeminiSuggestion = async () => {
        if (!selectedConversation || selectedConversation.unreadCount === 0) return;

        const lastMessage = selectedConversation.messages[selectedConversation.messages.length - 1].text;
        setIsSuggestingResponse(true);
        setMessage(''); // Clear message box
        const prompt = `Você é um assistente de secretaria escolar. A última mensagem recebida de um responsável de aluno foi: "${lastMessage}". Escreva uma sugestão de resposta curta, amigável e profissional.`;
        
        try {
            const stream = await streamDocumentText(prompt);
            for await (const chunk of stream) {
                setMessage(prev => prev + chunk.text);
            }
        } catch (error) {
            alert(`Ocorreu um erro ao sugerir a resposta: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsSuggestingResponse(false);
        }
    };

    const handleSendMessage = () => {
        if (!selectedConversation?.phone || !message.trim()) return;
        const whatsappUrl = `https://wa.me/${selectedConversation.phone}?text=${encodeURIComponent(message.trim())}`;
        window.open(whatsappUrl, '_blank');
        setMessage('');
    };

    const handleEmojiSelect = (emoji: string) => {
        if (messageTextareaRef.current) {
            const { selectionStart, selectionEnd } = messageTextareaRef.current;
            const text = message;
            setMessage(text.slice(0, selectionStart ?? 0) + emoji + text.slice(selectionEnd ?? 0));
             setTimeout(() => {
                messageTextareaRef.current?.focus();
                messageTextareaRef.current?.setSelectionRange((selectionStart ?? 0) + emoji.length, (selectionStart ?? 0) + emoji.length);
            }, 0);
        } else {
            setMessage(prev => prev + emoji);
        }
        setIsEmojiPickerOpen(false);
    };

    return (
        <div className="md:flex gap-4 h-full md:h-[calc(100vh-200px)]">
            {/* Conversation List */}
            <div className={`w-full md:w-1/3 md:max-w-xs flex-shrink-0 bg-white dark:bg-gray-800/50 rounded-lg flex flex-col ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
                <header className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Contatos</h2>
                </header>
                <div className="flex-grow overflow-y-auto">
                    {conversations.length > 0 ? conversations.map(convo => (
                        <button
                            key={convo.id}
                            onClick={() => setSelectedConversationId(convo.id)}
                            className={`w-full text-left p-4 flex items-center space-x-3 transition-colors ${selectedConversationId === convo.id ? 'bg-teal-100 dark:bg-teal-800/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                        >
                            <img src={convo.contactAvatar} alt={convo.contactName} className="w-12 h-12 rounded-full" />
                            <div className="flex-grow">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-900 dark:text-white">{convo.contactName}</span>
                                    {convo.unreadCount > 0 && <span className="text-xs bg-teal-500 text-white font-bold rounded-full h-5 w-5 flex items-center justify-center">{convo.unreadCount}</span>}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{convo.lastMessage}</p>
                            </div>
                        </button>
                    )) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 p-4">Nenhum contato encontrado.</p>
                    )}
                </div>
            </div>

            {/* Message Composer */}
            <div className={`w-full md:flex-1 bg-white dark:bg-gray-800/50 rounded-lg flex-col p-6 ${selectedConversationId ? 'flex' : 'hidden md:flex'}`}>
                {selectedConversation ? (
                    <>
                        <header className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                             <button onClick={() => setSelectedConversationId(null)} className="p-2 mr-2 text-gray-500 dark:text-gray-400 rounded-md md:hidden" aria-label="Voltar para a lista">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </button>
                            <div className="flex items-center space-x-3">
                                <img src={selectedConversation.contactAvatar} alt={selectedConversation.contactName} className="w-12 h-12 rounded-full" />
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{selectedConversation.contactName}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedConversation.phone}</p>
                                </div>
                            </div>
                        </header>
                        <div className="flex-grow">
                            {/* Gemini AI Tools */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg my-4 space-y-3">
                                <div className="flex items-center space-x-2">
                                    <MagicWandIcon className="h-5 w-5 text-purple-500 dark:text-purple-400"/>
                                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Gerar Mensagem com IA</h4>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="text" value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="Digite um tópico. Ex: 'Lembrete sobre reunião de pais'" className="flex-grow bg-white dark:bg-gray-700/80 p-2 rounded-lg text-sm" />
                                    <button onClick={handleGenerateWithAI} disabled={isGeneratingMessage} className="px-3 py-2 bg-purple-100 text-purple-700 dark:bg-purple-600/50 dark:text-purple-200 text-xs font-semibold rounded-md hover:bg-purple-200 w-24 text-center">
                                        {isGeneratingMessage ? 'Gerando...' : 'Gerar'}
                                    </button>
                                </div>
                                 {selectedConversation.unreadCount > 0 && (
                                     <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                         <div className="flex items-center space-x-2">
                                             <LightBulbIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400"/>
                                             <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Sugestão de Resposta</h4>
                                         </div>
                                         <button onClick={handleGeminiSuggestion} disabled={isSuggestingResponse} className="mt-2 text-xs text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/50 rounded-md p-2 w-full text-left hover:bg-yellow-200 dark:hover:bg-yellow-900">
                                             {isSuggestingResponse ? 'Analisando...' : 'Clique para ver uma sugestão de resposta para a última mensagem recebida.'}
                                         </button>
                                     </div>
                                 )}
                            </div>
                        </div>
                        {/* Message Input */}
                        <div className="relative mt-auto">
                             <textarea
                                ref={messageTextareaRef}
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="Digite sua mensagem aqui..."
                                rows={4}
                                className="w-full p-3 pr-24 bg-gray-100 dark:bg-gray-700/50 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                            />
                            <div className="absolute bottom-2 right-2 flex items-center space-x-1">
                                <button type="button" onClick={() => setIsEmojiPickerOpen(prev => !prev)} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">😊</button>
                                <button onClick={handleSendMessage} className="p-2 bg-teal-500 text-white rounded-full hover:bg-teal-400">
                                    <WhatsAppIcon className="h-6 w-6"/>
                                </button>
                            </div>
                             {isEmojiPickerOpen && (
                                <div className="absolute bottom-14 right-0 z-10">
                                    <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">Selecione um Contato</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Escolha um contato na lista ao lado para iniciar uma conversa.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// FIX: Added default export
export default DirectMessages;
