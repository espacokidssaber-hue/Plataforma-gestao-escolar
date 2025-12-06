import React, { useState, useMemo, useEffect } from 'react';
import { type User, type Lead, type SchoolClass, type AttendanceRecord, UserRole, School, type Staff } from '../types';
import { Button } from './ui/Button';
import { HandRaisedIcon } from './icons/HandRaisedIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { PrinterIcon } from './icons/PrinterIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface AttendancePageProps {
    user: User;
    students: Lead[];
    classes: SchoolClass[];
    schools: School[];
    attendanceRecords: AttendanceRecord[];
    onSaveAttendanceBatch: (records: Omit<AttendanceRecord, 'id'>[]) => Promise<void>;
    superAdminSchoolFilter: string;
    onPrintAttendanceReport: (data: any) => void;
    selectedYear: number;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({ 
    user, 
    students, 
    classes, 
    schools, 
    attendanceRecords, 
    onSaveAttendanceBatch, 
    superAdminSchoolFilter,
    onPrintAttendanceReport,
    selectedYear
}) => {
    const [activeTab, setActiveTab] = useState<'register' | 'report'>('register');
    
    // Register State
    const [selectedSchoolId, setSelectedSchoolId] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, 'present' | 'absent' | 'justified'>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // Report State
    const [reportStudentId, setReportStudentId] = useState('');
    const [reportStartDate, setReportStartDate] = useState('');
    const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Initial Setup
    useEffect(() => {
        if (user.role === UserRole.SUPER_ADMINISTRADOR) {
            setSelectedSchoolId(superAdminSchoolFilter !== 'all' ? superAdminSchoolFilter : schools[0]?.id || '');
        } else {
            setSelectedSchoolId(user.schoolId || '');
        }
        
        // Set default report start date to beginning of current month
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        setReportStartDate(firstDay.toISOString().split('T')[0]);

    }, [user, schools, superAdminSchoolFilter]);

    const availableClasses = useMemo(() => classes.filter(c => c.schoolId === selectedSchoolId), [classes, selectedSchoolId]);
    
    const studentsInClass = useMemo(() => {
        if (!selectedClass) return [];
        return students
            .filter(s => s.schoolId === selectedSchoolId && s.className === selectedClass && s.status === 'Alocado em Turma')
            .sort((a, b) => a.studentName.localeCompare(b.studentName));
    }, [students, selectedSchoolId, selectedClass]);

    // Load existing attendance when date or class changes
    useEffect(() => {
        if (selectedDate && selectedClass && studentsInClass.length > 0) {
            const newMap: Record<string, 'present' | 'absent' | 'justified'> = {};
            
            // Default all to present first
            studentsInClass.forEach(s => {
                newMap[s.id] = 'present';
            });

            // Override with existing records
            const recordsForDate = attendanceRecords.filter(r => r.date === selectedDate && r.className === selectedClass);
            recordsForDate.forEach(r => {
                newMap[r.studentId] = r.status;
            });

            setAttendanceMap(newMap);
        }
    }, [selectedDate, selectedClass, studentsInClass, attendanceRecords]);

    const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'justified') => {
        setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage('');
        try {
            const recordsToSave: Omit<AttendanceRecord, 'id'>[] = studentsInClass.map(student => ({
                studentId: student.id,
                schoolId: selectedSchoolId,
                className: selectedClass,
                date: selectedDate,
                status: attendanceMap[student.id] || 'present',
                schoolYear: selectedYear
            }));

            await onSaveAttendanceBatch(recordsToSave);
            setSaveMessage('Chamada salva com sucesso!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar chamada. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };

    // Report Logic
    const handleGenerateReport = () => {
        const student = students.find(s => s.id === reportStudentId);
        if (!student) return;

        const recordsInRange = attendanceRecords.filter(r => 
            r.studentId === student.id && 
            r.date >= reportStartDate && 
            r.date <= reportEndDate
        );

        const totalDays = recordsInRange.length;
        const presentDays = recordsInRange.filter(r => r.status === 'present').length;
        const absentDays = recordsInRange.filter(r => r.status !== 'present').length;
        const justifiedDays = recordsInRange.filter(r => r.status === 'justified').length;
        
        // Avoid division by zero
        const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 100;

        const school = schools.find(s => s.id === student.schoolId);
        const classInfo = classes.find(c => c.name === student.className && c.schoolId === student.schoolId);

        onPrintAttendanceReport({
            student,
            school,
            classInfo,
            startDate: reportStartDate,
            endDate: reportEndDate,
            stats: {
                totalDays,
                presentDays,
                absentDays,
                justifiedDays,
                percentage
            },
            records: recordsInRange
        });
    };

    const inputClass = "block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border";

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Frequência Escolar</h1>
                <p className="text-gray-600 mt-1">Registre a chamada diária e emita relatórios de presença.</p>
            </div>

            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('register')}
                        className={`${activeTab === 'register' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <HandRaisedIcon className="w-5 h-5 mr-2" />
                        Realizar Chamada
                    </button>
                    <button
                        onClick={() => setActiveTab('report')}
                        className={`${activeTab === 'report' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <PrinterIcon className="w-5 h-5 mr-2" />
                        Relatórios e Declarações
                    </button>
                </nav>
            </div>

            {activeTab === 'register' && (
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {user.role === UserRole.SUPER_ADMINISTRADOR && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Escola</label>
                                <select value={selectedSchoolId} onChange={e => setSelectedSchoolId(e.target.value)} className={inputClass}>
                                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
                            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className={inputClass}>
                                <option value="">Selecione...</option>
                                {availableClasses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {selectedClass ? (
                        <>
                            <div className="overflow-x-auto mb-6">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Situação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {studentsInClass.map(student => (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {student.studentName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex justify-center space-x-4">
                                                        <label className={`inline-flex items-center cursor-pointer px-3 py-1 rounded-full border transition-colors ${attendanceMap[student.id] === 'present' ? 'bg-green-100 border-green-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                                            <input type="radio" name={`status-${student.id}`} value="present" checked={attendanceMap[student.id] === 'present'} onChange={() => handleStatusChange(student.id, 'present')} className="form-radio h-4 w-4 text-green-600" />
                                                            <span className="ml-2 text-sm text-gray-700">Presente</span>
                                                        </label>
                                                        <label className={`inline-flex items-center cursor-pointer px-3 py-1 rounded-full border transition-colors ${attendanceMap[student.id] === 'absent' ? 'bg-red-100 border-red-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                                            <input type="radio" name={`status-${student.id}`} value="absent" checked={attendanceMap[student.id] === 'absent'} onChange={() => handleStatusChange(student.id, 'absent')} className="form-radio h-4 w-4 text-red-600" />
                                                            <span className="ml-2 text-sm text-gray-700">Falta</span>
                                                        </label>
                                                        <label className={`inline-flex items-center cursor-pointer px-3 py-1 rounded-full border transition-colors ${attendanceMap[student.id] === 'justified' ? 'bg-yellow-100 border-yellow-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                                            <input type="radio" name={`status-${student.id}`} value="justified" checked={attendanceMap[student.id] === 'justified'} onChange={() => handleStatusChange(student.id, 'justified')} className="form-radio h-4 w-4 text-yellow-600" />
                                                            <span className="ml-2 text-sm text-gray-700">Justificada</span>
                                                        </label>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {studentsInClass.length === 0 && <p className="text-center text-gray-500 py-8">Nenhum aluno encontrado nesta turma.</p>}
                            </div>
                            
                            <div className="flex items-center justify-end gap-4">
                                {saveMessage && <span className="text-green-600 text-sm font-medium flex items-center"><CheckCircleIcon className="w-4 h-4 mr-1"/>{saveMessage}</span>}
                                <Button onClick={handleSave} disabled={isSaving || studentsInClass.length === 0}>
                                    {isSaving ? <SpinnerIcon className="w-5 h-5 mr-2" /> : null}
                                    {isSaving ? 'Salvando...' : 'Salvar Chamada'}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <HandRaisedIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Selecione uma turma</h3>
                            <p className="mt-1 text-sm text-gray-500">Escolha uma turma acima para iniciar a chamada.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'report' && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Gerar Documento de Frequência</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Aluno(a)</label>
                            <select value={reportStudentId} onChange={e => setReportStudentId(e.target.value)} className={inputClass}>
                                <option value="">Selecione o aluno...</option>
                                {students.filter(s => s.status === 'Alocado em Turma').sort((a,b) => a.studentName.localeCompare(b.studentName)).map(s => (
                                    <option key={s.id} value={s.id}>{s.studentName} ({s.className})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                            <input type="date" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                            <input type="date" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)} className={inputClass} />
                        </div>
                    </div>
                    
                    <div className="flex justify-end">
                        <Button onClick={handleGenerateReport} disabled={!reportStudentId || !reportStartDate || !reportEndDate} variant="secondary">
                            <PrinterIcon className="w-5 h-5 mr-2" />
                            Imprimir Declaração
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};