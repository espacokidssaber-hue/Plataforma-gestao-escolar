import React, { useState } from 'react';
import { Subject } from '../../types';
import SubjectModal from './SubjectModal';
import SubjectConfigModal from './SubjectConfigModal';
import { useEnrollment } from '../../contexts/EnrollmentContext';

const Subjects: React.FC = () => {
    // Subjects are now managed globally in EnrollmentContext, but for this component,
    // we manage a local copy to demonstrate adding/editing.
    // In a real app with a backend, you'd fetch and update from the context/API.
    const { subjects: initialSubjects } = useEnrollment();
    const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);

    const handleOpenModal = (subject: Subject | null = null) => {
        setSubjectToEdit(subject);
        setIsModalOpen(true);
    };

    const handleOpenConfigModal = (subject: Subject) => {
        setSubjectToEdit(subject);
        setIsConfigModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsConfigModalOpen(false);
        setSubjectToEdit(null);
    };

    const handleSaveSubject = (data: Omit<Subject, 'id' | 'calculationMethod' | 'assessments'> & { id?: number }) => {
        if (data.id) { // Update existing
            setSubjects(prev => prev.map(s => s.id === data.id ? { ...s, ...data } : s));
        } else { // Add new
            const newSubject: Subject = {
                ...data,
                id: Date.now(),
                calculationMethod: 'arithmetic',
                assessments: [],
            };
            setSubjects(prev => [newSubject, ...prev]);
        }
        handleCloseModals();
    };
    
    const handleSaveConfig = (updatedSubject: Subject) => {
        setSubjects(prev => prev.map(s => s.id === updatedSubject.id ? updatedSubject : s));
        handleCloseModals();
    };

    const handleDeleteSubject = (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta disciplina?')) {
            setSubjects(prev => prev.filter(s => s.id !== id));
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cadastro de Disciplinas</h2>
                <button 
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 transition-colors flex items-center space-x-2"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Nova Disciplina</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                            <th className="p-3">Disciplina</th>
                             <th className="p-3">Método de Cálculo</th>
                            <th className="p-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map(subject => (
                            <tr key={subject.id} className="border-b border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                <td className="p-3">
                                    <div className="flex items-center space-x-3">
                                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }}></span>
                                        <span className="font-semibold text-gray-800 dark:text-white">{subject.name}</span>
                                    </div>
                                </td>
                                <td className="p-3 text-gray-600 dark:text-gray-300 capitalize">
                                    {subject.calculationMethod === 'weighted' ? 'Média Ponderada' : 'Média Aritmética'}
                                </td>
                                <td className="p-3 text-right space-x-2">
                                     <button
                                        onClick={() => handleOpenConfigModal(subject)}
                                        className="px-3 py-1 bg-green-100 dark:bg-green-600/50 text-green-700 dark:text-green-200 text-sm font-semibold rounded-md hover:bg-green-200 dark:hover:bg-green-600"
                                    >
                                        Configurar Avaliações
                                    </button>
                                    <button
                                        onClick={() => handleOpenModal(subject)}
                                        className="px-3 py-1 bg-blue-100 dark:bg-blue-600/50 text-blue-700 dark:text-blue-200 text-sm font-semibold rounded-md hover:bg-blue-200 dark:hover:bg-blue-600"
                                    >
                                        Editar
                                    </button>
                                     <button
                                        onClick={() => handleDeleteSubject(subject.id)}
                                        className="px-3 py-1 bg-red-100 dark:bg-red-600/50 text-red-700 dark:text-red-200 text-sm font-semibold rounded-md hover:bg-red-200 dark:hover:bg-red-600"
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {subjects.length === 0 && (
                     <p className="text-center text-gray-500 dark:text-gray-400 py-10">Nenhuma disciplina cadastrada.</p>
                 )}
            </div>
            {isModalOpen && <SubjectModal subjectToEdit={subjectToEdit} onClose={handleCloseModals} onSave={handleSaveSubject} />}
            {isConfigModalOpen && subjectToEdit && <SubjectConfigModal subject={subjectToEdit} onClose={handleCloseModals} onSave={handleSaveConfig} />}
        </div>
    );
};

export default Subjects;