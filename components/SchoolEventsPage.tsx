
import React, { useState, useMemo, useEffect } from 'react';
import { type User, type CalendarEvent, UserRole, School, EventCostItem, EventAttendanceItem, SchoolClass, Lead, EventParticipation } from '../types';
import { Button } from './ui/Button';
import { PlusIcon } from './icons/PlusIcon';
import { TicketIcon } from './icons/TicketIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { Modal } from './ui/Modal';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';
import { UsersIcon } from './icons/UsersIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { PrinterIcon } from './icons/PrinterIcon';
import { RectangleGroupIcon } from './icons/RectangleGroupIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { GoogleGenAI, Type } from "@google/genai";

interface SchoolEventsPageProps {
    user: User;
    events: CalendarEvent[];
    onAddOrUpdateEvent: (event: Omit<CalendarEvent, 'id' | 'schoolId' | 'createdBy'>, eventId?: string, schoolId?: string) => Promise<void>;
    onDeleteEvent: (eventId: string) => Promise<void>;
    schools: School[];
    classes: SchoolClass[];
    students: Lead[];
    onPrintEventAttendance?: (data: any) => void;
}

// --- Helper Components for Analysis ---

const SimpleBarChart: React.FC<{ 
    data: { label: string; value: number; subLabel?: string; value2?: number }[]; 
    color: string; 
    color2?: string;
    formatValue: (val: number) => string;
    legend?: string;
    legend2?: string;
}> = ({ data, color, color2, formatValue, legend, legend2 }) => {
    const maxValue = Math.max(...data.map(d => (d.value + (d.value2 || 0))), 1);

    return (
        <div className="flex flex-col h-64 pt-6">
            <div className="flex items-end justify-around flex-grow gap-2">
                {data.map((item, index) => {
                    const h1 = Math.max((item.value / maxValue) * 100, 2);
                    const h2 = item.value2 ? Math.max((item.value2 / maxValue) * 100, 0) : 0;
                    
                    return (
                        <div key={index} className="flex flex-col items-center flex-1 group relative h-full justify-end">
                            {/* Tooltip */}
                            <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 shadow-lg">
                                <p>{legend || 'Valor'}: {formatValue(item.value)}</p>
                                {item.value2 !== undefined && <p>{legend2}: {formatValue(item.value2)}</p>}
                            </div>
                            
                            {/* Stacked Bars or Single Bar */}
                            <div className="w-full max-w-[40px] flex flex-col justify-end h-full">
                                {item.value2 !== undefined && (
                                    <div style={{ height: `${h2}%` }} className={`w-full rounded-t-sm ${color2} opacity-80 hover:opacity-100 transition-all`}></div>
                                )}
                                <div style={{ height: `${h1}%` }} className={`w-full ${item.value2 ? 'rounded-b-sm' : 'rounded-t-sm'} ${color} hover:opacity-90 transition-all`}></div>
                            </div>

                            <div className="mt-2 text-center h-10">
                                <p className="text-xs font-semibold text-gray-700 truncate w-full">{item.label}</p>
                                {item.subLabel && <p className="text-[10px] text-gray-500 truncate w-full" title={item.subLabel}>{item.subLabel}</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
            {(legend || legend2) && (
                <div className="flex justify-center gap-4 mt-2 text-xs text-gray-600">
                    <div className="flex items-center"><span className={`w-3 h-3 ${color} mr-1 rounded-sm`}></span> {legend}</div>
                    {legend2 && <div className="flex items-center"><span className={`w-3 h-3 ${color2} mr-1 rounded-sm`}></span> {legend2}</div>}
                </div>
            )}
        </div>
    );
};

const ClassEngagementMap: React.FC<{ events: CalendarEvent[] }> = ({ events }) => {
    // 1. Prepare Data
    const { classes, sortedEvents, matrix } = useMemo(() => {
        const classNames = new Set<string>();
        const eventList = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const dataMatrix: Record<string, Record<string, { rate: number; attended: number; total: number }>> = {};

        eventList.forEach(event => {
            // Get planned attendance (total) from event configuration
            const totalsByClass: Record<string, number> = {};
            event.attendance?.forEach(a => {
                if (a.className && a.count > 0) {
                    totalsByClass[a.className] = a.count;
                    classNames.add(a.className);
                }
            });

            // Get actual attendance from participations
            const actualsByClass: Record<string, number> = {};
            event.studentParticipations?.forEach(p => {
                if (p.status === 'confirmed' && p.className) {
                    actualsByClass[p.className] = (actualsByClass[p.className] || 0) + 1;
                    // Ensure class exists in set even if not in planned attendance (edge case)
                    classNames.add(p.className);
                }
            });

            // Build Matrix Cell
            Object.keys(totalsByClass).forEach(className => {
                if (!dataMatrix[className]) dataMatrix[className] = {};
                
                const total = totalsByClass[className] || 0;
                const attended = actualsByClass[className] || 0;
                const rate = total > 0 ? (attended / total) * 100 : 0;

                dataMatrix[className][event.id] = { rate, attended, total };
            });
        });

        return {
            classes: Array.from(classNames).sort(),
            sortedEvents: eventList,
            matrix: dataMatrix
        };
    }, [events]);

    const getCellColor = (rate: number, hasData: boolean) => {
        if (!hasData) return 'bg-gray-50';
        if (rate >= 80) return 'bg-green-500 text-white';
        if (rate >= 50) return 'bg-yellow-400 text-yellow-900';
        return 'bg-red-400 text-white';
    };

    if (classes.length === 0 || sortedEvents.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <RectangleGroupIcon className="w-5 h-5 mr-2 text-teal-600"/>
                Mapa de Engajamento por Turma
            </h3>
            
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="p-2 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">
                                Turma / Evento
                            </th>
                            {sortedEvents.map(event => (
                                <th key={event.id} className="p-2 border-b-2 border-gray-200 text-center text-xs font-semibold text-gray-500 uppercase min-w-[100px]">
                                    <div className="truncate w-24 mx-auto" title={event.title}>{event.title}</div>
                                    <div className="text-[10px] font-normal text-gray-400">
                                        {new Date(event.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {classes.map(className => (
                            <tr key={className} className="hover:bg-gray-50">
                                <td className="p-2 border-b border-gray-100 text-sm font-medium text-gray-700 whitespace-nowrap">
                                    {className}
                                </td>
                                {sortedEvents.map(event => {
                                    const cell = matrix[className]?.[event.id];
                                    const hasData = !!cell;
                                    const rate = cell?.rate || 0;
                                    
                                    return (
                                        <td key={`${className}-${event.id}`} className="p-2 border-b border-gray-100 text-center align-middle">
                                            {hasData ? (
                                                <div 
                                                    className={`w-full py-1.5 rounded text-xs font-bold shadow-sm transition-transform hover:scale-105 cursor-help ${getCellColor(rate, hasData)}`}
                                                    title={`Presentes: ${cell.attended} / Previstos: ${cell.total} (${rate.toFixed(1)}%)`}
                                                >
                                                    {rate.toFixed(0)}%
                                                </div>
                                            ) : (
                                                <div className="w-full py-1.5 text-center text-gray-300 text-xs">-</div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex gap-4 text-xs text-gray-500 justify-end">
                <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-sm mr-1"></span> Alta Adesão (&gt;80%)</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-yellow-400 rounded-sm mr-1"></span> Média Adesão (50-80%)</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-red-400 rounded-sm mr-1"></span> Baixa Adesão (&lt;50%)</div>
            </div>
        </div>
    );
};

const EngagementRanking: React.FC<{ events: CalendarEvent[] }> = ({ events }) => {
    const studentStats = useMemo(() => {
        const stats: Record<string, { name: string; className: string; eventsAttended: number; totalSpent: number }> = {};

        events.forEach(event => {
            if (event.studentParticipations) {
                event.studentParticipations.forEach(p => {
                    if (p.status === 'confirmed') {
                        if (!stats[p.studentId]) {
                            stats[p.studentId] = {
                                name: p.studentName,
                                className: p.className,
                                eventsAttended: 0,
                                totalSpent: 0
                            };
                        }
                        stats[p.studentId].eventsAttended += 1;
                        if (p.paymentStatus === 'paid') {
                            stats[p.studentId].totalSpent += (Number(p.amountPaid) || 0);
                        }
                    }
                });
            }
        });

        return Object.values(stats).sort((a, b) => {
            // Sort by attendance count (desc), then by total spent (desc)
            if (b.eventsAttended !== a.eventsAttended) return b.eventsAttended - a.eventsAttended;
            return b.totalSpent - a.totalSpent;
        });
    }, [events]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <ClassEngagementMap events={events} />

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Ranking de Alunos</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Visualize quais alunos participam mais ativamente dos eventos e o volume financeiro investido por eles.
                </p>

                {studentStats.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-center font-bold text-gray-500 uppercase tracking-wider w-16">#</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Turma</th>
                                    <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">Eventos</th>
                                    <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Investimento Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {studentStats.map((student, index) => (
                                    <tr key={index} className={index < 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                                        <td className="px-4 py-3 text-center font-bold text-gray-600">
                                            {index + 1}º
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {student.name}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {student.className}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {student.eventsAttended}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-green-700">
                                            {formatCurrency(student.totalSpent)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        Nenhum dado de participação registrado ainda. Use a aba "Check-in e Pagamentos" nos eventos para começar.
                    </div>
                )}
            </div>
        </div>
    );
};

// --- AI Suggestion Component ---

interface ActivitySuggestion {
    title: string;
    classes: string;
    location: string;
    justification: string;
    logistics: string;
    advanceNotice: string;
}

const ActivityGenerator: React.FC<{
    onConvertToEvent: (event: Partial<CalendarEvent>) => void;
}> = ({ onConvertToEvent }) => {
    const [city, setCity] = useState('');
    const [topics, setTopics] = useState('');
    const [month, setMonth] = useState('');
    const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!city || !topics) return;
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
            const prompt = `Atue como um Coordenador Pedagógico Escolar experiente.
            Eu preciso de sugestões de atividades extra-classe para alunos.
            
            Contexto:
            - Cidade da Escola: ${city}
            - Mês/Período: ${month}
            - Tópicos/Assuntos sendo estudados: ${topics}

            Regras:
            1. Sugira atividades que conectem os tópicos estudados com pontos turísticos, culturais ou locais da cidade fornecida.
            2. Sugira o agrupamento de turmas (ex: "Juntar turmas de 3º e 4º ano") se os assuntos forem compatíveis, para otimizar transporte.
            3. CRITICO: A "justificativa" deve ser escrita para CONVENCER OS PAIS de que a atividade é essencial para o aprendizado e não apenas um "passeio", evitando reclamações sobre excesso de atividades.
            4. Inclua um prazo recomendado de antecedência para enviar o comunicado (ex: "15 dias antes").

            Retorne APENAS um JSON array com objetos contendo:
            - title: Título da atividade.
            - classes: Turmas sugeridas ou agrupamento.
            - location: Local sugerido na cidade.
            - justification: Texto persuasivo para os pais focando no pedagógico.
            - logistics: Breve resumo de como realizar (ex: transporte, duração).
            - advanceNotice: Prazo recomendado de antecedência (ex: "3 semanas").
            `;

            const responseSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        classes: { type: Type.STRING },
                        location: { type: Type.STRING },
                        justification: { type: Type.STRING },
                        logistics: { type: Type.STRING },
                        advanceNotice: { type: Type.STRING }
                    },
                    required: ["title", "classes", "location", "justification", "logistics", "advanceNotice"]
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                }
            });

            const data = JSON.parse(response.text || '[]');
            setSuggestions(data);
        } catch (error) {
            console.error(error);
            alert("Erro ao gerar sugestões. Tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 p-3 rounded-full">
                        <SparklesIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Coordenador Virtual (IA)</h2>
                        <p className="text-sm text-gray-600">
                            Gere propostas de atividades pedagógicas contextualizadas com sua cidade e currículo.
                            A IA criará justificativas robustas para garantir a aprovação dos pais.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cidade da Escola</label>
                        <input 
                            type="text" 
                            value={city} 
                            onChange={(e) => setCity(e.target.value)} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Ex: São Paulo, SP"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mês/Período</label>
                        <input 
                            type="text" 
                            value={month} 
                            onChange={(e) => setMonth(e.target.value)} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Ex: Outubro / Dia das Crianças"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tópicos/Assuntos do Momento</label>
                        <input 
                            type="text" 
                            value={topics} 
                            onChange={(e) => setTopics(e.target.value)} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Ex: Ciclo da água, História local..."
                        />
                    </div>
                </div>
                <div className="mt-4 text-right">
                    <Button onClick={handleGenerate} disabled={isGenerating || !city || !topics}>
                        {isGenerating ? <SpinnerIcon className="w-4 h-4 mr-2" /> : <SparklesIcon className="w-4 h-4 mr-2" />}
                        {isGenerating ? 'Gerando Propostas...' : 'Gerar Sugestões'}
                    </Button>
                </div>
            </div>

            {suggestions.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {suggestions.map((s, idx) => (
                        <div key={idx} className="bg-white rounded-lg shadow border-l-4 border-indigo-500 p-5 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg text-gray-900">{s.title}</h3>
                                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-medium">
                                        {s.classes}
                                    </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500 mt-2 mb-3">
                                    <MapPinIcon className="w-4 h-4 mr-1 text-gray-400" />
                                    {s.location}
                                </div>
                                
                                <div className="bg-green-50 border border-green-100 p-3 rounded-md mb-3">
                                    <p className="text-xs font-bold text-green-800 uppercase mb-1">Justificativa para os Pais (Pedagógica)</p>
                                    <p className="text-sm text-green-900 italic">"{s.justification}"</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="bg-gray-50 p-2 rounded border">
                                        <p className="text-xs font-bold text-gray-500">Logística</p>
                                        <p className="text-xs text-gray-700">{s.logistics}</p>
                                    </div>
                                    <div className="bg-orange-50 p-2 rounded border border-orange-100">
                                        <p className="text-xs font-bold text-orange-700">Prazo de Aviso</p>
                                        <p className="text-xs text-orange-800 font-semibold">{s.advanceNotice}</p>
                                    </div>
                                </div>
                            </div>
                            <Button 
                                variant="secondary" 
                                className="w-full justify-center"
                                onClick={() => onConvertToEvent({
                                    title: s.title,
                                    description: `Justificativa Pedagógica:\n${s.justification}\n\nLogística:\n${s.logistics}\n\nTurmas Sugeridas: ${s.classes}`,
                                    type: 'event'
                                })}
                            >
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Transformar em Evento
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ComparativeAnalysis: React.FC<{ events: CalendarEvent[] }> = ({ events }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filter events based on search to create a "Series"
    const analysisSeries = useMemo(() => {
        if (!searchTerm.trim()) return [];
        
        const lowerTerm = searchTerm.toLowerCase();
        return events
            .filter(e => e.title.toLowerCase().includes(lowerTerm))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [events, searchTerm]);

    const metrics = useMemo(() => {
        return analysisSeries.map(event => {
            const year = new Date(event.date).getFullYear();
            const totalAttendance = (event.attendance || []).reduce((sum, i) => sum + (Number(i.count) || 0), 0);
            
            let totalFixedCost = 0;
            let totalVariableCost = 0;

            (event.financials || []).forEach((item) => {
                const amount = Number(item.amount) || 0;
                if (item.type === 'per_student') {
                    totalVariableCost += amount * totalAttendance;
                } else {
                    totalFixedCost += amount;
                }
            });

            const totalCost = totalFixedCost + totalVariableCost;
            const costPerStudent = totalAttendance > 0 ? totalCost / totalAttendance : 0;
            
            // Financial Health Calculations
            const margin = event.profitMargin || 0;
            const suggestedPrice = costPerStudent * (1 + (margin / 100));
            const theoreticalRevenue = suggestedPrice * totalAttendance;
            const theoreticalProfit = theoreticalRevenue - totalCost;

            return {
                id: event.id,
                title: event.title,
                year,
                dateLabel: new Date(event.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
                totalCost,
                totalFixedCost,
                totalVariableCost,
                totalAttendance,
                costPerStudent,
                margin,
                theoreticalRevenue,
                theoreticalProfit
            };
        });
    }, [analysisSeries]);

    const aggregates = useMemo(() => {
        if (metrics.length === 0) return null;
        const count = metrics.length;
        const avgAttendance = metrics.reduce((acc, m) => acc + m.totalAttendance, 0) / count;
        const avgCost = metrics.reduce((acc, m) => acc + m.totalCost, 0) / count;
        const avgCostPerStudent = metrics.reduce((acc, m) => acc + m.costPerStudent, 0) / count;
        const avgProfit = metrics.reduce((acc, m) => acc + m.theoreticalProfit, 0) / count;

        return { avgAttendance, avgCost, avgCostPerStudent, avgProfit };
    }, [metrics]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtrar Série Histórica</h3>
                <div className="relative max-w-lg">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border-gray-300 pl-10 focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                        placeholder="Digite o nome do evento (ex: Festa Junina)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Digite um nome para comparar indicadores de eventos semelhantes ao longo dos anos.
                </p>
            </div>

            {analysisSeries.length > 0 && aggregates ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Média de Público</p>
                            <p className="text-2xl font-bold text-gray-800 flex items-baseline">
                                {Math.round(aggregates.avgAttendance)} <span className="text-sm text-gray-500 ml-1">alunos</span>
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Custo Médio Total</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {formatCurrency(aggregates.avgCost)}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Custo Médio / Aluno</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {formatCurrency(aggregates.avgCostPerStudent)}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Lucro Médio Est.</p>
                            <p className="text-2xl font-bold text-green-700">
                                {formatCurrency(aggregates.avgProfit)}
                            </p>
                        </div>
                    </div>

                    {/* Main Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Cost Structure Chart */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                                <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600"/> Composição de Custos (Fixo vs Variável)
                            </h4>
                            <p className="text-xs text-gray-500 mb-4">Analise se o evento está se tornando mais caro devido à estrutura (fixo) ou número de alunos (variável).</p>
                            <SimpleBarChart 
                                data={metrics.map(m => ({ 
                                    label: m.year.toString(), 
                                    subLabel: m.title, 
                                    value: m.totalFixedCost, // Base
                                    value2: m.totalVariableCost // Stacked
                                }))} 
                                color="bg-blue-500" 
                                color2="bg-cyan-300"
                                legend="Custo Fixo"
                                legend2="Custo Variável"
                                formatValue={formatCurrency}
                            />
                        </div>

                        {/* Profitability Chart */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                                <CurrencyDollarIcon className="w-5 h-5 mr-2 text-green-600"/> Saúde Financeira (Custo vs Receita Teórica)
                            </h4>
                            <p className="text-xs text-gray-500 mb-4">Comparativo entre o custo total realizado e a receita estimada baseada na margem de lucro.</p>
                            <SimpleBarChart 
                                data={metrics.map(m => ({ 
                                    label: m.year.toString(), 
                                    subLabel: m.title, 
                                    value: m.totalCost, 
                                    value2: m.theoreticalProfit // Using stacked to show total revenue roughly
                                }))} 
                                color="bg-red-400" 
                                color2="bg-green-500"
                                legend="Custo Total"
                                legend2="Lucro Estimado"
                                formatValue={formatCurrency}
                            />
                        </div>
                    </div>

                    {/* Efficiency Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-gray-700 flex items-center">
                                <UsersIcon className="w-5 h-5 mr-2 text-purple-600"/> Eficiência e Participação
                            </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <SimpleBarChart 
                                data={metrics.map(m => ({ label: m.dateLabel, value: m.totalAttendance }))} 
                                color="bg-purple-500" 
                                legend="Nº Participantes"
                                formatValue={(v) => `${v} alunos`}
                            />
                             <SimpleBarChart 
                                data={metrics.map(m => ({ label: m.dateLabel, value: m.costPerStudent }))} 
                                color="bg-orange-400" 
                                legend="Custo por Aluno"
                                formatValue={formatCurrency}
                            />
                        </div>
                    </div>

                    {/* Detailed Data Table */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Detalhamento Completo</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Evento</th>
                                        <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Público</th>
                                        <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Custo Fixo</th>
                                        <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Custo Variável</th>
                                        <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider bg-red-50 text-red-700">Custo Total</th>
                                        <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Custo/Aluno</th>
                                        <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Margem</th>
                                        <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider bg-green-50 text-green-700">Lucro Est.</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {metrics.map((m) => (
                                        <tr key={m.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{m.title}</div>
                                                <div className="text-xs text-gray-500">{m.dateLabel}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                                                {m.totalAttendance}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                                                {formatCurrency(m.totalFixedCost)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                                                {formatCurrency(m.totalVariableCost)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-red-600 bg-red-50">
                                                {formatCurrency(m.totalCost)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                                                {formatCurrency(m.costPerStudent)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                                                {m.margin}%
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-green-600 bg-green-50">
                                                {formatCurrency(m.theoreticalProfit)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow-md">
                    <ChartBarIcon className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum dado para exibir</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? 'Nenhum evento encontrado com esse nome.' : 'Use a busca acima para filtrar e comparar eventos.'}
                    </p>
                </div>
            )}
        </div>
    );
};

// --- Main Component ---

const EventFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<CalendarEvent, 'id' | 'schoolId' | 'createdBy'>, eventId?: string, schoolId?: string) => Promise<void>;
    event: Partial<CalendarEvent> | null;
    user: User;
    schools: School[];
}> = ({ isOpen, onClose, onSave, event, user, schools }) => {
    const [formData, setFormData] = useState({
        date: '',
        title: '',
        type: 'event' as 'event' | 'holiday' | 'reminder',
        description: '',
    });
    const [selectedSchoolId, setSelectedSchoolId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                date: event?.date || new Date().toISOString().split('T')[0],
                title: event?.title || '',
                type: event?.type || 'event',
                description: event?.description || '',
            });
            
            if (user.role === UserRole.SUPER_ADMINISTRADOR) {
                const eventSchoolId = (event as CalendarEvent)?.schoolId;
                setSelectedSchoolId(eventSchoolId || (schools.length > 0 ? schools[0].id : ''));
            } else {
                setSelectedSchoolId(user.schoolId || '');
            }
        }
    }, [isOpen, event, user, schools]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                description: formData.description || '',
            };
            await onSave(payload, event?.id, selectedSchoolId);
            onClose();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar evento. Verifique se todos os campos estão preenchidos.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={event?.id ? 'Editar Evento' : 'Novo Evento'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {user.role === UserRole.SUPER_ADMINISTRADOR && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Escola</label>
                        <select 
                            value={selectedSchoolId} 
                            onChange={(e) => setSelectedSchoolId(e.target.value)} 
                            required 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm disabled:bg-gray-100"
                            disabled={!!event?.id}
                        >
                            <option value="" disabled>Selecione uma escola</option>
                            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Título</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Data</label>
                    <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
                        <option value="event">Evento</option>
                        <option value="holiday">Feriado</option>
                        <option value="reminder">Lembrete</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <SpinnerIcon className="w-5 h-5"/> : 'Salvar'}</Button>
                </div>
            </form>
        </Modal>
    );
};

const EventStatsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<CalendarEvent, 'id' | 'schoolId' | 'createdBy'>, eventId: string, schoolId: string) => Promise<void>;
    event: CalendarEvent;
    classes: SchoolClass[];
    students: Lead[];
    onPrintAttendance?: (data: any) => void;
    schools?: School[];
}> = ({ isOpen, onClose, onSave, event, classes, students, onPrintAttendance, schools }) => {
    const [activeTab, setActiveTab] = useState<'financial' | 'attendance' | 'checkin'>('financial');
    const [financials, setFinancials] = useState<EventCostItem[]>(event.financials || []);
    const [attendance, setAttendance] = useState<EventAttendanceItem[]>(event.attendance || []);
    const [participations, setParticipations] = useState<EventParticipation[]>(event.studentParticipations || []);
    const [profitMargin, setProfitMargin] = useState<number>(event.profitMargin || 0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Check-in state
    const [selectedClassId, setSelectedClassId] = useState<string>('');

    const schoolClasses = useMemo(() => classes.filter(c => c.schoolId === event.schoolId), [classes, event.schoolId]);

    useEffect(() => {
        if (isOpen) {
            setFinancials(event.financials || []);
            setProfitMargin(event.profitMargin || 0);
            setParticipations(event.studentParticipations || []);
            
            if (event.attendance && event.attendance.length > 0) {
                setAttendance(event.attendance);
            } else {
                setAttendance(schoolClasses.map(c => ({
                    classId: c.id,
                    className: c.name,
                    count: 0
                })));
            }
            if (schoolClasses.length > 0) setSelectedClassId(schoolClasses[0].id);
            else setSelectedClassId('all');
        }
    }, [isOpen]);

    const addCostItem = () => {
        setFinancials([...financials, { id: Date.now().toString(), description: '', amount: 0, type: 'fixed' }]);
    };

    const removeCostItem = (id: string) => {
        setFinancials(financials.filter(item => item.id !== id));
    };

    const updateCostItem = (id: string, field: keyof EventCostItem, value: string | number) => {
        setFinancials(financials.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const updateAttendance = (classId: string, count: number) => {
        setAttendance(attendance.map(item => item.classId === classId ? { ...item, count } : item));
    };

    const totalParticipants = useMemo(() => attendance.reduce((sum, item) => sum + (Number(item.count) || 0), 0), [attendance]);

    const pricing = useMemo(() => {
        const totalFixedCost = financials.filter(f => f.type !== 'per_student').reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const variableCostPerHead = financials.filter(f => f.type === 'per_student').reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const totalVariableCost = variableCostPerHead * totalParticipants;
        
        const totalEventCost = totalFixedCost + totalVariableCost;
        const costPerStudent = totalParticipants > 0 ? totalEventCost / totalParticipants : 0;
        const suggestedPrice = costPerStudent * (1 + (profitMargin / 100));

        return {
            totalFixedCost,
            variableCostPerHead,
            totalVariableCost,
            totalEventCost,
            costPerStudent,
            suggestedPrice
        };
    }, [financials, totalParticipants, profitMargin]);

    // Check-in Logic
    const filteredStudents = useMemo(() => {
        if (!selectedClassId) return [];
        
        if (selectedClassId === 'all') {
            return students
                .filter(s => s.schoolId === event.schoolId)
                .sort((a, b) => (a.className || '').localeCompare(b.className || ''));
        }

        const classObj = schoolClasses.find(c => c.id === selectedClassId);
        const targetClassName = classObj?.name.trim().toLowerCase() || '';

        return students.filter(s => 
            s.schoolId === event.schoolId && 
            s.className?.trim().toLowerCase() === targetClassName
        );
    }, [students, selectedClassId, event.schoolId, schoolClasses]);

    const getStudentParticipation = (studentId: string) => {
        return participations.find(p => p.studentId === studentId);
    };

    const handleParticipationChange = (student: Lead, field: keyof EventParticipation, value: any) => {
        setParticipations(prev => {
            const existing = prev.find(p => p.studentId === student.id);
            let updated = [...prev];
            
            if (existing) {
                updated = updated.map(p => p.studentId === student.id ? { ...p, [field]: value } : p);
            } else {
                updated.push({
                    studentId: student.id,
                    studentName: student.studentName,
                    className: student.className || '',
                    status: 'absent',
                    paymentStatus: 'pending',
                    amountPaid: pricing.suggestedPrice,
                    [field]: value
                } as EventParticipation);
            }
            return updated;
        });
    };

    const financialSummary = useMemo(() => {
        const totalRealizedRevenue = participations.reduce((sum, p) => {
            return p.paymentStatus === 'paid' ? sum + (Number(p.amountPaid) || 0) : sum;
        }, 0);

        const totalConfirmedReal = participations.filter(p => p.status === 'confirmed').length;
        const realizedVariableCost = pricing.variableCostPerHead * totalConfirmedReal;
        const totalRealizedCost = pricing.totalFixedCost + realizedVariableCost;

        const realizedProfit = totalRealizedRevenue - totalRealizedCost;
        const targetProfitValue = pricing.totalEventCost * (profitMargin / 100);
        const goalGap = targetProfitValue - realizedProfit;

        return {
            revenue: totalRealizedRevenue,
            profit: realizedProfit,
            targetProfit: targetProfitValue,
            goalGap: goalGap
        };
    }, [participations, pricing, profitMargin]);

    const constructEventData = () => {
        return {
            date: event.date,
            title: event.title,
            type: event.type,
            description: event.description || '',
            profitMargin: profitMargin,
            financials: financials.map(f => ({ 
                id: f.id, 
                description: f.description || '', 
                amount: Number(f.amount) || 0,
                type: f.type || 'fixed'
            })),
            attendance: attendance.map(a => ({ 
                classId: a.classId, 
                className: a.className || '', 
                count: Number(a.count) || 0 
            })),
            studentParticipations: participations
        };
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            const updatedEventData = constructEventData();
            await onSave(updatedEventData, event.id, event.schoolId);
            onClose();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar estatísticas.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePriceChange = (newPrice: number) => {
        if (pricing.costPerStudent > 0) {
            const profitPerStudent = newPrice - pricing.costPerStudent;
            const newMargin = (profitPerStudent / pricing.costPerStudent) * 100;
            setProfitMargin(newMargin);
        }
    };

    const handleTotalProfitChange = (targetProfit: number) => {
        if (pricing.totalEventCost > 0) {
            const newMargin = (targetProfit / pricing.totalEventCost) * 100;
            setProfitMargin(newMargin);
        }
    };

    const handlePrintAttendance = async () => {
        if (!onPrintAttendance) return;
        setIsSubmitting(true);
        try {
            const updatedEventData = constructEventData();
            await onSave(updatedEventData, event.id, event.schoolId);

            const classesForPrint: { name: string, students: Lead[] }[] = [];
            schoolClasses.forEach(cls => {
                const studentsInClass = students.filter(s => 
                    s.schoolId === event.schoolId && 
                    s.className?.trim().toLowerCase() === cls.name.trim().toLowerCase()
                );
                if (studentsInClass.length > 0) {
                    classesForPrint.push({ name: cls.name, students: studentsInClass });
                }
            });
            classesForPrint.sort((a, b) => a.name.localeCompare(b.name));
            const schoolName = schools?.find(s => s.id === event.schoolId)?.name;

            onPrintAttendance({
                eventName: event.title,
                eventDate: event.date,
                classes: classesForPrint,
                schoolName
            });
        } catch (e) {
            console.error("Error saving before print", e);
            alert("Erro ao salvar dados antes de imprimir.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    const currentTotalProfit = pricing.totalEventCost * (profitMargin / 100);
    const contributionMargin = pricing.suggestedPrice - pricing.variableCostPerHead;
    const breakEvenParticipants = contributionMargin > 0 
        ? Math.ceil(pricing.totalFixedCost / contributionMargin) 
        : (pricing.totalFixedCost === 0 && contributionMargin >= 0 ? 0 : Infinity);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Relatório do Evento: ${event.title}`}>
            <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
                <button className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'financial' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('financial')}>Custos e Precificação</button>
                <button className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'checkin' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('checkin')}>Check-in e Pagamentos</button>
                <button className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'attendance' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('attendance')}>Resumo por Turma</button>
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'financial' && (
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                            <h4 className="font-semibold text-gray-800 border-b pb-2">Calculadora de Preço Sugerido</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><p className="text-gray-500">Custo Total Fixo</p><p className="font-medium">{formatCurrency(pricing.totalFixedCost)}</p></div>
                                <div><p className="text-gray-500">Custo Total Variável</p><p className="font-medium">{formatCurrency(pricing.totalVariableCost)} <span className="text-xs text-gray-400">({totalParticipants} alunos previstos)</span></p></div>
                                <div className="col-span-2 border-t pt-2 mt-1"><p className="text-gray-700 font-bold flex justify-between"><span>Custo Total do Evento (Planejado):</span><span>{formatCurrency(pricing.totalEventCost)}</span></p></div>
                            </div>
                            <div className="bg-white p-4 rounded border border-gray-200">
                                <div className="flex justify-between items-center mb-3 p-2 bg-gray-100 rounded border border-gray-200"><span className="text-sm font-bold text-gray-600">Custo por Aluno (Congelado/Base):</span><span className="font-bold text-gray-800">{formatCurrency(pricing.costPerStudent)}</span></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-3">
                                    <div>
                                        <label className="block text-xs font-bold text-teal-700 uppercase mb-1">Lucro Total Desejado (R$)</label>
                                        <div className="relative rounded-md shadow-sm"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-gray-500 sm:text-sm">R$</span></div><input type="number" min="0" step="0.01" value={currentTotalProfit.toFixed(2)} onChange={(e) => handleTotalProfitChange(parseFloat(e.target.value) || 0)} disabled={pricing.costPerStudent <= 0} className="block w-full rounded-md border-gray-300 pl-10 focus:border-teal-500 focus:ring-teal-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-400 font-semibold text-gray-800"/></div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Margem Equivalente (%)</label>
                                        <div className="relative rounded-md shadow-sm"><input type="number" min="0" step="0.1" value={profitMargin.toFixed(1)} onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)} disabled={pricing.costPerStudent <= 0} className="block w-full rounded-md border-gray-300 pl-3 pr-8 focus:border-teal-500 focus:ring-teal-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-400 text-gray-500"/><div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><span className="text-gray-500 sm:text-sm">%</span></div></div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-dashed border-gray-300">
                                    <label className="block text-xs font-bold text-teal-700 uppercase mb-1">Preço Sugerido por Aluno</label>
                                    <div className="relative rounded-md shadow-sm"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-teal-600 sm:text-lg font-bold">R$</span></div><input type="number" min="0" step="0.01" value={pricing.suggestedPrice.toFixed(2)} onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)} disabled={pricing.costPerStudent <= 0} className="block w-full rounded-md border-teal-300 pl-12 py-2 text-lg font-bold text-teal-700 focus:border-teal-500 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-400"/></div>
                                    <div className="mt-3 bg-blue-50 p-2 rounded border border-blue-100 text-xs">{breakEvenParticipants !== Infinity ? <p className="text-blue-800"><span className="font-bold">Ponto de Equilíbrio:</span> Necessário {breakEvenParticipants} alunos para cobrir os custos.{totalParticipants >= breakEvenParticipants ? <span className="text-green-600 font-bold ml-1">(Atingido no Planejamento!)</span> : <span className="text-red-500 font-bold ml-1">(Faltam {breakEvenParticipants - totalParticipants} no plano)</span>}</p> : <p className="text-red-600 font-bold">Preço insuficiente para cobrir custos variáveis por aluno.</p>}</div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Detalhamento de Custos</h4>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                {financials.map((item) => (
                                    <div key={item.id} className="flex gap-2 items-center">
                                        <select value={item.type || 'fixed'} onChange={(e) => updateCostItem(item.id, 'type', e.target.value)} className="w-28 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-xs"><option value="fixed">Total (Fixo)</option><option value="per_student">Por Aluno</option></select>
                                        <input type="text" placeholder="Descrição" value={item.description} onChange={(e) => updateCostItem(item.id, 'description', e.target.value)} className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-xs py-1.5"/>
                                        <div className="relative w-24"><span className="absolute inset-y-0 left-0 pl-1 flex items-center text-gray-500 text-xs">R$</span><input type="number" placeholder="0.00" value={item.amount} onChange={(e) => updateCostItem(item.id, 'amount', parseFloat(e.target.value))} className="w-full pl-6 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-xs py-1.5"/></div>
                                        <button onClick={() => removeCostItem(item.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                            <Button type="button" variant="secondary" onClick={addCostItem} className="w-full mt-2 !text-xs !py-1"><PlusIcon className="w-3 h-3 mr-1" /> Adicionar Custo</Button>
                        </div>
                    </div>
                )}

                {activeTab === 'checkin' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-green-50 border border-green-200 p-4 rounded-lg"><p className="text-xs font-semibold text-green-800 uppercase">Total Recebido</p><p className="text-2xl font-bold text-green-700">{formatCurrency(financialSummary.revenue)}</p></div>
                            <div className={`border p-4 rounded-lg ${financialSummary.profit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}><p className={`text-xs font-semibold uppercase ${financialSummary.profit >= 0 ? 'text-blue-800' : 'text-red-800'}`}>Lucro Obtido (Real)</p><p className={`text-2xl font-bold ${financialSummary.profit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>{formatCurrency(financialSummary.profit)}</p></div>
                            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg"><p className="text-xs font-semibold text-orange-800 uppercase">Falta para Meta</p><p className="text-2xl font-bold text-orange-700">{financialSummary.goalGap > 0 ? formatCurrency(financialSummary.goalGap) : 'Meta Atingida!'}</p></div>
                        </div>
                        <div className="flex gap-4 items-center"><label className="text-sm font-medium text-gray-700">Selecione a Turma:</label><select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"><option value="all">Todas as Turmas</option>{schoolClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                        <div className="border rounded-md max-h-[400px] overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0 z-10"><tr><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aluno</th><th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Presença</th><th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Pagamento</th><th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Valor (R$)</th></tr></thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredStudents.map(student => {
                                        const p = getStudentParticipation(student.id) || { status: 'absent', paymentStatus: 'pending', amountPaid: pricing.suggestedPrice };
                                        return (
                                            <tr key={student.id}>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{student.studentName}{(selectedClassId === 'all' || !selectedClassId) && <div className="text-xs text-gray-500 font-normal">{student.className || 'Sem Turma'}</div>}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-center"><select value={p.status} onChange={(e) => handleParticipationChange(student, 'status', e.target.value)} className={`text-xs rounded-full px-2 py-1 border-0 font-semibold cursor-pointer ${p.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}><option value="absent">Ausente</option><option value="confirmed">Confirmado</option></select></td>
                                                <td className="px-3 py-2 whitespace-nowrap text-center"><select value={p.paymentStatus} onChange={(e) => handleParticipationChange(student, 'paymentStatus', e.target.value)} disabled={p.status !== 'confirmed'} className={`text-xs rounded-full px-2 py-1 border-0 font-semibold cursor-pointer ${p.status !== 'confirmed' ? 'opacity-50' : p.paymentStatus === 'paid' ? 'bg-blue-100 text-blue-800' : p.paymentStatus === 'exempt' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'}`}><option value="pending">Pendente</option><option value="paid">Pago</option><option value="exempt">Isento</option></select></td>
                                                <td className="px-3 py-2 whitespace-nowrap text-right"><input type="number" value={p.amountPaid} onChange={(e) => handleParticipationChange(student, 'amountPaid', parseFloat(e.target.value))} disabled={p.status !== 'confirmed' || p.paymentStatus === 'exempt'} className="w-20 text-xs border-gray-300 rounded-md text-right focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100"/></td>
                                            </tr>
                                        );
                                    })}
                                    {filteredStudents.length === 0 && <tr><td colSpan={4} className="text-center py-4 text-sm text-gray-500">Nenhum aluno encontrado para esta seleção.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div className="space-y-4">
                         <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center mb-4">
                            <div><span className="font-semibold text-gray-700 block">Total de Participantes (Planejado)</span><p className="text-xs text-gray-500 italic">*Defina aqui a estimativa de público para calcular os custos do evento.</p></div>
                            <div className="flex items-center gap-4"><span className="text-xl font-bold text-blue-600">{totalParticipants} Alunos</span>{onPrintAttendance && <Button onClick={handlePrintAttendance} variant="secondary" className="!p-2 text-sm" disabled={isSubmitting}>{isSubmitting ? <SpinnerIcon className="w-4 h-4 mr-2" /> : <PrinterIcon className="w-4 h-4 mr-2" />}{isSubmitting ? 'Salvando...' : 'Imprimir Lista de Presença'}</Button>}</div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2">
                            {attendance.length > 0 ? attendance.map((item) => (
                                <div key={item.classId} className="flex justify-between items-center p-3 border rounded-md bg-white"><span className="text-sm font-medium text-gray-700 truncate mr-2" title={item.className}>{item.className}</span><input type="number" min="0" value={item.count} onChange={(e) => updateAttendance(item.classId, parseInt(e.target.value) || 0)} className="w-20 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm text-center"/></div>
                            )) : <p className="col-span-2 text-center text-gray-500 py-4">Nenhuma turma cadastrada para esta escola.</p>}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-6 border-t mt-4">
                <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                <Button type="button" onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? <SpinnerIcon className="w-5 h-5"/> : 'Salvar Relatório'}</Button>
            </div>
        </Modal>
    );
};

export const SchoolEventsPage: React.FC<SchoolEventsPageProps> = ({ user, events, onAddOrUpdateEvent, onDeleteEvent, schools, classes, students, onPrintEventAttendance }) => {
    const [viewMode, setViewMode] = useState<'list' | 'analytics' | 'ranking' | 'suggestions'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [statsEvent, setStatsEvent] = useState<CalendarEvent | null>(null);

    const filteredEvents = useMemo(() => {
        let filtered = events;
        if (typeFilter !== 'all') {
            filtered = filtered.filter(e => e.type === typeFilter);
        }
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(e => 
                e.title.toLowerCase().includes(lowerSearch) || 
                (e.description && e.description.toLowerCase().includes(lowerSearch))
            );
        }
        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [events, searchTerm, typeFilter]);

    const handleOpenModal = (event: CalendarEvent | null = null) => {
        setEditingEvent(event);
        setIsModalOpen(true);
    };

    const handleOpenStatsModal = (event: CalendarEvent) => {
        setStatsEvent(event);
        setIsStatsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este evento?')) {
            await onDeleteEvent(id);
        }
    };

    const getTypeLabel = (type: string) => {
        switch(type) {
            case 'holiday': return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Feriado</span>;
            case 'reminder': return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Lembrete</span>;
            default: return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Evento</span>;
        }
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Eventos Escolares</h1>
                    <p className="text-gray-600 mt-1">Registro completo de atividades, estatísticas e custos.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200 flex">
                        <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'list' ? 'bg-teal-100 text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><DocumentTextIcon className="w-4 h-4 inline-block mr-1"/> Lista</button>
                        <button onClick={() => setViewMode('analytics')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'analytics' ? 'bg-teal-100 text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><ChartBarIcon className="w-4 h-4 inline-block mr-1"/> Comparativo</button>
                        <button onClick={() => setViewMode('ranking')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'ranking' ? 'bg-teal-100 text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><UsersIcon className="w-4 h-4 inline-block mr-1"/> Ranking</button>
                        <button onClick={() => setViewMode('suggestions')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'suggestions' ? 'bg-teal-100 text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><SparklesIcon className="w-4 h-4 inline-block mr-1"/> Sugestões (IA)</button>
                    </div>
                    {viewMode === 'list' && (
                        <Button onClick={() => handleOpenModal()}>
                            <PlusIcon className="w-5 h-5 mr-2" /> Novo Evento
                        </Button>
                    )}
                </div>
            </div>

            {viewMode === 'list' && (
                <>
                    <div className="bg-white rounded-lg shadow mb-6 p-4 flex flex-wrap gap-4 items-center">
                        <div className="relative flex-grow max-w-md"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><MagnifyingGlassIcon className="h-5 w-5 text-gray-400" /></div><input type="text" className="block w-full rounded-md border-gray-300 pl-10 focus:border-teal-500 focus:ring-teal-500 sm:text-sm" placeholder="Buscar eventos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"><option value="all">Todos os Tipos</option><option value="event">Eventos</option><option value="holiday">Feriados</option><option value="reminder">Lembretes</option></select>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        {filteredEvents.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {filteredEvents.map((event) => {
                                    const totalAttendance = (event.attendance || []).reduce((sum, item) => sum + (Number(item.count) || 0), 0);
                                    const totalCost = (event.financials || []).reduce((sum, item) => {
                                        if (item.type === 'per_student') {
                                            return sum + ((Number(item.amount) || 0) * totalAttendance);
                                        } else {
                                            return sum + (Number(item.amount) || 0);
                                        }
                                    }, 0);
                                    
                                    return (
                                        <li key={event.id} className="p-4 hover:bg-gray-50 transition duration-150 ease-in-out">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <p className="text-sm font-medium text-teal-600 truncate">{new Date(event.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                        {getTypeLabel(event.type)}
                                                    </div>
                                                    <p className="text-lg font-semibold text-gray-900 truncate">{event.title}</p>
                                                    {event.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{event.description}</p>}
                                                    
                                                    {(totalCost > 0 || totalAttendance > 0) && (
                                                        <div className="flex gap-4 mt-2">
                                                            {totalCost > 0 && <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800"><CurrencyDollarIcon className="w-3 h-3 mr-1" />{formatCurrency(totalCost)}</span>}
                                                            {totalAttendance > 0 && <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800"><UsersIcon className="w-3 h-3 mr-1" />{totalAttendance} Participantes</span>}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 self-start md:self-center">
                                                    <Button variant="secondary" className="!p-2 text-xs" onClick={() => handleOpenStatsModal(event)} title="Gerenciar Estatísticas e Custos"><ChartBarIcon className="w-4 h-4 mr-1 md:mr-0 lg:mr-1" /><span className="hidden lg:inline">Relatório</span></Button>
                                                    <Button variant="secondary" className="!p-2" onClick={() => handleOpenModal(event)}><PencilIcon className="w-4 h-4 text-gray-600" /></Button>
                                                    <Button variant="secondary" className="!p-2 !bg-red-50 hover:!bg-red-100" onClick={() => handleDelete(event.id)}><TrashIcon className="w-4 h-4 text-red-600" /></Button>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="text-center py-12"><TicketIcon className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum evento encontrado</h3><p className="mt-1 text-sm text-gray-500">Tente ajustar os filtros ou adicione um novo evento.</p></div>
                        )}
                    </div>
                </>
            )}
            
            {viewMode === 'analytics' && <ComparativeAnalysis events={events} />}
            {viewMode === 'ranking' && <EngagementRanking events={events} />}
            {viewMode === 'suggestions' && <ActivityGenerator onConvertToEvent={(e) => { handleOpenModal(e as CalendarEvent); }} />}

            {isModalOpen && <EventFormModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingEvent(null); }} onSave={onAddOrUpdateEvent} event={editingEvent} user={user} schools={schools} />}
            {isStatsModalOpen && statsEvent && <EventStatsModal isOpen={isStatsModalOpen} onClose={() => { setIsStatsModalOpen(false); setStatsEvent(null); }} onSave={onAddOrUpdateEvent} event={statsEvent} classes={classes} students={students} onPrintAttendance={onPrintEventAttendance} schools={schools} />}
        </div>
    );
};
