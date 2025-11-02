import React, { useState, useRef } from 'react';
import { useEnrollment } from '../../contexts/EnrollmentContext';

interface UploadActivityModalProps {
  onClose: () => void;
}

const UploadActivityModal: React.FC<UploadActivityModalProps> = ({ onClose }) => {
    const { classes, addUploadedActivity } = useEnrollment();
    const [classId, setClassId] = useState('');
    const [title, setTitle] = useState('');
    const [educatorName, setEducatorName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                setFileUrl(loadEvent.target?.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            alert('Por favor, selecione um arquivo PDF.');
            setFile(null);
            setFileUrl('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (classId && title && educatorName && file && fileUrl) {
            setIsUploading(true);
            setTimeout(() => { // Simulate upload delay
                addUploadedActivity({
                    title,
                    educatorName,
                    fileUrl,
                    fileName: file.name
                }, Number(classId));
                setIsUploading(false);
                onClose();
            }, 1000);
        }
    };

    const isFormValid = classId && title && educatorName && file;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Enviar Atividade para Impressão</h2>
                    <button type="button" onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="p-6 space-y-4">
                    <div>
                        <label htmlFor="classId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Turma *</label>
                        <select id="classId" value={classId} onChange={e => setClassId(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                            <option value="">Selecione a turma...</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título da Atividade *</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ex: Exercícios de Fixação - Matemática" className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" />
                    </div>
                    <div>
                        <label htmlFor="educatorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Educadora *</label>
                        <input type="text" id="educatorName" value={educatorName} onChange={e => setEducatorName(e.target.value)} required placeholder="Ex: Prof. Ana Silva" className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Arquivo (PDF) *</label>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
                        <div 
                            onClick={() => fileInputRef.current?.click()} 
                            className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-teal-500 hover:text-teal-400 transition-colors flex flex-col items-center justify-center text-center cursor-pointer"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                            <span className="text-sm">{file ? file.name : 'Clique para selecionar o arquivo PDF'}</span>
                        </div>
                    </div>
                </main>
                <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500">
                        Cancelar
                    </button>
                    <button type="submit" disabled={!isFormValid || isUploading} className="px-4 py-2 w-28 bg-teal-600 rounded-lg text-white font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-teal-500">
                        {isUploading ? (
                            <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Enviar'}
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

export default UploadActivityModal;