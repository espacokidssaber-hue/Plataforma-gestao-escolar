import React, { useMemo, useState } from 'react';
import { AcademicSubView, ClassPeriod, SchoolUnit, SchoolClass, DAYS_OF_WEEK, View } from '../../types';
import { useEnrollment } from '../../contexts/EnrollmentContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCommunication } from '../../contexts/CommunicationContext';

interface TeacherDashboardProps {
    onSelectClass: (classInfo: { id: number; name: string }, targetView?: AcademicSubView) => void;
    setActiveView: (view: View) => void;
}

const TaskCard: React.FC<{ title: string; count: number; action: string }> = ({ title, count, action }) => (
    <div className="bg-white dark:bg-gray-800/70 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50 flex flex-col items-center justify-center text-center">
        <p className="text-4xl font-bold text-teal-600 dark:text-teal-300">{count}</p>
        <h3 className="text-sm font-medium text-gray-700 dark:text-white mt-1">{title}</h3>
        <button className="mt-3 text-xs text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-800/50 px-3 py-1 rounded-full hover:bg-teal-200 dark:hover:bg-teal-800">{action}</button>
    </div>
);


const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onSelectClass, setActiveView }) => {
    const { classes, schedules } = useEnrollment();
    const { user } = useAuth();
    const { unreadCount: unreadInternalMessages } = useCommunication();
    
    const today = new Date();
    const dayOfWeek = DAYS_OF_WEEK[today.getDay() - 1] || ''; // -1 because Sunday is 0

    const teacherClasses = useMemo(() => {
        if (!user || user.role !== 'educator') return classes;
        return classes.filter(c => 
            c.teachers.matriz === user.id || 
            c.teachers.filial === user.id || 
            c.teachers.anexo === user.id
        );
    }, [classes, user]);

    const todaySchedule = useMemo(() => {
        if (!user || !dayOfWeek) return [];
        
        const teacherSchedule: { time: string; subject: string; className: string }[] = [];

        teacherClasses.forEach(c => {
            const classSchedule = schedules[c.id];
            if (classSchedule && classSchedule[dayOfWeek]) {
                for (const time in classSchedule[dayOfWeek]) {
                    if (classSchedule[dayOfWeek][time].educatorId === user.id) {
                        teacherSchedule.push({
                            time: time,
                            subject: classSchedule[dayOfWeek][time].subject,
                            className: c.name
                        });
                    }
                }
            }
        });
        
        return teacherSchedule.sort((a,b) => a.time.localeCompare(b.time));

    }, [user, dayOfWeek, teacherClasses, schedules]);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bem-vindo(a), {user?.username}!</h2>
                <p className="text-gray-500 dark:text-gray-400">Aqui estão suas tarefas e turmas para hoje.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Minhas Turmas</h3>
                        <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                            <th className="p-3">Turma</th>
                                            <th className="p-3">Série</th>
                                            <th className="p-3">Período</th>
                                            <th className="p-3 text-right">Ações Rápidas</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teacherClasses.map(c => (
                                            <tr key={c.id} className="border-b border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                                <td className="p-3 font-semibold text-gray-900 dark:text-white">{c.name}</td>
                                                <td className="p-3 text-gray-600 dark:text-gray-300">{c.grade}</td>
                                                <td className="p-3 text-gray-600 dark:text-gray-300">{c.period}</td>
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
                                {teacherClasses.length === 0 && (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-6">Nenhuma turma atribuída a você.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800/30 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Horário de Hoje ({dayOfWeek})</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {todaySchedule.length > 0 ? todaySchedule.map(item => (
                                <div key={item.time + item.className} className="flex items-center text-sm p-2 bg-gray-100 dark:bg-gray-800/70 rounded-md">
                                    <span className="font-mono text-teal-600 dark:text-teal-300 font-semibold w-16">{item.time}</span>
                                    <div className="border-l border-gray-300 dark:border-gray-600 pl-3 ml-3">
                                        <p className="font-semibold text-gray-800 dark:text-white">{item.subject}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.className}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">Nenhuma aula programada para hoje.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800/30 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Comunicação</h3>
                         <button 
                            onClick={() => setActiveView(View.COMMUNICATION)}
                            className="w-full relative px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 flex items-center justify-center space-x-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 2.332l7.997 3.552A1 1 0 0118 6.884V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.884a1 1 0 01.003-.999zM11.383 11.444c.43.234.953.234 1.383 0l3.93-2.162a1 1 0 00-1.384-1.56L10 10.118 4.617 7.722a1 1 0 00-1.383 1.56l3.93 2.162z" /></svg>
                            <span>Mensagens Internas</span>
                             {unreadInternalMessages > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {unreadInternalMessages}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;