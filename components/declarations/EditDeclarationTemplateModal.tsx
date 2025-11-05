import React, { useState, useEffect } from 'react';
import { DeclarationTemplate } from '../../types';

interface EditDeclarationTemplateModalProps {
    template: DeclarationTemplate | null;
    onClose: () => void;
    onSave: (template: DeclarationTemplate) => void;
}

const PLACEHOLDERS = [
    '[NOME_ALUNO]', '[DATA_NASCIMENTO_ALUNO]', '[CPF_ALUNO]', 
    '[NOME_MAE_ALUNO]', '[SERIE_TURMA_ALUNO]', '[TURNO_ALUNO]',
    '[ANO_LETIVO]', '[ANO_LETIVO_CONCLUSAO]', '[DATA_ATUAL]'
];

const EditDeclarationTemplateModal: React.FC<EditDeclarationTemplateModalProps> = ({ template, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        if (template) {
            setName(template.name);
            setContent(template.content);
        }
    }, [template]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: template?.id || Date.now(),
            name,
            content
        });
    };

    const handleCopyPlaceholder = (placeholder: string) => {
        navigator.clipboard.writeText(placeholder);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[60] animate-fade-in" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-3xl flex flex-col h-[80vh]" onClick={e => e.stopPropagation()}>
                <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{template ? 'Editar Modelo' : 'Criar Novo Modelo'}</h2>
                    <button type="button" onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="flex-grow p-4 grid grid-cols-3 gap-4 overflow-hidden">
                    <div className="col-span-2 flex flex-col gap-4">
                        <div>
                            <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Modelo</label>
                            <input
                                id="template-name"
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg"
                            />
                        </div>
                        <div className="flex-grow flex flex-col">
                             <label htmlFor="template-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conteúdo do Modelo</label>
                             <textarea
                                id="template-content"
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                required
                                className="w-full flex-grow bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg resize-none"
                             />
                        </div>
                    </div>
                    <div className="col-span-1 bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 overflow-y-auto">
                        <h3 className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">Variáveis Disponíveis</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Clique para copiar e cole no texto.</p>
                        <div className="space-y-1">
                            {PLACEHOLDERS.map(p => (
                                <button
                                    type="button"
                                    key={p}
                                    onClick={() => handleCopyPlaceholder(p)}
                                    className="w-full text-left p-1.5 bg-white dark:bg-gray-700/50 rounded text-xs font-mono hover:bg-teal-100 dark:hover:bg-teal-900/50"
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </main>
                <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg">Salvar Modelo</button>
                </footer>
            </form>
        </div>
    );
};

export default EditDeclarationTemplateModal;
