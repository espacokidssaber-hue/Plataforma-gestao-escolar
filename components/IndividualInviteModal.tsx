import React, { useState } from 'react';
import { ReEnrollingStudent } from '../types';

interface IndividualInviteModalProps {
  student: ReEnrollingStudent;
  defaultFee: number;
  onClose: () => void;
  onConfirm: (student: ReEnrollingStudent, fee: number) => void;
}

const IndividualInviteModal: React.FC<IndividualInviteModalProps> = ({ student, defaultFee, onClose, onConfirm }) => {
    const [fee, setFee] = useState(defaultFee);

    const handleConfirm = () => {
        onConfirm(student, fee);
        alert(`Convite individual enviado para ${student.name} com a taxa de R$ ${fee.toFixed(2)}.`);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Enviar Convite Individual</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Aluno: <span className="font-semibold text-teal-600 dark:text-teal-300">{student.name}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="p-6 space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                        Esta ação enviará o link do portal de pré-matrícula para o responsável do aluno.
                        Você pode definir uma taxa personalizada para esta pré-matrícula.
                    </p>
                    <div>
                        <label htmlFor="custom-fee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Taxa de Pré-Matrícula Personalizada (R$)
                        </label>
                        <input
                            type="number"
                            id="custom-fee"
                            value={fee}
                            onChange={(e) => setFee(Number(e.target.value))}
                            className="w-full bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">O valor padrão da campanha é R$ {defaultFee.toFixed(2)}.</p>
                    </div>
                </main>
                <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500">
                        Cancelar
                    </button>
                    <button onClick={handleConfirm} className="px-4 py-2 bg-teal-600 rounded-lg text-white font-semibold hover:bg-teal-500">
                        Confirmar e Enviar
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default IndividualInviteModal;
