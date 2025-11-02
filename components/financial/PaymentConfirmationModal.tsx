import React, { useState } from 'react';
import { Invoice, InvoiceStatus } from '../../types';

interface PaymentConfirmationModalProps {
  invoice: Invoice;
  onClose: () => void;
  onConfirm: (updatedInvoice: Invoice) => void;
}

const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({ invoice, onClose, onConfirm }) => {
  const [receipt, setReceipt] = useState<{ file: File, base64: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const base64 = loadEvent.target?.result as string;
        setReceipt({ file, base64 });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleConfirmWithReceipt = () => {
    if (receipt) {
      onConfirm({
        ...invoice,
        status: InvoiceStatus.PAID,
        paymentMethod: 'Comprovante',
        paymentReceiptUrl: receipt.base64,
      });
    }
  };

  const handleManualConfirmation = (method: 'PIX' | 'Dinheiro' | 'Cartão') => {
    onConfirm({
      ...invoice,
      status: InvoiceStatus.PAID,
      paymentMethod: method,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Confirmar Pagamento da Fatura #{invoice.id}</h2>
          <button onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
          {/* Section 1: Upload Receipt */}
          <div className="space-y-4 flex flex-col">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Opção 1: Anexar Comprovante</h3>
            <div className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg flex-grow">
              <input type="file" id="receipt-upload" accept=".pdf,image/*" onChange={handleFileChange} className="hidden" />
              <label htmlFor="receipt-upload" className="cursor-pointer w-full h-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-teal-500 hover:text-teal-400 transition-colors flex flex-col items-center justify-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <span className="text-sm">{receipt ? receipt.file.name : 'Clique para carregar (PDF, JPG, PNG)'}</span>
              </label>
            </div>
            <button onClick={handleConfirmWithReceipt} disabled={!receipt} className="w-full px-4 py-2 bg-teal-600 font-semibold text-white rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-teal-500">
              Confirmar com Comprovante
            </button>
          </div>

          {/* Section 2: Manual Confirmation */}
          <div className="space-y-4 flex flex-col">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Opção 2: Confirmação Manual</h3>
            <div className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg h-full flex flex-col justify-around space-y-3">
              <button onClick={() => handleManualConfirmation('PIX')} className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold text-gray-800 dark:text-white rounded-lg transition-colors">PIX Recebido</button>
              <button onClick={() => handleManualConfirmation('Dinheiro')} className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold text-gray-800 dark:text-white rounded-lg transition-colors">Recebido em Dinheiro</button>
              <button onClick={() => handleManualConfirmation('Cartão')} className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold text-gray-800 dark:text-white rounded-lg transition-colors">Pago no Cartão</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentConfirmationModal;