import React, { useState } from 'react';

interface AttendanceReportModalProps {
  onClose: () => void;
  onGenerate: (month: number, year: number) => void;
}

const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const AttendanceReportModal: React.FC<AttendanceReportModalProps> = ({ onClose, onGenerate }) => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(month, year);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerar Relatório de Frequência</h2>
                    <button type="button" onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ano Letivo</label>
                            <input type="number" id="year" value={year} onChange={e => setYear(Number(e.target.value))} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                        </div>
                        <div>
                            <label htmlFor="month" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mês de Referência</label>
                            <select id="month" value={month} onChange={e => setMonth(Number(e.target.value))} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-sm">
                                <option value="-1">Todos os Meses</option>
                                {MONTH_NAMES.map((name, index) => <option key={name} value={index}>{name}</option>)}
                            </select>
                        </div>
                    </div>
                </main>
                <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500">
                        Gerar e Baixar
                    </button>
                </footer>
                <style>{`.animate-fade-in { animation: fade-in 0.2s ease-out forwards; }`}</style>
            </form>
        </div>
    );
};

export default AttendanceReportModal;