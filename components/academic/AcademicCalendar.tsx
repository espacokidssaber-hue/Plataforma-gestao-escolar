import React, { useState, useMemo, useRef } from 'react';
import { EventData, AllCalendarEvents } from '../../types';
import { extractCalendarEventsFromPdf } from '../../services/geminiService';
import { MOCK_CALENDAR_EVENTS } from '../../data/calendarData';
import AddEventModal from './AddEventModal';


const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const EventBadge: React.FC<{ event: { type: string; label: string } }> = ({ event }) => {
    const typeClasses: { [key: string]: string } = {
        exam: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
        holiday: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300',
        event: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
        other: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    };
    return (
        <div className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-md truncate ${typeClasses[event.type] || 'bg-gray-200'}`} title={event.label}>
            {event.label}
        </div>
    );
};

const AcademicCalendar: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<AllCalendarEvents>(MOCK_CALENDAR_EVENTS);
    const [isImporting, setIsImporting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dayToAddEvent, setDayToAddEvent] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const calendarGrid = useMemo(() => {
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const grid = Array(firstDayOfMonth).fill(null);
        for (let day = 1; day <= daysInMonth; day++) {
            grid.push(day);
        }
        return grid;
    }, [currentYear, currentMonth]);

    const handleMonthChange = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handlePdfImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || file.type !== 'application/pdf') {
            alert('Por favor, selecione um arquivo PDF.');
            return;
        }
        setIsImporting(true);
        try {
            const base64Data = await fileToBase64(file);
            const extractedMonths = await extractCalendarEventsFromPdf(base64Data);
            
            const newEvents: AllCalendarEvents = { ...events };
            extractedMonths.forEach(monthData => {
                const key = `${monthData.year}-${monthData.month - 1}`;
                newEvents[key] = newEvents[key] || {};
                monthData.events.forEach(event => {
                    if (!newEvents[key][event.day]) {
                        newEvents[key][event.day] = [];
                    }
                    newEvents[key][event.day].push({ type: event.type, label: event.label });
                });
            });
            
            setEvents(newEvents);
            alert(`${extractedMonths.reduce((acc, m) => acc + m.events.length, 0)} eventos importados com sucesso!`);
        } catch (error) {
            console.error(error);
            alert(`Erro ao importar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSaveEvent = (eventData: EventData) => {
        const key = `${currentYear}-${currentMonth}`;
        const newEvents = { ...events };
        if (!newEvents[key]) newEvents[key] = {};
        if (!newEvents[key][eventData.day]) newEvents[key][eventData.day] = [];
        newEvents[key][eventData.day].push({ type: eventData.type, label: eventData.label });
        setEvents(newEvents);
        setIsModalOpen(false);
        setDayToAddEvent(null);
    };

    return (
        <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6">
            <header className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <div className="flex items-center space-x-2">
                    <button onClick={() => handleMonthChange(-1)} className="p-2 bg-gray-200 dark:bg-gray-700/60 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700">&lt;</button>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white w-48 text-center">{`${MONTH_NAMES[currentMonth]} de ${currentYear}`}</h2>
                    <button onClick={() => handleMonthChange(1)} className="p-2 bg-gray-200 dark:bg-gray-700/60 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700">&gt;</button>
                    <button onClick={() => setCurrentDate(new Date())} className="text-sm font-semibold text-teal-600 dark:text-teal-300 ml-2">Hoje</button>
                </div>
                <div className="flex items-center space-x-2">
                     <input type="file" ref={fileInputRef} onChange={handlePdfImport} accept=".pdf" className="hidden" />
                     <button onClick={() => fileInputRef.current?.click()} disabled={isImporting} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 disabled:bg-gray-500">
                        {isImporting ? 'Importando...' : 'Importar Calendário (PDF)'}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-7 gap-1">
                {DAY_NAMES.map(day => <div key={day} className="text-center font-bold text-gray-500 dark:text-gray-400 text-sm">{day}</div>)}
                {calendarGrid.map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} className="border border-gray-200 dark:border-gray-700/50 rounded-md min-h-[100px]"></div>;
                    }
                    const dayEvents = events[`${currentYear}-${currentMonth}`]?.[day] || [];
                    const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
                    return (
                        <div key={day} className={`relative border border-gray-200 dark:border-gray-700/50 rounded-md min-h-[100px] p-1 group ${isToday ? 'bg-teal-50 dark:bg-teal-900/30' : ''}`}>
                            <span className={`font-semibold ${isToday ? 'text-teal-600 dark:text-teal-300' : 'text-gray-900 dark:text-white'}`}>{day}</span>
                            <div className="space-y-1 mt-1">
                                {dayEvents.map((event, i) => <EventBadge key={i} event={event} />)}
                            </div>
                             <button 
                                onClick={() => { setDayToAddEvent(day); setIsModalOpen(true); }}
                                className="absolute top-1 right-1 p-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    );
                })}
            </div>
            {isModalOpen && <AddEventModal day={dayToAddEvent} onClose={() => setIsModalOpen(false)} onSave={handleSaveEvent} />}
        </div>
    );
};

export default AcademicCalendar;
