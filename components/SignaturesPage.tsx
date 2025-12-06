
import React, { useState, useMemo, useRef } from 'react';
import { type User, type Lead, type SchoolClass, UserRole, LeadStatus } from '../types';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { DocumentArrowUpIcon } from './icons/DocumentArrowUpIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CloudArrowUpIcon } from './icons/CloudArrowUpIcon';

interface SignaturesPageProps {
    user: User;
    students: Lead[];
    classes: SchoolClass[];
    onUploadContract: (studentId: string, file: File) => Promise<void>;
    superAdminSchoolFilter: string;
}

const ContractUploadModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    student: Lead | null;
    onUpload: (studentId: string, file: File) => Promise<void>;
}> = ({ isOpen, onClose, student, onUpload }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!student || !file) return;
        setIsSubmitting(true);
        try {
            await onUpload(student.id, file);
            onClose();
            setFile(null);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!student) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Contrato de ${student.studentName}`}>
            <div className="space-y-4">
                <p className="text-sm text-gray-600">Digitalize o contrato assinado e faça o upload abaixo para arquivar no sistema.</p>
                
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                            <label htmlFor="contract-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500">
                                <span>Selecionar Arquivo</span>
                                <input id="contract-upload" name="contract-upload" type="file" className="sr-only" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500">{file ? file.name : 'PDF, PNG, JPG até 10MB'}</p>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={!file || isSubmitting}>
                        {isSubmitting ? <SpinnerIcon className="w-5 h-5" /> : 'Enviar Contrato'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export const SignaturesPage: React.FC<SignaturesPageProps> = ({ user, students, classes, onUploadContract, superAdminSchoolFilter }) => {
    const [selectedClass, setSelectedClass] = useState('all');
    const [uploadModalState, setUploadModalState] = useState<{ isOpen: boolean; student: Lead | null }>({ isOpen: false, student: null });

    const filteredStudents = useMemo(() => {
        let list = students.filter(s => s.status === LeadStatus.ALLOCATED || s.status === LeadStatus.COMPLETED);
        
        if (user.role === UserRole.SUPER_ADMINISTRADOR && superAdminSchoolFilter !== 'all') {
            list = list.filter(s => s.schoolId === superAdminSchoolFilter);
        } else if (user.schoolId) {
            list = list.filter(s => s.schoolId === user.schoolId);
        }

        if (selectedClass !== 'all') {
            list = list.filter(s => s.className === selectedClass);
        }
        return list;
    }, [students, selectedClass, user, superAdminSchoolFilter]);

    const stats = useMemo(() => {
        const statsByClass: Record<string, { total: number; signed: number; pending: number }> = {};
        
        // Use filteredStudents to respect school filter, but we need to group by ALL classes for the stats dashboard initially or filtered?
        // Let's calculate stats for the visible students based on their actual classes.
        
        filteredStudents.forEach(student => {
            const className = student.className || 'Sem Turma';
            if (!statsByClass[className]) {
                statsByClass[className] = { total: 0, signed: 0, pending: 0 };
            }
            statsByClass[className].total++;
            if (student.contractSigned) {
                statsByClass[className].signed++;
            } else {
                statsByClass[className].pending++;
            }
        });

        return statsByClass;
    }, [filteredStudents]);

    const uniqueClasses = useMemo(() => Object.keys(stats).sort(), [stats]);

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Assinaturas e Contratos</h1>
                <p className="text-gray-600 mt-1">Gerencie a digitalização e o status dos contratos de matrícula.</p>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {uniqueClasses.map(className => {
                    const classStat = stats[className];
                    const percentage = classStat.total > 0 ? Math.round((classStat.signed / classStat.total) * 100) : 0;
                    
                    return (
                        <div key={className} className="bg-white p-5 rounded-lg shadow border border-gray-100">
                            <h3 className="font-bold text-gray-800 text-lg mb-2">{className}</h3>
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <p className="text-2xl font-bold text-teal-600">{classStat.signed}<span className="text-gray-400 text-sm font-normal">/{classStat.total}</span></p>
                                    <p className="text-xs text-gray-500">Contratos Assinados</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-red-500">{classStat.pending}</p>
                                    <p className="text-xs text-gray-500">Pendentes</p>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filter */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                    <label htmlFor="class-filter" className="block text-sm font-medium text-gray-700 mb-1">Filtrar Lista por Turma</label>
                    <select
                        id="class-filter"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border"
                    >
                        <option value="all">Todas as Turmas</option>
                        {uniqueClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <ul className="divide-y divide-gray-200">
                    {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                        <li key={student.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center min-w-0">
                                    <div className="flex-shrink-0">
                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${student.contractSigned ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                            <PencilSquareIcon className={`h-6 w-6 ${student.contractSigned ? 'text-green-600' : 'text-yellow-600'}`} />
                                        </div>
                                    </div>
                                    <div className="ml-4 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{student.studentName}</p>
                                        <p className="text-xs text-gray-500 truncate">Resp: {student.responsibleName}</p>
                                        <p className="text-xs text-gray-500">Turma: {student.className || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {student.contractSigned ? (
                                        <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                                            <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                                            Assinado
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                                            <ExclamationTriangleIcon className="w-4 h-4 mr-1.5" />
                                            Pendente
                                        </div>
                                    )}
                                    
                                    <div className="flex gap-2">
                                        {student.contractUrl ? (
                                            <a href={student.contractUrl} target="_blank" rel="noopener noreferrer">
                                                <Button variant="secondary" className="!text-xs !py-1.5">
                                                    <DocumentTextIcon className="w-4 h-4 mr-1" />
                                                    Ver Contrato
                                                </Button>
                                            </a>
                                        ) : null}
                                        
                                        <Button 
                                            onClick={() => setUploadModalState({ isOpen: true, student })} 
                                            variant={student.contractSigned ? "secondary" : "primary"}
                                            className="!text-xs !py-1.5"
                                        >
                                            <DocumentArrowUpIcon className="w-4 h-4 mr-1" />
                                            {student.contractSigned ? 'Reenviar' : 'Anexar'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </li>
                    )) : (
                        <li className="p-8 text-center text-gray-500">Nenhum aluno encontrado para os filtros selecionados.</li>
                    )}
                </ul>
            </div>

            <ContractUploadModal 
                isOpen={uploadModalState.isOpen}
                onClose={() => setUploadModalState({ isOpen: false, student: null })}
                student={uploadModalState.student}
                onUpload={onUploadContract}
            />
        </div>
    );
};
