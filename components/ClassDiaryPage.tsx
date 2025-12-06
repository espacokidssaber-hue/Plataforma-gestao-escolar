import React, { useState, useMemo, useEffect } from 'react';
import { type User, type ClassDiaryEntry, UserRole, School, SchoolClass, type Discipline, type DiarioPrintData } from '../types';
import { AVAILABLE_SUBJECTS } from '../constants';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { PlusIcon } from './icons/PlusIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { PrinterIcon } from './icons/PrinterIcon';
import { DiarioPrintOptionsModal } from './DiarioPrintOptionsModal';

const EntryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any, schoolId?: string) => Promise<void>;
    entry: ClassDiaryEntry | null;
    user: User;
    schools: School[];
    classes: SchoolClass[];
}> = ({ isOpen, onClose, onSave, entry, user, schools, classes }) => {
    
    const [formData, setFormData] = useState({} as any);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedSchoolId, setSelectedSchoolId] = useState('');

    const availableClassesForSchool = useMemo(() => {
        const schoolId = user.role === UserRole.SUPER_ADMINISTRADOR ? selectedSchoolId : user.schoolId;
        if (!schoolId) return [];
        return classes.filter(c => c.schoolId === schoolId);
    }, [classes, selectedSchoolId, user]);
    
    useEffect(() => {
        if (isOpen) {
            const initialFormState = {
                classDate: new Date().toISOString().split('T')[0],
                className: '',
                subject: AVAILABLE_SUBJECTS[0] || '',
                topic: '',
                objective: '',
                methodology: '',
                resources: '',
                evaluation: '',
            };
            
            if (entry) {
                setFormData({
                    classDate: entry.classDate,
                    className: entry.className,
                    subject: entry.subject,
                    topic: entry.topic,
                    objective: entry.objective,
                    methodology: entry.methodology,
                    resources: entry.resources,
                    evaluation: entry.evaluation,
                });
                setSelectedSchoolId(entry.schoolId);
            } else {
                const schoolId = user.role === UserRole.SUPER_ADMINISTRADOR 
                    ? (schools[0]?.id || '')
                    : user.schoolId || '';
                setSelectedSchoolId(schoolId);
                const initialClasses = classes.filter(c => c.schoolId === schoolId);
                setFormData({ ...initialFormState, className: initialClasses[0]?.name || ''});
            }
        }
    }, [entry, isOpen, user, schools, classes]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        let success = false;
        try {
            const schoolIdToSubmit = user.role === UserRole.SUPER_ADMINISTRADOR ? selectedSchoolId : undefined;
            await onSave(formData, schoolIdToSubmit);
            success = true;
        } catch (error) {
            console.error("Failed to save diary entry:", error);
            // Em uma aplicação real, seria bom mostrar uma mensagem de erro no modal
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
        <Modal isOpen={isOpen} onClose={onClose} title={entry ? 'Editar Registro do Diário' : 'Novo Registro no Diário'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 {user.role === UserRole.SUPER_ADMINISTRADOR ? (
                    <div>
                        <label htmlFor="schoolId" className={labelClass}>Escola</label>
                        <select
                            name="schoolId"
                            id="schoolId"
                            value={selectedSchoolId}
                            onChange={(e) => setSelectedSchoolId(e.target.value)}
                            className={inputClass}
                            required
                            disabled={!!entry} // Cannot change school when editing
                        >
                            <option value="" disabled>-- Selecione uma escola --</option>
                            {schools.map(school => (
                                <option key={school.id} value={school.id}>{school.name}</option>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="classDate" className={labelClass}>Data da Aula</label>
                        <input type="date" name="classDate" id="classDate" value={formData.classDate} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="className" className={labelClass}>Turma</label>
                        <select name="className" id="className" value={formData.className} onChange={handleChange} className={inputClass} required>
                            {availableClassesForSchool.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="subject" className={labelClass}>Disciplina</label>
                        <select name="subject" id="subject" value={formData.subject} onChange={handleChange} className={inputClass} required>
                             {AVAILABLE_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="topic" className={labelClass}>Assunto da Aula</label>
                    <input type="text" name="topic" id="topic" value={formData.topic} onChange={handleChange} className={inputClass} required placeholder="Ex: Adição com 2 dígitos" />
                </div>
                <div>
                    <label htmlFor="objective" className={labelClass}>Objetivo da Aula</label>
                    <textarea name="objective" id="objective" value={formData.objective} onChange={handleChange} className={inputClass} rows={3} required placeholder="O que se espera que os alunos aprendam..."></textarea>
                </div>
                <div>
                    <label htmlFor="methodology" className={labelClass}>Metodologia Utilizada</label>
                    <textarea name="methodology" id="methodology" value={formData.methodology} onChange={handleChange} className={inputClass} rows={3} required placeholder="Atividades em grupo, lousa digital, etc..."></textarea>
                </div>
                 <div>
                    <label htmlFor="resources" className={labelClass}>Recursos Utilizados</label>
                    <textarea name="resources" id="resources" value={formData.resources} onChange={handleChange} className={inputClass} rows={2} required placeholder="Livro didático, projetor, materiais recicláveis, etc..."></textarea>
                </div>
                 <div>
                    <label htmlFor="evaluation" className={labelClass}>Avaliação</label>
                    <textarea name="evaluation" id="evaluation" value={formData.evaluation} onChange={handleChange} className={inputClass} rows={2} required placeholder="Forma como a aprendizagem foi avaliada..."></textarea>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <SpinnerIcon className="w-5 h-5" /> : 'Salvar Registro'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export const ClassDiaryPage: React.FC<{
  user: User;
  schools: School[];
  classes: SchoolClass[];
  disciplines: Discipline[];
  classDiaryEntries: ClassDiaryEntry[];
  onAddNewEntry: (entryData: Omit<ClassDiaryEntry, 'id' | 'schoolId' | 'authorId' | 'authorName' | 'createdAt'>, schoolId?: string) => Promise<void>;
  onUpdateEntry: (entryId: string, entryData: Partial<Omit<ClassDiaryEntry, 'id' | 'schoolId' | 'authorId' | 'authorName' | 'createdAt'>>) => Promise<void>;
  onDeleteEntry: (entryId: string) => Promise<void>;
  onPrintDiario: (printData: Omit<DiarioPrintData, 'school' | 'entries' | 'disciplines'>) => void;
}> = ({ user, schools, classes, disciplines, classDiaryEntries, onAddNewEntry, onUpdateEntry, onDeleteEntry, onPrintDiario }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<ClassDiaryEntry | null>(null);
    const [selectedClass, setSelectedClass] = useState('all');

    const filteredEntries = useMemo(() => {
        const sorted = [...classDiaryEntries].sort((a, b) => new Date(b.classDate || 0).getTime() - new Date(a.classDate || 0).getTime());
        if (selectedClass === 'all') {
            return sorted;
        }
        return sorted.filter(entry => entry.className === selectedClass);
    }, [classDiaryEntries, selectedClass]);

    const uniqueClasses = useMemo(() => {
        return [...new Set(classDiaryEntries.map(e => e.className).filter(Boolean) as string[])].sort();
    }, [classDiaryEntries]);

    const handleOpenModal = (entry: ClassDiaryEntry | null = null) => {
        setEditingEntry(entry);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEntry(null);
    };

    const handleSave = async (data: Omit<ClassDiaryEntry, 'id' | 'schoolId' | 'authorId' | 'authorName' | 'createdAt'>, schoolId?: string) => {
        if (editingEntry) {
            await onUpdateEntry(editingEntry.id, data);
        } else {
            await onAddNewEntry(data, schoolId);
        }
    };

    const handleDelete = async (entryId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este registro do diário?')) {
            await onDeleteEntry(entryId);
        }
    };

    return (
        <>
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Diário de Classe</h1>
                        <p className="text-gray-600 mt-1">Registre e consulte o andamento das aulas.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={() => setIsPrintModalOpen(true)} variant="secondary">
                            <PrinterIcon className="w-5 h-5 mr-2" />
                            Imprimir Diário
                        </Button>
                        <Button onClick={() => handleOpenModal()}>
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Adicionar Registro
                        </Button>
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor="class-filter" className="block text-sm font-medium text-gray-700">Filtrar por Turma</label>
                    <select
                        id="class-filter"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="mt-1 block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm"
                    >
                        <option value="all">Todas as Turmas</option>
                        {uniqueClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                    </select>
                </div>

                {filteredEntries.length > 0 ? (
                    <div className="space-y-4">
                        {filteredEntries.map(entry => (
                            <div key={entry.id} className="bg-white p-4 rounded-lg shadow-md border">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-lg text-gray-800">{entry.topic}</p>
                                        <div className="flex items-center gap-x-4 text-xs text-gray-500 mt-1">
                                            <span><span className="font-semibold">Data:</span> {new Date(entry.classDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                                            <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">{entry.className}</span>
                                            <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">{entry.subject}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="secondary" className="!p-2" onClick={() => handleOpenModal(entry)}>
                                           <PencilIcon className="w-4 h-4" />
                                        </Button>
                                         <Button variant="secondary" className="!p-2 !bg-red-50 hover:!bg-red-100" onClick={() => handleDelete(entry.id)}>
                                           <TrashIcon className="w-4 h-4 text-red-600" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-4 border-t pt-3">
                                   <details className="text-sm text-gray-600">
                                        <summary className="cursor-pointer font-semibold text-gray-700">Ver Detalhes</summary>
                                        <div className="mt-2 space-y-3 pl-2 border-l-2">
                                            <div><p className="font-semibold">Objetivo:</p><p className="whitespace-pre-wrap">{entry.objective}</p></div>
                                            <div><p className="font-semibold">Metodologia:</p><p className="whitespace-pre-wrap">{entry.methodology}</p></div>
                                            <div><p className="font-semibold">Recursos:</p><p className="whitespace-pre-wrap">{entry.resources}</p></div>
                                            <div><p className="font-semibold">Avaliação:</p><p className="whitespace-pre-wrap">{entry.evaluation}</p></div>
                                        </div>
                                   </details>
                                </div>
                                <div className="text-right text-xs text-gray-400 mt-3">
                                    Registrado por: {entry.authorName}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
                        <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">Nenhum Registro Encontrado</h3>
                        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                            Use o botão "Adicionar Registro" para criar a primeira entrada no diário para a turma selecionada.
                        </p>
                    </div>
                )}
            </div>

            <EntryModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                entry={editingEntry}
                user={user}
                schools={schools}
                classes={classes}
            />
            
            <DiarioPrintOptionsModal
                isOpen={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                classes={classes}
                onConfirm={onPrintDiario}
            />
        </>
    );
};