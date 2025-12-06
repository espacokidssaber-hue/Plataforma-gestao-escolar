import React, { useState, useMemo, useEffect } from 'react';
import { type User, type SchoolClass, UserRole, School } from '../types';
import { CLASS_LEVELS, CLASS_PERIODS } from '../constants';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { PlusIcon } from './icons/PlusIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { RectangleGroupIcon } from './icons/RectangleGroupIcon';

const ClassModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (classData: Omit<SchoolClass, 'id' | 'schoolId'> & { schoolId?: string }, classId?: string) => Promise<void>;
    classData: SchoolClass | null;
    user: User;
    schools: School[];
    superAdminSchoolFilter: string;
}> = ({ isOpen, onClose, onSave, classData, user, schools, superAdminSchoolFilter }) => {
    const initialFormState = {
        name: '',
        period: CLASS_PERIODS[0] as SchoolClass['period'],
        level: CLASS_LEVELS[0] as SchoolClass['level'],
        baseMonthlyFee: '',
        capacity: '20' // Default capacity
    };
    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedSchoolId, setSelectedSchoolId] = useState('');

    useEffect(() => {
        if (isOpen) {
             const schoolId = user.role === UserRole.SUPER_ADMINISTRADOR 
                ? (superAdminSchoolFilter !== 'all' ? superAdminSchoolFilter : (schools[0]?.id || ''))
                : user.schoolId || '';

            if (classData) {
                setFormData({
                    name: classData.name,
                    period: classData.period,
                    level: classData.level,
                    baseMonthlyFee: classData.baseMonthlyFee.toString(),
                    capacity: (classData.capacity || 20).toString(),
                });
                setSelectedSchoolId(classData.schoolId);
            } else {
                setFormData(initialFormState);
                setSelectedSchoolId(schoolId);
            }
        }
    }, [classData, isOpen, user, schools, superAdminSchoolFilter]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        let success = false;
        try {
            const payload: Omit<SchoolClass, 'id' | 'schoolId'> & { schoolId?: string } = {
                ...formData,
                baseMonthlyFee: parseFloat(formData.baseMonthlyFee) || 0,
                capacity: parseInt(formData.capacity) || 20
            };
            if (user.role === UserRole.SUPER_ADMINISTRADOR) {
                payload.schoolId = selectedSchoolId;
            }
            await onSave(payload, classData?.id);
            success = true;
        } catch (error) {
            console.error("Failed to save class:", error);
        } finally {
            setIsSubmitting(false);
            if (success) {
                onClose();
            }
        }
    };

    const inputClass = "mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm disabled:bg-gray-100";
    const labelClass = "block text-sm font-medium text-gray-700";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={classData ? 'Editar Turma' : 'Criar Nova Turma'}>
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
                            <option value="" disabled>-- Selecione uma escola --</option>
                            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
                 <div>
                    <label htmlFor="name" className={labelClass}>Nome da Turma</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputClass} required placeholder="Ex: Maternal I - Manhã" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="level" className={labelClass}>Nível de Ensino</label>
                        <select name="level" id="level" value={formData.level} onChange={handleChange} className={inputClass} required>
                            {CLASS_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="period" className={labelClass}>Período</label>
                        <select name="period" id="period" value={formData.period} onChange={handleChange} className={inputClass} required>
                            {CLASS_PERIODS.map(period => <option key={period} value={period}>{period}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="baseMonthlyFee" className={labelClass}>Mensalidade Base (R$)</label>
                        <input type="number" name="baseMonthlyFee" id="baseMonthlyFee" value={formData.baseMonthlyFee} onChange={handleChange} className={inputClass} required min="0" step="0.01" placeholder="Ex: 1250.00" />
                    </div>
                    <div>
                        <label htmlFor="capacity" className={labelClass}>Capacidade Máxima</label>
                        <input type="number" name="capacity" id="capacity" value={formData.capacity} onChange={handleChange} className={inputClass} required min="1" placeholder="Ex: 20" />
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <SpinnerIcon className="w-5 h-5"/> : 'Salvar Turma'}</Button>
                </div>
            </form>
        </Modal>
    );
};

export const ClassesPage: React.FC<{
  user: User;
  classes: SchoolClass[];
  schools: School[];
  onSaveClass: (classData: Omit<SchoolClass, 'id' | 'schoolId'> & { schoolId?: string }, classId?: string) => Promise<void>;
  onDeleteClass: (classId: string) => void;
  superAdminSchoolFilter: string;
}> = ({ user, classes, schools, onSaveClass, onDeleteClass, superAdminSchoolFilter }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

    const handleOpenModal = (classData: SchoolClass | null = null) => {
        setEditingClass(classData);
        setIsModalOpen(true);
    };

    const handleDelete = (classId: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta turma?')) {
            onDeleteClass(classId);
        }
    };
    
    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <>
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestão de Turmas</h1>
                        <p className="text-gray-600 mt-1">Crie e gerencie as turmas e mensalidades da escola.</p>
                    </div>
                    <Button onClick={() => handleOpenModal()}>
                        <PlusIcon className="w-5 h-5 mr-2" /> Criar Nova Turma
                    </Button>
                </div>

                 <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    {classes.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome da Turma</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nível</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidade</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensalidade Base</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {classes.map(cls => (
                                    <tr key={cls.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{cls.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.level}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.period}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.capacity || 20} Alunos</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{formatCurrency(cls.baseMonthlyFee)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                             <Button variant="secondary" className="!p-2" onClick={() => handleOpenModal(cls)}><PencilIcon className="w-4 h-4" /></Button>
                                             <Button variant="secondary" className="!p-2 !bg-red-50 hover:!bg-red-100" onClick={() => handleDelete(cls.id)}><TrashIcon className="w-4 h-4 text-red-600" /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     ) : (
                         <div className="text-center py-16 px-6">
                            <RectangleGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">Nenhuma Turma Cadastrada</h3>
                            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                                Clique em "Criar Nova Turma" para adicionar a primeira turma da escola.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <ClassModal
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setEditingClass(null); }}
                    onSave={onSaveClass}
                    classData={editingClass}
                    user={user}
                    schools={schools}
                    superAdminSchoolFilter={superAdminSchoolFilter}
                />
            )}
        </>
    );
};