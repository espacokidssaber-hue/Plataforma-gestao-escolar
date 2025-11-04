import React, { useState, useMemo } from 'react';
import { EnrolledStudent, Educator } from '../../types';
import { generateDocumentText } from '../../services/geminiService';

interface NewMeetingModalProps {
  students: EnrolledStudent[];
  educators: Educator[];
  onClose: () => void;
  onSchedule: (meetingData: any) => void;
}

const NewMeetingModal: React.FC<NewMeetingModalProps> = ({ students, educators, onClose, onSchedule }) => {
    const [type, setType] = useState<'responsavel' | 'educadora'>('responsavel');
    const [studentId, setStudentId] = useState<string>('');
    const [educatorId, setEducatorId] = useState<string>('');
    const [schoolParticipants, setSchoolParticipants] = useState('Coordenação');
    const [subject, setSubject] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [channels, setChannels] = useState({ email: true, whatsapp: true, app: true });
    const [message, setMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const selectedStudent = useMemo(() => students.find(s => s.id.toString() === studentId), [students, studentId]);
    const selectedEducator = useMemo(() => educators.find(e => e.id.toString() === educatorId), [educators, educatorId]);
    
    const isFormValid = subject.trim() !== '' && dateTime !== '';

    const handleGenerateMessage = async () => {
        if (!isFormValid) {
            alert("Preencha o assunto, data/hora e selecione um convidado antes de gerar a mensagem.");
            return;
        }
        const isBulkInvite = type === 'educadora' && educatorId === 'all-educators';
        const attendeeName = isBulkInvite 
            ? 'Equipe de Educadoras' 
            : (type === 'responsavel' ? selectedStudent?.guardians?.[0]?.name : selectedEducator?.name);

        setIsGenerating(true);
        const prompt = `Escreva uma mensagem de convite formal e amigável para uma reunião escolar.
        - Convidado: ${attendeeName || 'Convidado(a)'}
        - Assunto da reunião: ${subject}
        - Data e Hora: ${new Date(dateTime).toLocaleString('pt-BR')}
        - Participantes da escola: ${schoolParticipants}
        A mensagem deve incluir um placeholder para um link de confirmação, como "[LINK_PARA_CONFIRMAR]".`;
        try {
            const result = await generateDocumentText(prompt);
            setMessage(result);
        } catch (error) {
            alert(`Erro ao gerar mensagem: ${error instanceof Error ? error.message : "Tente novamente."}`);
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        
        const isBulkInvite = type === 'educadora' && educatorId === 'all-educators';
        const attendeeName = isBulkInvite 
            ? 'Equipe de Educadoras' 
            : (type === 'responsavel' ? selectedStudent?.guardians?.[0]?.name : selectedEducator?.name);

        const meetingData = {
            title: subject,
            attendeeName: attendeeName || schoolParticipants,
            attendeeContact: {
                email: type === 'responsavel' ? selectedStudent?.guardians?.[0]?.email : (selectedEducator ? 'educator@school.com' : undefined),
                phone: type === 'responsavel' ? selectedStudent?.guardians?.[0]?.phone : (selectedEducator ? '11912345678' : undefined),
            },
            schoolParticipants,
            studentName: type === 'responsavel' ? selectedStudent?.name : undefined,
            date: new Date(dateTime).toISOString(),
            channels: channels,
            message: message,
            isBulk: isBulkInvite,
        };
        onSchedule(meetingData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Agendar Nova Reunião</h2>
                    <button type="button" onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agendar com:</label>
                        <div className="flex space-x-2">
                            <button type="button" onClick={() => setType('responsavel')} className={`px-4 py-2 text-sm font-semibold rounded-md flex-1 ${type === 'responsavel' ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Responsável de Aluno</button>
                            <button type="button" onClick={() => setType('educadora')} className={`px-4 py-2 text-sm font-semibold rounded-md flex-1 ${type === 'educadora' ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Educadora</button>
                        </div>
                    </div>
                    {type === 'responsavel' ? (
                        <div>
                            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aluno</label>
                            <select id="studentId" value={studentId} onChange={e => setStudentId(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg">
                                <option value="">Selecione o aluno (opcional)...</option>
                                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.guardians?.[0]?.name})</option>)}
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="educatorId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Educadora</label>
                            <select id="educatorId" value={educatorId} onChange={e => setEducatorId(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg">
                                <option value="">Selecione a educadora (opcional)...</option>
                                <option value="all-educators">Todos(as) os(as) Educadores(as)</option>
                                {educators.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                    )}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="schoolParticipants" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Participantes da Escola</label>
                            <input type="text" id="schoolParticipants" value={schoolParticipants} onChange={e => setSchoolParticipants(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg"/>
                        </div>
                        <div>
                            <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data e Hora *</label>
                            <input type="datetime-local" id="dateTime" value={dateTime} onChange={e => setDateTime(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assunto Principal *</label>
                        <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg"/>
                    </div>
                     <div>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mensagem do Convite</label>
                            <button type="button" onClick={handleGenerateMessage} disabled={isGenerating} className="px-2 py-1 text-xs font-semibold bg-gray-200 dark:bg-gray-600/50 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center">
                                {isGenerating ? 'Gerando...' : 'Gerar com IA ✨'}
                            </button>
                        </div>
                        <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="Opcional. Uma mensagem padrão será usada se este campo ficar em branco." className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Canais de Envio do Convite</label>
                        <div className="flex space-x-4">
                            <label className="flex items-center">
                                <input type="checkbox" checked={channels.email} onChange={e => setChannels(c => ({...c, email: e.target.checked}))} className="h-4 w-4 rounded text-teal-500" />
                                <span className="ml-2 text-gray-900 dark:text-white">E-mail</span>
                            </label>
                            <label className="flex items-center">
                                <input type="checkbox" checked={channels.whatsapp} onChange={e => setChannels(c => ({...c, whatsapp: e.target.checked}))} className="h-4 w-4 rounded text-teal-500" />
                                <span className="ml-2 text-gray-900 dark:text-white">WhatsApp</span>
                            </label>
                            <label className="flex items-center">
                                <input type="checkbox" checked={channels.app} onChange={e => setChannels(c => ({...c, app: e.target.checked}))} className="h-4 w-4 rounded text-teal-500" />
                                <span className="ml-2 text-gray-900 dark:text-white">Aplicativo</span>
                            </label>
                        </div>
                    </div>
                </main>
                <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button type="submit" disabled={!isFormValid} className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 disabled:bg-gray-500">
                        Agendar e Enviar Convite
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

export default NewMeetingModal;