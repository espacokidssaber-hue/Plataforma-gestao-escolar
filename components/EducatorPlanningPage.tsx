

import React, { useState, useMemo, useEffect } from 'react';
import { type User, type LessonPlan, type SchoolClass, type Discipline, type Staff, UserRole, School, CurriculumMap, CurriculumItem } from '../types';
import { AVAILABLE_SUBJECTS } from '../constants';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { PlusIcon } from './icons/PlusIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { PresentationChartLineIcon } from './icons/PresentationChartLineIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { MapIcon } from './icons/MapIcon';
import { GoogleGenAI, Type } from "@google/genai";

interface EducatorPlanningPageProps {
    user: User;
    lessonPlans: LessonPlan[];
    curriculumMaps: CurriculumMap[];
    classes: SchoolClass[];
    disciplines: Discipline[];
    staff: Staff[];
    schools: School[];
    onSavePlan: (plan: Omit<LessonPlan, 'id' | 'createdAt'>, planId?: string) => Promise<void>;
    onDeletePlan: (planId: string) => Promise<void>;
    onSaveMap: (map: Omit<CurriculumMap, 'id' | 'createdAt'>, mapId?: string) => Promise<void>;
    onDeleteMap: (mapId: string) => Promise<void>;
    superAdminSchoolFilter: string;
    selectedYear: number;
}

const CurriculumManager: React.FC<{
    user: User;
    classes: SchoolClass[];
    disciplines: Discipline[];
    schools: School[];
    curriculumMaps: CurriculumMap[];
    onSaveMap: (map: Omit<CurriculumMap, 'id' | 'createdAt'>, mapId?: string) => Promise<void>;
    onDeleteMap: (mapId: string) => Promise<void>;
    superAdminSchoolFilter: string;
    selectedYear: number;
}> = ({ user, classes, disciplines, schools, curriculumMaps, onSaveMap, onDeleteMap, superAdminSchoolFilter, selectedYear }) => {
    const [selectedSchoolId, setSelectedSchoolId] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [bookContent, setBookContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [existingMap, setExistingMap] = useState<CurriculumMap | null>(null);

    // Initialize School ID
    useEffect(() => {
        if (user.role === UserRole.SUPER_ADMINISTRADOR) {
            setSelectedSchoolId(superAdminSchoolFilter !== 'all' ? superAdminSchoolFilter : schools[0]?.id || '');
        } else {
            setSelectedSchoolId(user.schoolId || '');
        }
    }, [user, schools, superAdminSchoolFilter]);

    // Check for existing map
    useEffect(() => {
        if (selectedClass && selectedSubject && selectedSchoolId) {
            const map = curriculumMaps.find(m => 
                m.schoolId === selectedSchoolId && 
                m.className === selectedClass && 
                m.subject === selectedSubject &&
                m.schoolYear === selectedYear
            );
            setExistingMap(map || null);
        } else {
            setExistingMap(null);
        }
    }, [selectedClass, selectedSubject, selectedSchoolId, curriculumMaps, selectedYear]);

    const availableClasses = useMemo(() => classes.filter(c => c.schoolId === selectedSchoolId), [classes, selectedSchoolId]);

    const handleGenerate = async () => {
        if (!bookContent || !selectedClass || !selectedSubject) return;
        setIsGenerating(true);

        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
            const prompt = `Atue como um Coordenador Pedagógico. Analise o seguinte conteúdo programático (sumário do livro/BNCC) para a disciplina de ${selectedSubject}, turma ${selectedClass}:
            
            "${bookContent}"

            Distribua este conteúdo ao longo de um ano letivo padrão de 40 semanas, dividido em 4 Bimestres (aprox 10 semanas cada).
            Leve em consideração uma progressão lógica de dificuldade.

            Gere um JSON array onde cada objeto representa uma semana de aula:
            - week: número da semana (1 a 40)
            - month: mês provável (ex: Fevereiro, Março...)
            - bimester: "1º Bimestre", "2º Bimestre", etc.
            - content: Tópico/Conteúdo a ser abordado.
            - objectives: Objetivo de aprendizagem resumido.
            `;

            const responseSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        week: { type: Type.INTEGER },
                        month: { type: Type.STRING },
                        bimester: { type: Type.STRING },
                        content: { type: Type.STRING },
                        objectives: { type: Type.STRING }
                    },
                    required: ["week", "month", "bimester", "content", "objectives"]
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                }
            });

            const items = JSON.parse(response.text || '[]');
            
            const newMap: Omit<CurriculumMap, 'id' | 'createdAt'> = {
                schoolId: selectedSchoolId,
                schoolYear: selectedYear,
                className: selectedClass,
                subject: selectedSubject,
                items: items
            };

            await onSaveMap(newMap, existingMap?.id);
            setBookContent(''); 

        } catch (e) {
            console.error(e);
            alert("Erro ao gerar matriz. Tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDelete = async () => {
        if (existingMap && window.confirm("Tem certeza que deseja excluir esta matriz curricular?")) {
            await onDeleteMap(existingMap.id);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <SparklesIcon className="w-5 h-5 mr-2 text-indigo-600"/>
                    Gerador de Distribuição Anual (IA)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {user.role === UserRole.SUPER_ADMINISTRADOR && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Escola</label>
                            <select value={selectedSchoolId} onChange={e => setSelectedSchoolId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Turma</label>
                        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                            <option value="">Selecione...</option>
                            {availableClasses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Disciplina</label>
                        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                            <option value="">Selecione...</option>
                            {AVAILABLE_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                {!existingMap && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sumário do Livro / Lista de Conteúdos</label>
                        <textarea 
                            value={bookContent} 
                            onChange={e => setBookContent(e.target.value)} 
                            className="w-full h-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Cole aqui o sumário do livro didático ou a lista de tópicos da BNCC para esta matéria..."
                        />
                        <div className="mt-2 text-right">
                            <Button onClick={handleGenerate} disabled={isGenerating || !bookContent || !selectedClass || !selectedSubject}>
                                {isGenerating ? <SpinnerIcon className="w-4 h-4 mr-2"/> : <SparklesIcon className="w-4 h-4 mr-2"/>}
                                {isGenerating ? 'Analisando e Distribuindo...' : 'Gerar Matriz Anual'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {existingMap ? (
                <div className="bg-white rounded-lg shadow-md border overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Matriz Curricular: {existingMap.subject} - {existingMap.className}</h3>
                        <Button variant="secondary" className="!text-red-600 !border-red-200 hover:!bg-red-50" onClick={handleDelete}>
                            <TrashIcon className="w-4 h-4 mr-2"/> Excluir Matriz
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-white">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Semana</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Mês</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Bimestre</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Conteúdo Previsto</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Objetivo de Aprendizagem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {existingMap.items.sort((a,b) => a.week - b.week).map((item, idx) => (
                                    <tr key={idx} className={item.bimester.includes('1º') ? 'bg-blue-50/30' : item.bimester.includes('2º') ? 'bg-green-50/30' : item.bimester.includes('3º') ? 'bg-yellow-50/30' : 'bg-red-50/30'}>
                                        <td className="px-4 py-3 font-semibold text-gray-700">{item.week}</td>
                                        <td className="px-4 py-3 text-gray-600">{item.month}</td>
                                        <td className="px-4 py-3 text-gray-600"><span className="px-2 py-1 rounded-full bg-white border text-xs">{item.bimester}</span></td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{item.content}</td>
                                        <td className="px-4 py-3 text-gray-500 italic">{item.objectives}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <MapIcon className="w-12 h-12 mx-auto text-gray-300 mb-2"/>
                    <p>Nenhuma matriz curricular definida para esta turma/disciplina.</p>
                    <p className="text-sm">Use o gerador acima para criar o planejamento anual.</p>
                </div>
            )}
        </div>
    );
};

const PlanningModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (plan: Omit<LessonPlan, 'id' | 'createdAt'>, planId?: string) => Promise<void>;
    plan: LessonPlan | null;
    user: User;
    classes: SchoolClass[];
    disciplines: Discipline[];
    staff: Staff[];
    schools: School[];
    superAdminSchoolFilter: string;
    curriculumMaps: CurriculumMap[];
    selectedYear: number;
}> = ({ isOpen, onClose, onSave, plan, user, classes, disciplines, staff, schools, superAdminSchoolFilter, curriculumMaps, selectedYear }) => {
    
    const [formData, setFormData] = useState({
        schoolId: '',
        teacherId: '',
        teacherName: '',
        className: '',
        subject: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        topic: '',
        objectives: '',
        methodology: '',
        resources: '',
        assessment: '',
        status: 'draft' as 'draft' | 'submitted' | 'approved'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const initialSchoolId = user.role === UserRole.SUPER_ADMINISTRADOR 
                ? (superAdminSchoolFilter !== 'all' ? superAdminSchoolFilter : schools[0]?.id || '')
                : user.schoolId || '';

            const currentUserStaff = staff.find(s => s.email === user.username || s.fullName === user.username) || 
                                     (user.role === UserRole.EDUCADORA ? staff.find(s => s.id === user.id) : null);

            if (plan) {
                setFormData({
                    schoolId: plan.schoolId,
                    teacherId: plan.teacherId,
                    teacherName: plan.teacherName,
                    className: plan.className,
                    subject: plan.subject,
                    startDate: plan.startDate,
                    endDate: plan.endDate,
                    topic: plan.topic,
                    objectives: plan.objectives,
                    methodology: plan.methodology,
                    resources: plan.resources,
                    assessment: plan.assessment,
                    status: plan.status,
                });
            } else {
                setFormData({
                    schoolId: initialSchoolId,
                    teacherId: currentUserStaff?.id || '',
                    teacherName: currentUserStaff?.fullName || '',
                    className: '',
                    subject: AVAILABLE_SUBJECTS[0] || '',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    topic: '',
                    objectives: '',
                    methodology: '',
                    resources: '',
                    assessment: '',
                    status: 'draft'
                });
            }
        }
    }, [isOpen, plan, user, schools, superAdminSchoolFilter, staff]);

    const availableClasses = useMemo(() => classes.filter(c => c.schoolId === formData.schoolId), [classes, formData.schoolId]);
    const availableStaff = useMemo(() => staff.filter(s => s.schoolId === formData.schoolId && s.role === 'Professor(a)'), [staff, formData.schoolId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'teacherId') {
            const selectedTeacher = availableStaff.find(s => s.id === value);
            if (selectedTeacher) {
                setFormData(prev => ({ ...prev, teacherName: selectedTeacher.fullName }));
            }
        }
    };

    const handleLoadFromMap = () => {
        // Find map
        const map = curriculumMaps.find(m => 
            m.schoolId === formData.schoolId &&
            m.className === formData.className &&
            m.subject === formData.subject &&
            m.schoolYear === selectedYear
        );

        if (!map) {
            alert("Nenhuma matriz curricular encontrada para esta turma e disciplina.");
            return;
        }

        // Determine current week number roughly based on startDate
        // This is a simplification. A real app would need precise calendar logic.
        // Assuming year starts Feb 1st.
        const startOfYear = new Date(selectedYear, 1, 1);
        const planDate = new Date(formData.startDate);
        const diffTime = Math.abs(planDate.getTime() - startOfYear.getTime());
        const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)); 
        const currentWeek = Math.max(1, Math.min(40, diffWeeks));

        const weekContent = map.items.find(i => i.week === currentWeek) || map.items.find(i => i.week === currentWeek - 1) || map.items[0];

        if (weekContent) {
            setFormData(prev => ({
                ...prev,
                topic: weekContent.content,
                objectives: weekContent.objectives
            }));
        }
    };

    const handleGenerateAI = async () => {
        if (!formData.topic || !formData.subject || !formData.className) {
            alert('Por favor, preencha a Turma, Disciplina e Tema Central para gerar o plano.');
            return;
        }

        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
            const prompt = `Atue como um Coordenador Pedagógico experiente. Crie um plano de aula estruturado para:
            - Disciplina: ${formData.subject}
            - Tema: ${formData.topic}
            - Turma/Nível: ${formData.className}
            
            Gere um JSON com os seguintes campos (textos em português, claros e práticos):
            - objectives: Objetivos de aprendizagem (o que o aluno deve saber fazer).
            - methodology: Metodologia e desenvolvimento da aula (passo a passo).
            - resources: Recursos didáticos necessários.
            - assessment: Como avaliar se o objetivo foi atingido.
            `;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    objectives: { type: Type.STRING },
                    methodology: { type: Type.STRING },
                    resources: { type: Type.STRING },
                    assessment: { type: Type.STRING },
                },
                required: ["objectives", "methodology", "resources", "assessment"]
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                }
            });

            const data = JSON.parse(response.text || '{}');
            setFormData(prev => ({
                ...prev,
                objectives: data.objectives || prev.objectives,
                methodology: data.methodology || prev.methodology,
                resources: data.resources || prev.resources,
                assessment: data.assessment || prev.assessment,
            }));

        } catch (error) {
            console.error("AI Generation Error", error);
            alert("Erro ao gerar plano com IA. Tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave(formData, plan?.id);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border";
    const labelClass = "block text-sm font-medium text-gray-700";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={plan ? 'Editar Plano de Aula' : 'Novo Plano de Aula'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.role !== UserRole.EDUCADORA && (
                        <div className="md:col-span-2">
                            <label className={labelClass}>Professor(a)</label>
                            <select name="teacherId" value={formData.teacherId} onChange={handleChange} className={inputClass} required>
                                <option value="">Selecione...</option>
                                {availableStaff.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className={labelClass}>Turma</label>
                        <select name="className" value={formData.className} onChange={handleChange} className={inputClass} required>
                            <option value="">Selecione...</option>
                            {availableClasses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Disciplina</label>
                        <select name="subject" value={formData.subject} onChange={handleChange} className={inputClass} required>
                            {AVAILABLE_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Início (Semana)</label>
                        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label className={labelClass}>Fim (Semana)</label>
                        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className={inputClass} required />
                    </div>
                </div>

                <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-end mb-2">
                        <label className={labelClass}>Tema Central / Conteúdo</label>
                        <div className="flex gap-2">
                            <Button type="button" variant="secondary" onClick={handleLoadFromMap} className="!text-xs !py-1 !px-2 bg-purple-50 text-purple-700 border-purple-200">
                                <MapIcon className="w-3 h-3 mr-1" />
                                Carregar da Matriz
                            </Button>
                            <Button type="button" variant="secondary" onClick={handleGenerateAI} disabled={isGenerating} className="!text-xs !py-1 !px-2">
                                {isGenerating ? <SpinnerIcon className="w-3 h-3 mr-1"/> : <SparklesIcon className="w-3 h-3 mr-1"/>}
                                Preencher com IA
                            </Button>
                        </div>
                    </div>
                    <input type="text" name="topic" value={formData.topic} onChange={handleChange} className={inputClass} placeholder="Ex: O Ciclo da Água" required />
                </div>

                <div>
                    <label className={labelClass}>Objetivos de Aprendizagem</label>
                    <textarea name="objectives" value={formData.objectives} onChange={handleChange} rows={3} className={inputClass} placeholder="O que o aluno deve aprender?" />
                </div>

                <div>
                    <label className={labelClass}>Metodologia (Desenvolvimento)</label>
                    <textarea name="methodology" value={formData.methodology} onChange={handleChange} rows={4} className={inputClass} placeholder="Passo a passo da aula..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Recursos Didáticos</label>
                        <textarea name="resources" value={formData.resources} onChange={handleChange} rows={2} className={inputClass} placeholder="Materiais necessários..." />
                    </div>
                    <div>
                        <label className={labelClass}>Avaliação</label>
                        <textarea name="assessment" value={formData.assessment} onChange={handleChange} rows={2} className={inputClass} placeholder="Como será avaliado?" />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting || isGenerating}>
                        {isSubmitting ? <SpinnerIcon className="w-5 h-5"/> : 'Salvar Planejamento'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export const EducatorPlanningPage: React.FC<EducatorPlanningPageProps> = ({ user, lessonPlans, curriculumMaps, classes, disciplines, staff, schools, onSavePlan, onDeletePlan, onSaveMap, onDeleteMap, superAdminSchoolFilter, selectedYear }) => {
    const [activeTab, setActiveTab] = useState<'plans' | 'matrix'>('plans');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<LessonPlan | null>(null);
    const [selectedTeacherId, setSelectedTeacherId] = useState('all');

    const filteredPlans = useMemo(() => {
        let list = lessonPlans.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        
        if (user.role === UserRole.SUPER_ADMINISTRADOR && superAdminSchoolFilter !== 'all') {
            list = list.filter(p => p.schoolId === superAdminSchoolFilter);
        } else if (user.schoolId) {
            list = list.filter(p => p.schoolId === user.schoolId);
        }

        if (user.role === UserRole.EDUCADORA) {
            const currentUserStaff = staff.find(s => s.id === user.id || s.email === user.username);
            if (currentUserStaff) {
                list = list.filter(p => p.teacherId === currentUserStaff.id);
            }
        } else if (selectedTeacherId !== 'all') {
            list = list.filter(p => p.teacherId === selectedTeacherId);
        }

        return list;
    }, [lessonPlans, user, superAdminSchoolFilter, selectedTeacherId, staff]);

    const uniqueTeachers = useMemo(() => {
        const teacherIds = new Set(lessonPlans.map(p => p.teacherId));
        return staff.filter(s => teacherIds.has(s.id) && (user.schoolId ? s.schoolId === user.schoolId : true));
    }, [lessonPlans, staff, user.schoolId]);

    const handleEdit = (plan: LessonPlan) => {
        setEditingPlan(plan);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir este planejamento?")) {
            await onDeletePlan(id);
        }
    };

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Planejamento das Educadoras</h1>
                    <p className="text-gray-600 mt-1">Elabore, consulte e organize os planos de aula semanais.</p>
                </div>
            </div>

            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('plans')}
                        className={`${activeTab === 'plans' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <PresentationChartLineIcon className="w-5 h-5 mr-2" />
                        Meus Planos de Aula
                    </button>
                    <button
                        onClick={() => setActiveTab('matrix')}
                        className={`${activeTab === 'matrix' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <MapIcon className="w-5 h-5 mr-2" />
                        Matriz Curricular Anual
                    </button>
                </nav>
            </div>

            {activeTab === 'plans' && (
                <>
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => { setEditingPlan(null); setIsModalOpen(true); }}>
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Novo Planejamento
                        </Button>
                    </div>

                    {user.role !== UserRole.EDUCADORA && (
                        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Educadora</label>
                            <select 
                                value={selectedTeacherId} 
                                onChange={(e) => setSelectedTeacherId(e.target.value)}
                                className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border"
                            >
                                <option value="all">Todas as Educadoras</option>
                                {uniqueTeachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                            </select>
                        </div>
                    )}

                    {filteredPlans.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {filteredPlans.map(plan => (
                                <div key={plan.id} className="bg-white rounded-lg shadow-md border-l-4 border-teal-500 overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="p-5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">{plan.topic}</h3>
                                                <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-600">
                                                    <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">{plan.subject}</span>
                                                    <span className="font-medium text-gray-500">•</span>
                                                    <span>{plan.className}</span>
                                                    <span className="font-medium text-gray-500">•</span>
                                                    <span>{new Date(plan.startDate).toLocaleDateString('pt-BR')} a {new Date(plan.endDate).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(plan)} className="p-2 text-gray-400 hover:text-teal-600 bg-gray-50 rounded-full"><PencilIcon className="w-4 h-4"/></button>
                                                <button onClick={() => handleDelete(plan.id)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div className="bg-gray-50 p-3 rounded-md">
                                                <p className="font-semibold text-gray-700 mb-1">Objetivos</p>
                                                <p className="text-gray-600 whitespace-pre-wrap">{plan.objectives}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-md">
                                                <p className="font-semibold text-gray-700 mb-1">Metodologia</p>
                                                <p className="text-gray-600 whitespace-pre-wrap">{plan.methodology}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-3 flex justify-between items-center text-xs text-gray-400">
                                            <span>Educadora: {plan.teacherName}</span>
                                            <span>Criado em: {new Date(plan.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
                            <PresentationChartLineIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">Nenhum Planejamento Encontrado</h3>
                            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                                Comece criando o primeiro plano de aula para organizar a semana.
                            </p>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'matrix' && (
                <CurriculumManager 
                    user={user}
                    classes={classes}
                    disciplines={disciplines}
                    schools={schools}
                    curriculumMaps={curriculumMaps}
                    onSaveMap={onSaveMap}
                    onDeleteMap={onDeleteMap}
                    superAdminSchoolFilter={superAdminSchoolFilter}
                    selectedYear={selectedYear}
                />
            )}

            <PlanningModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={onSavePlan}
                plan={editingPlan}
                user={user}
                classes={classes}
                disciplines={disciplines}
                staff={staff}
                schools={schools}
                superAdminSchoolFilter={superAdminSchoolFilter}
                curriculumMaps={curriculumMaps}
                selectedYear={selectedYear}
            />
        </div>
    );
};
