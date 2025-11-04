import React, { useMemo, useState, useEffect } from 'react';
import { useEnrollment } from '../../contexts/EnrollmentContext';
import { SchoolClass } from '../../types';
import { MOCK_SUBJECTS } from '../../data/subjectsData';
import { ClassLogEntry } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface ClassDiaryProps {
  selectedClass: { id: number; name:string } | null;
}

const ClassDiary: React.FC<ClassDiaryProps> = ({ selectedClass: initialSelectedClass }) => {
    const { classLogs, addClassLog, updateClassLog, deleteClassLog, classes } = useEnrollment();
    const { user } = useAuth();
    
    const teacherClasses = useMemo(() => {
        if (user?.role === 'educator') {
            return classes.filter(c => 
                (c.teachers.matriz === user.id && c.unit === 'Matriz') || 
                (c.teachers.filial === user.id && c.unit === 'Filial') ||
                (c.teachers.anexo === user.id && c.unit === 'Anexo')
            );
        }
        return classes;
    }, [classes, user]);
    
    const [selectedClassId, setSelectedClassId] = useState<number | null>(initialSelectedClass?.id || teacherClasses[0]?.id || null);
    
    const [isEditing, setIsEditing] = useState<ClassLogEntry | null>(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        if (isEditing) {
            setDate(isEditing.date);
            setSubject(isEditing.subject);
            setContent(isEditing.content);
        } else {
            resetForm();
        }
    }, [isEditing]);

    useEffect(() => {
        if(initialSelectedClass && teacherClasses.some(c => c.id === initialSelectedClass.id)) {
            setSelectedClassId(initialSelectedClass.id);
        } else if (teacherClasses.length > 0 && !teacherClasses.some(c => c.id === selectedClassId)) {
            setSelectedClassId(teacherClasses[0].id)
        } else if (teacherClasses.length === 0) {
            setSelectedClassId(null);
        }
        resetForm();
    }, [selectedClassId, initialSelectedClass, teacherClasses]);
    
    const resetForm = () => {
        setDate(new Date().toISOString().split('T')[0]);
        setSubject('');
        setContent('');
        setIsEditing(null);
    }

    const logsForSelectedClass = useMemo(() => {
        if (!selectedClassId) return [];
        return classLogs
            .filter(log => log.classId === selectedClassId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [classLogs, selectedClassId]);
    
    const logsGroupedByMonth = useMemo(() => {
        return logsForSelectedClass.reduce((acc, log) => {
            const month = new Date(log.date + 'T00:00:00').toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
            if (!acc[month]) {
                acc[month] = [];
            }
            acc[month].push(log);
            return acc;
        }, {} as Record<string, ClassLogEntry[]>);
    }, [logsForSelectedClass]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClassId || !subject || !content || !user) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        if (isEditing) {
            const editorName = user.role === 'admin' ? user.username : undefined;
            updateClassLog({ 
                ...isEditing, 
                classId: selectedClassId, 
                date, 
                subject, 
                content 
            }, editorName);
            alert('Registro atualizado com sucesso!');
        } else {
            addClassLog({ 
                classId: selectedClassId, 
                date, 
                subject, 
                content,
                authorId: user.id,
                authorName: user.username
            });
            alert('Registro salvo com sucesso!');
        }
        resetForm();
    };

    const handleDelete = (logId: number) => {
        if (window.confirm('Tem certeza que deseja excluir este registro?')) {
            deleteClassLog(logId);
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6">
            <header className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Registro de Aulas</h2>
                <div>
                     <label htmlFor="class-select" className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Turma:</label>
                     <select 
                        id="class-select"
                        value={selectedClassId || ''}
                        onChange={(e) => setSelectedClassId(Number(e.target.value))}
                        className="bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                    >
                        {teacherClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna do Formulário */}
                <div className="lg:col-span-1">
                    {user?.role === 'educator' ? (
                        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4 sticky top-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{isEditing ? 'Editando Registro' : 'Novo Registro de Aula'}</h3>
                            <div>
                                <label htmlFor="log-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data da Aula</label>
                                <input type="date" id="log-date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-white dark:bg-gray-700/80 p-2 rounded-lg" />
                            </div>
                            <div>
                                <label htmlFor="log-subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Disciplina</label>
                                <select id="log-subject" value={subject} onChange={e => setSubject(e.target.value)} required className="w-full bg-white dark:bg-gray-700/80 p-2 rounded-lg">
                                    <option value="">Selecione...</option>
                                    {MOCK_SUBJECTS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="log-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conteúdo e Metodologia Utilizada</label>
                                <textarea
                                    id="log-content"
                                    rows={6}
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    placeholder="Descreva o conteúdo abordado, as atividades realizadas (exercícios no livro, trabalho em grupo, uso de vídeo, etc.) e a metodologia aplicada."
                                    required
                                    className="w-full bg-white dark:bg-gray-700/80 p-2 rounded-lg text-sm"
                                ></textarea>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button type="submit" className="flex-1 px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500">
                                    {isEditing ? 'Atualizar Registro' : 'Salvar Registro'}
                                </button>
                                {isEditing && (
                                    <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white">
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    ) : (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-300 sticky top-6">
                            <p className="font-semibold">Modo de Visualização</p>
                            {user?.role === 'admin' && <p className="text-sm mt-2">Como administrador, você pode editar ou excluir registros existentes na lista ao lado.</p>}
                            {user?.role === 'secretary' && <p className="text-sm mt-2">A secretaria tem permissão apenas para visualizar os registros de aula.</p>}
                        </div>
                    )}
                </div>

                {/* Coluna do Histórico */}
                <div className="lg:col-span-2">
                     <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Histórico de Registros da Turma</h3>
                     <div className="space-y-6">
                        {Object.keys(logsGroupedByMonth).length > 0 ? Object.keys(logsGroupedByMonth).map((month) => {
                            const logs = logsGroupedByMonth[month];
                            return (
                                <div key={month}>
                                    <h4 className="font-bold text-gray-500 dark:text-gray-400 capitalize mb-2">{month}</h4>
                                    <div className="space-y-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4 ml-2">
                                        {logs.map(log => {
                                            const canDelete = user?.role === 'admin' || (user?.role === 'educator' && user.id === log.authorId);
                                            const canEdit = user?.role === 'admin';

                                            return (
                                            <div key={log.id} className="relative p-4 bg-gray-50 dark:bg-gray-800/60 rounded-lg group">
                                                <div className="absolute -left-[27px] top-6 w-4 h-4 bg-white dark:bg-gray-500 rounded-full border-2 border-gray-200 dark:border-gray-700"></div>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                                        <p className="font-bold text-teal-600 dark:text-teal-300">{log.subject}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">por: {log.authorName} {log.lastEditedBy && <span className="italic">(editado por {log.lastEditedBy})</span>}</p>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                                                        {canEdit && <button onClick={() => setIsEditing(log)} className="p-1 text-blue-500 dark:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-xs">Editar</button>}
                                                        {canDelete && <button onClick={() => handleDelete(log.id)} className="p-1 text-red-500 dark:text-red-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-xs">Excluir</button>}
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{log.content}</p>
                                            </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                <p>Nenhum registro encontrado para esta turma.</p>
                                {user?.role === 'educator' && <p className="text-sm">Use o formulário ao lado para começar.</p>}
                            </div>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default ClassDiary;
