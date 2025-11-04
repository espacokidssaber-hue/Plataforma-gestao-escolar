import React, { useState, useMemo } from 'react';
import { Expense, ExpenseStatus } from '../../types';
import AddExpenseModal from './AddExpenseModal';
import MarkAsPaidModal from './MarkAsPaidModal';


const StatusBadge: React.FC<{ status: ExpenseStatus }> = ({ status }) => {
    const statusClasses = {
        [ExpenseStatus.PAID]: 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300',
        [ExpenseStatus.PENDING]: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300',
        [ExpenseStatus.OVERDUE]: 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`}>
            {status}
        </span>
    );
};


const AccountsPayable: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [filter, setFilter] = useState<ExpenseStatus | 'all'>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isPaidModalOpen, setIsPaidModalOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
    const [expenseToPay, setExpenseToPay] = useState<Expense | null>(null);

    const handleSaveExpense = (data: Omit<Expense, 'id' | 'status'> & { id?: number }) => {
        if (data.id) { // Edit
            setExpenses(prev => prev.map(exp => exp.id === data.id ? { ...exp, ...data } : exp));
        } else { // Add
            const newExpense: Expense = {
                ...data,
                id: Date.now(),
                status: new Date(data.dueDate) < new Date() ? ExpenseStatus.OVERDUE : ExpenseStatus.PENDING,
            };
            setExpenses(prev => [newExpense, ...prev]);
        }
        setIsAddModalOpen(false);
        setExpenseToEdit(null);
    };

    const handleMarkAsPaid = (paymentDate: string) => {
        if (expenseToPay) {
            setExpenses(prev => prev.map(exp => exp.id === expenseToPay.id ? { ...exp, status: ExpenseStatus.PAID, paymentDate } : exp));
            setIsPaidModalOpen(false);
            setExpenseToPay(null);
        }
    };

    const filteredExpenses = useMemo(() => {
        if (filter === 'all') return expenses;
        return expenses.filter(exp => exp.status === filter);
    }, [expenses, filter]);

    return (
        <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contas a Pagar</h2>
                <button
                    onClick={() => { setExpenseToEdit(null); setIsAddModalOpen(true); }}
                    className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 transition-colors flex items-center space-x-2"
                >
                    + Adicionar Despesa
                </button>
            </div>

            <div className="flex items-center space-x-2 mb-4">
                <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm rounded-md ${filter === 'all' ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>Todos</button>
                <button onClick={() => setFilter(ExpenseStatus.PENDING)} className={`px-3 py-1 text-sm rounded-md ${filter === ExpenseStatus.PENDING ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>Pendentes</button>
                <button onClick={() => setFilter(ExpenseStatus.OVERDUE)} className={`px-3 py-1 text-sm rounded-md ${filter === ExpenseStatus.OVERDUE ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>Atrasados</button>
                <button onClick={() => setFilter(ExpenseStatus.PAID)} className={`px-3 py-1 text-sm rounded-md ${filter === ExpenseStatus.PAID ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>Pagos</button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                            <th className="p-3">Fornecedor / Descrição</th>
                            <th className="p-3">Categoria</th>
                            <th className="p-3">Vencimento</th>
                            <th className="p-3">Valor</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.map(exp => (
                            <tr key={exp.id} className="border-b border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                <td className="p-3">
                                    <p className="font-semibold text-gray-800 dark:text-white">{exp.supplier}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{exp.description}</p>
                                </td>
                                <td className="p-3 text-gray-600 dark:text-gray-300">{exp.category}</td>
                                <td className="p-3 text-gray-600 dark:text-gray-300">{new Date(exp.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                <td className="p-3 font-semibold text-gray-800 dark:text-white">R$ {exp.amount.toFixed(2)}</td>
                                <td className="p-3"><StatusBadge status={exp.status} /></td>
                                <td className="p-3 text-right space-x-2">
                                    {exp.status !== ExpenseStatus.PAID && (
                                        <button onClick={() => { setExpenseToPay(exp); setIsPaidModalOpen(true); }} className="px-3 py-1 bg-green-100 dark:bg-green-600/50 text-green-700 dark:text-green-200 text-xs font-semibold rounded-md">
                                            Registrar Pagamento
                                        </button>
                                    )}
                                    <button onClick={() => { setExpenseToEdit(exp); setIsAddModalOpen(true); }} className="px-3 py-1 bg-blue-100 dark:bg-blue-600/50 text-blue-700 dark:text-blue-200 text-xs font-semibold rounded-md">
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredExpenses.length === 0 && (
                     <p className="text-center text-gray-500 dark:text-gray-400 py-10">Nenhuma despesa encontrada para este filtro.</p>
                 )}
            </div>

            {isAddModalOpen && (
                <AddExpenseModal
                    expense={expenseToEdit}
                    onClose={() => { setIsAddModalOpen(false); setExpenseToEdit(null); }}
                    onSave={handleSaveExpense}
                />
            )}

            {isPaidModalOpen && expenseToPay && (
                <MarkAsPaidModal
                    expense={expenseToPay}
                    onClose={() => { setIsPaidModalOpen(false); setExpenseToPay(null); }}
                    onConfirm={handleMarkAsPaid}
                />
            )}
        </div>
    )
};

export default AccountsPayable;