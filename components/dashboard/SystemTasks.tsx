import React, { useState, useEffect } from 'react';
import { SystemTask } from '../../types';

interface SystemTasksProps {
    unreadEnrollmentCount: number;
    pendingDocsCount: number;
    assessmentsToGradeCount: number;
    overdueInvoicesCount: number;
    birthdaysTodayCount: number;
}

// Icons without color classes, color will be applied dynamically
const icons = {
    docs: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    grade: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    invoice: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    birthday: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 5a3 3 0 013-3h2a3 3 0 013 3v2a3 3 0 01-3 3H8a3 3 0 01-3-3V5zm5 4a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd" /><path d="M3 10a2 2 0 012-2h10a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5z" /></svg>,
    enrollment: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
};

const colorMap = {
    enrollments: 'teal',
    documents: 'yellow',
    grading: 'purple',
    invoices: 'red',
    birthdays: 'pink'
};

const colorClasses: Record<string, string> = {
    teal: 'bg-teal-100 dark:bg-teal-800/50 text-teal-600 dark:text-teal-300',
    yellow: 'bg-yellow-100 dark:bg-yellow-800/50 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-100 dark:bg-purple-800/50 text-purple-600 dark:text-purple-400',
    red: 'bg-red-100 dark:bg-red-800/50 text-red-600 dark:text-red-400',
    pink: 'bg-pink-100 dark:bg-pink-800/50 text-pink-600 dark:text-pink-400',
};

const SystemTasks: React.FC<SystemTasksProps> = (props) => {
    const [tasks, setTasks] = useState<SystemTask[]>([]);
    const todayKey = `system_tasks_completed_${new Date().toISOString().split('T')[0]}`;

    useEffect(() => {
        const potentialTasks: Omit<SystemTask, 'isCompleted'>[] = [];

        if (props.unreadEnrollmentCount > 0) {
            potentialTasks.push({
                id: 'enrollments',
                icon: icons.enrollment,
                title: 'Novas Matrículas e Pré-Matrículas',
                subtitle: `${props.unreadEnrollmentCount} processo(s) concluído(s) aguardando revisão`,
            });
        }
        if (props.pendingDocsCount > 0) {
             potentialTasks.push({
                id: 'documents',
                icon: icons.docs,
                title: 'Documentação Pendente',
                subtitle: `${props.pendingDocsCount} novas matrículas aguardando validação`,
            });
        }
        if (props.assessmentsToGradeCount > 0) {
            potentialTasks.push({
                id: 'grading',
                icon: icons.grade,
                title: 'Corrigir Avaliações',
                subtitle: 'Prova de Matemática - Turma 2º Ano B',
            });
        }
        if (props.overdueInvoicesCount > 0) {
             potentialTasks.push({
                id: 'invoices',
                icon: icons.invoice,
                title: 'Analisar Faturas Vencidas',
                subtitle: `${props.overdueInvoicesCount} faturas com mais de 15 dias de atraso`,
            });
        }
        if (props.birthdaysTodayCount > 0) {
             potentialTasks.push({
                id: 'birthdays',
                icon: icons.birthday,
                title: 'Aniversariantes do Dia',
                subtitle: `${props.birthdaysTodayCount} na comunidade escolar`,
            });
        }

        const completedStatus = JSON.parse(localStorage.getItem(todayKey) || '{}');
        const finalTasks = potentialTasks.map(task => ({
            ...task,
            isCompleted: completedStatus[task.id] || false,
        }));

        setTasks(finalTasks);
    }, [props, todayKey]);

    const handleCompleteTask = (taskId: string) => {
        const updatedTasks = tasks.map(task => 
            task.id === taskId ? { ...task, isCompleted: true } : task
        );
        setTasks(updatedTasks);
        
        const completedStatus = JSON.parse(localStorage.getItem(todayKey) || '{}');
        completedStatus[taskId] = true;
        localStorage.setItem(todayKey, JSON.stringify(completedStatus));
    };

    if (tasks.length === 0) {
         return (
             <div className="space-y-2 h-full flex flex-col justify-center items-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="font-semibold text-gray-800 dark:text-white">Parabéns!</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma tarefa do sistema pendente para hoje.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {tasks.map(task => {
                const colorKey = colorMap[task.id as keyof typeof colorMap] || 'teal';
                const [bgColor, textColor] = colorClasses[colorKey].split(' ');

                return (
                    <div key={task.id} className={`flex items-center space-x-4 p-3 rounded-lg transition-all duration-300 ${task.isCompleted ? 'bg-gray-100 dark:bg-gray-800/40 opacity-50' : 'bg-gray-50 dark:bg-gray-900/40'}`}>
                        <div className={`p-3 rounded-full ${bgColor}`}>
                            {React.cloneElement(task.icon as React.ReactElement, { className: `h-6 w-6 ${textColor}` })}
                        </div>
                        <div className="flex-grow">
                            <h4 className={`font-semibold ${task.isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`}>{task.title}</h4>
                            <p className={`text-sm ${task.isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>{task.subtitle}</p>
                        </div>
                        {task.isCompleted ? (
                             <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 font-semibold text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                <span>Concluído</span>
                            </div>
                        ) : (
                             <button onClick={() => handleCompleteTask(task.id)} className="px-3 py-1.5 text-xs font-semibold bg-teal-100 dark:bg-teal-600/50 text-teal-700 dark:text-teal-200 rounded-md hover:bg-teal-200 dark:hover:bg-teal-600">
                                Concluir
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default SystemTasks;