
import React, { useState, useMemo } from 'react';
import { type Lead, LeadStatus } from '../types';
import { Button } from './ui/Button';
import { FolderOpenIcon } from './icons/FolderOpenIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { StudentDocumentsModal } from './StudentDocumentsModal';
import { DocumentTextIcon } from './icons/DocumentTextIcon';

interface ArquivosAtivoPageProps {
    students: Lead[];
    onUploadDocument: (studentId: string, file: File) => Promise<void>;
    onDeleteDocument: (studentId: string, fileName: string) => Promise<void>;
}

export const ArquivosAtivoPage: React.FC<ArquivosAtivoPageProps> = ({ students, onUploadDocument, onDeleteDocument }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Lead | null>(null);

    const activeStudents = useMemo(() => {
        // Filter for students who are either allocated to a class or have completed enrollment
        const allocated = students.filter(s => s.status === LeadStatus.ALLOCATED || s.status === LeadStatus.COMPLETED);
        
        if (!searchTerm) return allocated;
        
        const lowerSearch = searchTerm.toLowerCase();
        return allocated.filter(s => 
            s.studentName.toLowerCase().includes(lowerSearch) || 
            (s.className && s.className.toLowerCase().includes(lowerSearch))
        );
    }, [students, searchTerm]);

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <FolderOpenIcon className="w-8 h-8 mr-2 text-teal-600" />
                        Arquivo Ativo
                    </h1>
                    <p className="text-gray-600 mt-1">Gerenciamento de documentação digital dos alunos ativos.</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-6 flex items-center gap-4">
                <div className="relative flex-grow max-w-md">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border-gray-300 pl-10 focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border"
                        placeholder="Buscar aluno por nome ou turma..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turma</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documentos</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {activeStudents.map(student => (
                            <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                                    <div className="text-xs text-gray-500">{student.responsibleName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {student.className || <span className="text-gray-400 italic">Não alocado</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {student.documents?.length || 0} arquivos
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Button onClick={() => setSelectedStudent(student)} variant="secondary" className="!p-2">
                                        <DocumentTextIcon className="w-4 h-4 mr-2" />
                                        Gerenciar Arquivos
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {activeStudents.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                                    Nenhum aluno encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedStudent && (
                <StudentDocumentsModal
                    isOpen={!!selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                    student={selectedStudent}
                    onUpload={onUploadDocument}
                    onDelete={onDeleteDocument}
                />
            )}
        </div>
    );
};
