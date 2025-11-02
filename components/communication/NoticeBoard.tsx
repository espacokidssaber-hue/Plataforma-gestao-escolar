import React, { useState } from 'react';
import { Announcement } from '../../types';
import { generateDocumentText } from '../../services/geminiService';

const BoardIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>);
const EmailIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 2.332l7.997 3.552A1 1 0 0118 6.884V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.884a1 1 0 01.003-.999zM11 8a1 1 0 10-2 0v2a1 1 0 102 0V8z" /></svg>);
const WhatsAppIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className={className}><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 .9c48.4 0 93.2 18.7 127.6 53.2 34.4 34.4 53.2 79.2 53.2 127.6s-18.8 93.2-53.2 127.6c-34.4 34.4-79.2 53.2-127.6 53.2h-.1c-33.8 0-66.3-9.3-94-26.4l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5zm101.2 138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>);
const AppIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>);


const INITIAL_ANNOUNCEMENTS: Announcement[] = [
    { id: 1, title: 'Início das Provas Bimestrais', author: 'Coordenação Pedagógica', date: '2023-11-05T10:00:00Z', audience: 'Alunos e Responsáveis - Fundamental II', content: 'Lembramos que as provas bimestrais terão início na próxima segunda-feira, dia 12. O cronograma completo já foi enviado por e-mail e está disponível no portal do aluno. Desejamos a todos uma ótima semana de avaliações!', channels: { board: true, email: true, app: true, whatsapp: false } },
    { id: 2, title: 'Campanha do Agasalho 2023', author: 'Diretoria', date: '2023-11-02T14:30:00Z', audience: 'Toda a Comunidade Escolar', content: 'Nossa tradicional campanha do agasalho já começou! As caixas de coleta estão posicionadas na entrada da escola. Sua doação pode aquecer o inverno de muitas famílias. Contamos com a colaboração de todos até o dia 30/11.', channels: { board: true, email: false, app: false, whatsapp: true } },
    { id: 3, title: 'Festa Junina - Venda de Ingressos', author: 'Associação de Pais e Mestres', date: '2023-10-28T09:00:00Z', audience: 'Toda a Comunidade Escolar', content: 'Os ingressos para a nossa grande Festa Junina já estão à venda na secretaria. Garanta o seu e venha se divertir conosco no dia 22/06 com muitas comidas típicas, danças e brincadeiras!', channels: { board: true, email: true, app: true, whatsapp: true } },
];

const NoticeBoard: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
    const [showModal, setShowModal] = useState(false);

    const handleAddAnnouncement = (data: Omit<Announcement, 'id' | 'author' | 'date'>) => {
        const newAnnouncement: Announcement = {
            ...data,
            id: Date.now(),
            author: 'Secretaria',
            date: new Date().toISOString(),
        };
        setAnnouncements(prev => [newAnnouncement, ...prev]);
        setShowModal(false);

        const sentChannels = Object.entries(data.channels)
            .filter(([, sent]) => sent)
            .map(([channelName]) => {
                switch(channelName) {
                    case 'board': return 'Mural';
                    case 'email': return 'E-mail';
                    case 'whatsapp': return 'WhatsApp';
                    case 'app': return 'App';
                    default: return '';
                }
            }).filter(Boolean);

        alert(`Aviso publicado com sucesso!\nCanais utilizados: ${sentChannels.join(', ')}.`);
    };

    const ChannelIcons: React.FC<{channels: Announcement['channels']}> = ({ channels }) => (
        <div className="flex items-center space-x-2 text-gray-400 dark:text-gray-500">
            {channels.board && <BoardIcon className="h-4 w-4" title="Publicado no Mural" />}
            {channels.email && <EmailIcon className="h-4 w-4" title="Enviado por E-mail" />}
            {channels.whatsapp && <WhatsAppIcon className="h-4 w-4" title="Enviado por WhatsApp" />}
            {channels.app && <AppIcon className="h-4 w-4" title="Enviado por Notificação do App" />}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mural de Avisos</h2>
                <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500">
                    + Novo Aviso
                </button>
            </div>

            {announcements.map(ann => (
                <div key={ann.id} className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700/50">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{ann.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Por <span className="font-semibold">{ann.author}</span> em {new Date(ann.date).toLocaleDateString('pt-BR')} para <span className="text-teal-600 dark:text-teal-300">{ann.audience}</span>
                            </p>
                        </div>
                        <ChannelIcons channels={ann.channels} />
                    </div>
                    <p className="mt-4 text-gray-700 dark:text-gray-300">{ann.content}</p>
                </div>
            ))}
            
            {showModal && (
                <NewAnnouncementModal onClose={() => setShowModal(false)} onAdd={handleAddAnnouncement} />
            )}
        </div>
    );
};


interface NewAnnouncementModalProps {
    onClose: () => void;
    onAdd: (data: Omit<Announcement, 'id' | 'author' | 'date'>) => void;
}

const NewAnnouncementModal: React.FC<NewAnnouncementModalProps> = ({ onClose, onAdd }) => {
    const [title, setTitle] = useState('');
    const [audience, setAudience] = useState('Toda a Comunidade Escolar');
    const [content, setContent] = useState('');
    const [channels, setChannels] = useState({ board: true, email: false, whatsapp: false, app: false });
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateWithAI = async () => {
        if (!title.trim()) {
            alert("Por favor, preencha o Título para que a IA possa gerar o conteúdo.");
            return;
        }
        setIsGenerating(true);
        const prompt = `Aja como um profissional de comunicação escolar. Escreva um comunicado claro e amigável para o público "${audience}" sobre o seguinte tópico: "${title}". O comunicado será exibido no mural de avisos da escola e enviado para os pais.`;
        try {
            const result = await generateDocumentText(prompt);
            setContent(result);
        } catch(error) {
            alert(`Erro ao gerar conteúdo: ${error instanceof Error ? error.message : 'Tente novamente.'}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onAdd({ title, audience, content, channels });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Criar Novo Aviso</h3>
                <div className="space-y-4 flex-grow overflow-y-auto pr-2">
                    <input type="text" placeholder="Título do Aviso" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" />
                    <select value={audience} onChange={e => setAudience(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                        <option>Toda a Comunidade Escolar</option>
                        <option>Alunos e Responsáveis - Fundamental I</option>
                        <option>Alunos e Responsáveis - Fundamental II</option>
                        <option>Corpo Docente</option>
                    </select>
                    <div className="relative">
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Conteúdo do aviso</label>
                            <button type="button" onClick={handleGenerateWithAI} disabled={isGenerating} className="px-2 py-1 text-xs font-semibold bg-gray-200 dark:bg-gray-600/50 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center w-28">
                                {isGenerating ? 'Gerando...' : 'Gerar com IA ✨'}
                            </button>
                        </div>
                        <textarea id="content" value={content} onChange={e => setContent(e.target.value)} rows={5} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"></textarea>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Disparar por:</label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.keys(channels).map(channelKey => (
                                <label key={channelKey} className="flex items-center p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={channels[channelKey as keyof typeof channels]}
                                        onChange={e => setChannels(prev => ({...prev, [channelKey]: e.target.checked}))}
                                        className="h-4 w-4 rounded text-teal-500"
                                    />
                                    <span className="ml-3 text-sm text-gray-900 dark:text-white capitalize">{channelKey === 'board' ? 'Mural de Avisos' : channelKey === 'app' ? 'Notificação do App' : channelKey}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-gray-200">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-teal-600 font-semibold text-white rounded-lg">Publicar Aviso</button>
                </div>
            </form>
        </div>
    );
};


export default NoticeBoard;