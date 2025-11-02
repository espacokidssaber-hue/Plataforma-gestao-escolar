import React, { useState } from 'react';

interface GenerateInvoicesModalProps {
  onClose: () => void;
  onGenerate: (config: {
    month: string;
    year: string;
    dueDate: string;
    baseAmount: number;
    description: string;
    applyDiscount: boolean;
    level: string;
  }) => void;
}

const GenerateInvoicesModal: React.FC<GenerateInvoicesModalProps> = ({ onClose, onGenerate }) => {
    const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
    const currentYear = new Date().getFullYear().toString();

    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);
    const [dueDate, setDueDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5).toISOString().split('T')[0]);
    const [baseAmount, setBaseAmount] = useState(1200);
    const [description, setDescription] = useState('Mensalidade referente a {mes}/{ano}');
    const [applyDiscount, setApplyDiscount] = useState(false);
    const [level, setLevel] = useState('all');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate({ month, year, dueDate, baseAmount, description, applyDiscount, level });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerar Mensalidades em Lote</h2>
                    <button type="button" onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Month and Year */}
                    <div>
                        <label htmlFor="month" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mês de Referência</label>
                        <select id="month" value={month} onChange={e => setMonth(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white">
                            {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ano</label>
                        <input type="number" id="year" value={year} onChange={e => setYear(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white" />
                    </div>
                    {/* Due Date and Amount */}
                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Vencimento</label>
                        <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="baseAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Padrão (R$)</label>
                        <input type="number" step="0.01" id="baseAmount" value={baseAmount} onChange={e => setBaseAmount(Number(e.target.value))} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white" />
                    </div>
                    {/* Description and Level */}
                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição da Fatura</label>
                        <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Público-alvo</label>
                        <select id="level" value={level} onChange={e => setLevel(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white">
                            <option value="all">Todos os Alunos</option>
                            <option value="infantil">Apenas Ed. Infantil</option>
                            <option value="fundamental1">Apenas Fundamental I</option>
                        </select>
                    </div>
                    {/* Discount */}
                    <div className="md:col-span-2 flex items-center">
                        <input type="checkbox" id="applyDiscount" checked={applyDiscount} onChange={e => setApplyDiscount(e.target.checked)} className="h-4 w-4 text-teal-600 border-gray-300 rounded" />
                        <label htmlFor="applyDiscount" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Aplicar desconto de pontualidade (5%)</label>
                    </div>
                </main>
                <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500">
                        Gerar Faturas
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

export default GenerateInvoicesModal;