import React, { useState } from 'react';
import { PrintDiaryConfig } from '../../types';

interface GenerateDiaryModalProps {
  onClose: () => void;
  onGenerate: (config: PrintDiaryConfig) => void;
}

const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const GenerateDiaryModal: React.FC<GenerateDiaryModalProps> = ({ onClose, onGenerate }) => {
    const [teacherName, setTeacherName] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth());
    const [includeAttendance, setIncludeAttendance] = useState(true);
    const [includeGrades, setIncludeGrades] = useState(true);
    const [includeLessonLog, setIncludeLessonLog] = useState(true);
    const [includeCalendar, setIncludeCalendar] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate({
            teacherName: teacherName || 'Professor(a)',
            year,
            month,
            includeAttendance,
            includeGrades,
            includeLessonLog,
            includeCalendar,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerar Diário de Classe</h2>
                    <button type="button" onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="teacherName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do(a) Professor(a)</label>
                            <input type="text" id="teacherName" value={teacherName} onChange={e => setTeacherName(e.target.value)} placeholder="Professor(a) Regente" className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                        </div>
                        <div>
                            <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ano Letivo</label>
                            <input type="number" id="year" value={year} onChange={e => setYear(Number(e.target.value))} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Seções para Incluir</h3>
                        <div className="space-y-2">
                            <label className="flex items-center p-2 bg-gray-100 dark:bg-gray-700/30 rounded-lg">
                                <input type="checkbox" checked={includeAttendance} onChange={e => setIncludeAttendance(e.target.checked)} className="h-4 w-4 rounded text-teal-500" />
                                <span className="ml-3 text-gray-900 dark:text-white">Registro de Frequência</span>
                            </label>
                            {includeAttendance && (
                                <div className="pl-8">
                                    <label htmlFor="month" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mês para a Frequência</label>
                                    <select id="month" value={month} onChange={e => setMonth(Number(e.target.value))} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-sm">
                                        {MONTH_NAMES.map((name, index) => <option key={name} value={index}>{name}</option>)}
                                    </select>
                                </div>
                            )}
                            <label className="flex items-center p-2 bg-gray-100 dark:bg-gray-700/30 rounded-lg">
                                <input type="checkbox" checked={includeGrades} onChange={e => setIncludeGrades(e.target.checked)} className="h-4 w-4 rounded text-teal-500" />
                                <span className="ml-3 text-gray-900 dark:text-white">Registro de Notas</span>
                            </label>
                            <label className="flex items-center p-2 bg-gray-100 dark:bg-gray-700/30 rounded-lg">
                                <input type="checkbox" checked={includeLessonLog} onChange={e => setIncludeLessonLog(e.target.checked)} className="h-4 w-4 rounded text-teal-500" />
                                <span className="ml-3 text-gray-900 dark:text-white">Registro de Aulas Ministradas</span>
                            </label>
                            <label className="flex items-center p-2 bg-gray-100 dark:bg-gray-700/30 rounded-lg">
                                <input type="checkbox" checked={includeCalendar} onChange={e => setIncludeCalendar(e.target.checked)} className="h-4 w-4 rounded text-teal-500" />
                                <span className="ml-3 text-gray-900 dark:text-white">Calendário Escolar</span>
                            </label>
                        </div>
                    </div>
                </main>
                <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500">
                        Baixar Arquivo
                    </button>
                </footer>
                <style>{`
                    @keyframes fade-in {
                        from { opacity: 0; transform: scale(0.98); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                `}</style>
            </form>
        </div>
    );
};

export default GenerateDiaryModal;