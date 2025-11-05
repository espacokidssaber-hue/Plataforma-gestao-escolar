import React, { useState } from 'react';
import { useEnrollment } from '../../contexts/EnrollmentContext';
import { DeclarationTemplate } from '../../types';
import EditDeclarationTemplateModal from './EditDeclarationTemplateModal';

interface ManageDeclarationTemplatesModalProps {
    onClose: () => void;
}

const ManageDeclarationTemplatesModal: React.FC<ManageDeclarationTemplatesModalProps> = ({ onClose }) => {
    const { declarationTemplates, updateDeclarationTemplates } = useEnrollment();
    const [templateToEdit, setTemplateToEdit] = useState<DeclarationTemplate | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleAddNew = () => {
        setTemplateToEdit(null);
        setIsEditModalOpen(true);
    };

    const handleEdit = (template: DeclarationTemplate) => {
        setTemplateToEdit(template);
        setIsEditModalOpen(true);
    };

    const handleDelete = (templateId: number) => {
        if (window.confirm('Tem certeza que deseja excluir este modelo? Esta ação não pode ser desfeita.')) {
            const updated = declarationTemplates.filter(t => t.id !== templateId);
            updateDeclarationTemplates(updated);
        }
    };

    const handleSaveTemplate = (templateData: DeclarationTemplate) => {
        let updated;
        if (declarationTemplates.some(t => t.id === templateData.id)) {
            // Update existing
            updated = declarationTemplates.map(t => t.id === templateData.id ? templateData : t);
        } else {
            // Add new
            updated = [...declarationTemplates, { ...templateData, id: Date.now() }];
        }
        updateDeclarationTemplates(updated);
        setIsEditModalOpen(false);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-2xl flex flex-col h-[70vh]" onClick={e => e.stopPropagation()}>
                    <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerenciar Modelos de Declaração</h2>
                        <button type="button" onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </header>
                    <main className="flex-grow p-4 space-y-2 overflow-y-auto">
                        {declarationTemplates.map(template => (
                            <div key={template.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{template.name}</span>
                                <div className="space-x-2">
                                    <button onClick={() => handleEdit(template)} className="px-3 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-600/50 text-blue-700 dark:text-blue-200 rounded-md">Editar</button>
                                    <button onClick={() => handleDelete(template.id)} className="px-3 py-1 text-xs font-semibold bg-red-100 dark:bg-red-600/50 text-red-700 dark:text-red-200 rounded-md">Excluir</button>
                                </div>
                            </div>
                        ))}
                    </main>
                    <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                        <button onClick={handleAddNew} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg">
                            + Adicionar Novo Modelo
                        </button>
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">
                            Fechar
                        </button>
                    </footer>
                </div>
            </div>
            {isEditModalOpen && (
                <EditDeclarationTemplateModal 
                    template={templateToEdit} 
                    onClose={() => setIsEditModalOpen(false)} 
                    onSave={handleSaveTemplate} 
                />
            )}
            <style>{`.animate-fade-in { animation: fade-in 0.2s ease-out forwards; }`}</style>
        </>
    );
};

export default ManageDeclarationTemplatesModal;
