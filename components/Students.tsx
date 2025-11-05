import React, { useState, useMemo, useRef } from 'react';
import { useEnrollment } from '../contexts/EnrollmentContext';
import { StudentLifecycleStatus, EnrolledStudent } from '../types';
import RegistrationForm from './student/RegistrationForm';
import * as XLSX from 'xlsx';
import { useAuth } from '../contexts/AuthContext';

const StatusBadge: React.FC<{ status: StudentLifecycleStatus }> = ({ status }) => {
    const statusClasses = {
        [StudentLifecycleStatus.ACTIVE]: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300',
        [StudentLifecycleStatus.INACTIVE]: 'bg-gray-200 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300',
        [StudentLifecycleStatus.TRANSFERRED_OUT]: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
        [StudentLifecycleStatus.CANCELLED]: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`}>
            {status}
        </span>
    );
};

const Students: React.FC = () => {
    const { enrolledStudents, updateEnrolledStudent, classes } = useEnrollment();
    const [searchTerm, setSearchTerm] = useState('');
    const [studentForForm, setStudentForForm] = useState<EnrolledStudent | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [studentToUpdateAvatar, setStudentToUpdateAvatar] = useState<number | null>(null);
    const [selectedClassForDownload, setSelectedClassForDownload] = useState<string>('');
    const [isDownloading, setIsDownloading] = useState(false);

    const filteredStudents = useMemo(() => {
        if (!searchTerm.trim()) {
            return enrolledStudents;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return enrolledStudents.filter(student =>
            student.name.toLowerCase().includes(lowercasedFilter)
        );
    }, [enrolledStudents, searchTerm]);

    const handleAvatarClick = (studentId: number) => {
        setStudentToUpdateAvatar(studentId);
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && studentToUpdateAvatar) {
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione um arquivo de imagem.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const base64Url = loadEvent.target?.result as string;
                
                const student = enrolledStudents.find(s => s.id === studentToUpdateAvatar);
                if (student) {
                    updateEnrolledStudent({ ...student, avatar: base64Url });
                }

                setStudentToUpdateAvatar(null);
            };
            reader.readAsDataURL(file);

            if(e.target) e.target.value = '';
        }
    };
    
    const handleDownloadClassList = () => {
        if (!selectedClassForDownload) return;

        setIsDownloading(true);

        const classId = Number(selectedClassForDownload);
        const selectedClass = classes.find(c => c.id === classId);
        if (!selectedClass) {
            alert("Turma não encontrada.");
            setIsDownloading(false);
            return;
        }

        const studentsInClass = enrolledStudents.filter(student => student.classId === classId);

        if (studentsInClass.length === 0) {
            alert(`Não há alunos matriculados na turma "${selectedClass.name}" para baixar.`);
            setIsDownloading(false);
            return;
        }
        
        // Use a small timeout to let the UI update to "Baixando..."
        setTimeout(() => {
            try {
                const dataToExport = studentsInClass.map((student, index) => ({
                    'Nº': index + 1,
                    'Nome do Aluno': student.name,
                    'Data de Nascimento': student.dateOfBirth ? new Date(student.dateOfBirth + 'T00:00:00').toLocaleDateString('pt-BR') : '',
                    'Nome do Responsável': student.guardians?.[0]?.name || '',
                    'Telefone do Responsável': student.guardians?.[0]?.phone || '',
                }));
        
                const worksheet = XLSX.utils.json_to_sheet(dataToExport);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Alunos');

                // Set column widths for better readability
                worksheet['!cols'] = [
                    { wch: 4 }, // Nº
                    { wch: 40 }, // Nome do Aluno
                    { wch: 18 }, // Data de Nascimento
                    { wch: 40 }, // Nome do Responsável
                    { wch: 20 }, // Telefone do Responsável
                ];
        
                const safeClassName = selectedClass.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                XLSX.writeFile(workbook, `lista_alunos_${safeClassName}.xlsx`);

            } catch (error) {
                console.error("Error exporting to XLSX:", error);
                alert("Ocorreu um erro ao gerar a planilha.");
            } finally {
                setIsDownloading(false);
                setSelectedClassForDownload('');
            }
        }, 100);
    };

    return (
        <div>
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Alunos</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Consulte a lista completa de alunos e acesse suas fichas individuais.</p>
            </header>
            
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
            />

            <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex-shrink-0">Lista de Alunos Matriculados</h2>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                        <input 
                            type="search"
                            placeholder="Buscar aluno por nome..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                        <div className="flex items-center space-x-2">
                            <select
                                value={selectedClassForDownload}
                                onChange={e => setSelectedClassForDownload(e.target.value)}
                                className="flex-grow bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm"
                                aria-label="Selecionar turma para baixar"
                            >
                                <option value="">Baixar lista por turma...</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <button
                                onClick={handleDownloadClassList}
                                disabled={!selectedClassForDownload || isDownloading}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 disabled:bg-gray-400"
                            >
                                {isDownloading ? 'Baixando...' : 'Baixar'}
                            </button>
                        </div>
                    </div>
                </div>

                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                <th className="p-3">Aluno</th>
                                <th className="p-3">Série</th>
                                <th className="p-3">Turma</th>
                                <th className="p-3">Unidade</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => (
                                <tr key={student.id} className="border-b border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                    <td className="p-3">
                                        <div className="flex items-center space-x-3">
                                            <button 
                                                onClick={() => handleAvatarClick(student.id)} 
                                                className="relative group flex-shrink-0"
                                                title="Clique para alterar a foto"
                                            >
                                                <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover group-hover:opacity-60 transition-opacity" />
                                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                    </svg>
                                                </div>
                                            </button>
                                            <span className="font-semibold text-gray-800 dark:text-white">{student.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-gray-600 dark:text-gray-300">{student.grade}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-300">{student.className}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-300">{student.unit}</td>
                                    <td className="p-3"><StatusBadge status={student.status} /></td>
                                    <td className="p-3 text-right">
                                        <button 
                                            onClick={() => setStudentForForm(student)}
                                            className="px-3 py-1 bg-blue-100 dark:bg-blue-600/50 text-blue-700 dark:text-blue-200 text-sm font-semibold rounded-md hover:bg-blue-200 dark:hover:bg-blue-600 hover:text-blue-800 dark:hover:text-white transition-colors">
                                            Ver Ficha
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredStudents.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-10">
                            Nenhum aluno encontrado.
                        </p>
                    )}
                </div>
            </div>

            {studentForForm && (
                <RegistrationForm 
                    student={studentForForm} 
                    onClose={() => setStudentForForm(null)} 
                />
            )}
        </div>
    );
};

export default Students;