import React, { useState, useMemo, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { type User, type Lead, type Staff, type SchoolClass, type School, UserRole } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { MailIcon } from './icons/MailIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface CommunicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    schools: School[];
    students: Lead[];
    staff: Staff[];
    classes: SchoolClass[];
    onSend: (messageData: any, schoolId: string) => Promise<void>;
}

export const CommunicationModal: React.FC<CommunicationModalProps> = ({ isOpen, onClose, user, schools, students, staff, classes, onSend }) => {
    const [idea, setIdea] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [channels, setChannels] = useState({ system: true, email: false, whatsapp: false });
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [selectedSchoolId, setSelectedSchoolId] = useState('');

     useEffect(() => {
        if (isOpen) {
            if (user.role === UserRole.SUPER_ADMINISTRADOR && schools.length > 0) {
                setSelectedSchoolId(schools[0].id);
            } else if (user.schoolId) {
                setSelectedSchoolId(user.schoolId);
            }
        }
    }, [isOpen, user, schools]);

    const recipientOptions = useMemo(() => {
        const options = [];

        // General Groups
        const generalGroups = [
            { value: 'group:parents:all', label: 'Todos os Pais/Responsáveis' },
            { value: 'group:staff:all', label: 'Todos os Funcionários' },
            { value: 'group:staff:educators', label: 'Todos os Educadores' },
        ].sort((a, b) => a.label.localeCompare(b.label));
        
        options.push({ label: 'Grupos Gerais', options: generalGroups });


        // Parents by Class
        if (classes.length > 0) {
            options.push({ label: 'Pais por Turma', options: classes.map(c => ({
                value: `group:class:${c.id}`,
                label: `Pais - ${c.name}`,
            }))});
        }
        
        // Individual Staff
        if (staff.length > 0) {
            options.push({ label: 'Funcionários Individuais', options: staff.map(s => ({
                value: `staff:${s.id}`,
                label: `${s.fullName} (${s.role})`,
            }))});
        }
        
        // Individual Parents
        if (students.length > 0) {
             options.push({ label: 'Pais/Responsáveis Individuais', options: students.map(s => ({
                value: `parent:${s.id}`,
                label: `${s.responsibleName} (Resp. por ${s.studentName})`,
            }))});
        }

        return options;
    }, [students, staff, classes]);

    const handleChannelChange = (channel: keyof typeof channels) => {
        setChannels(prev => ({ ...prev, [channel]: !prev[channel] }));
    };

    const handleGenerateMessage = async () => {
        if (!idea.trim()) {
            setError("Por favor, insira as ideias para a mensagem.");
            return;
        }
        setError('');
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
    
            const prompt = `Você é um(a) assistente de comunicação para uma escola. Sua tarefa é criar uma mensagem clara, profissional e amigável para pais e funcionários com base nas ideias fornecidas.
            
            **Ideias Chave:** "${idea}"
            
            Gere um JSON com duas chaves: "subject" (um assunto curto e direto) e "message" (o corpo da mensagem completo e bem formatado).`;
            
            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    subject: { type: Type.STRING, description: "O assunto da mensagem." },
                    message: { type: Type.STRING, description: "O corpo completo da mensagem." }
                },
                required: ["subject", "message"]
            };
    
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: responseSchema,
                }
            });
    
            const jsonString = response.text.trim();
            const generatedContent = JSON.parse(jsonString);
    
            if (generatedContent.subject && generatedContent.message) {
                setSubject(generatedContent.subject);
                setMessage(generatedContent.message);
            } else {
                throw new Error("A resposta da IA não continha o formato esperado.");
            }
    
        } catch (err) {
            console.error("Error generating message:", err);
            setError("Não foi possível gerar a mensagem. Tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (selectedRecipients.length === 0) {
            setError('Selecione ao menos um destinatário.');
            return;
        }
        if (!Object.values(channels).some(v => v)) {
            setError('Selecione ao menos um canal de envio.');
            return;
        }

        setIsSubmitting(true);
        try {
            const { groups, individuals, summary } = processRecipients();
            
            const payload = {
                subject,
                message,
                channels: Object.keys(channels).filter(c => channels[c as keyof typeof channels]),
                recipients: { groups, individuals },
                recipientSummary: summary,
            };

            await onSend(payload, selectedSchoolId);
            onClose();
            // Reset form
            setSubject('');
            setMessage('');
            setIdea('');
            setSelectedRecipients([]);
            setChannels({ system: true, email: false, whatsapp: false });

        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao enviar a mensagem.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const processRecipients = () => {
        const groups: string[] = [];
        const individuals: { id: string, name: string, type: 'parent' | 'staff' }[] = [];
        const summaryParts: string[] = [];

        selectedRecipients.forEach(rec => {
            const [type, id] = rec.split(':');
            if (type === 'group') {
                const groupLabel = recipientOptions.flatMap(g => g.options).find(o => o.value === rec)?.label || rec;
                groups.push(groupLabel);
                summaryParts.push(groupLabel);
            } else if (type === 'staff') {
                const staffMember = staff.find(s => s.id === id);
                if (staffMember) {
                    individuals.push({ id, name: staffMember.fullName, type: 'staff' });
                    summaryParts.push(staffMember.fullName);
                }
            } else if (type === 'parent') {
                const student = students.find(s => s.id === id);
                if (student) {
                    individuals.push({ id, name: student.responsibleName, type: 'parent' });
                    summaryParts.push(student.responsibleName);
                }
            }
        });
        
        // Create a concise summary
        let summary = summaryParts.join(', ');
        if (summary.length > 100) {
            summary = `${summaryParts.slice(0, 3).join(', ')} e mais ${summaryParts.length - 3} outros...`;
        }

        return { groups, individuals, summary };
    };


    const labelClass = "block text-sm font-medium text-gray-700";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nova Mensagem">
            <form onSubmit={handleSubmit} className="space-y-4">
                {user.role === UserRole.SUPER_ADMINISTRADOR && (
                    <div>
                        <label htmlFor="schoolId" className={labelClass}>Escola de Envio</label>
                        <select
                            id="schoolId"
                            value={selectedSchoolId}
                            onChange={e => setSelectedSchoolId(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                            required
                        >
                             <option value="" disabled>-- Selecione uma escola --</option>
                            {schools.map(school => (
                                <option key={school.id} value={school.id}>{school.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div>
                    <label htmlFor="recipients" className={labelClass}>Destinatários</label>
                    <select
                        id="recipients"
                        multiple
                        value={selectedRecipients}
                        // FIX: Explicitly type the 'option' parameter as HTMLOptionElement to resolve type inference issue.
                        onChange={e => setSelectedRecipients(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))}
                        className="mt-1 block w-full h-40 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    >
                        {recipientOptions.map(group => (
                            <optgroup key={group.label} label={group.label}>
                                {group.options.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>
                 <div>
                    <label className={labelClass}>Canais de Envio</label>
                    <div className="mt-2 flex items-center space-x-6">
                        <label className="flex items-center"><input type="checkbox" checked={channels.system} onChange={() => handleChannelChange('system')} className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" /><ChatBubbleLeftRightIcon className="w-5 h-5 ml-2 text-gray-600"/><span className="ml-2 text-sm">Sistema</span></label>
                        <label className="flex items-center"><input type="checkbox" checked={channels.email} onChange={() => handleChannelChange('email')} className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" /><MailIcon className="w-5 h-5 ml-2 text-gray-600"/><span className="ml-2 text-sm">E-mail</span></label>
                        <label className="flex items-center"><input type="checkbox" checked={channels.whatsapp} onChange={() => handleChannelChange('whatsapp')} className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" /><WhatsAppIcon className="w-5 h-5 ml-2 text-gray-600"/><span className="ml-2 text-sm">WhatsApp</span></label>
                    </div>
                 </div>

                 <div>
                    <label htmlFor="idea" className={labelClass}>
                        Ideias para a Mensagem (IA)
                    </label>
                    <textarea
                        id="idea"
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                        placeholder="Ex: festa de dia das crianças na próxima sexta, 14h. Trazer um prato de doce ou salgado."
                    />
                    <div className="mt-2">
                        <Button type="button" variant="secondary" onClick={handleGenerateMessage} disabled={isGenerating}>
                            {isGenerating ? (
                                <SpinnerIcon className="w-5 h-5 mr-2" />
                            ) : (
                                <SparklesIcon className="w-5 h-5 mr-2" />
                            )}
                            {isGenerating ? 'Gerando...' : 'Gerar Mensagem com IA'}
                        </Button>
                    </div>
                </div>

                 <div>
                    <label htmlFor="subject" className={labelClass}>Assunto</label>
                    <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="message" className={labelClass}>Mensagem</label>
                    <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} required rows={6} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"></textarea>
                </div>
                 {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <SpinnerIcon className="w-5 h-5" /> : 'Enviar Mensagem'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};