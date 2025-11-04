import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Invoice, Expense, InvoiceStatus, ExpenseStatus } from '../../types';
import ExportSebraeModal from './ExportSebraeModal';

interface CashFlowProps {
  invoices: Invoice[];
  expenses: Expense[];
}

const Bar: React.FC<{ value: number; maxValue: number, type: 'revenue' | 'expenses' }> = ({ value, maxValue, type }) => {
    const heightPercentage = (value / maxValue) * 100;
    const color = type === 'revenue' ? 'bg-teal-500' : 'bg-red-500';
    return (
        <div 
            className={`w-10 rounded-t-md ${color} transition-all duration-500`} 
            style={{ height: `${heightPercentage}%`}}
            title={`R$ ${value.toLocaleString('pt-BR')}`}
        ></div>
    );
};

const CashFlow: React.FC<CashFlowProps> = ({ invoices, expenses }) => {
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const cashFlowData = useMemo(() => {
        const data: Record<string, { revenue: number, expenses: number }> = {};
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const now = new Date();

        // Initialize last 4 months
        for (let i = 3; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${monthNames[date.getMonth()]}/${date.getFullYear().toString().slice(2)}`;
            data[monthKey] = { revenue: 0, expenses: 0 };
        }

        // Populate with paid invoices
        invoices.forEach(inv => {
            if (inv.status === InvoiceStatus.PAID) {
                const invDate = new Date(inv.dueDate); // Could also be paymentDate if available
                const monthKey = `${monthNames[invDate.getMonth()]}/${invDate.getFullYear().toString().slice(2)}`;
                if (data[monthKey]) {
                    data[monthKey].revenue += inv.amount;
                }
            }
        });

        // Populate with paid expenses
        expenses.forEach(exp => {
            if (exp.status === ExpenseStatus.PAID && exp.paymentDate) {
                const expDate = new Date(exp.paymentDate);
                const monthKey = `${monthNames[expDate.getMonth()]}/${expDate.getFullYear().toString().slice(2)}`;
                 if (data[monthKey]) {
                    data[monthKey].expenses += exp.amount;
                }
            }
        });

        return Object.entries(data).map(([month, values]) => ({ month, ...values }));
    }, [invoices, expenses]);

    const maxValue = Math.max(...cashFlowData.flatMap(d => [d.revenue, d.expenses]), 1); // Avoid division by zero

    return (
        <>
            <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Fluxo de Caixa (Últimos 4 Meses)</h2>
                    <button 
                        onClick={() => setIsExportModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors flex items-center space-x-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                        <span>Exportar para Sebrae</span>
                    </button>
                </div>
                <div className="flex justify-end space-x-4 mb-4 text-sm">
                    <div className="flex items-center">
                        <span className="w-3 h-3 bg-teal-500 rounded-sm mr-2"></span>
                        <span className="text-gray-700 dark:text-gray-300">Receitas</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-3 h-3 bg-red-500 rounded-sm mr-2"></span>
                        <span className="text-gray-700 dark:text-gray-300">Despesas</span>
                    </div>
                </div>
                <div className="h-96 bg-gray-50 dark:bg-gray-800/40 rounded-lg p-4 flex justify-around items-end border border-gray-200 dark:border-gray-700/50">
                    {cashFlowData.map(data => (
                        <div key={data.month} className="flex flex-col items-center h-full">
                            <div className="flex-grow flex items-end space-x-2">
                                <Bar value={data.revenue} maxValue={maxValue} type="revenue" />
                                <Bar value={data.expenses} maxValue={maxValue} type="expenses" />
                            </div>
                            <span className="mt-2 text-sm font-semibold text-gray-600 dark:text-gray-300">{data.month}</span>
                        </div>
                    ))}
                </div>
            </div>
            {isExportModalOpen && (
                <ExportSebraeModal 
                    invoices={invoices}
                    expenses={expenses}
                    onClose={() => setIsExportModalOpen(false)}
                />
            )}
        </>
    );
};

export default CashFlow;