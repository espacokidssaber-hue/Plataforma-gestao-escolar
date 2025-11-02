import React, { useState, useEffect } from 'react';
import { Educator, ScheduleItem } from '../../types';

interface ScheduleItemModalProps {
  onClose: () => void;
  onSave: (data: { subject: string, educatorId: number }) => void;
  onDelete: () => void;
  cellInfo: { day: string, time: string, item?: ScheduleItem };
  educators: Educator[];
}

const ScheduleItemModal: React.FC<ScheduleItemModalProps> = ({ onClose, onSave, onDelete, cellInfo, educators }) => {
  const [subject, setSubject] = useState(cellInfo.item?.subject || '');
  const [educatorId, setEducatorId] = useState<string>(cellInfo.item?.educatorId.toString() || '');

  const isEditing = !!cellInfo.item;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim() && educatorId) {
      onSave({ subject, educatorId: Number(educatorId) });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Editar Aula' : 'Adicionar Aula'}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{cellInfo.day} às {cellInfo.time}</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </header>
        <main className="p-6 space-y-4">
            <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Disciplina</label>
                <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    required
                    placeholder="Ex: Matemática"
                    className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                />
            </div>
             <div>
                <label htmlFor="educator" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Educadora</label>
                <select
                    id="educator"
                    value={educatorId}
                    onChange={e => setEducatorId(e.target.value)}
                    required
                    className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                >
                    <option value="">Selecione...</option>
                    {educators.map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                </select>
            </div>
        </main>
        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
                {isEditing && (
                    <button type="button" onClick={onDelete} className="px-4 py-2 bg-red-100 dark:bg-red-600/50 text-red-700 dark:text-red-200 text-sm font-semibold rounded-md hover:bg-red-200 dark:hover:bg-red-600 hover:text-red-800 dark:hover:text-white">
                        Remover Aula
                    </button>
                )}
            </div>
            <div className="space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg">Salvar</button>
            </div>
        </footer>
        <style>{`
            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in { animation: fade-in 0.2s ease-out; }
        `}</style>
      </form>
    </div>
  );
};

export default ScheduleItemModal;