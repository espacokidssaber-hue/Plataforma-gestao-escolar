
import React, { useState, useEffect } from 'react';
import { type DeclarationTemplate, type User, UserRole, type School } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface DeclarationModelsModalProps {
    isOpen: boolean;
    onClose: () => void;
    templates: DeclarationTemplate[];
    onSave: (templateData: Omit<DeclarationTemplate, 'id' | 'schoolId'> & { schoolId?: string }, templateId?: string) => Promise<void>;
    onDelete: (templateId: string) => Promise<void>;
    user: User;
    schools: School[];
    superAdminSchoolFilter: string;
}

const availableVariables = [
    { variable: '{{aluno.nome}}', description: 'Nome completo do aluno.' },
    { variable: '{{responsavel.nome}}', description: 'Nome do responsável.' },
    { variable: '{{responsavel.cpf}}', description: 'CPF do responsável.' },
    { variable: '{{responsavel.endereco_completo}}', description: 'Endereço completo do responsável.' },
    { variable: '{{turma.nome}}', description: 'Nome da turma do aluno.' },
    { variable: '{{escola.nome}}', description: 'Nome da escola.' },
    { variable: '{{escola.cnpj}}', description: 'CNPJ da escola.' },
    { variable: '{{data.atual.extenso}}', description: 'Data atual por extenso (ex: 25 de julho de 2024).' },
    { variable: '{{valor.anuidade.total}}', description: 'Valor total da anuidade (matrícula + mensalidades).' },
];

export const DeclarationModelsModal: React.FC<DeclarationModelsModalProps> = ({ isOpen, onClose, templates, onSave, onDelete, user, schools, superAdminSchoolFilter }) => {
    const [selectedTemplate, setSelectedTemplate] = useState<DeclarationTemplate | null>(null);
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedSchoolId, setSelectedSchoolId] = useState('');

    useEffect(() => {
        if (!isOpen) {
            handleNewTemplate();
        } else {
            const schoolId = user.role === UserRole.SUPER_ADMINISTRADOR 
                ? (superAdminSchoolFilter !== 'all' ? superAdminSchoolFilter : (schools[0]?.id || ''))
                : user.schoolId || '';
            setSelectedSchoolId(schoolId);
        }
    }, [isOpen]);

    const handleSelectTemplate = (template: DeclarationTemplate) => {
        setSelectedTemplate(template);
        setName(template.name);
        setContent(template.content);
        if(user.role === UserRole.SUPER_ADMINISTRADOR) {
            setSelectedSchoolId(template.schoolId);
        }
    };

    const handleNewTemplate = () => {
        setSelectedTemplate(null);
        setName('');
        setContent('');
    };

    const handleDelete = async () => {
        if (selectedTemplate && window.confirm(`Tem certeza que deseja excluir o modelo "${selectedTemplate.name}"?`)) {
            await onDelete(selectedTemplate.id);
            handleNewTemplate();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        let success = false;
        try {
            const payload: Omit<DeclarationTemplate, 'id' | 'schoolId'> & { schoolId?: string } = { name, content };
            if (user.role === UserRole.SUPER_ADMINISTRADOR) {
                payload.schoolId = selectedSchoolId;
            }
            await onSave(payload, selectedTemplate?.id);
            success = true;
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
            if (success) {
                if(!selectedTemplate) handleNewTemplate();
            }
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Modelos de Declaração">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[60vh]">
                {/* Left: Template List */}
                <div className="md:col-span-1 border-r pr-4">
                    <Button onClick={handleNewTemplate} variant="secondary" className="w-full mb-4 bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100">
                        <PlusIcon className="w-4 h-4 mr-2" /> Novo Modelo
                    </Button>
                    <ul className="space-y-1 overflow-y-auto max-h-[50vh]">
                        {templates.map(t => (
                            <li key={t.id}>
                                <button
                                    onClick={() => handleSelectTemplate(t)}
                                    className={`w-full text-left p-2 rounded-md text-sm ${selectedTemplate?.id === t.id ? 'bg-teal-100 text-teal-800 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    {t.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right: Editor */}
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="text-lg font-semibold">{selectedTemplate ? 'Editando Modelo' : 'Novo Modelo'}</h3>
                        {user.role === UserRole.SUPER_ADMINISTRADOR && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Escola</label>
                                <select value={selectedSchoolId} onChange={e => setSelectedSchoolId(e.target.value)} required disabled={superAdminSchoolFilter !== 'all'} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
                                    <option value="" disabled>Selecione...</option>
                                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div>
                            <label htmlFor="template-name" className="block text-sm font-medium text-gray-700">Nome do Modelo</label>
                            <input id="template-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="template-content" className="block text-sm font-medium text-gray-700">Conteúdo do Modelo</label>
                            <textarea id="template-content" value={content} onChange={e => setContent(e.target.value)} required rows={10} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm font-mono"></textarea>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-md border text-xs text-gray-600">
                           <p className="font-semibold mb-2">Variáveis disponíveis:</p>
                           <ul className="space-y-1">
                               {availableVariables.map(v => (
                                   <li key={v.variable}>
                                       <code className="font-bold text-teal-700">{v.variable}</code> - {v.description}
                                   </li>
                               ))}
                           </ul>
                        </div>
                        
                        <div className="flex justify-between items-center pt-4">
                            <div>
                               {selectedTemplate && (
                                   <Button type="button" variant="secondary" onClick={handleDelete} className="!text-red-600 !border-red-300 hover:!bg-red-50">
                                       <TrashIcon className="w-4 h-4 mr-2" /> Excluir
                                   </Button>
                               )}
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="secondary" onClick={onClose}>Fechar</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <SpinnerIcon className="w-5 h-5"/> : 'Salvar Modelo'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
};
