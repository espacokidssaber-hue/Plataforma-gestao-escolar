import React, { useState, useEffect, useLayoutEffect } from 'react';
import { streamDocumentText } from '../services/geminiService';
import { useEnrollment } from '../contexts/EnrollmentContext';
import * as XLSX from 'xlsx';
import { useSchoolInfo } from '../contexts/EnrollmentContext';
import { SchoolInfo } from '../types';

// html2pdf is loaded globally from index.html
declare const html2pdf: any;


// --- MOCK DATA ---
const ALL_MOCK_DATA: Record<string, Record<string, any>> = {
  '2025': {
    'Todos': {
      overallAverage: 8.3,
      approvalRate: 92.4,
      atRiskStudents: 18,
      averageAttendance: 97.5,
      academicPerformanceData: [{ label: '1º A', value: 8.2 }, { label: '2º B', value: 7.5 }, { label: '3º A', value: 9.1 }, { label: '4º C', value: 8.8 }, { label: '5º A', value: 7.8 }],
      performanceBySubjectData: [{ label: 'Português', value: 8.5 }, { label: 'Matemática', value: 7.8 }, { label: 'Ciências', value: 8.9 }, { label: 'História', value: 8.1 }, { label: 'Artes', value: 9.2 }],
      approvalRateDonutData: [{ label: 'Aprovados', value: 450, color: '#22c55e' }, { label: 'Recuperação', value: 25, color: '#f97316' }, { label: 'Reprovados', value: 12, color: '#ef4444' }],
      schoolAverageEvolutionData: [{ label: '2023', value: 8.0 }, { label: '2024', value: 8.1 }, { label: '2025', value: 8.3 }],
    },
    'Infantil': {
      overallAverage: 9.4,
      approvalRate: 100.0,
      atRiskStudents: 0,
      averageAttendance: 98.2,
      academicPerformanceData: [{ label: 'Inf II A', value: 9.5 }, { label: 'Inf III B', value: 9.2 }, { label: 'Inf IV A', value: 9.4 }],
      performanceBySubjectData: [{ label: 'Psicomot.', value: 9.5 }, { label: 'Música', value: 9.2 }, { label: 'Artes', value: 9.4 }],
      approvalRateDonutData: [{ label: 'Aprovados', value: 120, color: '#22c55e' }, { label: 'Recuperação', value: 0, color: '#f97316' }, { label: 'Reprovados', value: 0, color: '#ef4444' }],
      schoolAverageEvolutionData: [{ label: '2023', value: 9.1 }, { label: '2024', value: 9.2 }, { label: '2025', value: 9.4 }],
    },
    'Fund. I': {
       overallAverage: 8.4,
       approvalRate: 91.3,
       atRiskStudents: 11,
       averageAttendance: 96.8,
       academicPerformanceData: [{ label: '1º A', value: 8.2 }, { label: '2º B', value: 7.5 }, { label: '3º A', value: 9.1 }, { label: '4º C', value: 8.8 }, { label: '5º A', value: 7.8 }],
       performanceBySubjectData: [{ label: 'Português', value: 8.6 }, { label: 'Matemática', value: 8.1 }, { label: 'Ciências', value: 8.8 }],
       approvalRateDonutData: [{ label: 'Aprovados', value: 210, color: '#22c55e' }, { label: 'Recuperação', value: 15, color: '#f97316' }, { label: 'Reprovados', value: 5, color: '#ef4444' }],
       schoolAverageEvolutionData: [{ label: '2023', value: 8.1 }, { label: '2024', value: 8.2 }, { label: '2025', value: 8.4 }],
    },
  },
  '2024': {
     'Todos': {
      overallAverage: 8.1,
      approvalRate: 90.8,
      atRiskStudents: 21,
      averageAttendance: 96.1,
      academicPerformanceData: [{ label: '1º A', value: 8.0 }, { label: '2º B', value: 7.2 }, { label: '3º A', value: 8.9 }, { label: '4º C', value: 8.5 }, { label: '5º A', value: 7.6 }],
      performanceBySubjectData: [{ label: 'Português', value: 8.3 }, { label: 'Matemática', value: 7.5 }, { label: 'Ciências', value: 8.6 }],
      approvalRateDonutData: [{ label: 'Aprovados', value: 445, color: '#22c55e' }, { label: 'Recuperação', value: 30, color: '#f97316' }, { label: 'Reprovados', value: 15, color: '#ef4444' }],
      schoolAverageEvolutionData: [{ label: '2022', value: 7.9 }, { label: '2023', value: 8.0 }, { label: '2024', value: 8.1 }],
    },
     'Infantil': {
      overallAverage: 9.2,
      approvalRate: 100.0,
      atRiskStudents: 0,
      averageAttendance: 97.9,
      academicPerformanceData: [{ label: 'Inf II A', value: 9.3 }, { label: 'Inf III B', value: 9.0 }, { label: 'Inf IV A', value: 9.1 }],
      performanceBySubjectData: [{ label: 'Psicomot.', value: 9.4 }, { label: 'Música', value: 9.1 }, { label: 'Artes', value: 9.2 }],
      approvalRateDonutData: [{ label: 'Aprovados', value: 118, color: '#22c55e' }, { label: 'Recuperação', value: 0, color: '#f97316' }, { label: 'Reprovados', value: 0, color: '#ef4444' }],
       schoolAverageEvolutionData: [{ label: '2022', value: 9.0 }, { label: '2023', value: 9.1 }, { label: '2024', value: 9.2 }],
    },
    'Fund. I': {
        overallAverage: 8.2,
        approvalRate: 89.1,
        atRiskStudents: 13,
        averageAttendance: 95.5,
        academicPerformanceData: [{ label: '1º A', value: 8.0 }, { label: '2º B', value: 7.2 }, { label: '3º A', value: 8.9 }, { label: '4º C', value: 8.5 }, { label: '5º A', value: 7.6 }],
        performanceBySubjectData: [{ label: 'Português', value: 8.3 }, { label: 'Matemática', value: 7.5 }, { label: 'Ciências', value: 8.6 }],
        approvalRateDonutData: [{ label: 'Aprovados', value: 205, color: '#22c55e' }, { label: 'Recuperação', value: 18, color: '#f97316' }, { label: 'Reprovados', value: 7, color: '#ef4444' }],
        schoolAverageEvolutionData: [{ label: '2022', value: 8.0 }, { label: '2023', value: 8.1 }, { label: '2024', value: 8.2 }],
    },
  },
};


// --- Reusable Chart & UI Components ---
const FilterButton: React.FC<{ label: string; active?: boolean; onClick: () => void; }> = ({ label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${active ? 'bg-teal-600 text-white font-semibold' : 'bg-gray-200 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
    >
        {label}
    </button>
);

const Widget: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700/50 flex flex-col ${className}`}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="flex-grow">
            {children}
        </div>
    </div>
);

const KPICard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700/50 flex items-center space-x-4">
        <div className="bg-teal-100 dark:bg-teal-800/50 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const VerticalBarChart: React.FC<{ data: { label: string; value: number }[], color: string, unit?: string }> = ({ data, color, unit = '' }) => {
    const max = Math.max(...data.map(d => d.value), 0);
    return (
        <div className="flex justify-around items-end h-full pt-4">
            {data.map(item => (
                <div key={item.label} className="flex flex-col items-center group cursor-pointer w-10">
                    <span className="text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity text-xs -mb-4 relative z-10 bg-gray-900 px-1 rounded">{item.value.toFixed(1)}{unit}</span>
                    <div
                        className="w-full rounded-t-md transition-all duration-300 group-hover:brightness-125"
                        style={{ height: `${max > 0 ? (item.value / max) * 100 : 0}%`, backgroundColor: color, minHeight: '2px' }}
                        title={`${item.label}: ${item.value.toFixed(1)}${unit}`}
                    ></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.label}</span>
                </div>
            ))}
        </div>
    );
};

const HorizontalBarChart: React.FC<{ data: { label: string; value: number }[], color: string }> = ({ data, color }) => {
    const max = Math.max(...data.map(d => d.value), 0);
    return (
        <div className="space-y-3 h-full flex flex-col justify-center">
            {data.map(item => (
                <div key={item.label} className="flex items-center">
                    <span className="w-24 text-sm text-gray-600 dark:text-gray-300 text-right pr-2">{item.label}</span>
                    <div className="flex-grow bg-gray-200 dark:bg-gray-700 rounded-full h-5">
                        <div
                            className="h-5 rounded-full flex items-center justify-end pr-2 text-white font-bold text-xs"
                            style={{ width: `${max > 0 ? (item.value / max) * 100 : 0}%`, backgroundColor: color, minWidth: '20px' }}
                        >
                            {item.value.toFixed(1)}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    let cumulative = 0;

    return (
        <div className="flex flex-col md:flex-row items-center justify-around h-full gap-4">
            <div className="relative w-32 h-32">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    {data.map((item, index) => {
                        const percentage = total > 0 ? (item.value / total) * 100 : 0;
                        const offset = cumulative;
                        cumulative += percentage;
                        return (
                            <circle
                                key={index} r="15.9" cx="18" cy="18" fill="transparent"
                                stroke={item.color} strokeWidth="4" strokeDasharray={`${percentage} ${100 - percentage}`}
                                strokeDashoffset={-offset} className="transition-all duration-500"
                            />
                        );
                    })}
                </svg>
                 <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{total}</span>
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

const SmallSpinner: React.FC = () => (
    <svg className="animate-spin h-4 w-4 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const PrintableReport: React.FC<{ title: string; data: any[]; schoolInfo: SchoolInfo, onRendered: () => void; }> = ({ title, data, schoolInfo, onRendered }) => {
    useLayoutEffect(() => {
        onRendered();
    }, [onRendered]);

    if (data.length === 0) return <div id="printable-report-content" className="p-4 bg-white text-black">Nenhum dado para exibir.</div>;
    const headers = Object.keys(data[0]);

    return (
        <div id="printable-report-content" className="p-4 bg-white text-black printable-annual-report">
            <header className="flex items-start space-x-4 mb-4">
                <div className="h-20 w-20 flex-shrink-0 flex items-center justify-center">
                    {schoolInfo.logo ? (
                        <img src={schoolInfo.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                        <div className="h-20 w-20 bg-gray-200"></div>
                    )}
                </div>
                <div className="text-center flex-grow">
                    <h1 className="text-xl font-bold uppercase">{schoolInfo.name}</h1>
                    <p className="text-xs">{schoolInfo.address}</p>
                    <p className="text-xs">CNPJ: {schoolInfo.cnpj} | Telefone: {schoolInfo.phone}</p>
                </div>
                <div className="w-20 flex-shrink-0"></div>
            </header>

            <h2 className="text-xl font-bold mb-4 text-center">{title}</h2>
            <table className="w-full border-collapse text-xs">
                <thead>
                    <tr className="bg-gray-100">
                        {headers.map(header => <th key={header} className="p-1 border border-gray-400">{header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            {headers.map(header => <td key={header} className="p-1 border border-gray-400">{String(row[header])}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


// --- Main Reports Component ---
const Reports: React.FC = () => {
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState('2025');
    const [selectedLevel, setSelectedLevel] = useState('Todos');
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [displayData, setDisplayData] = useState(ALL_MOCK_DATA[selectedYear][selectedLevel]);
    const { enrolledStudents, classes } = useEnrollment();
    const { schoolInfo } = useSchoolInfo();
    const [printablePdfContent, setPrintablePdfContent] = useState<{ title: string; data: any[]; schoolInfo: SchoolInfo } | null>(null);

    const operationalReports = [
        { name: "Lista Mestra de Alunos", description: "Tabela completa com todos os alunos matriculados e seus dados." },
        { name: "Alunos por Turma (Diário)", description: "Listagem de alunos agrupada por cada turma para conferência." },
        { name: "Relatório de Vagas Ociosas", description: "Mostra as turmas que ainda possuem vagas disponíveis." }
    ];

    const kpiIcons = {
        average: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600 dark:text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>,
        approval: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600 dark:text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        risk: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600 dark:text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
        attendance: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600 dark:text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    };

    useEffect(() => {
        const dataForYear = ALL_MOCK_DATA[selectedYear] || ALL_MOCK_DATA['2025'];
        const dataForLevel = dataForYear[selectedLevel] || dataForYear['Todos'];
        setDisplayData(dataForLevel);
        setAnalysis(''); 
    }, [selectedYear, selectedLevel]);
    
    const handlePdfRendered = () => {
        if (!printablePdfContent) return;

        const element = document.getElementById('printable-report-content');
        if (element) {
            const filename = `${printablePdfContent.title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.pdf`;
            html2pdf().from(element).set({
                margin: 15,
                filename,
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }).save().then(() => {
                setPrintablePdfContent(null);
                setIsProcessing(null);
            }).catch((err: any) => {
                console.error("html2pdf error:", err);
                alert("Ocorreu um erro ao gerar o PDF.");
                setPrintablePdfContent(null);
                setIsProcessing(null);
            });
        } else {
            alert("Erro: Elemento para impressão não foi encontrado.");
            setPrintablePdfContent(null);
            setIsProcessing(null);
        }
    };


    const handleGenerateAnalysis = async () => {
        setIsLoading(true);
        setAnalysis('');
        
        const dataContext = `
            Analisar os seguintes dados acadêmicos para o ano de ${selectedYear}, nível "${selectedLevel}":
            - Média Geral: ${displayData.overallAverage.toFixed(1)}
            - Taxa de Aprovação: ${displayData.approvalRate.toFixed(1)}%
            - Alunos em Risco (<7.0): ${displayData.atRiskStudents}
            - Frequência Média: ${displayData.averageAttendance.toFixed(1)}%
            - Média por turma: ${displayData.academicPerformanceData.map((d: any) => `${d.label} (${d.value.toFixed(1)})`).join(', ')}.
            - Desempenho por disciplina: ${displayData.performanceBySubjectData.map((d: any) => `${d.label} (${d.value.toFixed(1)})`).join(', ')}.
            
            Com base nesses dados, escreva uma análise pedagógica concisa para a gestão escolar. Use o seguinte formato Markdown:
            **Visão Geral:** Um resumo de 1-2 frases sobre o cenário geral.
            **Pontos de Atenção:** Uma lista (bullet points) com 2-3 áreas que necessitam de atenção imediata.
            **Sugestões:** Uma lista (bullet points) com 2-3 ações práticas recomendadas para a equipe pedagógica.
        `;

        try {
            const stream = await streamDocumentText(dataContext);
            for await (const chunk of stream) {
                setAnalysis(prev => prev + (chunk.text || ''));
            }
        } catch (error) {
            const errorMessage = `**Erro ao Gerar Análise**\nOcorreu um erro ao comunicar com a IA. Por favor, tente novamente.\n\nDetalhes: ${error instanceof Error ? error.message : String(error)}`;
            setAnalysis(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = async (reportName: string, format: 'csv' | 'pdf') => {
        const actionName = `Gerar ${format.toUpperCase()}: ${reportName}`;
        setIsProcessing(actionName);
        
        await new Promise(resolve => setTimeout(resolve, 50)); 

        try {
            let data: any[] = [];
            let columns: { wch: number }[] = [];
            const filename = `${reportName.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.${format === 'csv' ? 'xlsx' : 'pdf'}`;

            switch(reportName) {
                case "Lista Mestra de Alunos":
                    data = enrolledStudents.map(s => ({
                        'ID': s.id,
                        'Nome': s.name,
                        'Série': s.grade,
                        'Turma': s.className,
                        'Unidade': s.unit,
                        'Status': s.status,
                        'Responsável': s.guardians?.[0]?.name || '',
                    }));
                    columns = [{wch: 5}, {wch: 40}, {wch: 15}, {wch: 15}, {wch: 10}, {wch: 10}, {wch: 40}];
                    break;

                case "Alunos por Turma (Diário)":
                    const classCounters: { [key: string]: number } = {};
                    data = enrolledStudents
                        .sort((a, b) => a.className.localeCompare(b.className) || a.name.localeCompare(b.name))
                        .map(s => {
                            if (!classCounters[s.className]) {
                                classCounters[s.className] = 0;
                            }
                            classCounters[s.className]++;
                            return {
                                'Turma': s.className,
                                'Nº': classCounters[s.className],
                                'Nome do Aluno': s.name,
                            };
                        });
                    columns = [{wch: 20}, {wch: 5}, {wch: 40}];
                    break;

                case "Relatório de Vagas Ociosas":
                     data = classes.map(c => {
                        const enrolled = enrolledStudents.filter(s => s.classId === c.id).length;
                        const capacityKey = c.unit.toLowerCase() as keyof typeof c.capacity;
                        const capacity = c.capacity[capacityKey] || 0;
                        const available = capacity - enrolled;
                        return {
                            'Turma': c.name,
                            'Unidade': c.unit,
                            'Capacidade': capacity,
                            'Matriculados': enrolled,
                            'Vagas Ociosas': available > 0 ? available : 0,
                        };
                    }).filter(r => r['Vagas Ociosas'] > 0);
                    columns = [{wch: 20}, {wch: 15}, {wch: 12}, {wch: 12}, {wch: 15}];
                    break;
            }

            if (data.length === 0) {
                alert('Não há dados para gerar este relatório.');
                setIsProcessing(null);
                return;
            }

            if (format === 'csv') {
                const worksheet = XLSX.utils.json_to_sheet(data);
                worksheet['!cols'] = columns;
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');
                XLSX.writeFile(workbook, filename);
            } else {
                setPrintablePdfContent({ title: reportName, data, schoolInfo });
            }

        } catch (error) {
            console.error(`Error generating ${format.toUpperCase()}:`, error);
            alert(`Ocorreu um erro ao gerar o arquivo ${format.toUpperCase()}.`);
        } finally {
            if (format === 'csv') {
                setIsProcessing(null);
            }
        }
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Relatórios Acadêmicos</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Dashboard gerencial com indicadores de desempenho acadêmico.</p>
            </header>
            
            <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50 flex flex-wrap items-center justify-between gap-4">
                 <div className="flex items-center gap-x-4 gap-y-2 flex-wrap">
                    <div className="flex items-center gap-2">
                         <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Ano Letivo:</span>
                         {Object.keys(ALL_MOCK_DATA).map(year => <FilterButton key={year} label={year} active={selectedYear === year} onClick={() => setSelectedYear(year)} />)}
                    </div>
                     <div className="flex items-center gap-2">
                         <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Nível:</span>
                         {['Todos', 'Infantil', 'Fund. I'].map(level => <FilterButton key={level} label={level} active={selectedLevel === level} onClick={() => setSelectedLevel(level)} />)}
                    </div>
                 </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <KPICard title="Média Geral" value={displayData.overallAverage.toFixed(1)} icon={kpiIcons.average} />
                <KPICard title="Taxa de Aprovação" value={`${displayData.approvalRate.toFixed(1)}%`} icon={kpiIcons.approval} />
                <KPICard title="Alunos em Risco" value={displayData.atRiskStudents} icon={kpiIcons.risk} />
                <KPICard title="Frequência Média" value={`${displayData.averageAttendance.toFixed(1)}%`} icon={kpiIcons.attendance} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Widget title="Desempenho por Turma" className="lg:col-span-3">
                    <div className="h-64"><VerticalBarChart data={displayData.academicPerformanceData} color="#14b8a6" /></div>
                </Widget>
                <Widget title="Desempenho por Disciplina" className="lg:col-span-2">
                    <div className="h-64"><HorizontalBarChart data={displayData.performanceBySubjectData} color="#8b5cf6" /></div>
                </Widget>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Widget title="Evolução da Média Anual">
                     <div className="h-64"><VerticalBarChart data={displayData.schoolAverageEvolutionData} color="#f97316" /></div>
                </Widget>
                <Widget title="Composição da Aprovação">
                     <div className="h-64"><DonutChart data={displayData.approvalRateDonutData} /></div>
                </Widget>
                <Widget title="Análise Inteligente com Gemini">
                    <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg text-gray-700 dark:text-gray-300 flex-grow min-h-[150px] overflow-y-auto text-sm">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <svg className="animate-spin h-8 w-8 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            </div>
                        ) : analysis ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: analysis.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\* (.*?)(?=\n\*|\n$)/g, '<li>$1</li>').replace(/<\/li><li>/g, '</li><li>') }} />
                        ) : (
                             <div className="flex flex-col items-center justify-center text-center h-full">
                                <p className="text-gray-500 dark:text-gray-400">Clique para que o Gemini analise os dados e gere insights.</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 flex justify-center">
                        <button onClick={handleGenerateAnalysis} disabled={isLoading} className="flex items-center px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 disabled:bg-gray-600 text-sm">
                            {isLoading ? 'Analisando...' : 'Gerar Análise com IA'}
                        </button>
                    </div>
                </Widget>
            </div>
            
            <Widget title="Relatórios Operacionais">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                         <tbody>
                            {operationalReports.map(report => {
                                const csvActionName = `Gerar CSV: ${report.name}`;
                                const pdfActionName = `Gerar PDF: ${report.name}`;
                                return (
                                <tr key={report.name} className="border-b border-gray-200 dark:border-gray-700/50 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                    <td className="p-3">
                                        <p className="font-semibold text-gray-800 dark:text-white">{report.name}</p>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">{report.description}</p>
                                    </td>
                                    <td className="p-3 text-right space-x-2">
                                        <button onClick={() => handleDownload(report.name, 'csv')} disabled={!!isProcessing} className="text-xs px-3 py-1 w-16 text-center bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-wait">
                                           {isProcessing === csvActionName ? <SmallSpinner /> : 'CSV'}
                                        </button>
                                        <button onClick={() => handleDownload(report.name, 'pdf')} disabled={!!isProcessing} className="text-xs px-3 py-1 w-16 text-center bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-wait">
                                           {isProcessing === pdfActionName ? <SmallSpinner /> : 'PDF'}
                                        </button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                 </div>
            </Widget>
            
            {printablePdfContent && (
                <div className="fixed -top-[9999px] left-0">
                    <PrintableReport 
                        title={printablePdfContent.title} 
                        data={printablePdfContent.data}
                        schoolInfo={printablePdfContent.schoolInfo}
                        onRendered={handlePdfRendered}
                    />
                </div>
            )}

        </div>
    );
};

export default Reports;