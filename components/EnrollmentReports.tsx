import React, { useMemo } from 'react';
import { useEnrollment } from '../contexts/EnrollmentContext';
// FIX: Added 'NewEnrollmentStatus' to the import from '../types' to resolve a reference error.
import { LeadStatus, StudentLifecycleStatus, SchoolClass, EnrolledStudent, NewEnrollmentStatus } from '../types';

// --- Reusable Chart & UI Components ---

const FilterButton: React.FC<{ label: string; active?: boolean }> = ({ label, active }) => (
    <button className={`px-3 py-1.5 text-sm rounded-md transition-colors ${active ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}>
        {label}
    </button>
);

const Widget: React.FC<{ title: string; children: React.ReactNode; flexCol?: boolean }> = ({ title, children, flexCol = false }) => (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700/50 h-full flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className={`flex-grow ${flexCol ? 'flex flex-col' : ''}`}>
            {children}
        </div>
    </div>
);

const KPIGauge: React.FC<{ value: number; max: number; label: string }> = ({ value, max, label }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const circumference = 2 * Math.PI * 45; // 2 * pi * r
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center h-full">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="10" fill="transparent" />
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#14b8a6"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
            </svg>
            <div className="absolute text-center">
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-xs text-teal-600 dark:text-teal-300">Meta: {max}</p>
            </div>
        </div>
    );
};

const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    let cumulative = 0;

    return (
        <div className="flex items-center justify-around h-full">
            <div className="relative w-40 h-40">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                    {data.map((item, index) => {
                        const percentage = total > 0 ? (item.value / total) * 100 : 0;
                        const offset = cumulative;
                        cumulative += percentage;
                        return (
                            <circle
                                key={index}
                                r="15.9"
                                cx="18"
                                cy="18"
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth="4"
                                strokeDasharray={`${percentage} ${100 - percentage}`}
                                strokeDashoffset={-offset}
                            />
                        );
                    })}
                </svg>
                 <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{total}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Total</span>
                </div>
            </div>
            <div className="space-y-2">
                {data.map(item => (
                    <div key={item.label} className="flex items-center text-sm">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                        <span className="text-gray-600 dark:text-gray-300">{item.label}: <span className="font-bold text-gray-900 dark:text-white">{item.value}</span></span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BarChart: React.FC<{ data: { label: string; value: number }[], color: string }> = ({ data, color }) => {
    const max = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
    return (
        <div className="flex justify-around items-end h-full pt-4">
            {data.map(item => (
                <div key={item.label} className="flex flex-col items-center">
                    <span className="text-gray-900 dark:text-white font-bold">{item.value}</span>
                    <div
                        className="w-8 rounded-t-md"
                        style={{ height: `${(item.value / max) * 100}%`, backgroundColor: color, minHeight: '2px' }}
                    ></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.label}</span>
                </div>
            ))}
        </div>
    );
};

const FunnelChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const max = data[0]?.value || 1;
    const colors = ["#14b8a6", "#0d9488", "#0f766e", "#115e59"];

    return (
        <div className="space-y-1">
            {data.map((item, index) => {
                const width = (item.value / max) * 100;
                return (
                    <div key={item.label} className="flex items-center text-sm">
                        <div className="w-24 text-right pr-2 text-gray-500 dark:text-gray-400">{item.label}</div>
                        <div className="flex-grow flex items-center">
                            <div style={{ width: `${width}%`, backgroundColor: colors[index % colors.length] }} className="h-6 flex items-center justify-end pr-2 text-white font-bold rounded-sm">
                                {item.value}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => {
    let bgColor = 'bg-green-500';
    if (percentage > 80) bgColor = 'bg-yellow-500';
    if (percentage >= 100) bgColor = 'bg-red-500';

    return (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className={`${bgColor} h-2.5 rounded-full`} style={{ width: `${percentage > 100 ? 100 : percentage}%` }}></div>
        </div>
    );
};

const ClassOccupancyReport: React.FC<{ classes: SchoolClass[]; enrolledStudents: EnrolledStudent[] }> = ({ classes, enrolledStudents }) => {
    return (
        <Widget title="Relatório de Ocupação de Turmas">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                            <th className="p-3">Turma</th>
                            <th className="p-3 text-center">Vagas (Ocup/Total)</th>
                            <th className="p-3 w-1/4">Ocupação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classes.map(c => {
                            const occupied = enrolledStudents.filter(s => s.classId === c.id).length;
                            const totalCapacity = (c.capacity?.matriz || 0) + (c.capacity?.filial || 0) + (c.capacity?.anexo || 0);
                            const percentage = totalCapacity > 0 ? (occupied / totalCapacity) * 100 : 0;
                            
                            return (
                                <tr key={c.id} className="border-b border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                    <td className="p-3">
                                        <p className="font-semibold text-gray-800 dark:text-white">{c.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{c.grade} - {c.period}</p>
                                    </td>
                                    <td className="p-3 text-center text-gray-600 dark:text-gray-300 font-mono">
                                        {occupied} / {totalCapacity}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center space-x-2">
                                            <ProgressBar percentage={percentage} />
                                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{percentage.toFixed(0)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </Widget>
    );
};


export const EnrollmentReports: React.FC = () => {
    const { enrolledStudents, leads, classes, applicants } = useEnrollment();

    // Calculate real data for charts
    const activeStudentsCount = enrolledStudents.filter(s => s.status === StudentLifecycleStatus.ACTIVE).length;
    const pendingApplicantsCount = applicants.filter(a => a.status !== NewEnrollmentStatus.ENROLLED).length;
    
    const totalCapacity = classes.reduce((sum, cls) => {
        const capacity = (cls.capacity?.matriz || 0) + (cls.capacity?.filial || 0) + (cls.capacity?.anexo || 0);
        return sum + capacity;
    }, 0);
    
    const compositionData = [
        { label: 'Alunos Matriculados', value: activeStudentsCount, color: '#14b8a6' },
        { label: 'Candidatos na Fila', value: pendingApplicantsCount, color: '#2dd4bf' }
    ];

    const funnelData = [
        { label: 'Leads', value: leads.length },
        { label: 'Visitou', value: leads.filter(l => [LeadStatus.VISIT_SCHEDULED, LeadStatus.NEGOTIATION, LeadStatus.ENROLLMENT_INVITED, LeadStatus.WON].includes(l.status)).length },
        { label: 'Negociação', value: leads.filter(l => [LeadStatus.NEGOTIATION, LeadStatus.ENROLLMENT_INVITED, LeadStatus.WON].includes(l.status)).length },
        { label: 'Convertido', value: leads.filter(l => l.status === LeadStatus.WON).length }
    ];

    const churnCount = enrolledStudents.filter(s => s.status === StudentLifecycleStatus.TRANSFERRED_OUT || s.status === StudentLifecycleStatus.CANCELLED).length;

    const channelData = useMemo(() => {
        const sources = leads.reduce((acc, lead) => {
            const source = lead.source || 'Desconhecida';
            acc[source] = (acc[source] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(sources).map(([label, value]) => ({ label, value }));
    }, [leads]);
    
    return (
        <div className="mt-6 space-y-8">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Gerencial</h2>
                    <p className="text-gray-500 dark:text-gray-400">Visão geral da saúde da escola em tempo real.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <FilterButton label="Ano Letivo: 2025" active />
                    <FilterButton label="Fundamental I" />
                     <button onClick={() => alert("Simulando exportação para PDF...")} className="p-2 bg-gray-200 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" /></svg>
                     </button>
                      <button onClick={() => alert("Simulando agendamento de relatório...")} className="p-2 bg-gray-200 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                      </button>
                </div>
            </header>

            {/* --- KPIs Section --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                <Widget title="Ocupação Total"><KPIGauge value={activeStudentsCount} max={totalCapacity} label="Alunos" /></Widget>
                <Widget title="Composição"><DonutChart data={compositionData} /></Widget>
                <Widget title="Funil de Captação"><FunnelChart data={funnelData} /></Widget>
                <Widget title="Taxa de Evasão (Churn)" flexCol>
                    <div className="text-center flex-grow flex flex-col justify-center">
                        <p className="text-5xl font-bold text-red-500 dark:text-red-400">{churnCount}</p>
                        <p className="text-gray-500 dark:text-gray-400">Alunos perdidos no ano</p>
                    </div>
                </Widget>
            </div>

            {/* --- Growth & Churn Analysis --- */}
            <div className="grid grid-cols-1 gap-6">
                <Widget title="Eficácia de Canal (Novos Leads)"><BarChart data={channelData} color="#14b8a6" /></Widget>
            </div>

             {/* --- Operational Reports --- */}
            <div>
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Relatórios Operacionais</h2>
                 <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700/50">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                    <th className="p-3">Nome do Relatório</th>
                                    <th className="p-3">Descrição</th>
                                    <th className="p-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200 dark:border-gray-700/50">
                                    <td className="p-3 font-semibold text-gray-900 dark:text-white">Lista Mestra de Alunos</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-300">Tabela completa de todos os alunos matriculados.</td>
                                    <td className="p-3 text-right space-x-2">
                                        <button className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-200">CSV</button>
                                        <button className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-200">PDF</button>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-200 dark:border-gray-700/50">
                                    <td className="p-3 font-semibold text-gray-900 dark:text-white">Alunos por Turma (Diário)</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-300">Listagem de alunos agrupada por turma.</td>
                                    <td className="p-3 text-right space-x-2">
                                        <button className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-200">CSV</button>
                                        <button className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-200">PDF</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-semibold text-gray-900 dark:text-white">Relatório de Vagas Ociosas</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-300">Lista de turmas com vagas ainda disponíveis.</td>
                                    <td className="p-3 text-right space-x-2">
                                        <button className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-200">CSV</button>
                                        <button className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-200">PDF</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <ClassOccupancyReport classes={classes} enrolledStudents={enrolledStudents} />
                 </div>
            </div>
        </div>
    );
};