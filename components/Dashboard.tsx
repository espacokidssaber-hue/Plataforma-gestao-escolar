import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { NotificationType } from '../types';
import DailyChecklist from './dashboard/DailyChecklist';
import SystemTasks from './dashboard/SystemTasks';
import AnnualTasks from './dashboard/AnnualTasks';

const KPICard: React.FC<{ title: string; value: string; change?: string; changeType?: 'increase' | 'decrease' }> = ({ title, value, change, changeType }) => {
    const changeColor = changeType === 'increase' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    return (
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700/50">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
            {change && (
                <p className={`text-sm mt-2 flex items-center ${changeColor}`}>
                    {changeType === 'increase' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                    )}
                    {change}
                </p>
            )}
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { notifications } = useNotification();

    const unreadEnrollmentNotifications = notifications.filter(
        n => n.type === NotificationType.ENROLLMENT && !n.isRead
    ).length;
    
    // Mock data for other tasks
    const pendingDocsCount = 5;
    const assessmentsToGradeCount = 1;
    const overdueInvoicesCount = 3;
    const birthdaysTodayCount = 3;


    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard title="Alunos Matriculados" value="487" change="+5 este mês" changeType="increase" />
                <KPICard title="Novos Leads" value="23" change="+12% vs. semana passada" changeType="increase" />
                <KPICard title="Inadimplência" value="3.4%" change="-0.5% vs. mês passado" changeType="decrease" />
                <KPICard title="Vagas Disponíveis" value="13" />
            </div>

            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700/50">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Meu Dia</h3>
                <div className="flex flex-col space-y-8">
                    {/* Seção de Tarefas do Sistema */}
                    <SystemTasks
                        unreadEnrollmentCount={unreadEnrollmentNotifications}
                        pendingDocsCount={pendingDocsCount}
                        assessmentsToGradeCount={assessmentsToGradeCount}
                        overdueInvoicesCount={overdueInvoicesCount}
                        birthdaysTodayCount={birthdaysTodayCount}
                    />
                    {/* Seção de Checklists */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-gray-200 dark:border-gray-700/50">
                        <AnnualTasks />
                        <DailyChecklist />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;