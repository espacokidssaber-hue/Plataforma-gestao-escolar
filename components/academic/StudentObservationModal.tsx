import React, { useState } from 'react';
import { StudentAcademicRecord } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface StudentObservationModalProps {
    student: StudentAcademicRecord;
    onClose: () => void;
    onSave: (studentId: number, newObservations: StudentAcademicRecord['observations']) => void;
}

const StudentObservationModal: React.FC<StudentObservationModalProps> = ({ student, onClose, onSave }) => {
    const [newObservation, setNewObservation] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { user } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newObservation.trim() || !user) return;
        
        setIsSaving(true);
        const observationEntry = {
            date: new Date().toISOString(),
            author: user.username,
            text: newObservation.trim(),
        };
        
        const updatedObservations = [...(student.observations || []), observationEntry];
        
        // Simulate save
        setTimeout(() => {
            onSave(student.studentId, updatedObservations);
            setIsSaving(false);
            setNewObservation('');
        }, 300);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl flex flex-col h-[70vh]" onClick={e => e.stopPropagation()}>
                <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Observações Pedagógicas</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{student.studentName}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <main className="flex-grow p-4 space-y-4 overflow-y-auto">
                    {student.observations && student.observations.length > 0 ? (
                        student.observations.map((obs, index) => (
                            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Em {new Date(obs.date).toLocaleDateString('pt-BR')} por <span className="font-semibold">{obs.author}</span>
                                </p>
                                <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{obs.text}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhuma observação registrada para este aluno.</p>
                    )}
                </main>
                
                <form onSubmit={handleSubmit} className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <label htmlFor="new-observation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adicionar Nova Observação</label>
                    <textarea
                        id="new-observation"
                        rows={3}
                        value={newObservation}
                        onChange={e => setNewObservation(e.target.value)}
                        required
                        className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-sm"
                    />
                    <div className="flex justify-end">
                         <button type="submit" disabled={isSaving || !newObservation.trim()} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg w-28">
                            {isSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>

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

export default StudentObservationModal;