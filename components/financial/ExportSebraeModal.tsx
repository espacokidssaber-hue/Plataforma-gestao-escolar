import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Invoice, Expense } from '../../types';

interface ExportSebraeModalProps {
  invoices: Invoice[];
  expenses: Expense[];
  onClose: () => void;
}

const ExportSebraeModal: React.FC<ExportSebraeModalProps> = ({ invoices, expenses, onClose }) => {
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(1);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        const date = new Date();
        return date.toISOString().split('T')[0];
    });
    const [includeReceivables, setIncludeReceivables] = useState(true);
    const [includePayables, setIncludePayables] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleExport = () => {
        setIsGenerating(true);

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the whole end day

        const dataToExport = [];

        // Process Receivables (Invoices)
        if (includeReceivables) {
            const filteredInvoices = invoices.filter(inv => {
                const invDate = new Date(inv.dueDate);
                return invDate >= start && invDate <= end;
            });
            filteredInvoices.forEach(inv => {
                dataToExport.push({
                    'Data': inv.dueDate,
                    'Descrição': `${inv.description} - ${inv.studentName}`,
                    'Valor': inv.amount,
                    'Tipo': 'Entrada',
                    'Situação': inv.status,
                });
            });
        }

        // Process Payables (Expenses)
        if (includePayables) {
            const filteredExpenses = expenses.filter(exp => {
                const expDate = new Date(exp.dueDate);
                return expDate >= start && expDate <= end;
            });
            filteredExpenses.forEach(exp => {
                dataToExport.push({
                    'Data': exp.dueDate,
                    'Descrição': `${exp.description} - ${exp.supplier}`,
                    'Valor': exp.amount,
                    'Tipo': 'Saída',
                    'Situação': exp.status,
                });
            });
        }
        
        if(dataToExport.length === 0) {
            alert('Nenhum dado encontrado para o período e filtros selecionados.');
            setIsGenerating(false);
            return;
        }

        // Sort data by date
        dataToExport.sort((a, b) => new Date(a.Data).getTime() - new Date(b.Data).getTime());

        // Create worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Lançamentos');

        // Trigger download
        XLSX.writeFile(workbook, `export_fluxo_caixa_sebrae_${startDate}_a_${endDate}.xlsx`);

        setIsGenerating(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Exportar Lançamentos para Sebrae</h2>
                    <button type="button" onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="p-6 space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Selecione o período e os tipos de lançamento que deseja incluir no arquivo de exportação.</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Início</label>
                            <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Fim</label>
                            <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Incluir no arquivo:</h3>
                        <div className="space-y-2">
                            <label className="flex items-center p-3 bg-gray-100 dark:bg-gray-700/30 rounded-lg">
                                <input type="checkbox" checked={includeReceivables} onChange={e => setIncludeReceivables(e.target.checked)} className="h-4 w-4 rounded text-teal-500" />
                                <span className="ml-3 text-gray-900 dark:text-white">Contas a Receber (Entradas)</span>
                            </label>
                             <label className="flex items-center p-3 bg-gray-100 dark:bg-gray-700/30 rounded-lg">
                                <input type="checkbox" checked={includePayables} onChange={e => setIncludePayables(e.target.checked)} className="h-4 w-4 rounded text-teal-500" />
                                <span className="ml-3 text-gray-900 dark:text-white">Contas a Pagar (Saídas)</span>
                            </label>
                        </div>
                    </div>
                </main>
                <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button 
                        onClick={handleExport} 
                        disabled={isGenerating || (!includePayables && !includeReceivables)}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 disabled:bg-gray-500"
                    >
                        {isGenerating ? 'Gerando...' : 'Gerar e Baixar Arquivo'}
                    </button>
                </footer>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default ExportSebraeModal;