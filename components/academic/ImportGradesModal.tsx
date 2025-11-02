import React, { useState } from 'react';
import { StudentAcademicRecord } from '../../types';

interface ImportGradesModalProps {
    students: StudentAcademicRecord[];
    onClose: () => void;
    onImport: (studentId: number, file: File) => void;
    isImporting: boolean;
}

const ImportGradesModal: React.FC<ImportGradesModalProps> = ({ students, onClose, onImport, isImporting }) => {
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStudentId && file) {
            onImport(Number(selectedStudentId), file);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Importar Notas de Boletim (PDF)</h2>
                     <button type="button" onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="p-6 space-y-4">
                    <div>
                        <label htmlFor="student-select-import" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">1. Selecione o Aluno</label>
                        <select id="student-select-import" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} required className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-gray-300 dark:border-gray-600">
                            <option value="">-- Selecione um aluno --</option>
                            {students.map(s => <option key={s.studentId} value={s.studentId}>{s.studentName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="pdf-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">2. Selecione o Arquivo PDF</label>
                        <input type="file" id="pdf-upload" accept=".pdf" required onChange={e => setFile(e.target.files?.[0] || null)} className="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-200 dark:file:bg-gray-700 file:text-teal-700 dark:file:text-teal-200 hover:file:bg-gray-300" />
                    </div>
                </main>
                <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
                     <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white">Cancelar</button>
                    <button type="submit" disabled={isImporting || !file || !selectedStudentId} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg disabled:bg-gray-400 w-32">
                        {isImporting ? 'Processando...' : 'Importar'}
                    </button>
                </footer>
            </form>
        </div>
    );
};
export default ImportGradesModal;
