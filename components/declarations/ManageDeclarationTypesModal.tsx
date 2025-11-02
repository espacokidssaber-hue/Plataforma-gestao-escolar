import React, { useState } from 'react';
import { DeclarationTemplate } from '../../types';

interface ManageDeclarationTypesModalProps {
  templates: DeclarationTemplate[];
  onClose: () => void;
  onSave: (newTemplates: DeclarationTemplate[]) => void;
}

const ManageDeclarationTypesModal: React.FC<ManageDeclarationTypesModalProps> = ({ templates, onClose, onSave }) => {
  const [currentTemplates, setCurrentTemplates] = useState<DeclarationTemplate[]>(templates);
  const [newTemplateName, setNewTemplateName] = useState('');

  const handleAddTemplate = () => {
    if (newTemplateName.trim() && !currentTemplates.some(t => t.name.toLowerCase() === newTemplateName.trim().toLowerCase())) {
      const newTemplate: DeclarationTemplate = {
        id: Date.now(),
        name: newTemplateName.trim(),
      };
      setCurrentTemplates(prev => [...prev, newTemplate]);
      setNewTemplateName('');
    }
  };

  const handleRemoveTemplate = (id: number) => {
    setCurrentTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveChanges = () => {
    onSave(currentTemplates);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerenciar Tipos de Declaração</h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        <main className="p-6 space-y-4 max-h-96 overflow-y-auto">
          {currentTemplates.map(template => (
            <div key={template.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-800 dark:text-gray-200">{template.name}</span>
              <button onClick={() => handleRemoveTemplate(template.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-semibold">
                Remover
              </button>
            </div>
          ))}
          {currentTemplates.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400">Nenhum tipo cadastrado.</p>}
        </main>
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={newTemplateName}
                    onChange={e => setNewTemplateName(e.target.value)}
                    placeholder="Nome do novo tipo de declaração..."
                    className="flex-grow bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                />
                <button onClick={handleAddTemplate} className="px-3 py-2 bg-blue-100 text-blue-700 dark:bg-blue-600/50 dark:text-blue-200 text-sm font-semibold rounded-md hover:bg-blue-200 dark:hover:bg-blue-600">
                    Adicionar
                </button>
            </div>
        </div>
        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white">Cancelar</button>
          <button onClick={handleSaveChanges} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg">Salvar Alterações</button>
        </footer>
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

export default ManageDeclarationTypesModal;