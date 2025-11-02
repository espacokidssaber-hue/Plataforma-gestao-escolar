import React, { useMemo, useState } from 'react';
import { AcademicSubView, ClassPeriod, SchoolUnit, SchoolClass } from '../../types';
import { useEnrollment } from '../../contexts/EnrollmentContext';
import { useAuth } from '../../contexts/AuthContext';
import RequestToSecretaryModal from './RequestToSecretaryModal';

interface TeacherDashboardProps {
    onSelectClass: (classInfo: { id: number; name: string }, targetView?: AcademicSubView) => void;
}

const TaskCard: React.FC<{ title: string; count: number; action: string }> = ({ title, count, action }) => (
    <div className="bg-white dark:bg-gray-800/70 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50 flex flex-col items-center justify-center text-center">
        <p className="text-4xl font-bold text-teal-600 dark:text-teal-300">{count}</p>
        <h3 className="text-sm font-medium text-gray-700 dark:text-white mt-1">{title}</h3>
        <button className="mt-3 text-xs text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-800/50 px-3 py-1 rounded-full hover:bg-teal-200 dark:hover:bg-teal-800">{action}</button>
    </div>
);

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onSelectClass }) => {
    const { classes } = useEnrollment();
    const { user } = useAuth();
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    const teacherClasses = useMemo(() => {
        if (!user || user.role !== 'educator') return classes; // Show all for admin/secretary for now
        return classes.filter(c => 
            c.teachers.matriz === user.id || 
            c.teachers.filial === user.id || 
            c.teachers.anexo === user.id
        );
    }, [classes, user]);

    return (
        <>
            <div className="space-y-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bem-vindo(a), {user?.username}!</h2>
                        <p className="text-gray-500 dark:text-gray-400">Aqui estão suas tarefas e turmas para hoje.</p>
                    </div>
                    <button onClick={() => setIsRequestModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 2.332l7.997 3.552A1 1 0 0118 6.884V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.884a1 1 0 01.003-.999zM11.383 11.444c.43.234.953.234 1.383 0l3.93-2.162a1 1 0 00-1.384-1.56L10 10.118 4.617 7.722a1 1 0 00-1.383 1.56l3.93 2.162z" /></svg>
                        <span>Enviar Solicitação à Secretaria</span>
                    </button>
                </div>
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
                                        <th className="p-3 text-right">Ações Rápidas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teacherClasses.map(c => (
                                        <tr key={c.id} className="border-b border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                            <td className="p-3 font-semibold text-gray-900 dark:text-white">{c.name}</td>
                                            <td className="p-3 text-gray-600 dark:text-gray-300">{c.grade}</td>
                                            <td className="p-3 text-gray-600 dark:text-gray-300">{c.period}</td>
                                            <td className="p-3 text-gray-600 dark:text-gray-300">{c.students?.length}</td>
                                            <td className="p-3 text-right space-x-2">
                                                 <button 
                                                    onClick={() => onSelectClass({id: c.id!, name: c.name!}, AcademicSubView.CLASS_DIARY)}
                                                    className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-600/50 dark:text-blue-200 text-xs font-semibold rounded-md hover:bg-blue-200"
                                                >
                                                    Registrar Aula
                                                </button>
                                                <button 
                                                    onClick={() => onSelectClass({id: c.id!, name: c.name!}, AcademicSubView.GRADES_ATTENDANCE)}
                                                    className="px-3 py-1 bg-teal-100 text-teal-700 dark:bg-teal-600/50 dark:text-teal-200 text-sm font-semibold rounded-md hover:bg-teal-200"
                                                >
                                                    Lançar Notas/Faltas
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
            {isRequestModalOpen && <RequestToSecretaryModal onClose={() => setIsRequestModalOpen(false)} />}
        </>
    );
};

export default TeacherDashboard;