import React, { useState, useEffect } from 'react';
import { Expense } from '../../types';

type ExpenseFormData = Omit<Expense, 'id' | 'status'>;

interface AddExpenseModalProps {
  expense: Expense | null;
  onClose: () => void;
  onSave: (data: ExpenseFormData & { id?: number }) => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ expense, onClose, onSave }) => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    supplier: '',
    category: '',
    description: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
  });

  const isEditing = !!expense;

  useEffect(() => {
    if (expense) {
      setFormData({
        supplier: expense.supplier,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        dueDate: expense.dueDate,
      });
    }
  }, [expense]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: expense?.id });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Editar Despesa' : 'Adicionar Nova Despesa'}</h2>
        </header>
        <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fornecedor</label>
            <input type="text" name="supplier" id="supplier" value={formData.supplier} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
            <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white" />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
            <input type="text" name="category" id="category" value={formData.category} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white" />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (R$)</label>
            <input type="number" step="0.01" name="amount" id="amount" value={formData.amount} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Vencimento</label>
            <input type="date" name="dueDate" id="dueDate" value={formData.dueDate} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white" />
          </div>
        </main>
        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white">Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-teal-600 font-semibold text-white rounded-lg">Salvar</button>
        </footer>
      </form>
    </div>
  );
};

export default AddExpenseModal;