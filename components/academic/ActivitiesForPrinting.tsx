import React, { useState } from 'react';
import { useEnrollment } from '../../contexts/EnrollmentContext';
import UploadActivityModal from './UploadActivityModal';

const ActivitiesForPrinting: React.FC = () => {
    const { classes, uploadedActivities } = useEnrollment();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6">
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Repositório de Atividades para Impressão</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie e baixe as atividades enviadas pelas educadoras, organizadas por turma.</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 transition-colors flex items-center space-x-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Enviar Atividade</span>
                    </button>
                </header>

                <div className="space-y-4">
                    {classes.map(c => {
                        const activitiesForClass = uploadedActivities[c.id] || [];
                        return (
                            <details key={c.id} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700/50 open:ring-2 open:ring-teal-500/50 open:shadow-lg transition-all" open={activitiesForClass.length > 0}>
                                <summary className="px-4 py-3 font-semibold text-gray-800 dark:text-white cursor-pointer flex justify-between items-center">
                                    <span>{c.name} - {c.grade} ({c.period})</span>
                                    <span className="text-sm px-2 py-1 bg-teal-100 dark:bg-teal-800/50 text-teal-700 dark:text-teal-200 rounded-full">{activitiesForClass.length}</span>
                                </summary>
                                <div className="border-t border-gray-200 dark:border-gray-700/50 p-4">
                                    {activitiesForClass.length > 0 ? (
                                        <ul className="space-y-3">
                                            {activitiesForClass.map(activity => (
                                                <li key={activity.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800/60 rounded-md">
                                                    <div className="flex items-center space-x-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 dark:text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 dark:text-white">{activity.title}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Enviado por {activity.educatorName} em {new Date(activity.uploadDate).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                        </div>
                                                    </div>
                                                    <a 
                                                        href={activity.fileUrl} 
                                                        download={activity.fileName}
                                                        className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-600/50 dark:text-blue-200 text-sm font-semibold rounded-md hover:bg-blue-200"
                                                    >
                                                        Baixar/Imprimir
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-center text-gray-500 dark:text-gray-400">Nenhuma atividade enviada para esta turma.</p>
                                    )}
                                </div>
                            </details>
                        )
                    })}
                </div>
            </div>

            {isModalOpen && <UploadActivityModal onClose={() => setIsModalOpen(false)} />}
        </>
    );
};

export default ActivitiesForPrinting;