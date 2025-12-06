import React, { useState, useRef } from 'react';
import { type Staff } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { DocumentArrowUpIcon } from './icons/DocumentArrowUpIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface StaffDocumentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    staff: Staff;
    onUpdateDocuments: (staffId: string, newCertificateFiles: File[]) => Promise<void>;
}

export const StaffDocumentsModal: React.FC<StaffDocumentsModalProps> = ({ isOpen, onClose, staff, onUpdateDocuments }) => {
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleRemoveNewFile = (fileName: string) => {
        setNewFiles(prev => prev.filter(file => file.name !== fileName));
    };

    const handleSubmit = async () => {
        if (newFiles.length === 0) return;
        setIsSubmitting(true);
        setSuccessMessage('');
        let success = false;
        try {
            await onUpdateDocuments(staff.id, newFiles);
            setSuccessMessage('Documentos salvos com sucesso!');
            setNewFiles([]);
            success = true;
        } catch (error) {
            console.error('Error updating documents:', error);
        } finally {
            setIsSubmitting(false);
            if (success) {
                setTimeout(() => {
                   onClose(); 
                }, 1500);
            }
        }
    };
    
    const DocumentItem: React.FC<{ name: string; url?: string; onRemove?: () => void }> = ({ name, url, onRemove }) => (
        <li className="flex items-center justify-between py-2 pl-3 pr-4 text-sm hover:bg-gray-50">
            <div className="flex w-0 flex-1 items-center">
                <DocumentTextIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                <span className="ml-2 w-0 flex-1 truncate">{name}</span>
            </div>
            <div className="ml-4 flex-shrink-0">
                {url ? (
                     <a href={url} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Ver
                     </a>
                ) : onRemove ? (
                    <button type="button" onClick={onRemove} className="font-medium text-red-600 hover:text-red-500">
                        Remover
                    </button>
                ): null}
            </div>
        </li>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Atestados de ${staff.fullName}`}>
            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-medium text-gray-700">Atestados Existentes</h3>
                    {staff.medicalCertificates && staff.medicalCertificates.length > 0 ? (
                         <ul className="mt-2 divide-y divide-gray-200 rounded-md border max-h-40 overflow-y-auto">
                            {staff.medicalCertificates.map((doc, index) => (
                                <DocumentItem key={index} name={doc.name} url={doc.url} />
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-2 text-sm text-gray-500">Nenhum atestado foi enviado ainda.</p>
                    )}
                </div>

                <div className="border-t pt-4">
                     <h3 className="text-sm font-medium text-gray-700">Anexar Novos Atestados</h3>
                      <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="new-certs-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                    <span>Selecione os arquivos</span>
                                    <input ref={fileInputRef} id="new-certs-upload" name="new-certs-upload" type="file" className="sr-only" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">PDF, JPG, PNG</p>
                        </div>
                    </div>

                    {newFiles.length > 0 && (
                        <div className="mt-4">
                             <ul className="divide-y divide-gray-200 rounded-md border max-h-40 overflow-y-auto">
                                {newFiles.map((file, index) => (
                                    <DocumentItem key={index} name={file.name} onRemove={() => handleRemoveNewFile(file.name)} />
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {successMessage && (
                    <div className="bg-green-100 text-green-800 text-sm p-3 rounded-md">
                        {successMessage}
                    </div>
                )}
            </div>
            <div className="mt-8 flex justify-end space-x-3">
                <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                    Fechar
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting || newFiles.length === 0}>
                    {isSubmitting ? <SpinnerIcon className="w-5 h-5" /> : 'Salvar Novos Atestados'}
                </Button>
            </div>
        </Modal>
    );
};