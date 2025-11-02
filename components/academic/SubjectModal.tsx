import React, { useState, useEffect } from 'react';
import { Subject } from '../../types';

interface SubjectModalProps {
  subjectToEdit?: Subject | null;
  onClose: () => void;
  onSave: (subject: Omit<Subject, 'id' | 'calculationMethod' | 'assessments'> & { id?: number }) => void;
}

const SubjectModal: React.FC<SubjectModalProps> = ({ subjectToEdit, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6'); // Default to blue

  const isEditing = !!subjectToEdit;

  useEffect(() => {
    if (subjectToEdit) {
      setName(subjectToEdit.name);
      setColor(subjectToEdit.color);
    }
  }, [subjectToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({
        id: subjectToEdit?.id,
        name,
        color,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Disciplina' : 'Adicionar Nova Disciplina'}
          </h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        <main className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Disciplina</label>
            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" />
          </div>
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cor de Identificação</label>
            <div className="flex items-center space-x-3">
              <input type="color" id="color" value={color} onChange={e => setColor(e.target.value)} className="w-12 h-12 p-1 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer" />
              <input type="text" value={color} onChange={e => setColor(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 font-mono" />
            </div>
          </div>
        </main>
        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white">Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg">
            {isEditing ? 'Salvar Alterações' : 'Salvar Disciplina'}
          </button>
        </footer>
         <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: scale(0.98); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        `}</style>
      </form>
    </div>
  );
};

export default SubjectModal;
