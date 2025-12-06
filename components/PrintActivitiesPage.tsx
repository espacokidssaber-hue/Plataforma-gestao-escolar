

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { type User, type PrintActivity, PrintActivityStatus, UserRole, School, SchoolClass } from '../types';
import { PRINT_STATUS_COLORS } from '../constants';
import { Button } from './ui/Button';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CloudArrowUpIcon } from './icons/CloudArrowUpIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { PrinterIcon } from './icons/PrinterIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

const UploadActivityForm: React.FC<{
    user: User;
    schools: School[];
    classes: SchoolClass[];
    onUpload: (data: any, file: File, schoolId?: string) => Promise<void>;
    superAdminSchoolFilter: string;
}> = ({ user, schools, classes, onUpload, superAdminSchoolFilter }) => {
    const [formData, setFormData] = useState({} as any);
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [selectedSchoolId, setSelectedSchoolId] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const availableClassesForSchool = useMemo(() => {
        const schoolId = user.role === UserRole.SUPER_ADMINISTRADOR ? selectedSchoolId : user.schoolId;
        if (!schoolId) return [];
        return classes.filter(c => c.schoolId === schoolId);
    }, [classes, selectedSchoolId, user]);
    
    useEffect(() => {
        const schoolId = user.role === UserRole.SUPER_ADMINISTRADOR 
            ? (superAdminSchoolFilter !== 'all' ? superAdminSchoolFilter : (schools[0]?.id || ''))
            : user.schoolId || '';
        
        setSelectedSchoolId(schoolId);
        
        const initialClasses = classes.filter(c => c.schoolId === schoolId);

        setFormData({
            title: '',
            className: initialClasses[0]?.name || '',
            copies: '',
            observations: '',
        });

    }, [user, schools, superAdminSchoolFilter, classes]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setMessage({ type: 'error', text: 'Por favor, selecione um arquivo PDF.' });
            return;
        }

        const schoolIdToSubmit = user.role === UserRole.SUPER_ADMINISTRADOR ? selectedSchoolId : user.schoolId;
        if (!schoolIdToSubmit) {
             setMessage({ type: 'error', text: 'Por favor, selecione uma escola.' });
            return;
        }
        setIsSubmitting(true);
        setMessage(null);
        try {
            await onUpload({ ...formData, copies: Number(formData.copies) }, file, schoolIdToSubmit);
            setMessage({ type: 'success', text: 'Atividade enviada para impressão com sucesso!' });
            setFormData({ title: '', className: availableClassesForSchool[0]?.name || '', copies: '', observations: ''});
            setFile(null);
            if(fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            setMessage({ type: 'error', text: 'Ocorreu um erro ao enviar a atividade.' });
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const inputClass = "mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm disabled:bg-gray-100";
    const labelClass = "block text-sm font-medium text-gray-700";
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Enviar Atividade para Impressão</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                 {user.role === UserRole.SUPER_ADMINISTRADOR ? (
                    <div>
                        <label htmlFor="schoolId" className={labelClass}>Escola</label>
                        <select
                            id="schoolId"
                            value={selectedSchoolId}
                            onChange={(e) => setSelectedSchoolId(e.target.value)}
                            className={inputClass}
                            required
                            disabled={superAdminSchoolFilter !== 'all'}
                        >
                            <option value="" disabled>-- Selecione a escola --</option>
                            {schools.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                 ) : (
                    user.schoolId && (
                        <div>
                            <label className={labelClass}>Instituição</label>
                            <input
                                type="text"
                                value={schools.find(s => s.id === user.schoolId)?.name || ''}
                                className={inputClass}
                                disabled
                            />
                        </div>
                    )
                 )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="title" className={labelClass}>Título da Atividade</label>
                        <input type="text" id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="className" className={labelClass}>Turma</label>
                        <select id="className" value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})} className={inputClass} required>
                            {availableClassesForSchool.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
                 <div>
                    <label htmlFor="copies" className={labelClass}>Número de Cópias</label>
                    <input type="number" id="copies" value={formData.copies} onChange={e => setFormData({...formData, copies: e.target.value})} className={inputClass} required min="1" />
                </div>
                <div>
                    <label className={labelClass}>Arquivo (PDF)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500">
                                    <span>Selecione um arquivo</span>
                                    <input ref={fileInputRef} id="file-upload" type="file" className="sr-only" accept=".pdf" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">{file ? file.name : 'PDF até 10MB'}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="observations" className={labelClass}>Observações (Opcional)</label>
                    <textarea id="observations" value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} className={inputClass} rows={3} placeholder="Ex: Imprimir frente e verso, em modo paisagem..." />
                </div>
                 {message && <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>}
                <div className="text-right">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <SpinnerIcon className="w-5 h-5" /> : 'Enviar'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

const PrintActivityCard: React.FC<{
    activity: PrintActivity;
    user: User;
    onUpdateStatus: (id: string, status: PrintActivityStatus) => Promise<void>;
}> = ({ activity, user, onUpdateStatus }) => {
    const isSecretaryOrAdmin = user.role !== UserRole.EDUCADORA;
    const statusColors = PRINT_STATUS_COLORS[activity.status];
    
    const handleUpdate = async () => {
        await onUpdateStatus(activity.id, PrintActivityStatus.PRINTED);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-gray-200">
            <div className="flex justify-between items-start gap-2">
                <div>
                    <p className="font-bold text-gray-800">{activity.title}</p>
                    <p className="text-sm text-gray-500">Para a turma: <span className="font-semibold text-teal-700">{activity.className}</span></p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors.bg} ${statusColors.text}`}>{activity.status}</span>
            </div>
            <div className="mt-3 border-t pt-3 space-y-2 text-sm">
                <p><span className="font-semibold">Cópias:</span> {activity.copies}</p>
                {activity.observations && <p><span className="font-semibold">Observações:</span> {activity.observations}</p>}
                <p className="text-xs text-gray-400">Enviado por: {activity.uploaderName} em {new Date(activity.uploadedAt).toLocaleString('pt-BR')}</p>
                 {activity.status === PrintActivityStatus.PRINTED && activity.printedBy && (
                    <p className="text-xs text-green-600">Impresso por: {activity.printedBy} em {new Date(activity.printedAt!).toLocaleString('pt-BR')}</p>
                 )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
                <a href={activity.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary">
                        <DocumentTextIcon className="w-4 h-4 mr-2" /> Ver PDF
                    </Button>
                </a>
                {isSecretaryOrAdmin && activity.status === PrintActivityStatus.PENDING && (
                    <Button onClick={handleUpdate}>
                        <CheckCircleIcon className="w-4 h-4 mr-2" /> Marcar como Impresso
                    </Button>
                )}
            </div>
        </div>
    );
};

export const PrintActivitiesPage: React.FC<{
  user: User;
  schools: School[];
  classes: SchoolClass[];
  printActivities: PrintActivity[];
  onUploadActivity: (activityData: any, file: File, schoolId?: string) => Promise<void>;
  onUpdateStatus: (activityId: string, newStatus: PrintActivityStatus) => Promise<void>;
  superAdminSchoolFilter: string;
}> = ({ user, schools, classes, printActivities, onUploadActivity, onUpdateStatus, superAdminSchoolFilter }) => {
    const [activeTab, setActiveTab] = useState<'pending' | 'printed'>('pending');

    const { pending, printed } = useMemo(() => {
        const sorted = [...printActivities].sort((a, b) => new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime());

        return {
            pending: sorted.filter(a => a.status === PrintActivityStatus.PENDING),
            printed: sorted.filter(a => a.status === PrintActivityStatus.PRINTED),
        };
    }, [printActivities]);

    const activeList = activeTab === 'pending' ? pending : printed;

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Atividades para Impressão</h1>
                <p className="text-gray-600 mt-1">
                    Envie suas atividades para impressão e acompanhe o status.
                </p>
            </div>

            <UploadActivityForm
                user={user}
                schools={schools}
                classes={classes}
                onUpload={onUploadActivity}
                superAdminSchoolFilter={superAdminSchoolFilter}
            />
            
            <div className="mt-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('pending')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'pending' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Pendentes <span className="bg-yellow-100 text-yellow-800 ml-2 py-0.5 px-2 rounded-full text-xs">{pending.length}</span>
                        </button>
                        <button onClick={() => setActiveTab('printed')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'printed' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Impressos <span className="bg-gray-100 text-gray-600 ml-2 py-0.5 px-2 rounded-full text-xs">{printed.length}</span>
                        </button>
                    </nav>
                </div>
                
                <div className="mt-6">
                    {activeList.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeList.map(activity => (
                                <PrintActivityCard key={activity.id} activity={activity} user={user} onUpdateStatus={onUpdateStatus} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
                            <PrinterIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">Nenhuma atividade nesta seção</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                {activeTab === 'pending' ? 'Não há solicitações de impressão pendentes no momento.' : 'Nenhuma atividade foi impressa ainda.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};