import React from 'react';
import { Invoice, Expense, InvoiceStatus, ExpenseStatus } from '../../types';

interface FinancialOverviewProps {
  invoices: Invoice[];
  expenses: Expense[];
}

const KPICard: React.FC<{ title: string; value: string; change?: string; changeType?: 'increase' | 'decrease' }> = ({ title, value, change, changeType }) => {
    const changeColor = changeType === 'increase' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    return (
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700/50">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
            {change && (
                <p className={`text-sm mt-2 flex items-center ${changeColor}`}>
                    {changeType === 'increase' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                    )}
                    {change}
                </p>
            )}
        </div>
    );
};


const FinancialOverview: React.FC<FinancialOverviewProps> = ({ invoices, expenses }) => {
    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Calculate KPIs
    const monthlyRevenue = invoices
        .filter(inv => {
            const invDate = new Date(inv.dueDate);
            return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
        })
        .reduce((sum, inv) => sum + inv.amount, 0);

    const monthlyExpenses = expenses
        .filter(exp => {
            const expDate = new Date(exp.dueDate);
            return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);

    const netResult = monthlyRevenue - monthlyExpenses;

    const overdueAmount = invoices
        .filter(inv => inv.status === InvoiceStatus.OVERDUE)
        .reduce((sum, inv) => sum + inv.amount, 0);

    const totalReceivables = invoices
        .filter(inv => inv.status === InvoiceStatus.PENDING || inv.status === InvoiceStatus.OVERDUE)
        .reduce((sum, inv) => sum + inv.amount, 0);
        
    const defaultRate = totalReceivables > 0 ? (overdueAmount / totalReceivables) * 100 : 0;
    
    const upcomingExpenses = expenses
        .filter(exp => exp.status === ExpenseStatus.PENDING && new Date(exp.dueDate) >= new Date())
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 3); // Show next 3

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Faturamento Previsto (Mês)" value={formatCurrency(monthlyRevenue)} />
                <KPICard title="Despesas Lançadas (Mês)" value={formatCurrency(monthlyExpenses)} />
                <KPICard title="Resultado Líquido (Mês)" value={formatCurrency(netResult)} />
                <KPICard title="Inadimplência Geral" value={`${defaultRate.toFixed(1)}%`} />
            </div>

             <div className="mt-8 bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700/50">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Próximos Vencimentos</h3>
                 <div className="space-y-3">
                    {upcomingExpenses.length > 0 ? (
                        upcomingExpenses.map(exp => (
                            <div key={exp.id} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700/40 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-white">{exp.supplier}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{exp.description}</p>
                                </div>
                                <div className="text-right">
                                     <p className="font-bold text-red-600 dark:text-red-400">{formatCurrency(exp.amount)}</p>
                                     <p className="text-xs text-gray-500 dark:text-gray-400">Vence em {new Date(exp.dueDate + 'T00:00:00-03:00').toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">Nenhuma despesa pendente para os próximos dias.</p>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default FinancialOverview;