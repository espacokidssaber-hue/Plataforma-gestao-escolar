import React, { useState } from 'react';
import { useEnrollment } from '../contexts/EnrollmentContext';
import UploadContractModal from './contracts/UploadContractModal';

const Widget: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700/50">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
        {children}
    </div>
);

const ImagePermissionDeniedIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.022-7 9.542-7 .847 0 1.669.105 2.458.303M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 2l20 20" />
    </svg>
);


const SignaturesAndContracts: React.FC = () => {
    const { enrolledStudents, signedContracts } = useEnrollment();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const studentsWithoutPermission = enrolledStudents.filter(s => s.imageUsagePermission === false);

    const contractsWithStudentData = signedContracts.map(contract => {
        const student = enrolledStudents.find(s => s.id === contract.studentId);
        return {
            ...contract,
            studentName: student?.name || 'Aluno não encontrado',
            studentAvatar: student?.avatar,
        };
    }).sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

    const handleDownloadAll = () => {
        alert("Funcionalidade em desenvolvimento.\n\nEm uma aplicação real, esta ação iniciaria o download de um arquivo .zip contendo todos os contratos assinados para facilitar o arquivamento local.");
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assinaturas e Contratos</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie contratos assinados e permissões de uso de imagem.</p>
            </header>

            <div className="bg-yellow-50 dark:bg-yellow-900/40 p-6 rounded-xl border-2 border-yellow-400 dark:border-yellow-700 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 bg-yellow-200 dark:bg-yellow-800/50 p-3 rounded-full">
                         <ImagePermissionDeniedIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-300" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-200">
                            Atenção: Alunos Sem Permissão de Imagem ({studentsWithoutPermission.length})
                        </h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                           Verifique esta lista antes de qualquer divulgação ou evento fotográfico.
                        </p>
                    </div>
                </div>
                
                {studentsWithoutPermission.length > 0 ? (
                    <div className="overflow-x-auto bg-white dark:bg-gray-800/50 rounded-lg border border-yellow-300 dark:border-yellow-700/50">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-yellow-300 dark:border-yellow-700/50 text-sm text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/30">
                                    <th className="p-3">Aluno</th>
                                    <th className="p-3">Turma</th>
                                    <th className="p-3">Responsável</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentsWithoutPermission.map(student => (
                                    <tr key={student.id} className="border-b border-yellow-200 dark:border-yellow-800/50 last:border-b-0">
                                        <td className="p-3">
                                            <div className="flex items-center space-x-3">
                                                <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full" />
                                                <span className="font-semibold text-gray-800 dark:text-white">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-gray-600 dark:text-gray-300">{student.className}</td>
                                        <td className="p-3 text-gray-600 dark:text-gray-300">{student.guardians?.[0]?.name || 'Não informado'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                        <p className="font-semibold text-green-700 dark:text-green-300">Ótima notícia! Todos os alunos têm permissão de uso de imagem autorizada.</p>
                    </div>
                )}
            </div>

            <Widget title="Repositório de Contratos Assinados">
                <div className="flex justify-end mb-4 space-x-2">
                    <button 
                        onClick={() => setIsUploadModalOpen(true)}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500"
                    >
                        Enviar Contrato Assinado
                    </button>
                    <button 
                        onClick={handleDownloadAll}
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 disabled:bg-gray-400"
                        disabled={contractsWithStudentData.length === 0}
                    >
                        Baixar Todos (.zip)
                    </button>
                </div>
                {contractsWithStudentData.length > 0 ? (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                    <th className="p-3">Aluno</th>
                                    <th className="p-3">Nome do Arquivo</th>
                                    <th className="p-3">Data de Envio</th>
                                    <th className="p-3 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contractsWithStudentData.map(contract => (
                                     <tr key={contract.studentId} className="border-b border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                        <td className="p-3">
                                            <div className="flex items-center space-x-3">
                                                <img src={contract.studentAvatar} alt={contract.studentName} className="w-10 h-10 rounded-full" />
                                                <span className="font-semibold text-gray-800 dark:text-white">{contract.studentName}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-gray-600 dark:text-gray-300">{contract.fileName}</td>
                                        <td className="p-3 text-gray-600 dark:text-gray-300">{new Date(contract.uploadDate).toLocaleDateString('pt-BR')}</td>
                                        <td className="p-3 text-right">
                                            <a
                                                href={contract.fileUrl}
                                                download={contract.fileName}
                                                className="px-3 py-1 bg-green-100 dark:bg-green-600/50 text-green-700 dark:text-green-200 text-sm font-semibold rounded-md hover:bg-green-200"
                                            >
                                                Baixar Contrato
                                            </a>
                                        </td>
                                     </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                     <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>Nenhum contrato assinado foi encontrado no sistema.</p>
                    </div>
                )}
            </Widget>

            {isUploadModalOpen && (
                <UploadContractModal onClose={() => setIsUploadModalOpen(false)} />
            )}
        </div>
    );
};

export default SignaturesAndContracts;