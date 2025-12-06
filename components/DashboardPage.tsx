
import React, { useMemo } from 'react';
import { Lead, LeadStatus, User } from '../types';
import { Button } from './ui/Button';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { FolderOpenIcon } from './icons/FolderOpenIcon';
import { UsersIcon } from './icons/UsersIcon';
import { AcademicCapIcon } from './icons/AcademicCapIcon';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    description: string;
    colorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description, colorClass = "bg-teal-100 text-teal-600" }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start transition-all hover:shadow-md hover:translate-y-[-2px]">
        <div className={`${colorClass} rounded-lg p-3 mr-4`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{description}</p>
        </div>
    </div>
);

interface DashboardPageProps {
  leads: Lead[];
  onNavigate: (pageId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ leads, onNavigate }) => {
  const metrics = useMemo(() => {
    const leadsInFunnel = leads.filter(l => 
      l.status === LeadStatus.NEGOTIATION ||
      l.status === LeadStatus.AWAITING_ENROLLMENT ||
      l.status === LeadStatus.ENROLLMENT_STARTED
    ).length;

    const enrollmentsToAllocate = leads.filter(l => l.status === LeadStatus.COMPLETED).length;

    const allocatedStudents = leads.filter(l => l.status === LeadStatus.ALLOCATED);
    const totalStudents = allocatedStudents.length;

    const monthlyRevenue = allocatedStudents.reduce((acc, student) => {
      const monthlyFee = student.monthlyFee || 0;
      const discount = student.discountPercentage || 0;
      const finalFee = monthlyFee * (1 - discount / 100);
      return acc + finalFee;
    }, 0);

    const recentActivity = leads
        .filter(l => l.status === LeadStatus.ALLOCATED || l.status === LeadStatus.COMPLETED)
        .slice(-5)
        .reverse();

    return {
      leadsInFunnel,
      enrollmentsToAllocate,
      totalStudents,
      monthlyRevenue,
      recentActivity
    };
  }, [leads]);

  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50/50 min-h-full">
      {/* System Status Banner - Updated for v3.28.0 */}
      <div className="bg-gradient-to-r from-indigo-50 to-white p-3 rounded-lg shadow-sm border border-indigo-100 mb-6 flex items-center justify-between animate-fadeIn">
        <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </div>
            <span className="text-sm font-semibold text-indigo-900">Sistema Operacional • v3.28.0</span>
        </div>
        <div className="text-xs text-indigo-600 font-medium">
            Correção de Build Aplicada
        </div>
      </div>

      {/* Hero Header */}
      <div className="mb-10 relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 shadow-lg">
        <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
        </div>
        <div className="relative p-8 text-white">
            <h1 className="text-3xl font-extrabold tracking-tight">Visão Geral</h1>
            <p className="mt-2 text-teal-100 text-lg max-w-2xl">
                Acompanhe o desempenho da sua escola em tempo real.
            </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Leads no Funil"
          value={metrics.leadsInFunnel}
          icon={UsersIcon}
          description="Em negociação ou matrícula."
          colorClass="bg-blue-100 text-blue-600"
        />
        <StatCard 
          title="Para Alocar"
          value={metrics.enrollmentsToAllocate}
          icon={UserPlusIcon}
          description="Matrículas concluídas."
          colorClass="bg-amber-100 text-amber-600"
        />
        <StatCard 
          title="Alunos Ativos"
          value={metrics.totalStudents}
          icon={AcademicCapIcon}
          description="Alocados em turmas."
          colorClass="bg-emerald-100 text-emerald-600"
        />
        <StatCard 
          title="Receita Mensal"
          value={formatCurrency(metrics.monthlyRevenue)}
          icon={CurrencyDollarIcon}
          description="Estimativa recorrente."
          colorClass="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
           <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
               <SparklesIcon className="w-5 h-5 mr-2 text-teal-500"/>
               Acesso Rápido
           </h2>
           <div className="space-y-4">
               <div className="group p-4 bg-gray-50 hover:bg-teal-50 rounded-xl transition-colors border border-transparent hover:border-teal-100 cursor-pointer" onClick={() => onNavigate('marketing')}>
                   <div className="flex items-center">
                       <div className="bg-white p-2 rounded-lg shadow-sm mr-4 group-hover:scale-110 transition-transform">
                           <UserPlusIcon className="w-6 h-6 text-teal-600" />
                       </div>
                       <div>
                           <h3 className="font-semibold text-gray-800">Novo Interessado</h3>
                           <p className="text-xs text-gray-500">Cadastrar lead no CRM</p>
                       </div>
                   </div>
               </div>
               
               <div className="group p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100 cursor-pointer" onClick={() => onNavigate('gestao-matriculas')}>
                   <div className="flex items-center">
                       <div className="bg-white p-2 rounded-lg shadow-sm mr-4 group-hover:scale-110 transition-transform">
                           <FolderOpenIcon className="w-6 h-6 text-blue-600" />
                       </div>
                       <div>
                           <h3 className="font-semibold text-gray-800">Gerenciar Matrículas</h3>
                           <p className="text-xs text-gray-500">Alocar alunos em turmas</p>
                       </div>
                   </div>
               </div>
           </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Últimas Movimentações</h2>
          <div className="flow-root">
             {metrics.recentActivity.length > 0 ? (
                <ul className="-mb-8">
                  {metrics.recentActivity.map((lead, index) => (
                    <li key={lead.id}>
                      <div className="relative pb-8">
                        {index !== metrics.recentActivity.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${lead.status === LeadStatus.COMPLETED ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                                {lead.status === LeadStatus.COMPLETED ? (
                                    <UserPlusIcon className="h-5 w-5 text-white" />
                                ) : (
                                    <AcademicCapIcon className="h-5 w-5 text-white" />
                                )}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-800">
                                O aluno <span className="font-bold">{lead.studentName}</span> avançou para <span className="font-semibold text-teal-700">{lead.status}</span>
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">Responsável: {lead.responsibleName}</p>
                            </div>
                            <div className="text-right text-xs whitespace-nowrap text-gray-400">
                              <time dateTime={lead.invitationSentAt}>{new Date().toLocaleDateString()}</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
             ) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <FolderOpenIcon className="w-12 h-12 mb-2 opacity-20" />
                    <p>Nenhuma atividade recente registrada.</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
