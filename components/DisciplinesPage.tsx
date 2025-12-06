import React, { useState, useMemo, useEffect } from 'react';
import { type User, type Discipline, type Staff, type SchoolClass, UserRole, School } from '../types';
import { AVAILABLE_SUBJECTS } from '../constants';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { PlusIcon } from './icons/PlusIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';

// Modal component
const DisciplineModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any, id?: string) => Promise<void>;
    discipline: Discipline | null;
    staff: Staff[];
    classes: SchoolClass[];
    user: User;
    schools: School[];
    superAdminSchoolFilter: string;
}> = ({ isOpen, onClose, onSave, discipline, staff, classes, user, schools, superAdminSchoolFilter }) => {
    const initialFormState = {
        name: AVAILABLE_SUBJECTS[0] || '',
        teacherId: '',
        classNames: [],
    };
    const [formData, setFormData] = useState(initialFormState as any);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedSchoolId, setSelectedSchoolId] = useState('');

    const schoolTeachers = useMemo(() => staff.filter(s => s.schoolId === selectedSchoolId && s.role === 'Professor(a)'), [staff, selectedSchoolId]);
    const schoolClasses = useMemo(() => classes.filter(c => c.schoolId === selectedSchoolId), [classes, selectedSchoolId]);

    useEffect(() => {
        if (isOpen) {
            const schoolId = user.role === UserRole.SUPER_ADMINISTRADOR 
                ? (superAdminSchoolFilter !== 'all' ? superAdminSchoolFilter : (schools[0]?.id || ''))
                : user.schoolId || '';
            
            if (discipline) {
                setFormData({
                    name: discipline.name,
                    teacherId: discipline.teacherId,
                    classNames: discipline.classNames || [],
                });
                setSelectedSchoolId(discipline.schoolId);
            } else {
                setFormData(initialFormState);
                setSelectedSchoolId(schoolId);
            }
        }
    }, [discipline, isOpen, user, schools, superAdminSchoolFilter]);

    const handleClassNamesChange = (className: string) => {
        setFormData((prev: any) => {
            const newClassNames = prev.classNames.includes(className)
                ? prev.classNames.filter((c: string) => c !== className)
                : [...prev.classNames, className];
            return { ...prev, classNames: newClassNames };
        });
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        let success = false;
        try {
            const payload: any = { ...formData };
            if (user.role === UserRole.SUPER_ADMINISTRADOR) {
                payload.schoolId = selectedSchoolId;
            }
            await onSave(payload, discipline?.id);
            success = true;
        } catch (error) {
            console.error("Failed to save discipline:", error);
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
        <Modal isOpen={isOpen} onClose={onClose} title={discipline ? 'Editar Disciplina' : 'Criar Nova Disciplina'}>
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
                            <option value="" disabled>-- Selecione --</option>
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
                    <label htmlFor="name" className={labelClass}>Disciplina</label>
                    <select name="name" id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} required>
                        {AVAILABLE_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="teacherId" className={labelClass}>Professor(a) Responsável</label>
                    <select name="teacherId" id="teacherId" value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})} className={inputClass} required>
                        <option value="" disabled>Selecione um(a) professor(a)</option>
                        {schoolTeachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Turmas Associadas</label>
                    <div className="mt-2 max-h-40 overflow-y-auto space-y-2 rounded-md border p-3">
                        {schoolClasses.length > 0 ? schoolClasses.map(c => (
                            <label key={c.id} className="flex items-center">
                                <input type="checkbox" checked={formData.classNames.includes(c.name)} onChange={() => handleClassNamesChange(c.name)} className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                                <span className="ml-3 text-sm text-gray-600">{c.name}</span>
                            </label>
                        )) : <p className="text-sm text-gray-500">Nenhuma turma cadastrada para esta escola.</p>}
                    </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <SpinnerIcon className="w-5 h-5"/> : 'Salvar Disciplina'}</Button>
                </div>
            </form>
        </Modal>
    );
};

// Main page component
export const DisciplinesPage: React.FC<{
    user: User;
    disciplines: Discipline[];
    staff: Staff[];
    classes: SchoolClass[];
    schools: School[];
    onSaveDiscipline: (data: any, id?: string) => Promise<void>;
    onDeleteDiscipline: (id: string) => void;
    superAdminSchoolFilter: string;
}> = ({ user, disciplines, staff, classes, schools, onSaveDiscipline, onDeleteDiscipline, superAdminSchoolFilter }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);

    const handleOpenModal = (discipline: Discipline | null = null) => {
        setEditingDiscipline(discipline);
        setIsModalOpen(true);
    };

    const handleDelete = (disciplineId: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta disciplina? Isso pode afetar outros registros.')) {
            onDeleteDiscipline(disciplineId);
        }
    };
    
    const getTeacherName = (teacherId: string) => staff.find(s => s.id === teacherId)?.fullName || 'Não encontrado';
    
    return (
        <>
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestão de Disciplinas</h1>
                        <p className="text-gray-600 mt-1">Vincule disciplinas, professores e turmas.</p>
                    </div>
                    <Button onClick={() => handleOpenModal()}>
                        <PlusIcon className="w-5 h-5 mr-2" /> Adicionar Disciplina
                    </Button>
                </div>
                
                 <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    {disciplines.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disciplina</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Professor(a)</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turmas</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {disciplines.map(d => (
                                    <tr key={d.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{d.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getTeacherName(d.teacherId)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex flex-wrap gap-1">
                                                {d.classNames.map(cn => <span key={cn} className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">{cn}</span>)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                             <Button variant="secondary" className="!p-2" onClick={() => handleOpenModal(d)}><PencilIcon className="w-4 h-4" /></Button>
                                             <Button variant="secondary" className="!p-2 !bg-red-50 hover:!bg-red-100" onClick={() => handleDelete(d.id)}><TrashIcon className="w-4 h-4 text-red-600" /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     ) : (
                         <div className="text-center py-16 px-6">
                            <ClipboardDocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">Nenhuma Disciplina Cadastrada</h3>
                            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                                Clique em "Adicionar Disciplina" para cadastrar a primeira.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <DisciplineModal
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setEditingDiscipline(null); }}
                    onSave={onSaveDiscipline}
                    discipline={editingDiscipline}
                    user={user}
                    staff={staff}
                    classes={classes}
                    schools={schools}
                    superAdminSchoolFilter={superAdminSchoolFilter}
                />
            )}
        </>
    );
};