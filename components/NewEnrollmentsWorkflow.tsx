import React, { useState, useEffect } from 'react';
import { Applicant, NewEnrollmentStatus, ManualEnrollmentData } from '../types';
import { useEnrollment } from '../contexts/EnrollmentContext';
import EnrollmentValidationModal from './EnrollmentValidationModal';
import ManualEnrollmentModal from './ManualEnrollmentModal';


const StatusBadge: React.FC<{ status: NewEnrollmentStatus }> = ({ status }) => {
    const statusClasses = {
        [NewEnrollmentStatus.PENDING_ANALYSIS]: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300',
        [NewEnrollmentStatus.AWAITING_PAYMENT]: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300',
        [NewEnrollmentStatus.INCORRECT_DOCUMENTATION]: 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300',
        [NewEnrollmentStatus.READY_TO_FINALIZE]: 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300',
        [NewEnrollmentStatus.ENROLLED]: 'bg-gray-200 dark:bg-gray-500/20 text-gray-800 dark:text-gray-300',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`}>
            {status}
        </span>
    );
};


const NewEnrollmentsWorkflow: React.FC = () => {
    const { applicants, updateApplicant, highlightedApplicantId, setHighlightedApplicantId, addManualApplicant } = useEnrollment();
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);

    useEffect(() => {
        if (highlightedApplicantId) {
            const timer = setTimeout(() => {
                setHighlightedApplicantId(null);
            }, 2500); // Match animation duration
            return () => clearTimeout(timer);
        }
    }, [highlightedApplicantId, setHighlightedApplicantId]);


    const handleUpdateApplicant = (updatedApplicant: Applicant) => {
        updateApplicant(updatedApplicant);
        setSelectedApplicant(null);
    };
    
    const handleSaveManual = (data: ManualEnrollmentData) => {
        addManualApplicant(data);
        setIsManualModalOpen(false);
    };

    const activeApplicants = applicants.filter(a => a.status !== NewEnrollmentStatus.ENROLLED);

    return (
        <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Fila de Novas Matrículas</h2>
                <button 
                    onClick={() => setIsManualModalOpen(true)}
                    className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 transition-colors flex items-center space-x-2"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Adicionar Matrícula Manualmente</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                            <th className="p-3">Aluno</th>
                            <th className="p-3">Data de Envio</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeApplicants.map(applicant => (
                            <tr key={applicant.id} className={`border-b border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors duration-200 ${applicant.id === highlightedApplicantId ? 'animate-highlight' : ''}`}>
                                <td className="p-3">
                                    <div className="flex items-center space-x-3">
                                        <img src={applicant.avatar} alt={applicant.name} className="w-10 h-10 rounded-full" />
                                        <span className="font-semibold text-gray-800 dark:text-white">{applicant.name}</span>
                                    </div>
                                </td>
                                <td className="p-3 text-gray-600 dark:text-gray-300">{new Date(applicant.submissionDate).toLocaleDateString('pt-BR')}</td>
                                <td className="p-3"><StatusBadge status={applicant.status} /></td>
                                <td className="p-3 text-right">
                                    <button
                                        onClick={() => setSelectedApplicant(applicant)}
                                        className="px-3 py-1 bg-teal-50 dark:bg-teal-600/50 text-teal-700 dark:text-teal-200 text-sm font-semibold rounded-md hover:bg-teal-100 dark:hover:bg-teal-600 hover:text-teal-800 dark:hover:text-white transition-colors"
                                    >
                                        Verificar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {activeApplicants.length === 0 && (
                     <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        <p>Nenhuma matrícula pendente no momento.</p>
                    </div>
                )}
            </div>
            {selectedApplicant && (
                <EnrollmentValidationModal 
                    applicant={selectedApplicant}
                    onClose={() => setSelectedApplicant(null)}
                    onSave={handleUpdateApplicant}
                />
            )}
            {isManualModalOpen && (
                <ManualEnrollmentModal
                    onClose={() => setIsManualModalOpen(false)}
                    onSave={handleSaveManual}
                />
            )}
            <style>{`
                @keyframes highlight-fade {
                    0% { background-color: rgba(20, 184, 166, 0.3); }
                    100% { background-color: transparent; }
                }
                .animate-highlight {
                    animation: highlight-fade 2.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default NewEnrollmentsWorkflow;