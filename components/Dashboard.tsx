import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { LeadStatus, NotificationType, StudentLifecycleStatus, NewEnrollmentStatus, View } from '../types';
import DailyChecklist from './dashboard/DailyChecklist';
import SystemTasks from './dashboard/SystemTasks';
import AnnualTasks from './dashboard/AnnualTasks';
import { useEnrollment } from '../contexts/EnrollmentContext';

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

interface DashboardProps {
  setActiveView: (view: View) => void;
}


const Dashboard: React.FC<DashboardProps> = ({ setActiveView }) => {
    const { notifications } = useNotification();
    const { enrolledStudents, leads, classes, applicants } = useEnrollment();

    const unreadEnrollmentNotifications = notifications.filter(
        n => n.type === NotificationType.ENROLLMENT && !n.isRead
    ).length;

    // Calculate real data for KPIs
    const activeStudentsCount = enrolledStudents.filter(s => s.status === StudentLifecycleStatus.ACTIVE).length;
    const newLeadsCount = leads.filter(l => l.status === LeadStatus.NEW).length;
    const pendingFinancialCount = enrolledStudents.filter(s => s.financialStatus === 'Pendente').length;
    
    const totalCapacity = classes.reduce((acc, c) => {
        const capacity = (c.capacity?.matriz || 0) + (c.capacity?.filial || 0) + (c.capacity?.anexo || 0);
        return acc + capacity;
    }, 0);
    const availableSpots = Math.max(0, totalCapacity - activeStudentsCount);

    // Calculate real data for "Meu Dia" tasks
    const pendingDocsCount = applicants.filter(
        a => a.status === NewEnrollmentStatus.PENDING_ANALYSIS
    ).length;
    
    // Placeholder until a real data source for assessments is implemented
    const assessmentsToGradeCount = 0; 

    const today = new Date();
    const todayMonthDay = `${today.getMonth() + 1}-${today.getDate()}`;
    const birthdaysTodayCount = enrolledStudents.filter(s => {
        if (!s.dateOfBirth) return false;
        // Adding 'T00:00:00' ensures the date is parsed in the local timezone, avoiding UTC conversion issues.
        const dob = new Date(s.dateOfBirth + 'T00:00:00'); 
        const studentMonthDay = `${dob.getMonth() + 1}-${dob.getDate()}`;
        return studentMonthDay === todayMonthDay;
    }).length;


    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard title="Alunos Ativos" value={activeStudentsCount.toString()} />
                <KPICard title="Novos Leads (Funil)" value={newLeadsCount.toString()} />
                <KPICard title="Pendências Financeiras" value={pendingFinancialCount.toString()} />
                <KPICard title="Vagas Disponíveis" value={availableSpots.toString()} />
            </div>

            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700/50">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Meu Dia</h3>
                <div className="flex flex-col space-y-8">
                    {/* Seção de Tarefas do Sistema */}
                    <SystemTasks
                        unreadEnrollmentCount={unreadEnrollmentNotifications}
                        pendingDocsCount={pendingDocsCount}
                        assessmentsToGradeCount={assessmentsToGradeCount}
                        overdueInvoicesCount={pendingFinancialCount}
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