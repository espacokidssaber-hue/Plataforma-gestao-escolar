import React from 'react';

interface BulkInviteConfirmModalProps {
  studentCount: number;
  defaultFee: number;
  campaignText: string;
  onClose: () => void;
  onConfirm: () => void;
}

const BulkInviteConfirmModal: React.FC<BulkInviteConfirmModalProps> = ({
  studentCount,
  defaultFee,
  campaignText,
  onClose,
  onConfirm,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Confirmar Disparo em Massa</h2>
          <button onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        <main className="p-6 space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Você está prestes a enviar o convite de pré-matrícula para todos os alunos elegíveis. Por favor, revise os detalhes abaixo antes de confirmar.
          </p>
          <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-500 dark:text-gray-400">Alunos a serem convidados:</span>
              <span className="font-bold text-gray-900 dark:text-white">{studentCount}</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-500 dark:text-gray-400">Taxa de Pré-Matrícula Padrão:</span>
              <span className="font-bold text-teal-600 dark:text-teal-300">R$ {defaultFee.toFixed(2)}</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Pré-visualização do Comunicado:</h3>
            <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
              {campaignText}
            </div>
          </div>
          <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-500/50 rounded-lg text-center">
            <p className="font-bold text-red-700 dark:text-red-300">Atenção: Esta ação é irreversível!</p>
            <p className="text-sm text-red-600 dark:text-red-400">Após a confirmação, os convites serão enviados e os status dos alunos serão atualizados.</p>
          </div>
        </main>
        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500">
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-6 py-2 bg-teal-600 rounded-lg text-white font-semibold hover:bg-teal-500">
            Confirmar e Disparar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default BulkInviteConfirmModal;
