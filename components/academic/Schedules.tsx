import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MORNING_TIME_SLOTS, AFTERNOON_TIME_SLOTS, AllSchedules, Educator, EducatorStatus, ScheduleItem, ClassPeriod, DAYS_OF_WEEK, PrintData, SchoolUnit } from '../../types';
import ScheduleItemModal from './ScheduleItemModal';
import PrintableSchedule from './PrintableSchedule';
import { MOCK_EDUCATORS } from '../../data/educatorsData';
import { MOCK_CLASSES } from '../../data/classesData';
import { MOCK_SCHEDULES_INITIAL_STATE } from '../../data/schedulesData';

// html2pdf is loaded globally from index.html
declare const html2pdf: any;

const SUBJECT_COLORS: Record<string, string> = {
    'Matemática': 'bg-blue-100 dark:bg-blue-800/50 border-blue-300 dark:border-blue-700',
    'Português': 'bg-green-100 dark:bg-green-800/50 border-green-300 dark:border-green-700',
    'Ciências': 'bg-yellow-100 dark:bg-yellow-800/50 border-yellow-300 dark:border-yellow-700',
    'História': 'bg-purple-100 dark:bg-purple-800/50 border-purple-300 dark:border-purple-700',
    'Artes': 'bg-pink-100 dark:bg-pink-800/50 border-pink-300 dark:border-pink-700',
    'Psicomotricidade': 'bg-indigo-100 dark:bg-indigo-800/50 border-indigo-300 dark:border-indigo-700',
    'Música': 'bg-orange-100 dark:bg-orange-800/50 border-orange-300 dark:border-orange-700',
    'Default': 'bg-gray-100 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600',
};

// Helper functions for time manipulation
const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    return `${hours}:${mins}`;
};

const generateTimeSlots = (
    startTimeStr: string,
    classDur: number,
    breakDur: number,
    numClasses: number,
    breakAfter: number
): { start: string; end: string; isBreak?: boolean; label?: string }[] => {
    const newSlots: { start: string; end: string; isBreak?: boolean; label?: string }[] = [];
    let currentTimeInMinutes = timeToMinutes(startTimeStr);

    for (let i = 1; i <= numClasses; i++) {
        // Add class slot
        const classStart = minutesToTime(currentTimeInMinutes);
        currentTimeInMinutes += classDur;
        const classEnd = minutesToTime(currentTimeInMinutes);
        newSlots.push({ start: classStart, end: classEnd });

        // Add break slot if it's the right time
        if (i === breakAfter && i < numClasses) {
            const breakStart = minutesToTime(currentTimeInMinutes);
            currentTimeInMinutes += breakDur;
            const breakEnd = minutesToTime(currentTimeInMinutes);
            newSlots.push({ start: breakStart, end: breakEnd, isBreak: true, label: 'Intervalo' });
        }
    }
    return newSlots;
};


const Schedules: React.FC = () => {
    const [viewMode, setViewMode] = useState<'class' | 'educator'>('class');
    const [activeShift, setActiveShift] = useState<ClassPeriod>(ClassPeriod.MORNING);
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [selectedEducatorId, setSelectedEducatorId] = useState<number | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCellInfo, setEditingCellInfo] = useState<{ day: string; time: string; item?: ScheduleItem } | null>(null);
    
    // States for schedules and time slots
    const [schedules, setSchedules] = useState<AllSchedules>(MOCK_SCHEDULES_INITIAL_STATE);
    const [morningTimeSlots, setMorningTimeSlots] = useState(() => JSON.parse(JSON.stringify(MORNING_TIME_SLOTS)));
    const [afternoonTimeSlots, setAfternoonTimeSlots] = useState(() => JSON.parse(JSON.stringify(AFTERNOON_TIME_SLOTS)));

    // States for optimizer
    const [startTime, setStartTime] = useState('07:30');
    const [classDuration, setClassDuration] = useState(50);
    const [breakDuration, setBreakDuration] = useState(20);
    const [numberOfClasses, setNumberOfClasses] = useState(5);
    const [breakAfterClass, setBreakAfterClass] = useState(3);

    // States for backup on edit mode
    const [initialSchedules, setInitialSchedules] = useState<AllSchedules | null>(null);
    const [initialMorningSlots, setInitialMorningSlots] = useState(morningTimeSlots);
    const [initialAfternoonSlots, setInitialAfternoonSlots] = useState(afternoonTimeSlots);
    
    // States for printing/downloading
    const [isDownloading, setIsDownloading] = useState(false);
    const [printableContent, setPrintableContent] = useState<React.ReactNode | null>(null);
    const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);
    const printMenuRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (printMenuRef.current && !printMenuRef.current.contains(event.target as Node)) {
                setIsPrintMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const activeEducators = useMemo(() => MOCK_EDUCATORS.filter(e => e.status === EducatorStatus.ACTIVE), []);
    const filteredClasses = useMemo(() => MOCK_CLASSES.filter(c => c.period === activeShift), [activeShift]);
    
    useEffect(() => {
        if (viewMode === 'class') {
            if (filteredClasses.length > 0 && !filteredClasses.some(c => c.id === selectedClassId)) {
                setSelectedClassId(filteredClasses[0].id);
            } else if (filteredClasses.length === 0) {
                setSelectedClassId(null);
            }
        }
    }, [filteredClasses, selectedClassId, viewMode]);


    const allDayTimeSlots = useMemo(() => [
        ...morningTimeSlots,
        { start: '12:00', end: '13:00', isBreak: true, label: 'Almoço' },
        ...afternoonTimeSlots,
    ], [morningTimeSlots, afternoonTimeSlots]);

    const educatorSchedules = useMemo(() => {
        const schedulesByEducator: Record<number, any> = {};
        activeEducators.forEach(educator => {
            const weeklySchedule: any = {};
            DAYS_OF_WEEK.forEach(day => {
                const dailySchedule: any = {};
                allDayTimeSlots.forEach(slot => {
                    if (slot.isBreak) return;
                    for (const classId in schedules) {
                        const classSchedule = schedules[classId as any];
                        const entry = classSchedule[day]?.[slot.start];
                        if (entry && entry.educatorId === educator.id) {
                            const className = MOCK_CLASSES.find(c => c.id === parseInt(classId))?.name || 'Turma';
                            dailySchedule[slot.start] = { subject: entry.subject, className: className };
                            break;
                        }
                    }
                });
                if(Object.keys(dailySchedule).length > 0) {
                     weeklySchedule[day] = dailySchedule;
                }
            });
            schedulesByEducator[educator.id] = weeklySchedule;
        });
        return schedulesByEducator;
    }, [activeEducators, schedules, allDayTimeSlots]);

    const getEducatorName = (id: number) => MOCK_EDUCATORS.find(e => e.id === id)?.name || 'N/A';
    
    // Effect to regenerate time slots when optimizer values change
    useEffect(() => {
        if (isEditMode) {
            const newSlots = generateTimeSlots(startTime, classDuration, breakDuration, numberOfClasses, breakAfterClass);
            if (activeShift === ClassPeriod.MORNING) {
                setMorningTimeSlots(newSlots);
            } else {
                setAfternoonTimeSlots(newSlots);
            }
        }
    }, [isEditMode, startTime, classDuration, breakDuration, numberOfClasses, breakAfterClass, activeShift]);


    const handleOpenModal = (day: string, time: string, item?: ScheduleItem) => {
        if (!isEditMode || viewMode !== 'class') return;
        setEditingCellInfo({ day, time, item });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCellInfo(null);
    };

    const handleSaveItem = (data: { subject: string, educatorId: number }) => {
        if (!editingCellInfo || !selectedClassId) return;
        const { day, time } = editingCellInfo;

        setSchedules(prev => {
            const newSchedules = JSON.parse(JSON.stringify(prev));
            if (!newSchedules[selectedClassId]) newSchedules[selectedClassId] = {};
            if (!newSchedules[selectedClassId][day]) newSchedules[selectedClassId][day] = {};
            newSchedules[selectedClassId][day][time] = data;
            return newSchedules;
        });
        handleCloseModal();
    };

    const handleDeleteItem = () => {
        if (!editingCellInfo || !selectedClassId) return;
        const { day, time } = editingCellInfo;
        
        setSchedules(prev => {
            const newSchedules = JSON.parse(JSON.stringify(prev));
            if (newSchedules[selectedClassId]?.[day]?.[time]) {
                delete newSchedules[selectedClassId][day][time];
            }
            return newSchedules;
        });
        handleCloseModal();
    };

    const handleToggleEditMode = () => {
        const newEditMode = !isEditMode;
        if (newEditMode) { // Entering edit mode
            setInitialSchedules(JSON.parse(JSON.stringify(schedules)));
            setInitialMorningSlots(JSON.parse(JSON.stringify(morningTimeSlots)));
            setInitialAfternoonSlots(JSON.parse(JSON.stringify(afternoonTimeSlots)));

            // Set optimizer values based on current shift
            const slots = activeShift === ClassPeriod.MORNING ? morningTimeSlots : afternoonTimeSlots;
            const classSlots = slots.filter(s => !s.isBreak);
            const breakSlot = slots.find(s => s.isBreak);
            const breakIndex = slots.findIndex(s => s.isBreak);
            
            setStartTime(classSlots[0]?.start || (activeShift === ClassPeriod.MORNING ? '07:30' : '13:00'));
            setClassDuration(classSlots.length > 0 ? timeToMinutes(classSlots[0].end) - timeToMinutes(classSlots[0].start) : 50);
            setBreakDuration(breakSlot ? timeToMinutes(breakSlot.end) - timeToMinutes(breakSlot.start) : 20);
            setNumberOfClasses(classSlots.length);
            setBreakAfterClass(breakIndex > 0 ? breakIndex : Math.floor(classSlots.length / 2));
            
        } else { // Exiting edit mode
            setInitialSchedules(null); // Clear backup
        }
        setIsEditMode(newEditMode);
    };

    const handleCancelEdit = () => {
        if (initialSchedules) {
            setSchedules(initialSchedules);
            setMorningTimeSlots(initialMorningSlots);
            setAfternoonTimeSlots(initialAfternoonSlots);
        }
        setIsEditMode(false);
    };

    const handleSaveChanges = () => {
        setIsEditMode(false);
        setInitialSchedules(null); // Clear backup
        alert("Horários salvos com sucesso!");
    };
    
    const handleDownloadPdf = (data: PrintData) => {
        if (!data) return;
        setIsDownloading(true);

        const doPdfGeneration = () => {
            const element = document.getElementById('printable-schedule-content');
            if (element) {
                const safeFilename = data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                html2pdf().from(element).set({
                    margin: 10,
                    filename: `${safeFilename}.pdf`,
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                }).save().then(() => {
                    setPrintableContent(null);
                    setIsDownloading(false);
                }).catch((err: any) => {
                    console.error("html2pdf error:", err);
                    alert("Ocorreu um erro ao gerar o PDF.");
                    setPrintableContent(null);
                    setIsDownloading(false);
                });
            } else {
                console.error("Printable element not found!");
                setIsDownloading(false);
                setPrintableContent(null);
                alert("Erro: Elemento para impressão não foi encontrado.");
            }
        };

        setPrintableContent(<PrintableSchedule {...data} onRendered={doPdfGeneration} />);
    };
    
    const handlePrintCurrent = () => {
        let dataToPrint: PrintData | null = null;
        if (viewMode === 'class' && selectedClassId) {
            const currentClass = MOCK_CLASSES.find(c => c.id === selectedClassId);
            if (currentClass) {
                dataToPrint = {
                    type: 'class',
                    title: `Horário da Turma: ${currentClass.name}`,
                    schedules: { [selectedClassId]: schedules[selectedClassId] || {} },
                    educators: MOCK_EDUCATORS,
                    classes: [currentClass],
                    timeSlots: activeShift === ClassPeriod.MORNING ? morningTimeSlots : afternoonTimeSlots,
                };
            }
        } else if (viewMode === 'educator' && selectedEducatorId) {
            const currentEducator = MOCK_EDUCATORS.find(e => e.id === selectedEducatorId);
            if (currentEducator) {
                 dataToPrint = {
                    type: 'educator',
                    title: `Horário da Educadora: ${currentEducator.name}`,
                    schedules: { [selectedEducatorId]: educatorSchedules[selectedEducatorId] || {} },
                    educators: [],
                    classes: [],
                    timeSlots: allDayTimeSlots,
                };
            }
        }

        if (dataToPrint) {
            handleDownloadPdf(dataToPrint);
        }
        setIsPrintMenuOpen(false);
    };

    const handlePrintGeneral = () => {
        const dataToPrint: PrintData = {
            type: 'general',
            title: 'Grade Geral de Horários da Instituição',
            schedules: schedules,
            educators: MOCK_EDUCATORS,
            classes: MOCK_CLASSES,
            timeSlots: [],
            allTimeSlots: allDayTimeSlots,
        };
        handleDownloadPdf(dataToPrint);
        setIsPrintMenuOpen(false);
    };
    
    const renderScheduleEditor = () => {
        if (!isEditMode || viewMode !== 'class') return null;

        return (
            <div className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg mb-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Otimizador de Horários ({activeShift})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                        <label htmlFor="startTime" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Início</label>
                        <input type="time" id="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} className="bg-white dark:bg-gray-700 w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm" />
                    </div>
                    <div>
                        <label htmlFor="numberOfClasses" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nº de Aulas</label>
                        <input type="number" id="numberOfClasses" min="1" max="8" value={numberOfClasses} onChange={e => setNumberOfClasses(Number(e.target.value))} className="bg-white dark:bg-gray-700 w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm" />
                    </div>
                    <div>
                        <label htmlFor="classDuration" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Duração Aula (min)</label>
                        <input type="number" id="classDuration" name="classDuration" min="20" step="5" value={classDuration} onChange={e => setClassDuration(Number(e.target.value))} className="bg-white dark:bg-gray-700 w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm" />
                    </div>
                    <div>
                        <label htmlFor="breakAfterClass" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Intervalo após</label>
                        <input type="number" id="breakAfterClass" min="1" max={numberOfClasses - 1} value={breakAfterClass} onChange={e => setBreakAfterClass(Number(e.target.value))} className="bg-white dark:bg-gray-700 w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm" />
                    </div>
                     <div>
                        <label htmlFor="breakDuration" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Duração Int. (min)</label>
                        <input type="number" id="breakDuration" name="breakDuration" min="10" step="5" value={breakDuration} onChange={e => setBreakDuration(Number(e.target.value))} className="bg-white dark:bg-gray-700 w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm" />
                    </div>
                </div>
            </div>
        )
    }

    const renderScheduleGrid = () => {
        let timeSlotsToRender;
        if (viewMode === 'class') {
            timeSlotsToRender = activeShift === ClassPeriod.MORNING ? morningTimeSlots : afternoonTimeSlots;
        } else {
            timeSlotsToRender = allDayTimeSlots;
        }

        const scheduleData = viewMode === 'class'
            ? (selectedClassId ? schedules[selectedClassId] : null)
            : (selectedEducatorId ? educatorSchedules[selectedEducatorId] : null);

        if ((viewMode === 'class' && !selectedClassId) || (viewMode === 'educator' && !selectedEducatorId)) {
            return <div className="text-center p-10 text-gray-500 dark:text-gray-400">Selecione uma {viewMode === 'class' ? 'turma' : 'educadora'} para visualizar o horário.</div>;
        }

        if (!scheduleData || Object.keys(scheduleData).length === 0 && !isEditMode) {
            return <div className="text-center p-10 text-gray-500 dark:text-gray-400">Nenhum horário cadastrado para esta seleção.</div>;
        }

        return (
             <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                        <th className="p-2 border border-gray-200 dark:border-gray-700 w-32 text-gray-600 dark:text-gray-300">Horário</th>
                        {DAYS_OF_WEEK.map(day => <th key={day} className="p-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">{day}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {timeSlotsToRender.map((slot, index) => (
                        <tr key={slot.start + index}>
                           <td className="p-1 border border-gray-200 dark:border-gray-700 text-center font-mono text-sm text-gray-500 dark:text-gray-400 align-middle">
                                {slot.start}<br/>{slot.end}
                            </td>
                            {slot.isBreak ? (
                                <td colSpan={5} className="p-2 border border-gray-200 dark:border-gray-700 text-center font-semibold bg-gray-100 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400">
                                    {slot.label}
                                </td>
                            ) : (
                                DAYS_OF_WEEK.map(day => {
                                    const entry = scheduleData?.[day]?.[slot.start];
                                    const colorKey = entry ? (Object.keys(SUBJECT_COLORS).find(key => entry.subject.includes(key)) || 'Default') : 'Default';
                                    const colorClass = SUBJECT_COLORS[colorKey] || SUBJECT_COLORS.Default;
                                    const isEditable = isEditMode && viewMode === 'class';

                                    return (
                                        <td key={day} 
                                            className={`p-1 border border-gray-200 dark:border-gray-700 align-top min-w-[120px] ${isEditable ? 'hover:bg-teal-50 dark:hover:bg-teal-900/40 cursor-pointer' : ''}`}
                                            onClick={() => handleOpenModal(day, slot.start, entry)}
                                        >
                                            {entry ? (
                                                <div className={`p-2 rounded-md border-l-4 ${colorClass} h-full`}>
                                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{entry.subject}</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-300">
                                                        {viewMode === 'class' ? getEducatorName(entry.educatorId) : entry.className}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="h-full flex items-center justify-center min-h-[50px]">
                                                    {isEditable && <span className="text-teal-500 text-2xl font-light opacity-50">+</span>}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
    
    return (
        <>
            <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6">
                <header className="flex flex-wrap justify-between items-center gap-4 mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 p-1 bg-gray-200 dark:bg-gray-700/50 rounded-lg">
                            <button onClick={() => setViewMode('class')} className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'class' ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-300'}`}>Por Turma</button>
                            <button onClick={() => { setViewMode('educator'); setIsEditMode(false); }} className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'educator' ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-300'}`}>Por Educadora</button>
                        </div>
                        <div className="relative" ref={printMenuRef}>
                            <button onClick={() => setIsPrintMenuOpen(prev => !prev)} className="px-4 py-2 bg-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-500 transition-colors flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                                </svg>
                                <span>Opções de Impressão</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {isPrintMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                                    <button onClick={handlePrintCurrent} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                        Imprimir Visão Atual
                                    </button>
                                    <button onClick={handlePrintGeneral} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm1 2v2h2V5H4zm0 3v2h2V8H4zm0 3v2h2v-2H4zm3 2v-2h2v2H7zm0-3v-2h2v2H7zm0-3V5h2v2H7zm3 3v2h2v-2h-2zm0-3v2h2V8h-2zm0-3V5h2v2h-2zm3 6v-2h2v2h-2zm0-3v-2h2v2h-2z" clipRule="evenodd" /></svg>
                                        Imprimir Grade Geral
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        {viewMode === 'class' ? (
                            <div className="flex items-center space-x-2">
                                <label className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={isEditMode} onChange={handleToggleEditMode} />
                                        <div className={`block w-12 h-6 rounded-full ${isEditMode ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isEditMode ? 'transform translate-x-6' : ''}`}></div>
                                    </div>
                                    <div className="ml-3 text-gray-700 dark:text-gray-300 font-semibold text-sm">Modo Edição</div>
                                </label>
                                <select aria-label="Selecionar Turma" value={selectedClassId ?? ''} onChange={e => setSelectedClassId(Number(e.target.value))} className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded-lg border border-gray-300 dark:border-gray-600">
                                {filteredClasses.length > 0 ? (
                                        filteredClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                    ) : (
                                        <option>Nenhuma turma neste turno</option>
                                    )}
                                </select>
                            </div>
                        ) : (
                            <select aria-label="Selecionar Educadora" value={selectedEducatorId ?? ''} onChange={e => setSelectedEducatorId(Number(e.target.value))} className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded-lg border border-gray-300 dark:border-gray-600">
                                <option value="">Selecione uma educadora...</option>
                                {activeEducators.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        )}
                    </div>
                </header>

                {viewMode === 'class' && (
                    <div className="flex space-x-1 mb-4 rounded-lg bg-gray-200 dark:bg-gray-700/50 p-1 self-start">
                        <button onClick={() => { setActiveShift(ClassPeriod.MORNING); setIsEditMode(false); }} className={`px-4 py-1.5 text-sm rounded-md transition-colors w-32 ${activeShift === ClassPeriod.MORNING ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-300'}`}>
                            Turno Manhã
                        </button>
                        <button onClick={() => { setActiveShift(ClassPeriod.AFTERNOON); setIsEditMode(false); }} className={`px-4 py-1.5 text-sm rounded-md transition-colors w-32 ${activeShift === ClassPeriod.AFTERNOON ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-300'}`}>
                            Turno Tarde
                        </button>
                    </div>
                )}
                
                {renderScheduleEditor()}

                <div className="overflow-x-auto">
                    {renderScheduleGrid()}
                </div>

                {isEditMode && viewMode === 'class' && (
                    <footer className="mt-6 flex justify-end space-x-3">
                        <button onClick={handleCancelEdit} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white">Cancelar</button>
                        <button onClick={handleSaveChanges} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg">Salvar Alterações</button>
                    </footer>
                )}
                {isModalOpen && editingCellInfo && (
                    <ScheduleItemModal 
                        onClose={handleCloseModal}
                        onSave={handleSaveItem}
                        onDelete={handleDeleteItem}
                        cellInfo={editingCellInfo}
                        educators={activeEducators}
                    />
                )}
            </div>
            {isDownloading && printableContent && (
                <div className="fixed -top-[9999px] left-0">
                    {printableContent}
                </div>
            )}
        </>
    );
};

export default Schedules;
