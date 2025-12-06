import React, { useState, useEffect, useMemo } from 'react';
import { type User, type Lead, type GradeConfig, type Activity, GradeCalculationMethod, UserRole } from '../types';
import { Button } from './ui/Button';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { Cog6ToothIcon } from './icons/Cog6ToothIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { UserIcon } from './icons/UserIcon';
import { AVAILABLE_SUBJECTS } from '../constants';
import { BookOpenIcon } from './icons/BookOpenIcon';

const AdminSettingsPanel: React.FC<{
    config: Omit<GradeConfig, 'id' | 'schoolId'>;
    onSave: (newConfig: Omit<GradeConfig, 'id' | 'schoolId' | 'subject'>) => Promise<void>;
    onClose: () => void;
}> = ({ config, onSave, onClose }) => {
    const [localConfig, setLocalConfig] = useState<Omit<GradeConfig, 'id' | 'schoolId' | 'subject'>>({ method: config.method, activities: config.activities });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setLocalConfig({ method: config.method, activities: config.activities || [] });
    }, [config]);

    const handleActivityChange = (id: string, field: 'name' | 'weight', value: string) => {
        const updatedActivities = localConfig.activities.map(act => {
            if (act.id === id) {
                return { ...act, [field]: field === 'weight' ? parseFloat(value) || 0 : value };
            }
            return act;
        });
        setLocalConfig(prev => ({ ...prev, activities: updatedActivities }));
    };

    const handleAddActivity = () => {
        const newActivity: Activity = {
            id: `activity-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: '',
            weight: 10, // Default weight
        };
        setLocalConfig(prev => ({ ...prev, activities: [...prev.activities, newActivity] }));
    };

    const handleRemoveActivity = (id: string) => {
        setLocalConfig(prev => ({ ...prev, activities: prev.activities.filter(act => act.id !== id) }));
    };

    const handleSave = async () => {
        setError('');
        if (localConfig.activities.some(act => !act.name.trim())) {
            setError('O nome de todas as atividades deve ser preenchido.');
            return;
        }
        if (localConfig.method === GradeCalculationMethod.PONDERADA) {
            const totalWeight = localConfig.activities.reduce((sum, act) => sum + (act.weight || 0), 0);
            if (totalWeight !== 100) {
                setError(`A soma dos pesos deve ser exatamente 100. Soma atual: ${totalWeight}.`);
                return;
            }
        }
        setIsSubmitting(true);
        await onSave(localConfig);
        setIsSubmitting(false);
        onClose();
    };

    const totalWeight = useMemo(() => {
        if (localConfig.method !== GradeCalculationMethod.PONDERADA) return null;
        return localConfig.activities.reduce((sum, act) => sum + (act.weight || 0), 0);
    }, [localConfig.activities, localConfig.method]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 mb-8">
            <div className="flex items-center gap-3 mb-4 border-b pb-4">
                <Cog6ToothIcon className="w-8 h-8 text-gray-500" />
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Configurar Avaliações para {config.subject}</h2>
                    <p className="text-sm text-gray-500">Defina o cálculo da média e as atividades que serão avaliadas.</p>
                </div>
            </div>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">1. Método de Cálculo da Média</label>
                    <div className="mt-2 flex gap-6 p-3 bg-gray-50 rounded-md">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="method" value={GradeCalculationMethod.ARITMETICA} checked={localConfig.method === GradeCalculationMethod.ARITMETICA} onChange={e => setLocalConfig(prev => ({ ...prev, method: e.target.value as GradeCalculationMethod }))} className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500" />
                            <span className="ml-2 text-sm text-gray-800 font-medium">Média Aritmética</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="method" value={GradeCalculationMethod.PONDERADA} checked={localConfig.method === GradeCalculationMethod.PONDERADA} onChange={e => setLocalConfig(prev => ({ ...prev, method: e.target.value as GradeCalculationMethod }))} className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500" />
                            <span className="ml-2 text-sm text-gray-800 font-medium">Média Ponderada</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">2. Atividades Avaliativas</label>
                    <div className="mt-2 space-y-3">
                        {localConfig.activities.length > 0 ? localConfig.activities.map((activity) => (
                            <div key={activity.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md border">
                                <input type="text" placeholder="Nome da Atividade (ex: Prova 1)" value={activity.name} onChange={e => handleActivityChange(activity.id, 'name', e.target.value)} className="block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-teal-500 focus:border-teal-500" required />
                                {localConfig.method === GradeCalculationMethod.PONDERADA && (
                                    <div className="relative">
                                        <input type="number" placeholder="Peso" value={activity.weight} onChange={e => handleActivityChange(activity.id, 'weight', e.target.value)} className="block w-28 text-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-teal-500 focus:border-teal-500" required />
                                        <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 text-sm">%</span>
                                    </div>
                                )}
                                <button type="button" onClick={() => handleRemoveActivity(activity.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        )) : (
                           <p className="text-sm text-gray-500 text-center py-4">Nenhuma atividade adicionada.</p>
                        )}
                    </div>
                    <Button type="button" variant="secondary" onClick={handleAddActivity} className="mt-3">
                        <PlusIcon className="w-4 h-4 mr-2"/> Adicionar Atividade
                    </Button>
                </div>

                {totalWeight !== null && (
                     <div className={`flex items-center text-sm p-3 rounded-md transition-all ${totalWeight === 100 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        <InformationCircleIcon className="w-5 h-5 mr-2"/>
                        Soma dos Pesos: <span className="font-bold ml-1">{totalWeight}% de 100%</span>
                    </div>
                )}
                {error && <p className="text-sm text-red-600 p-3 bg-red-50 rounded-md">{error}</p>}

                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="button" onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? <SpinnerIcon className="w-5 h-5"/> : 'Salvar Configurações'}
                    </Button>
                </div>
            </div>
        </div>
    );
};


export const GradesPage: React.FC<{
  user: User;
  students: Lead[];
  gradeConfigs: GradeConfig[];
  onUpdateGradeConfig: (schoolId: string, subject: string, config: Omit<GradeConfig, 'id' | 'schoolId' | 'subject'>) => Promise<void>;
  onUpdateStudentGrade: (leadId: string, subject: string, activityId: string, grade: number | null) => void;
}> = ({ user, students, gradeConfigs, onUpdateGradeConfig, onUpdateStudentGrade }) => {
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedClass, setSelectedClass] = useState('all');
    const [showSettings, setShowSettings] = useState(false);

    const isAdmin = user.role === UserRole.ADMINISTRADOR || user.role === UserRole.SUPER_ADMINISTRADOR;
    const canEditGrades = isAdmin || user.role === UserRole.EDUCADORA || user.role === UserRole.SECRETARIA;

    const activeGradeConfig = useMemo(() => {
        if (!selectedSubject) return null;
        return gradeConfigs.find(c => c.subject === selectedSubject);
    }, [gradeConfigs, selectedSubject]);

    const filteredStudents = useMemo(() => {
        if (selectedClass === 'all') return students;
        return students.filter(s => s.className === selectedClass);
    }, [students, selectedClass]);
    
    const uniqueClasses = useMemo(() => {
        return [...new Set(students.map(s => s.className).filter(Boolean) as string[])].sort();
    }, [students]);

    const handleSaveSettings = async (newConfig: Omit<GradeConfig, 'id' | 'schoolId' | 'subject'>) => {
        if (!selectedSubject || (!user.schoolId && user.role !== UserRole.SUPER_ADMINISTRADOR)) return;
        const schoolIdToSave = user.role === UserRole.SUPER_ADMINISTRADOR ? (gradeConfigs[0]?.schoolId || 'default') : user.schoolId!;
        await onUpdateGradeConfig(schoolIdToSave, selectedSubject, newConfig);
    };
    
    const calculateAverage = (student: Lead, subject: string): number | null => {
        const config = gradeConfigs.find(c => c.subject === subject);
        if (!config || !config.activities || config.activities.length === 0) return null;
        
        const subjectGrades = student.grades?.[subject] || {};
        let total = 0;
        let weightSum = 0;
        let gradesCount = 0;
        let hasAnyGrade = false;

        for (const activity of config.activities) {
            const grade = subjectGrades[activity.id];
            if (typeof grade === 'number' && !isNaN(grade)) {
                hasAnyGrade = true;
                if (config.method === GradeCalculationMethod.PONDERADA) {
                    const weight = activity.weight || 0;
                    total += grade * weight;
                    weightSum += weight;
                } else {
                    total += grade;
                    gradesCount++;
                }
            }
        }

        if (!hasAnyGrade) return null;

        if (config.method === GradeCalculationMethod.PONDERADA) {
            return weightSum > 0 ? total / weightSum : 0;
        } else {
            return gradesCount > 0 ? total / gradesCount : 0;
        }
    };


    const GradeInput: React.FC<{ studentId: string; activityId: string; subject: string; initialGrade?: number }> = ({ studentId, activityId, subject, initialGrade }) => {
        const [grade, setGrade] = useState(initialGrade?.toString().replace('.', ',') || '');
        const handleBlur = () => {
            const gradeAsFloat = parseFloat(grade.replace(',', '.'));
            const finalGrade = isNaN(gradeAsFloat) ? null : Math.max(0, Math.min(10, gradeAsFloat));
            onUpdateStudentGrade(studentId, subject, activityId, finalGrade);
            setGrade(finalGrade?.toString().replace('.', ',') || '');
        };
        useEffect(() => {
            setGrade(initialGrade?.toString().replace('.', ',') || '');
        }, [initialGrade]);
        return (
            <input
                type="text"
                inputMode="decimal"
                value={grade}
                onChange={e => setGrade(e.target.value)}
                onBlur={handleBlur}
                placeholder="-"
                disabled={!canEditGrades}
                className="w-20 text-center rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
        );
    };

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Notas e Avaliações</h1>
                <p className="text-gray-600 mt-1">Insira as notas dos alunos e configure o método de cálculo por disciplina.</p>
            </div>
            
            <div className="mb-6">
                 <label htmlFor="subject-selector" className="block text-sm font-medium text-gray-700 mb-1">
                   Selecione a Disciplina
                 </label>
                 <select
                    id="subject-selector"
                    value={selectedSubject || ''}
                    onChange={e => {
                        setSelectedSubject(e.target.value || null);
                        setShowSettings(false); // Close settings when changing subject
                    }}
                    className="block w-full max-w-sm pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm"
                 >
                     <option value="">-- Escolha uma disciplina --</option>
                     {AVAILABLE_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
            </div>
            
            {!selectedSubject ? (
                <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
                    <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">Selecione uma Disciplina</h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                        Para começar, escolha uma disciplina no seletor acima para visualizar ou editar as notas.
                    </p>
                </div>
            ) : (
                <>
                {isAdmin && (
                    <div className="mb-6">
                        <Button onClick={() => setShowSettings(!showSettings)} variant={showSettings ? "secondary" : "primary"}>
                            <Cog6ToothIcon className="w-5 h-5 mr-2"/>
                            {showSettings ? `Fechar Configurações de ${selectedSubject}` : `Configurar ${selectedSubject}`}
                        </Button>
                    </div>
                )}
                {isAdmin && showSettings && (
                    <AdminSettingsPanel 
                        config={activeGradeConfig || { subject: selectedSubject, method: GradeCalculationMethod.ARITMETICA, activities: [] }}
                        onSave={handleSaveSettings} 
                        onClose={() => setShowSettings(false)} 
                    />
                )}
                 <div className="bg-white rounded-lg shadow-md mt-4">
                     <div className="p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                               <h2 className="text-lg font-semibold text-gray-800">Lançamento de Notas: <span className="text-teal-700">{selectedSubject}</span></h2>
                            </div>
                            <div className="w-full sm:w-auto sm:max-w-xs">
                                 <label htmlFor="class-filter-grades" className="sr-only">Filtrar por Turma</label>
                                 <select id="class-filter-grades" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md">
                                     <option value="all">Todas as Turmas</option>
                                     {uniqueClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                                 </select>
                             </div>
                        </div>
                    </div>
                    {activeGradeConfig && activeGradeConfig.activities.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">Aluno</th>
                                        {activeGradeConfig.activities.map(act => (
                                            <th key={act.id} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                {act.name}
                                                {activeGradeConfig.method === GradeCalculationMethod.PONDERADA && <span className="block font-normal normal-case text-gray-400"> (Peso {act.weight}%)</span>}
                                            </th>
                                        ))}
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Média Final</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredStudents.map(student => {
                                        const average = calculateAverage(student, selectedSubject);
                                        return (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white hover:bg-gray-50 z-10">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            {student.studentPhotoUrl ? (
                                                              <img className="h-10 w-10 rounded-full object-cover" src={student.studentPhotoUrl} alt={student.studentName} />
                                                            ) : (
                                                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                                <UserIcon className="h-6 w-6 text-gray-500" />
                                                              </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                                                            <div className="text-xs text-gray-500">{student.className}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                {activeGradeConfig.activities.map(act => (
                                                    <td key={act.id} className="px-6 py-4 whitespace-nowrap text-center">
                                                        <GradeInput studentId={student.id} activityId={act.id} subject={selectedSubject} initialGrade={student.grades?.[selectedSubject]?.[act.id]} />
                                                    </td>
                                                ))}
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold">
                                                    {average !== null ? (
                                                        <span className={`px-3 py-1 rounded-full text-xs ${average >= 7 ? 'bg-green-100 text-green-800' : average >= 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                            {average.toFixed(2).replace('.', ',')}
                                                        </span>
                                                    ) : <span className="text-gray-400">-</span>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                         <div className="text-center py-16 px-6">
                            <InformationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">Nenhuma Atividade Configurada</h3>
                            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                                {isAdmin ? `Para começar, clique no botão "Configurar ${selectedSubject}" acima para definir as atividades e o método de cálculo da média.` : `Aguardando o administrador da escola configurar as atividades para ${selectedSubject}.`}
                            </p>
                            {isAdmin && !showSettings && (
                                <Button onClick={() => setShowSettings(true)} className="mt-6">
                                    Configurar Agora
                                </Button>
                            )}
                        </div>
                    )}
                </div>
                </>
            )}
        </div>
    );
};