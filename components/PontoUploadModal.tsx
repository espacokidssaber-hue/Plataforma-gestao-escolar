import React, { useState, useRef } from 'react';
import { type Staff } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { CloudArrowUpIcon } from './icons/CloudArrowUpIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface PontoUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (staffId: string, year: number, month: number, file: File) => Promise<void>;
    staffMember: Staff;
    year: number;
    month: number;
    monthName: string;
}

export const PontoUploadModal: React.FC<PontoUploadModalProps> = ({ isOpen, onClose, onUpload, staffMember, year, month, monthName }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== 'application/pdf' && !selectedFile.type.startsWith('image/')) {
                setError('Apenas arquivos PDF ou imagens são permitidos.');
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            setError('');
            setFile(selectedFile);
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            setError('Nenhum arquivo selecionado.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            await onUpload(staffMember.id, year, month, file);
            onClose();
        } catch (err) {
            setError('Ocorreu um erro ao enviar o arquivo.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Anexar Ponto de ${monthName}/${year}`}>
            <div className="space-y-4">
                <p className="text-sm text-gray-600">
                    Você está enviando o espelho de ponto para <span className="font-bold">{staffMember.fullName}</span>.
                </p>
                <div>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="ponto-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500">
                                    <span>Selecione o arquivo</span>
                                    <input ref={fileInputRef} id="ponto-file-upload" type="file" className="sr-only" accept=".pdf,image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">{file ? file.name : 'PDF ou Imagem'}</p>
                        </div>
                    </div>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="button" onClick={handleSubmit} disabled={isSubmitting || !file}>
                        {isSubmitting ? <SpinnerIcon className="w-5 h-5" /> : 'Confirmar Envio'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};