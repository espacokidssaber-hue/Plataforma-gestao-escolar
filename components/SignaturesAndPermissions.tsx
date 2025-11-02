import React, { useState, useRef } from 'react';
import { useEnrollment } from '../contexts/EnrollmentContext';

const SignaturesAndPermissions: React.FC = () => {
    const { enrolledStudents, signedContracts, uploadSignedContract } = useEnrollment();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingForStudentId, setUploadingForStudentId] = useState<number | null>(null);

    const studentsWithoutPermission = enrolledStudents.filter(s => s.imageUsagePermission === false);

    const handleUploadClick = (studentId: number) => {
        setUploadingForStudentId(studentId);
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && uploadingForStudentId) {
            if (file.type !== 'application/pdf') {
                alert('Por favor, envie apenas arquivos PDF.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const base64 = loadEvent.target?.result as string;
                uploadSignedContract(uploadingForStudentId, file, base64);
                setUploadingForStudentId(null);
            };
            reader.readAsDataURL(file);
        }
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assinaturas e Permissões</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie contratos assinados e permissões de uso de imagem.</p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contracts Section */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800/30 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Arquivo de Contratos Assinados</h2>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                    <th className="p-3">Aluno</th>
                                    <th className="p-3">Turma</th>
                                    <th className="p-3">Status do Contrato</th>
                                    <th className="p-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrolledStudents.map(student => {
                                    const contract = signedContracts.find(c => c.studentId === student.id);
                                    return (
                                        <tr key={student.id} className="border-b border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                            <td className="p-3">
                                                <div className="flex items-center space-x-3">
                                                    <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full" />
                                                    <span className="font-semibold text-gray-800 dark:text-white">{student.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-gray-600 dark:text-gray-300">{student.className}</td>
                                            <td className="p-3">
                                                {contract ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-green-600 dark:text-green-400 font-semibold">Digitalizado</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(contract.uploadDate).toLocaleDateString()}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-yellow-600 dark:text-yellow-400 font-semibold">Pendente</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-right">
                                                {contract ? (
                                                    <a href={contract.fileUrl} download={contract.fileName} className="px-3 py-1 bg-blue-100 dark:bg-blue-600/50 text-blue-700 dark:text-blue-200 text-sm font-semibold rounded-md hover:bg-blue-200">Baixar</a>
                                                ) : (
                                                    <button onClick={() => handleUploadClick(student.id)} className="px-3 py-1 bg-gray-200 dark:bg-gray-600/50 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-md hover:bg-gray-300">
                                                        Enviar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Permissions Section */}
                <div className="lg:col-span-1 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-lg">
                    <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        Uso de Imagem Não Permitido
                    </h2>
                    {studentsWithoutPermission.length > 0 ? (
                        <ul className="space-y-3">
                           {studentsWithoutPermission.map(student => (
                               <li key={student.id} className="flex items-center space-x-3 bg-white dark:bg-gray-800/30 p-2 rounded-md">
                                   <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full"/>
                                   <div>
                                       <p className="font-semibold text-gray-900 dark:text-white">{student.name}</p>
                                       <p className="text-xs text-gray-500 dark:text-gray-400">{student.className}</p>
                                   </div>
                               </li>
                           ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center h-full text-green-800 dark:text-green-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p>Todos os alunos possuem permissão de uso de imagem.</p>
                        </div>
                    )}
                     <p className="text-xs text-red-700 dark:text-red-300 mt-6">
                        <strong>Atenção:</strong> A lista acima contém todos os alunos que não devem aparecer em fotos ou vídeos de divulgação. Para alterar a permissão, acesse a ficha do aluno na tela "Alunos".
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignaturesAndPermissions;
