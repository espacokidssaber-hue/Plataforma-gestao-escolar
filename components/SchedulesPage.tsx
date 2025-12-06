import React, { useState, useMemo, useEffect } from 'react';
import { type User, type Schedule, type ScheduleTimeSlot, type Staff, UserRole, School, SchoolClass } from '../types';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { PlusIcon } from './icons/PlusIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { PrinterIcon } from './icons/PrinterIcon';
import { RectangleStackIcon } from './icons/RectangleStackIcon';

const weekDays = {
    monday: 'Segunda',
    tuesday: 'Terça',
    wednesday: 'Quarta',
    thursday: 'Quinta',
    friday: 'Sexta',
};

const emptySchedule: Schedule['schedule'] = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
};

const ScheduleCard: React.FC<{
    schedule: Schedule;
    onEdit: (schedule: Schedule) => void;
    onDelete: (id: string) => void;
    onPrint: (schedule: Schedule) => void;
}> = ({ schedule, onEdit, onDelete, onPrint }) => {

    const hasAnySchedule = useMemo(() => {
        if (!schedule || !schedule.schedule) return false;
        return Object.values(schedule.schedule).some(daySlots => Array.isArray(daySlots) && daySlots.some(slot => slot?.activity));
    }, [schedule]);
    
    const timeIntervals = useMemo(() => {
        if (!schedule?.schedule) return [];

        const allSlots = Object.values(schedule.schedule).flat();
        const validSlots = allSlots.filter((s: any): s is ScheduleTimeSlot => s && typeof s.startTime === 'string' && typeof s.endTime === 'string');
        
        const intervals = validSlots.map(s => `${s.startTime} - ${s.endTime}`);
        
        return [...new Set(intervals)].sort((a, b) => {
            const aStart = a.split(' - ')[0];
            const bStart = b.split(' - ')[0];
            if (!aStart || !bStart) return 0;
            return aStart.localeCompare(bStart);
        });
    }, [schedule]);


    return (
        <div className="bg-white rounded-lg shadow-md border overflow-hidden transition-shadow hover:shadow-xl flex flex-col">
            <div className="p-4 flex justify-between items-start bg-gray-50/70 border-b">
                <h3 className="font-bold text-lg text-gray-800 leading-tight">{schedule.name}</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="secondary" className="!p-2" onClick={() => onPrint(schedule)} title="Imprimir">
                        <PrinterIcon className="w-4 h-4 text-gray-600" />
                    </Button>
                    <Button variant="secondary" className="!p-2" onClick={() => onEdit(schedule)} title="Editar">
                        <PencilIcon className="w-4 h-4 text-gray-600" />
                    </Button>
                    <Button variant="secondary" className="!p-2 !bg-red-50 hover:!bg-red-100" onClick={() => onDelete(schedule.id)} title="Excluir">
                        <TrashIcon className="w-4 h-4 text-red-600" />
                    </Button>
                </div>
            </div>
            
            {hasAnySchedule ? (
                 <div className="p-4 sm:p-6 overflow-x-auto">
                    <table className="w-full border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="p-2 border text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Horário</th>
                                {Object.values(weekDays).map(dayName => (
                                    <th key={dayName} className="p-2 border text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{dayName}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {timeIntervals.map(interval => (
                                <tr key={interval}>
                                    <td className="p-2 border align-middle font-medium text-xs text-center text-gray-600">
                                        {interval}
                                    </td>
                                    {Object.keys(weekDays).map(dayKey => {
                                        const dayKeyTyped = dayKey as keyof typeof weekDays;
                                        const daySchedule = schedule.schedule[dayKeyTyped];
                                        const slot = Array.isArray(daySchedule) 
                                            ? daySchedule.find(s => s && s.startTime && s.endTime && `${s.startTime} - ${s.endTime}` === interval)
                                            : undefined;

                                        return (
                                            <td key={`${interval}-${dayKey}`} className="p-1.5 border align-top min-h-[60px]">
                                                {slot && slot.activity ? (
                                                    <div className="bg-teal-50 border-l-4 border-teal-500 rounded-md p-2 h-full w-full shadow-sm flex items-center justify-center text-center min-h-[50px]">
                                                        <p className="text-sm font-semibold text-gray-800 break-words">{slot.activity}</p>
                                                    </div>
                                                ) : null}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-gray-500 py-8">Nenhum horário definido.</p>
            )}
        </div>
    );
};

const ScheduleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (scheduleData: Omit<Schedule, 'id' | 'schoolId'> & { schoolId?: string }, scheduleId?: string) => Promise<void>;
    schedule: Schedule | null;
    staff: Staff[];
    classes: SchoolClass[];
    user: User;
    schools: School[];
}> = ({ isOpen, onClose, onSave, schedule, staff, classes, user, schools }) => {
    const [type, setType] = useState<'class' | 'educator'>('class');
    const [name, setName] = useState('');
    const [timeSlots, setTimeSlots] = useState<Schedule['schedule']>(emptySchedule);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedSchoolId, setSelectedSchoolId] = useState('');

     const availableClassesForSchool = useMemo(() => {
        const schoolId = user.role === UserRole.SUPER_ADMINISTRADOR ? selectedSchoolId : user.schoolId;
        if (!schoolId) return [];
        return classes.filter(c => c.schoolId === schoolId);
    }, [classes, selectedSchoolId, user]);

    const availableStaffForSchool = useMemo(() => {
        const schoolId = user.role === UserRole.SUPER_ADMINISTRADOR ? selectedSchoolId : user.schoolId;
        if (!schoolId) return [];
        return staff.filter(s => s.schoolId === schoolId);
    }, [staff, selectedSchoolId, user]);

    useEffect(() => {
        if (isOpen) {
            const schoolId = user.role === UserRole.SUPER_ADMINISTRADOR 
                ? (schedule?.schoolId || schools[0]?.id || '')
                : user.schoolId || '';
            
            if (schedule) {
                setType(schedule.type);
                setName(schedule.name);
                setTimeSlots(schedule.schedule || emptySchedule);
                setSelectedSchoolId(schedule.schoolId);
            } else {
                setType('class');
                setName('');
                setTimeSlots(emptySchedule);
                setSelectedSchoolId(schoolId);
            }
        }
    }, [schedule, isOpen, schools, user]);

    const handleTimeSlotChange = (day: keyof typeof weekDays, index: number, field: 'startTime' | 'endTime' | 'activity', value: string) => {
        const daySlots = timeSlots[day] || [];
        const updatedDaySlots = daySlots.map((slot, i) =>
            i === index ? { ...slot, [field]: value } : slot
        );
        setTimeSlots(prev => ({ ...prev, [day]: updatedDaySlots.sort((a: ScheduleTimeSlot, b: ScheduleTimeSlot) => (a.startTime || '').localeCompare(b.startTime || '')) }));
    };
    
    const handleAddTimeSlot = (day: keyof typeof weekDays) => {
        const newSlot: ScheduleTimeSlot = { id: `slot-${Date.now()}`, startTime: '', endTime: '', activity: '' };
        const daySlots = timeSlots[day] || [];
        setTimeSlots(prev => ({ ...prev, [day]: [...daySlots, newSlot] }));
    };

    const handleRemoveTimeSlot = (day: keyof typeof weekDays, index: number) => {
        const daySlots = timeSlots[day] || [];
        const updatedDaySlots = daySlots.filter((_, i) => i !== index);
        setTimeSlots(prev => ({ ...prev, [day]: updatedDaySlots }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: Omit<Schedule, 'id' | 'schoolId'> & { schoolId?: string } = { type, name, schedule: timeSlots };
        if (user.role === UserRole.SUPER_ADMINISTRADOR) {
            if (!selectedSchoolId) {
                alert("Super Administrador deve selecionar uma escola.");
                return;
            }
            payload.schoolId = selectedSchoolId;
        }
        setIsSubmitting(true);
        let success = false;
        try {
            await onSave(payload, schedule?.id);
            success = true;
        } catch (error) {
            console.error("Failed to save schedule:", error);
        } finally {
            setIsSubmitting(false);
            if (success) {
                onClose();
            }
        }
    };

    const nameOptions = type === 'class' ? availableClassesForSchool.map(c => c.name) : availableStaffForSchool.map(s => s.fullName);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={schedule ? 'Editar Horário' : 'Criar Novo Horário'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 {user.role === UserRole.SUPER_ADMINISTRADOR ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Escola</label>
                        <select value={selectedSchoolId} onChange={e => setSelectedSchoolId(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
                            <option value="" disabled>Selecione...</option>
                            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                 ) : (
                    user.schoolId && (
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Instituição</label>
                            <input
                                type="text"
                                value={schools.find(s => s.id === user.schoolId)?.name || ''}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm bg-gray-100"
                                disabled
                            />
                        </div>
                    )
                 )}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo</label>
                        <select value={type} onChange={e => { setType(e.target.value as any); setName(''); }} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
                            <option value="class">Turma</option>
                            <option value="educator">Educador(a)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{type === 'class' ? 'Nome da Turma' : 'Nome do(a) Educador(a)'}</label>
                        <select value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
                            <option value="" disabled>Selecione...</option>
                            {nameOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                    {Object.keys(weekDays).map(day => (
                        <div key={day} className="border p-3 rounded-md bg-gray-50/50">
                            <h3 className="font-semibold text-gray-800">{weekDays[day as keyof typeof weekDays]}</h3>
                            {(timeSlots[day as keyof typeof weekDays] || []).map((slot, index) => (
                                <div key={slot.id} className="flex items-center gap-2 mt-2">
                                    <input type="time" value={slot.startTime} onChange={e => handleTimeSlotChange(day as keyof typeof weekDays, index, 'startTime', e.target.value)} required className="block w-24 rounded-md border-gray-300 shadow-sm sm:text-sm"/>
                                    <input type="time" value={slot.endTime} onChange={e => handleTimeSlotChange(day as keyof typeof weekDays, index, 'endTime', e.target.value)} required className="block w-24 rounded-md border-gray-300 shadow-sm sm:text-sm"/>
                                    <input type="text" placeholder="Atividade" value={slot.activity} onChange={e => handleTimeSlotChange(day as keyof typeof weekDays, index, 'activity', e.target.value)} required className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/>
                                    <button type="button" onClick={() => handleRemoveTimeSlot(day as keyof typeof weekDays, index)} className="p-2 text-gray-400 hover:text-red-600 rounded-full transition-colors">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            ))}
                             <Button type="button" variant="secondary" onClick={() => handleAddTimeSlot(day as keyof typeof weekDays)} className="mt-2 text-xs !py-1">
                                <PlusIcon className="w-3 h-3 mr-1" /> Adicionar Horário
                            </Button>
                        </div>
                    ))}
                </div>
                 <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <SpinnerIcon className="w-5 h-5"/> : 'Salvar Horário'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export const SchedulesPage: React.FC<{
    user: User;
    schedules: Schedule[];
    staff: Staff[];
    classes: SchoolClass[];
    schools: School[];
    onSaveSchedule: (scheduleData: Omit<Schedule, 'id' | 'schoolId'> & { schoolId?: string }, scheduleId?: string) => Promise<void>;
    onDeleteSchedule: (scheduleId: string) => Promise<void>;
    onPrintSchedule: (schedule: Schedule) => void;
}> = ({ user, schedules, staff, classes, schools, onSaveSchedule, onDeleteSchedule, onPrintSchedule }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [activeTab, setActiveTab] = useState<'class' | 'educator'>('class');
    
    const { classSchedules, educatorSchedules } = useMemo(() => {
        const sorted = [...schedules].sort((a,b) => (a.name || '').localeCompare(b.name || ''));
        return {
            classSchedules: sorted.filter(s => s.type === 'class'),
            educatorSchedules: sorted.filter(s => s.type === 'educator'),
        };
    }, [schedules]);

    const handleOpenModal = (schedule: Schedule | null = null) => {
        setEditingSchedule(schedule);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este horário?')) {
            await onDeleteSchedule(id);
        }
    };

    const activeList = activeTab === 'class' ? classSchedules : educatorSchedules;

    return (
        <>
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Horários Escolares</h1>
                        <p className="text-gray-600 mt-1">Crie e gerencie os horários das turmas e dos educadores.</p>
                    </div>
                    <Button onClick={() => handleOpenModal()}>
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Criar Novo Horário
                    </Button>
                </div>

                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('class')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'class' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Horários das Turmas
                        </button>
                        <button onClick={() => setActiveTab('educator')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'educator' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Horários dos Educadores
                        </button>
                    </nav>
                </div>
                
                {activeList.length > 0 ? (
                    <div className="space-y-6">
                        {activeList.map(schedule => (
                            <ScheduleCard 
                                key={schedule.id} 
                                schedule={schedule} 
                                onEdit={handleOpenModal}
                                onDelete={handleDelete}
                                onPrint={onPrintSchedule}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
                        <RectangleStackIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">Nenhum Horário Cadastrado</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Clique em "Criar Novo Horário" para adicionar o primeiro horário para {activeTab === 'class' ? 'uma turma' : 'um educador'}.
                        </p>
                    </div>
                )}
            </div>
            
            <ScheduleModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingSchedule(null); }}
                onSave={onSaveSchedule}
                schedule={editingSchedule}
                staff={staff}
                classes={classes}
                user={user}
                schools={schools}
            />
        </>
    );
};