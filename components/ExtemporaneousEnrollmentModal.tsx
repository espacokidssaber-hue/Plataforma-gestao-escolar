import React, { useState } from 'react';
import { NewExtemporaneousData } from '../types';

interface ExtemporaneousEnrollmentModalProps {
  onClose: () => void;
  onSave: (data: NewExtemporaneousData) => void;
}

const ExtemporaneousEnrollmentModal: React.FC<ExtemporaneousEnrollmentModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState<NewExtemporaneousData>({
    studentName: '',
    guardianName: '',
    grade: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
        onSave(formData);
    }
  };
  
  const isFormValid = formData.studentName.trim() !== '' && formData.guardianName.trim() !== '' && formData.grade.trim() !== '';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nova Matrícula Extemporânea</h2>
          <button onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <main className="p-6 space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Insira os dados básicos do aluno. Ele será adicionado diretamente à fila de enturmação, e o perfil completo poderá ser preenchido posteriormente.</p>
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Aluno (Obrigatório)</label>
              <input type="text" name="studentName" id="studentName" value={formData.studentName} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" />
            </div>
             <div>
              <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Responsável (Obrigatório)</label>
              <input type="text" name="guardianName" id="guardianName" value={formData.guardianName} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" />
            </div>
             <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Série de Interesse (Obrigatório)</label>
              <input type="text" name="grade" id="grade" value={formData.grade} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" placeholder="Ex: 1º Ano, Infantil III..."/>
            </div>
          </main>
          <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500">
                Cancelar
            </button>
            <button type="submit" disabled={!isFormValid} className="px-4 py-2 bg-teal-600 rounded-lg text-white font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-teal-500">
                Adicionar à Fila de Enturmação
            </button>
          </footer>
        </form>
         <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: scale(0.98); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        `}</style>
      </div>
    </div>
  );
};

export default ExtemporaneousEnrollmentModal;
