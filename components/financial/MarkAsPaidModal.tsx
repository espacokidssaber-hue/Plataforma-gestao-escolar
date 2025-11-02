import React, { useState } from 'react';
import { Expense } from '../../types';

interface MarkAsPaidModalProps {
  expense: Expense;
  onClose: () => void;
  onConfirm: (paymentDate: string) => void;
}

const MarkAsPaidModal: React.FC<MarkAsPaidModalProps> = ({ expense, onClose, onConfirm }) => {
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(paymentDate);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Registrar Pagamento</h2>
        </header>
        <main className="p-6 space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Você está confirmando o pagamento da despesa <strong className="text-gray-800 dark:text-white">{expense.description}</strong> no valor de <strong className="text-gray-800 dark:text-white">R$ {expense.amount.toFixed(2)}</strong>.
          </p>
          <div>
            <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data do Pagamento</label>
            <input
              type="date"
              id="paymentDate"
              value={paymentDate}
              onChange={e => setPaymentDate(e.target.value)}
              required
              className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white"
            />
          </div>
        </main>
        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white">Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-green-600 font-semibold text-white rounded-lg">Confirmar Pagamento</button>
        </footer>
      </form>
    </div>
  );
};

export default MarkAsPaidModal;