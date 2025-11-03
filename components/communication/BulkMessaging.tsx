import React, { useState, useRef, useEffect } from 'react';
import { useEnrollment } from '../../contexts/EnrollmentContext';
import EmojiPicker from './EmojiPicker';
import { generateDocumentText } from '../../services/geminiService';
import { WhatsAppGroup } from '../../types';
import ManageGroupsModal from './ManageGroupsModal';


const BulkMessaging: React.FC = () => {
    const { contacts, enrolledStudents } = useEnrollment();
    const [isSending, setIsSending] = useState(false);
    const [sendStatus, setSendStatus] = useState({ sent: 0, skipped: 0, total: 0, current: '' });
    
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [audience, setAudience] = useState('Todos os Responsáveis');
    const [channel, setChannel] = useState('E-mail');
    
    // New states for group management
    const [savedGroups, setSavedGroups] = useState<WhatsAppGroup[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');
    const [isManageGroupsModalOpen, setIsManageGroupsModalOpen] = useState(false);


    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const storedGroups = localStorage.getItem('whatsapp_groups');
        if (storedGroups) {
            setSavedGroups(JSON.parse(storedGroups));
        }
    }, []);

    const handleSaveGroups = (groups: WhatsAppGroup[]) => {
        setSavedGroups(groups);
        localStorage.setItem('whatsapp_groups', JSON.stringify(groups));
        setIsManageGroupsModalOpen(false);
    };


    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Handle group message via WhatsApp link
        if (channel === 'WhatsApp' && selectedGroupId) {
            const selectedGroup = savedGroups.find(g => g.id.toString() === selectedGroupId);
            if (selectedGroup) {
                const url = selectedGroup.link.trim();
                try {
                    await navigator.clipboard.writeText(content);
                    window.open(url, '_blank');
                    alert(`O link para o grupo "${selectedGroup.name}" foi aberto. A mensagem foi copiada para sua área de transferência. Agora, é só colar no WhatsApp e enviar!`);
                } catch (err) {
                    console.error('Failed to copy text or open link: ', err);
                    alert('Não foi possível copiar a mensagem. Por favor, copie manualmente e cole no grupo do WhatsApp que foi aberto.');
                    window.open(url, '_blank');
                }
                return;
            }
        }
        
        // A simple simulation of fetching contacts based on audience
        let targetContacts: { name: string, email?: string, phone?: string }[] = [];

        if (audience.includes('Responsáveis') || audience.includes('Alunos')) {
             targetContacts = enrolledStudents.flatMap(s => s.guardians?.map(g => ({ name: g.name, email: g.email, phone: g.phone })) || []);
        } else if (audience === 'Contatos Importados do PDF') {
            targetContacts = contacts.map(c => ({ name: c.name, email: c.email, phone: c.phone }));
        }
        
        if (targetContacts.length === 0) {
            alert('Nenhum contato encontrado para o público-alvo selecionado.');
            return;
        }
        
        // Filter contacts based on the selected channel
        const channelFilteredContacts = targetContacts.filter(contact => {
            if (channel === 'E-mail') return contact.email;
            if (channel === 'WhatsApp') return contact.phone;
            return true; // For App Notification, assume all have it
        });

        const skippedCount = targetContacts.length - channelFilteredContacts.length;

        if (channelFilteredContacts.length === 0) {
            alert(`Nenhum contato com ${channel === 'E-mail' ? 'e-mail' : 'telefone'} válido encontrado para este público.`);
            return;
        }

        setIsSending(true);
        setSendStatus({ sent: 0, skipped: skippedCount, total: channelFilteredContacts.length, current: '' });

        for (let i = 0; i < channelFilteredContacts.length; i++) {
            const contact = channelFilteredContacts[i];
            setSendStatus(prev => ({ ...prev, current: `Enviando via ${channel} para ${contact.name}...` }));
            
            await sleep(500); // Shorter delay for better UX
            
            setSendStatus(prev => ({ ...prev, sent: i + 1 }));
        }

        setSendStatus(prev => ({ ...prev, current: `Disparo via ${channel} concluído!` }));
        await sleep(2000);
        
        setIsSending(false);
    };
    
    const handleGenerateWithAI = async () => {
        // Use the subject as the prompt, as shown in the user's screenshot
        const promptText = subject.trim();
        if (!promptText) {
            alert("Por favor, preencha o campo 'Assunto / Título' para que a IA possa gerar a mensagem.");
            return;
        }

        setIsGenerating(true);
        setContent(''); // Clear the textarea
        const fullPrompt = `Escreva um comunicado escolar formal, mas amigável, para ser enviado em massa para pais e responsáveis. O tópico é: "${promptText}".`;
        try {
            const result = await generateDocumentText(fullPrompt);
            setContent(result);
        } catch (error) {
            alert(`Erro ao gerar mensagem: ${error instanceof Error ? error.message : "Tente novamente."}`);
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleEmojiSelect = (emoji: string) => {
        if (contentTextareaRef.current) {
            const { selectionStart, selectionEnd } = contentTextareaRef.current;
            const text = content;
            setContent(text.slice(0, selectionStart ?? 0) + emoji + text.slice(selectionEnd ?? 0));
             setTimeout(() => {
                contentTextareaRef.current?.focus();
                contentTextareaRef.current?.setSelectionRange((selectionStart ?? 0) + emoji.length, (selectionStart ?? 0) + emoji.length);
            }, 0);
        } else {
            setContent(prev => prev + emoji);
        }
        setIsEmojiPickerOpen(false);
    };

    const isGroupMode = channel === 'WhatsApp' && !!selectedGroupId;

    return (
        <>
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800/50 p-8 rounded-xl border border-gray-200 dark:border-gray-700/50">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Disparos em Massa</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Envie comunicados importantes para grupos específicos da comunidade escolar.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="channel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Canal de Envio</label>
                            <select id="channel" name="channel" value={channel} onChange={e => setChannel(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                                <option>E-mail</option>
                                <option>WhatsApp</option>
                                <option>Notificação do App</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="audience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Público-alvo (Individual)</label>
                            <select id="audience" name="audience" value={audience} onChange={e => setAudience(e.target.value)} disabled={isGroupMode} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed">
                                <option>Todos os Responsáveis</option>
                                <option>Todos os Alunos</option>
                                <option>Responsáveis - Ed. Infantil</option>
                                <option>Responsáveis - Fundamental I</option>
                                <option>Responsáveis - Fundamental II</option>
                                <option>Contatos Importados do PDF</option>
                                <option>Corpo Docente</option>
                            </select>
                        </div>
                    </div>

                    {channel === 'WhatsApp' && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div>
                                    <label htmlFor="groupSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enviar para Grupo Salvo</label>
                                    <select id="groupSelect" value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)} className="w-full bg-white dark:bg-gray-700/80 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                                        <option value="">Enviar individualmente para o público-alvo</option>
                                        {savedGroups.map(group => (
                                            <option key={group.id} value={group.id}>{group.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="button" onClick={() => setIsManageGroupsModalOpen(true)} className="px-4 py-2 bg-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-500">
                                    Gerenciar Grupos
                                </button>
                            </div>
                        </div>
                    )}


                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assunto / Título</label>
                        <input type="text" id="subject" name="subject" value={subject} onChange={e => setSubject(e.target.value)} required placeholder="Este campo também será usado como tópico para a IA" className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" />
                    </div>

                    <div className="relative">
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Conteúdo da Mensagem</label>
                            <div className="flex items-center space-x-2">
                                <button 
                                    type="button" 
                                    onClick={handleGenerateWithAI} 
                                    disabled={isGenerating} 
                                    className="px-2 py-1 text-xs font-semibold bg-gray-200 dark:bg-gray-600/50 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center w-28 disabled:cursor-wait"
                                >
                                    {isGenerating ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Gerando...</span>
                                        </>
                                    ) : (
                                        'Gerar com IA ✨'
                                    )}
                                </button>
                                <button type="button" onClick={() => setIsEmojiPickerOpen(prev => !prev)} className="px-2 py-1 text-xs font-semibold bg-gray-200 dark:bg-gray-600/50 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
                                    😊 Emojis
                                </button>
                            </div>
                        </div>
                        <textarea ref={contentTextareaRef} id="content" name="content" value={content} onChange={e => setContent(e.target.value)} rows={8} required placeholder="Use {nome_aluno} ou {nome_responsavel} para personalizar a mensagem." className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"></textarea>
                        {isEmojiPickerOpen && (
                            <div className="absolute top-12 right-0 z-10">
                                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                            </div>
                        )}
                    </div>
                    
                    {isSending && (
                        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex justify-between items-center text-sm font-semibold mb-1">
                                <span className="text-gray-700 dark:text-gray-300">{sendStatus.current}</span>
                                <span className="text-gray-900 dark:text-white">{sendStatus.sent} / {sendStatus.total}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                <div className="bg-teal-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(sendStatus.sent / sendStatus.total) * 100}%` }}></div>
                            </div>
                            {sendStatus.skipped > 0 && (
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 text-center">
                                    {sendStatus.skipped} contato(s) ignorado(s) por não possuírem {channel === 'E-mail' ? 'e-mail' : 'telefone'} válido.
                                </p>
                            )}
                        </div>
                    )}

                    <div>
                        <button type="submit" disabled={isSending} className="w-full mt-4 px-6 py-3 bg-teal-600 hover:bg-teal-500 rounded-lg font-semibold text-white transition-colors disabled:bg-gray-500 disabled:cursor-wait">
                            {isSending ? 'Enviando...' : (isGroupMode ? 'Abrir Grupo no WhatsApp' : 'Agendar e Enviar Comunicado')}
                        </button>
                    </div>
                </form>
            </div>
            {isManageGroupsModalOpen && (
                <ManageGroupsModal
                    initialGroups={savedGroups}
                    onClose={() => setIsManageGroupsModalOpen(false)}
                    onSave={handleSaveGroups}
                />
            )}
        </>
    );
};

export default BulkMessaging;