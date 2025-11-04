import React, { useState, useMemo, useEffect, useRef } from 'react';
import { StudentAcademicRecord, Grade, AttendanceStatus, SchoolInfo, Subject, PrintDiaryConfig } from '../../types';
import GenerateDiaryModal from './GenerateDiaryModal';
import DiaryViewerModal from './DiaryViewerModal';
import AnnualStudentGradesModal from './AnnualStudentGradesModal';
import AttendanceReportModal from './AttendanceReportModal';
import PrintableMonthlyAttendance from './PrintableMonthlyAttendance';
import { MOCK_CALENDAR_EVENTS } from '../../data/calendarData';
// FIX: Corrected import path for EnrollmentContext
import { useEnrollment } from '../../contexts/EnrollmentContext';
// FIX: Corrected import path for EnrollmentContext
import { useSchoolInfo } from '../../contexts/EnrollmentContext';
import { extractGradesFromPdf, ExtractedGrade } from '../../services/geminiService';
import ImportGradesModal from './ImportGradesModal';
import ImportGradesResultModal from './ImportGradesResultModal';
import StudentObservationModal from './StudentObservationModal';


interface GradesAndAttendanceProps {
  selectedClass: { id: number; name:string } | null;
}

const GradeInput: React.FC<{ value: Grade, onChange: (value: Grade) => void, isDirty: boolean }> = ({ value, onChange, isDirty }) => (
    <div className="relative">
        <input 
            type="number" 
            step="0.1" 
            min="0" 
            max="10" 
            value={value ?? ''} 
            onChange={e => onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
            className="w-20 bg-gray-100 dark:bg-gray-700/50 text-center text-gray-900 dark:text-white rounded-md p-1 border border-transparent focus:border-teal-500 focus:ring-teal-500"
            aria-label="Campo de nota"
        />
        {isDirty && <span className="absolute -top-1 -right-1 h-2 w-2 bg-yellow-400 rounded-full" title="Nota alterada"></span>}
    </div>
);

const AttendanceSelector: React.FC<{ value: AttendanceStatus, onChange: (value: AttendanceStatus) => void }> = ({ value, onChange }) => {
    const statusClasses = {
        'Presente': 'bg-transparent text-gray-500 dark:text-gray-400',
        'Falta': 'bg-red-500 text-white font-bold',
        'Justificado': 'bg-yellow-500 text-white font-bold',
    };
    return (
        <select value={value} onChange={e => onChange(e.target.value as AttendanceStatus)} className={`w-full h-full text-center appearance-none cursor-pointer ${statusClasses[value]}`}>
            <option value="Presente">P</option>
            <option value="Falta">F</option>
            <option value="Justificado">J</option>
        </select>
    );
};


const GradesAndAttendance: React.FC<GradesAndAttendanceProps> = ({ selectedClass: initialSelectedClass }) => {
    const { classLogs, subjects, addSubject, classes, enrolledStudents } = useEnrollment();
    const { schoolInfo } = useSchoolInfo();
    const [activeTab, setActiveTab] = useState<'attendance' | 'grades'>('grades');
    const [selectedClass, setSelectedClass] = useState(initialSelectedClass);
    const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || 0);

    const [studentsData, setStudentsData] = useState<StudentAcademicRecord[]>([]);
    const [initialStudentsData, setInitialStudentsData] = useState<StudentAcademicRecord[]>([]);
    const [studentForReport, setStudentForReport] = useState<StudentAcademicRecord | null>(null);
    const [isDiaryModalOpen, setIsDiaryModalOpen] = useState(false);
    const [diaryToPrint, setDiaryToPrint] = useState<any | null>(null);
    const [isDiaryViewerOpen, setIsDiaryViewerOpen] = useState(false);
    
    // Attendance specific states
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isAttendanceReportModalOpen, setIsAttendanceReportModalOpen] = useState(false);
    const [attendanceReportToPrint, setAttendanceReportToPrint] = useState<any | null>(null);

    // PDF Import States
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ newSubjects: string[], updatedCount: number, studentName: string } | null>(null);

    // Observation states
    const [isObservationModalOpen, setIsObservationModalOpen] = useState(false);
    const [studentForObservation, setStudentForObservation] = useState<StudentAcademicRecord | null>(null);


    useEffect(() => {
        if (initialSelectedClass) {
            setSelectedClass(initialSelectedClass);
        }
    }, [initialSelectedClass]);

    useEffect(() => {
        if (selectedClass) {
            // In a real app, this data would be fetched. For now, we create it from the enrolled students list.
            const studentsInClass = enrolledStudents.filter(s => s.classId === selectedClass.id);
            const academicDataForClass = studentsInClass.map(s => ({
                studentId: s.id,
                studentName: s.name,
                avatar: s.avatar,
                grades: {},
                attendance: {},
                observations: [],
            }));
            setStudentsData(JSON.parse(JSON.stringify(academicDataForClass)));
            setInitialStudentsData(JSON.parse(JSON.stringify(academicDataForClass)));
        }
    }, [selectedClass, enrolledStudents]);
    
    useEffect(() => {
        const handlePrint = (onAfterPrint: () => void) => {
            window.addEventListener('afterprint', onAfterPrint, { once: true });
            const timer = setTimeout(() => window.print(), 100);
            return () => clearTimeout(timer);
        };

        if (attendanceReportToPrint) {
            handlePrint(() => setAttendanceReportToPrint(null));
        }
    }, [attendanceReportToPrint]);


    const handleGradeChange = (studentId: number, subjectName: string, assessmentName: string, value: Grade) => {
        setStudentsData(prev => prev.map(s => {
            if (s.studentId === studentId) {
                const newGrades = { ...s.grades };
                if (!newGrades[subjectName]) newGrades[subjectName] = {};
                newGrades[subjectName][assessmentName] = value;
                return { ...s, grades: newGrades };
            }
            return s;
        }));
    };
    
    const isDirty = useMemo(() => {
        return JSON.stringify(studentsData) !== JSON.stringify(initialStudentsData);
    }, [studentsData, initialStudentsData]);

    const handleSave = () => {
        // Here you would also push the changes to a backend/global state
        setInitialStudentsData(JSON.parse(JSON.stringify(studentsData)));
        alert('Alterações salvas com sucesso (simulação).');
    };

    const handleSaveObservation = (studentId: number, newObservations: StudentAcademicRecord['observations']) => {
        const updatedStudents = studentsData.map(s => 
            s.studentId === studentId ? { ...s, observations: newObservations } : s
        );
        setStudentsData(updatedStudents);
        handleSave(); // Persist changes immediately
    };


    const handleGenerateDiary = (config: PrintDiaryConfig) => {
        if (!selectedClass) return;
        setDiaryToPrint({
            schoolInfo, classInfo: selectedClass,
            students: studentsData.map(s => ({ id: s.studentId, name: s.studentName })),
            config, 
            calendarEvents: MOCK_CALENDAR_EVENTS,
            classLogs: classLogs.filter(log => log.classId === selectedClass.id),
            subjects: subjects,
            academicRecords: studentsData
        });
        setIsDiaryModalOpen(false);
        setIsDiaryViewerOpen(true);
    };
    
    const handleAttendanceChange = (studentId: number, dateKey: string, status: AttendanceStatus) => {
        setStudentsData(prev => prev.map(s => {
            if (s.studentId === studentId) {
                return { ...s, attendance: { ...s.attendance, [dateKey]: status } };
            }
            return s;
        }));
    };
    
    const handleGenerateAttendanceReport = (month: number, year: number) => {
        if (!selectedClass) return;
        setAttendanceReportToPrint({
            schoolInfo,
            classInfo: selectedClass,
            students: studentsData.map(s => ({ id: s.studentId, name: s.studentName, attendance: s.attendance })),
            month,
            year,
            calendarEvents: MOCK_CALENDAR_EVENTS,
        });
        setIsAttendanceReportModalOpen(false);
    };

    const handlePdfImport = async (studentId: number, file: File) => {
        const student = studentsData.find(s => s.studentId === studentId);
        if (!student) return;

        setIsImporting(true);
        try {
            const base64Data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(file);
            });

            const extractedData = await extractGradesFromPdf(base64Data, student.studentName);
            if (extractedData.length === 0) {
                throw new Error("Nenhuma nota válida foi encontrada no PDF.");
            }

            const newlyCreatedSubjects = new Set<string>();
            let updatedGradesCount = 0;
            
            let currentSubjects = [...subjects];

            setStudentsData(prevStudentsData => {
                const updatedStudentsData = JSON.parse(JSON.stringify(prevStudentsData));
                const studentIndex = updatedStudentsData.findIndex((s: StudentAcademicRecord) => s.studentId === studentId);
                if (studentIndex === -1) return prevStudentsData;

                const studentToUpdate = updatedStudentsData[studentIndex];

                extractedData.forEach(item => {
                    let subjectExists = currentSubjects.find(s => s.name.toLowerCase() === item.subjectName.toLowerCase());
                    
                    if (!subjectExists) {
                        const newSubject = addSubject(item.subjectName);
                        currentSubjects.push(newSubject);
                        newlyCreatedSubjects.add(item.subjectName);
                    }
                    
                    if(subjectExists) {
                        if (!studentToUpdate.grades[subjectExists.name]) {
                            studentToUpdate.grades[subjectExists.name] = {};
                        }
                        studentToUpdate.grades[subjectExists.name][item.assessmentName] = item.grade;
                        updatedGradesCount++;
                    }
                });

                return updatedStudentsData;
            });

            setImportResult({
                newSubjects: Array.from(newlyCreatedSubjects),
                updatedCount: updatedGradesCount,
                studentName: student.studentName,
            });

        } catch (error) {
            alert(`Erro na importação: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsImporting(false);
            setIsImportModalOpen(false);
        }
    };


    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    return (
      <div className="no-print">
        <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lançamento de Notas e Frequência</h2>
                 <select 
                    value={selectedClass?.id || ''} 
                    onChange={e => setSelectedClass(classes.find(c => c.id === Number(e.target.value)) || null)}
                    className="bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white"
                 >
                    <option value="">Selecione uma turma</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
            </div>
             <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                    <button onClick={() => setActiveTab('grades')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'grades' ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-300' : 'text-gray-500'}`}>Notas</button>
                    <button onClick={() => setActiveTab('attendance')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'attendance' ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-300' : 'text-gray-500'}`}>Frequência</button>
                </div>
                <div className="flex items-center space-x-2">
                    {activeTab === 'attendance' && <button onClick={() => setIsAttendanceReportModalOpen(true)} className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-600/50 dark:text-blue-200 text-xs font-semibold rounded-md">Gerar Relatório de Frequência</button>}
                    {activeTab === 'grades' && <button onClick={() => setIsImportModalOpen(true)} className="px-3 py-1.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-600/50 dark:text-indigo-200 text-xs font-semibold rounded-md">Importar Boletim (PDF)</button>}
                    <button onClick={() => setIsDiaryModalOpen(true)} className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-600/50 dark:text-blue-200 text-xs font-semibold rounded-md">Gerar Diário de Classe</button>
                    {isDirty && <button onClick={handleSave} className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-md">Salvar Alterações</button>}
                </div>
            </div>

            {/* Grades View */}
            {activeTab === 'grades' && selectedClass && (
                 <div>
                    <div className="flex items-center space-x-2 mb-4">
                        <label htmlFor="subject-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">Disciplina:</label>
                        <select id="subject-select" value={selectedSubjectId} onChange={e => setSelectedSubjectId(Number(e.target.value))} className="bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white">
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead>
                            <tr className="border-b-2 border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                <th className="p-2">Aluno</th>
                                {subjects.find(s => s.id === selectedSubjectId)?.assessments.map(ass => <th key={ass.name} className="p-2 text-center">{ass.name}</th>)}
                                <th className="p-2 text-center">Boletim Anual</th>
                                <th className="p-2 text-center">Observações</th>
                            </tr>
                           </thead>
                           <tbody>
                            {studentsData.map(student => (
                                <tr key={student.studentId} className="border-b border-gray-200 dark:border-gray-700/50">
                                    <td className="p-2 flex items-center space-x-2">
                                        <img src={student.avatar} alt={student.studentName} className="w-8 h-8 rounded-full" />
                                        <span className="font-semibold text-gray-800 dark:text-white">{student.studentName}</span>
                                    </td>
                                    {subjects.find(s => s.id === selectedSubjectId)?.assessments.map(ass => {
                                        const grade = student.grades[subjects.find(s => s.id === selectedSubjectId)?.name || '']?.[ass.name];
                                        const initialGrade = initialStudentsData.find(s => s.studentId === student.studentId)?.grades[subjects.find(s => s.id === selectedSubjectId)?.name || '']?.[ass.name];
                                        return (
                                            <td key={ass.name} className="p-2 text-center">
                                                <GradeInput 
                                                    value={grade}
                                                    onChange={value => handleGradeChange(student.studentId, subjects.find(s => s.id === selectedSubjectId)!.name, ass.name, value)}
                                                    isDirty={grade !== initialGrade}
                                                />
                                            </td>
                                        );
                                    })}
                                     <td className="p-2 text-center">
                                        <button onClick={() => setStudentForReport(student)} className="text-blue-500 hover:text-blue-400" title="Ver boletim anual completo">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        </button>
                                    </td>
                                     <td className="p-2 text-center">
                                        <button onClick={() => { setStudentForObservation(student); setIsObservationModalOpen(true); }} className="text-purple-500 hover:text-purple-400" title="Ver/Adicionar Observações">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                           </tbody>
                        </table>
                     </div>
                </div>
            )}

            {/* Attendance View */}
            {activeTab === 'attendance' && selectedClass && (
                 <div>
                    <div className="flex items-center space-x-2 mb-4">
                        <button onClick={() => setSelectedDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="p-2 bg-gray-200 dark:bg-gray-700/60 rounded-full">&lt;</button>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white w-48 text-center capitalize">{selectedDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
                        <button onClick={() => setSelectedDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="p-2 bg-gray-200 dark:bg-gray-700/60 rounded-full">&gt;</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr>
                                    <th className="p-1 border border-gray-300 dark:border-gray-600 sticky left-0 bg-gray-100 dark:bg-gray-800 z-10 w-48">Aluno</th>
                                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => <th key={day} className="p-1 border border-gray-300 dark:border-gray-600 text-center w-10">{day}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {studentsData.map(student => (
                                    <tr key={student.studentId}>
                                        <td className="p-1 border border-gray-300 dark:border-gray-600 sticky left-0 bg-white dark:bg-gray-800 z-10 font-semibold">{student.studentName}</td>
                                        {Array.from({ length: daysInMonth }, (_, i) => {
                                            const day = i + 1;
                                            const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                            const status = student.attendance[dateKey] || 'Presente';
                                            return (
                                                <td key={day} className="p-0 border border-gray-300 dark:border-gray-600 text-center h-8">
                                                    <AttendanceSelector value={status} onChange={(newStatus) => handleAttendanceChange(student.studentId, dateKey, newStatus)} />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {studentsData.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-10">Nenhum aluno nesta turma.</p>
                         )}
                    </div>
                 </div>
            )}
            {!selectedClass && (
                 <p className="text-center text-gray-500 dark:text-gray-400 py-10">Por favor, selecione uma turma para começar.</p>
            )}
        </div>

        {studentForReport && (
            <AnnualStudentGradesModal
                student={studentForReport}
                subjects={subjects}
                onClose={() => setStudentForReport(null)}
            />
        )}
        
        {isObservationModalOpen && studentForObservation && (
            <StudentObservationModal
                student={studentForObservation}
                onClose={() => setIsObservationModalOpen(false)}
                onSave={handleSaveObservation}
            />
        )}

        {isDiaryModalOpen && <GenerateDiaryModal onClose={() => setIsDiaryModalOpen(false)} onGenerate={handleGenerateDiary} />}
        {isDiaryViewerOpen && diaryToPrint && (
            <DiaryViewerModal
                diaryData={diaryToPrint}
                onClose={() => {
                    setIsDiaryViewerOpen(false);
                    setDiaryToPrint(null);
                }}
            />
        )}
        {isAttendanceReportModalOpen && <AttendanceReportModal onClose={() => setIsAttendanceReportModalOpen(false)} onGenerate={handleGenerateAttendanceReport} />}
        {isImportModalOpen && <ImportGradesModal students={studentsData} onClose={() => setIsImportModalOpen(false)} onImport={handlePdfImport} isImporting={isImporting} />}
        {importResult && <ImportGradesResultModal result={importResult} onClose={() => setImportResult(null)} />}
        
        <div className="print-container">
            {attendanceReportToPrint && <PrintableMonthlyAttendance {...attendanceReportToPrint} onRendered={() => setAttendanceReportToPrint(null)} />}
        </div>
      </div>
    );
};

export default GradesAndAttendance;