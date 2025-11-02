import React from 'react';
import { SchoolClass, ClassPeriod, SchoolUnit } from '../../types';

interface TeacherDashboardProps {
    onSelectClass: (classInfo: { id: number; name: string }) => void;
}

const MOCK_TEACHER_CLASSES: Partial<SchoolClass>[] = [
    { id: 1, name: 'Infantil II A', grade: 'Infantil II', period: ClassPeriod.MORNING, students: { length: 18 } as any, unit: SchoolUnit.MATRIZ },
    { id: 2, name: '1º Ano A', grade: '1º Ano', period: ClassPeriod.MORNING, students: { length: 25 } as any, unit: SchoolUnit.MATRIZ },
    { id: 3, name: '2º Ano B', grade: '2º Ano', period: ClassPeriod.AFTERNOON, students: { length: 23 } as any, unit: SchoolUnit.FILIAL },
];

const TaskCard: React.FC<{ title: string; count: number; action: string }> = ({ title, count, action }) => (
    <div className="bg-white dark:bg-gray-800/70 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50 flex flex-col items-center justify-center text-center">
        <p className="text-4xl font-bold text-teal-600 dark:text-teal-300">{count}</p>
        <h3 className="text-sm font-medium text-gray-700 dark:text-white mt-1">{title}</h3>
        <button className="mt-3 text-xs text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-800/50 px-3 py-1 rounded-full hover:bg-teal-200 dark:hover:bg-teal-800">{action}</button>
    </div>
);

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onSelectClass }) => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TaskCard title="Avaliações para Corrigir" count={2} action="Ver Pendências" />
                <TaskCard title="Frequências para Lançar" count={1} action="Lançar Agora" />
                <TaskCard title="Ocorrências Disciplinares" count={0} action="Ver Ocorrências" />
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Minhas Turmas</h2>
                <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                    <th className="p-3">Turma</th>
                                    <th className="p-3">Série</th>
                                    <th className="p-3">Período</th>
                                    <th className="p-3">Alunos</th>
                                    <th className="p-3 text-right">Ação Rápida</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_TEACHER_CLASSES.map(c => (
                                    <tr key={c.id} className="border-b border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                        <td className="p-3 font-semibold text-gray-900 dark:text-white">{c.name}</td>
                                        <td className="p-3 text-gray-600 dark:text-gray-300">{c.grade}</td>
                                        <td className="p-3 text-gray-600 dark:text-gray-300">{c.period}</td>
                                        <td className="p-3 text-gray-600 dark:text-gray-300">{c.students?.length}</td>
                                        <td className="p-3 text-right">
                                            <button 
                                                onClick={() => onSelectClass({id: c.id!, name: c.name!})}
                                                className="px-3 py-1 bg-teal-100 text-teal-700 dark:bg-teal-600/50 dark:text-teal-200 text-sm font-semibold rounded-md hover:bg-teal-200 hover:text-teal-800 dark:hover:bg-teal-600 dark:hover:text-white transition-colors"
                                            >
                                                Gerenciar Turma
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;