
import React, { useState, useRef } from 'react';
import { type Lead } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EyeIcon } from './icons/EyeIcon';
import { CloudArrowUpIcon } from './icons/CloudArrowUpIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface StudentDocumentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Lead;
    onUpload: (studentId: string, file: File) => Promise<void>;
    onDelete: (studentId: string, fileName: string) => Promise<void>;
}

export const StudentDocumentsModal: React.FC<StudentDocumentsModalProps> = ({ isOpen, onClose, student, onUpload, onDelete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsSubmitting(true);
        try {
            await onUpload(student.id, file);
            setFile(null);
            if(fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error(error);
            alert("Erro ao enviar arquivo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (fileName: string) => {
        if (window.confirm(`Excluir o arquivo "${fileName}"?`)) {
            await onDelete(student.id, fileName);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Documentos de ${student.studentName}`}>
            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Arquivos Existentes</h3>
                    {student.documents && student.documents.length > 0 ? (
                        <ul className="divide-y divide-gray-200 border rounded-md max-h-60 overflow-y-auto">
                            {student.documents.map((doc, idx) => (
                                <li key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50">
                                    <div className="flex items-center overflow-hidden">
                                        <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                                        <span className="text-sm text-gray-700 truncate" title={doc.name}>{doc.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                            <EyeIcon className="w-4 h-4" />
                                        </a>
                                        <button onClick={() => handleDelete(doc.name)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 italic p-4 text-center border border-dashed rounded-md">Nenhum documento arquivado.</p>
                    )}
                </div>

                <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Adicionar Novo Documento</h3>
                    <div className="flex gap-2 items-center">
                        <div className="flex-grow">
                            <label className="flex flex-col items-center px-4 py-4 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue-50">
                                <CloudArrowUpIcon className="w-6 h-6 text-blue-500" />
                                <span className="mt-1 text-xs leading-normal">{file ? file.name : 'Selecione um arquivo'}</span>
                                <input type='file' className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                            </label>
                        </div>
                        <Button onClick={handleUpload} disabled={!file || isSubmitting}>
                            {isSubmitting ? <SpinnerIcon className="w-4 h-4" /> : 'Enviar'}
                        </Button>
                    </div>
                </div>
                
                <div className="flex justify-end pt-2">
                    <Button variant="secondary" onClick={onClose}>Fechar</Button>
                </div>
            </div>
        </Modal>
    );
};
