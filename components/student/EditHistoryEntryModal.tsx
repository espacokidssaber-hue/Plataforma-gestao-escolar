import React, { useState, useEffect } from 'react';
import { AcademicHistoryEntry } from '../../types';

interface EditHistoryEntryModalProps {
  entry: AcademicHistoryEntry | null;
  isAddingNew: boolean;
  onClose: () => void;
  onSave: (entry: AcademicHistoryEntry) => void;
}

const EditHistoryEntryModal: React.FC<EditHistoryEntryModalProps> = ({ entry, isAddingNew, onClose, onSave }) => {
  const [formData, setFormData] = useState<AcademicHistoryEntry | null>(entry);
  
  // Lista padrão de disciplinas se o registro for novo e não tiver nenhuma
  const defaultSubjects = ['Português', 'Matemática', 'Ciências', 'História', 'Geografia', 'Artes'];
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    setFormData(entry);
  }, [entry]);

  if (!formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  const handleGradeChange = (subject: string, value: string) => {
    setFormData(prev => {
        if (!prev) return null;
        const newGrades = { ...prev.grades, [subject]: Number(value) };
        return { ...prev, grades: newGrades };
    });
  };

  const handleAddNewSubject = () => {
      if (newSubject.trim() && !Object.keys(formData.grades).includes(newSubject.trim())) {
          handleGradeChange(newSubject.trim(), '');
          setNewSubject('');
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
    }
  };

  const subjectList = Object.keys(formData.grades).length > 0 ? Object.keys(formData.grades) : defaultSubjects;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] animate-fade-in" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{isAddingNew ? 'Adicionar Novo Registro' : `Editar Registro Histórico (${formData.year})`}</h2>
        </header>
        <main className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Ano Letivo</label>
              <input type="number" name="year" value={formData.year} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
            </div>
            <div>
              <label className="text-sm">Série</label>
              <input type="text" name="gradeLevel" value={formData.gradeLevel} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm">Nome da Escola</label>
              <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700/50">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Notas por Disciplina</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {subjectList.map(subject => (
                     <div key={subject}>
                        <label className="text-sm">{subject}</label>
                        <input type="number" step="0.1" value={formData.grades[subject] || ''} onChange={e => handleGradeChange(subject, e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                    </div>
                ))}
            </div>
            <div className="flex items-center space-x-2 mt-3">
                 <input type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Outra disciplina..." className="flex-grow bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-sm"/>
                 <button type="button" onClick={handleAddNewSubject} className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 rounded-lg">Adicionar</button>
            </div>
          </div>
        </main>
        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg">Salvar</button>
        </footer>
      </form>
    </div>
  );
};

export default EditHistoryEntryModal;
