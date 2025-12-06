import React, { useState, useMemo, Fragment, useEffect, useRef } from 'react';
import { type User, type CalendarEvent, UserRole, type School } from '../types';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { PlusIcon } from './icons/PlusIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { TrashIcon } from './icons/TrashIcon';
import { AlertIcon } from './icons/AlertIcon';

const EventBadge: React.FC<{ event: CalendarEvent, onClick: () => void }> = ({ event, onClick }) => {
    const typeClasses = {
        holiday: 'bg-red-100 text-red-800 hover:bg-red-200',
        event: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        reminder: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
    };
    return (
        <button onClick={onClick} className={`w-full text-left text-xs px-1.5 py-0.5 rounded-md truncate ${typeClasses[event.type]}`}>
            {event.title}
        </button>
    );
};

const EventModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<CalendarEvent, 'id'|'schoolId'|'createdBy'>, eventId?: string, schoolId?: string) => Promise<void>;
    onDelete: (eventId: string) => Promise<void>;
    event: Partial<CalendarEvent> | null;
    isAuthorized: boolean;
    user: User;
    schools: School[];
}> = ({ isOpen, onClose, onSave, onDelete, event, isAuthorized, user, schools }) => {
    const [formData, setFormData] = useState({
        date: '',
        title: '',
        type: 'event' as 'event' | 'holiday' | 'reminder',
        description: '',
    });
    const [selectedSchoolId, setSelectedSchoolId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            const initial = {
                date: new Date().toISOString().split('T')[0],
                title: '',
                type: 'event' as 'event' | 'holiday' | 'reminder',
                description: '',
            };
            setFormData({
                date: event?.date || initial.date,
                title: event?.title || initial.title,
                type: event?.type || initial.type,
                description: event?.description || initial.description,
            });
            
            if (user.role === UserRole.SUPER_ADMINISTRADOR) {
                const eventSchoolId = (event as CalendarEvent)?.schoolId;
                setSelectedSchoolId(eventSchoolId || (schools.length > 0 ? schools[0].id : ''));
            } else {
                setSelectedSchoolId(user.schoolId || '');
            }

        }
    }, [isOpen, event, user, schools]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        let success = false;
        try {
            await onSave(formData, event?.id, selectedSchoolId);
            success = true;
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao salvar o evento.');
        } finally {
            setIsSubmitting(false);
            if (success) {
                onClose();
            }
        }
    };

    const handleDeleteClick = async () => {
        if (!event?.id) return;
        setIsDeleting(true);
        setError('');
        try {
            await onDelete(event.id);
            onClose();
        } catch (err: any) {
             setError(err.message || 'Ocorreu um erro ao excluir o evento.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={event?.id ? 'Editar Evento' : 'Adicionar Evento'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 {isAuthorized && user.role === UserRole.SUPER_ADMINISTRADOR && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Escola</label>
                        <select 
                            name="schoolId" 
                            value={selectedSchoolId} 
                            onChange={(e) => setSelectedSchoolId(e.target.value)} 
                            required 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm disabled:bg-gray-100"
                            disabled={!isAuthorized || !!event?.id}
                        >
                            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        {!!event?.id && <p className="text-xs text-gray-500 mt-1">A escola de um evento existente não pode ser alterada.</p>}
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Data</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} required readOnly={!isAuthorized} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm disabled:bg-gray-100" disabled={!isAuthorized} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Título</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required readOnly={!isAuthorized} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm disabled:bg-gray-100" disabled={!isAuthorized} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <select name="type" value={formData.type} onChange={handleChange} required disabled={!isAuthorized} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm disabled:bg-gray-100">
                        <option value="event">Evento</option>
                        <option value="holiday">Feriado</option>
                        <option value="reminder">Lembrete</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Descrição (Opcional)</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} readOnly={!isAuthorized} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm disabled:bg-gray-100" disabled={!isAuthorized}></textarea>
                </div>
                
                {error && <div className="bg-red-100 text-red-800 text-sm p-3 rounded-md">{error}</div>}

                <div className="flex justify-between items-center pt-4">
                     {isAuthorized && event?.id && (
                        <Button type="button" variant="secondary" className="!bg-red-100 !text-red-700 hover:!bg-red-200" onClick={handleDeleteClick} disabled={isDeleting || isSubmitting}>
                            {isDeleting ? <SpinnerIcon className="w-4 h-4 mr-2" /> : <TrashIcon className="w-4 h-4 mr-2" />}
                            {isDeleting ? 'Excluindo...' : 'Excluir'}
                        </Button>
                    )}
                    <div className="flex-grow flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting || isDeleting}>Fechar</Button>
                        {isAuthorized && <Button type="submit" disabled={isSubmitting || isDeleting}>
                           {isSubmitting && <SpinnerIcon className="w-5 h-5 mr-2" />}
                           {isSubmitting ? 'Salvando...' : (event?.id ? 'Salvar Alterações' : 'Criar Evento')}
                        </Button>}
                    </div>
                </div>
            </form>
        </Modal>
    );
};

const ImportCalendarModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onImport: (file: File, schoolIdOrAll: string, year: number) => Promise<void>;
    year: number;
    user: User;
    schools: School[];
}> = ({ isOpen, onClose, onImport, year, user, schools }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [message, setMessage] = useState<{ type: 'info' | 'success' | 'error', text: string } | null>(null);
    const [yearForImport, setYearForImport] = useState(year);
    const [selectedSchoolId, setSelectedSchoolId] = useState('all');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const isGlobalImport = user.role === UserRole.SUPER_ADMINISTRADOR && selectedSchoolId === 'all';
    const schoolName = !isGlobalImport ? schools.find(s => s.id === (user.role === UserRole.SUPER_ADMINISTRADOR ? selectedSchoolId : user.schoolId))?.name : undefined;


    useEffect(() => {
        if (isOpen) {
            setFile(null);
            setIsImporting(false);
            setMessage(null);
            setYearForImport(year);
            setSelectedSchoolId('all');
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }, [isOpen, year]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== 'application/pdf') {
                setMessage({ type: 'error', text: 'Por favor, selecione um arquivo PDF.' });
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            setFile(selectedFile);
            setMessage(null);

            const match = selectedFile.name.match(/(\d{4})/);
            if (match && match[0]) {
                const yearFromFile = parseInt(match[0], 10);
                if (yearFromFile > 2000 && yearFromFile < 2100) {
                    setYearForImport(yearFromFile);
                }
            }
        }
    };

    const handleImport = async () => {
        if (!file) {
            setMessage({ type: 'error', text: 'Nenhum arquivo selecionado.' });
            return;
        }

        let schoolIdTarget: string;

        if (user.role === UserRole.SUPER_ADMINISTRADOR) {
            schoolIdTarget = selectedSchoolId;
            if (schoolIdTarget === 'all' && schools.length === 0) {
                setMessage({ type: 'error', text: 'Não há escolas cadastradas para uma importação global.' });
                return;
            }
        } else {
            if (!user.schoolId) {
                setMessage({ type: 'error', text: 'Seu usuário não está vinculado a uma escola para realizar a importação.' });
                return;
            }
            schoolIdTarget = user.schoolId;
        }

        setIsImporting(true);
        setMessage({ type: 'info', text: 'Analisando o PDF e importando eventos. Isso pode levar um momento...' });
        let success = false;
        try {
            await onImport(file, schoolIdTarget, yearForImport);
            setMessage({ type: 'success', text: 'Calendário importado com sucesso!' });
            success = true;
        } catch (error) {
            console.error("Erro na importação: ", error);
            const errorMessage = (error instanceof Error) ? error.message : 'Ocorreu um erro desconhecido.';
            setMessage({ type: 'error', text: `Falha na importação: ${errorMessage}. Verifique o formato do arquivo ou tente novamente.` });
        } finally {
            setIsImporting(false);
            if (success) {
                setTimeout(onClose, 1500);
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Importar Calendário de PDF">
            <div className="space-y-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                             <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.01-1.742 3.01H4.42c-1.53 0-2.493-1.676-1.743-3.01l5.58-9.92zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                Atenção: A importação substituirá todos os eventos existentes para o ano de <span className="font-bold">{yearForImport}</span>.
                                {isGlobalImport ? (
                                    <span className="font-bold block mt-1">Esta ação será aplicada a TODAS as escolas cadastradas.</span>
                                ) : (
                                    <span className="font-bold block mt-1">Escola afetada: {schoolName}.</span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {user.role === UserRole.SUPER_ADMINISTRADOR && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Escola de Destino</label>
                        <select
                            value={selectedSchoolId}
                            onChange={e => setSelectedSchoolId(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                        >
                            <option value="all">Importar para TODAS as escolas</option>
                            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Arquivo PDF</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                             <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500">
                                    <span>Selecione um arquivo</span>
                                    <input ref={fileInputRef} id="file-upload" type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">{file ? file.name : 'Apenas PDF'}</p>
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={`flex items-center text-sm p-3 rounded-md ${
                        message.type === 'info' ? 'bg-blue-100 text-blue-800' :
                        message.type === 'success' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                        {message.type === 'info' && <SpinnerIcon className="w-5 h-5 mr-2" />}
                        {message.text}
                    </div>
                )}
            </div>

            <div className="mt-8 flex justify-end gap-3">
                <Button variant="secondary" onClick={onClose} disabled={isImporting}>Cancelar</Button>
                <Button onClick={handleImport} disabled={!file || isImporting}>
                    {isImporting ? <SpinnerIcon className="w-5 h-5" /> : 'Confirmar Importação'}
                </Button>
            </div>
        </Modal>
    );
};

interface CalendarPageProps {
  user: User;
  events: CalendarEvent[];
  onImportCalendar: (file: File, schoolIdOrAll: string, year: number) => Promise<void>;
  onAddOrUpdateEvent: (event: Omit<CalendarEvent, 'id' | 'schoolId' | 'createdBy'>, eventId?: string, schoolId?: string) => Promise<void>;
  onDeleteEvent: (eventId: string) => Promise<void>;
  schools: School[];
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ user, events, onImportCalendar, onAddOrUpdateEvent, onDeleteEvent, schools }) => {
    const [currentDate, setCurrentDate] = useState(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });

    const [modalEvent, setModalEvent] = useState<Partial<CalendarEvent> | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const canEdit = useMemo(() => {
        return user.role === UserRole.SUPER_ADMINISTRADOR || user.role === UserRole.ADMINISTRADOR || user.role === UserRole.SECRETARIA;
    }, [user]);

    const isPrivilegedUser = user.role === UserRole.ADMINISTRADOR || user.role === UserRole.SECRETARIA || user.role === UserRole.SUPER_ADMINISTRADOR;

    const eventsByDate = useMemo(() => {
        return events.reduce((acc, event) => {
            const date = event.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(event);
            return acc;
        }, {} as Record<string, CalendarEvent[]>);
    }, [events]);
    
    const { month, year } = { month: currentDate.getMonth(), year: currentDate.getFullYear() };
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    const calendarGrid = useMemo(() => {
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const grid = [];
        
        for (let i = 0; i < firstDayOfMonth; i++) {
            grid.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            grid.push(new Date(year, month, i));
        }
        return grid;
    }, [month, year]);
    
    const handleOpenModal = (event: Partial<CalendarEvent>) => {
        setModalEvent(event);
    };

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            {user.role === UserRole.SUPER_ADMINISTRADOR && schools.length === 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertIcon className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                Ação necessária: Para gerenciar calendários, primeiro cadastre uma instituição em{' '}
                                <span className="font-semibold">Configurações &gt; Gestão de Instituições</span>.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <header className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                     <h1 className="text-2xl font-bold text-gray-800 w-48 text-center">{monthNames[month]} de {year}</h1>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                    <button onClick={() => setCurrentDate(new Date())} className="ml-2 text-sm font-semibold text-teal-600 hover:text-teal-800">Hoje</button>
                </div>
                {isPrivilegedUser && (
                    <div className="flex items-center gap-2">
                        <Button 
                            onClick={() => handleOpenModal({ date: new Date().toISOString().split('T')[0] })} 
                            disabled={!canEdit || (user.role === UserRole.SUPER_ADMINISTRADOR && schools.length === 0)}
                            title={
                                !canEdit ? 'Você não tem permissão para adicionar eventos.' :
                                (user.role === UserRole.SUPER_ADMINISTRADOR && schools.length === 0) ? 'Cadastre uma escola em Configurações para adicionar eventos.' : 'Adicionar Evento'
                            }
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Adicionar Evento
                        </Button>
                        <Button 
                            onClick={() => setIsImportModalOpen(true)} 
                        >
                            Importar Calendário (PDF)
                        </Button>
                    </div>
                )}
            </header>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-500 text-sm mb-2">
                    {weekDays.map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {calendarGrid.map((day, index) => {
                        if (!day) return <div key={`empty-${index}`} className="border rounded-lg bg-gray-50"></div>;

                        const dayOfMonth = day.getDate();
                        const today = new Date();
                        const isToday = day.toDateString() === today.toDateString();
                        const dateString = `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, '0')}-${dayOfMonth.toString().padStart(2, '0')}`;
                        const dayEvents = eventsByDate[dateString] || [];

                        return (
                            <div key={dayOfMonth} className="border rounded-lg h-32 p-1.5 flex flex-col">
                                <time dateTime={dateString} className={`text-sm font-semibold ${isToday ? 'bg-teal-500 text-white rounded-full h-6 w-6 flex items-center justify-center' : 'text-gray-700'}`}>{dayOfMonth}</time>
                                <div className="mt-1 flex-grow space-y-1 overflow-y-auto">
                                    {dayEvents.map(event => <EventBadge key={event.id} event={event} onClick={() => handleOpenModal(event)} />)}
                                </div>
                                {isPrivilegedUser && (
                                    <button
                                        onClick={() => handleOpenModal({ date: dateString })}
                                        disabled={!canEdit || (user.role === UserRole.SUPER_ADMINISTRADOR && schools.length === 0)}
                                        title={
                                            !canEdit ? 'Você não tem permissão para adicionar eventos' : 
                                            (user.role === UserRole.SUPER_ADMINISTRADOR && schools.length === 0) ? 'Cadastre uma escola em Configurações para adicionar eventos.' : 'Adicionar evento'
                                        }
                                        className="mt-auto pt-1 w-full text-center text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 p-1 rounded-md flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                    >
                                        <PlusIcon className="w-3 h-3 mr-1" />
                                        Adicionar
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {modalEvent && (
                 <EventModal
                    isOpen={!!modalEvent}
                    onClose={() => setModalEvent(null)}
                    onSave={onAddOrUpdateEvent}
                    onDelete={onDeleteEvent}
                    event={modalEvent}
                    isAuthorized={canEdit}
                    user={user}
                    schools={schools}
                />
            )}

            <ImportCalendarModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={onImportCalendar}
                year={year}
                user={user}
                schools={schools}
            />
        </div>
    );
};