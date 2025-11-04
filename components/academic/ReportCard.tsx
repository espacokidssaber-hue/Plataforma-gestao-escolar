import React, { useState } from 'react';
import { StudentTranscriptData, SchoolInfo, EnrichedEnrolledStudent } from '../../types';
import { MOCK_ACADEMIC_HISTORY } from '../../data/academicHistoryData';
import PrintableTranscript from './PrintableTranscript';
// FIX: Corrected import path for EnrollmentContext
import { useSchoolInfo } from '../../contexts/EnrollmentContext';
import { useEnrollment } from '../../contexts/EnrollmentContext';

// html2pdf is loaded globally from index.html
declare const html2pdf: any;


const ReportCard: React.FC = () => {
    const { enrolledStudents } = useEnrollment();
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [transcriptData, setTranscriptData] = useState<StudentTranscriptData | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const { schoolInfo } = useSchoolInfo();

    const handleStudentChange = (studentId: number | null) => {
        setSelectedStudentId(studentId);
        if (!studentId) {
            setTranscriptData(null);
            return;
        }

        const studentData = enrolledStudents.find(s => s.id === studentId);
        const history = MOCK_ACADEMIC_HISTORY[studentId] || []; // Historical data can remain mock for now
        
        if (studentData) {
            // Enrich student data to match the expected format, mocking some fields if needed
            const enrichedStudentData: EnrichedEnrolledStudent = {
                ...studentData,
                enrollmentId: String(studentData.id).padStart(6, '0') + '-' + String(studentData.id % 10),
                cityOfBirth: studentData.cityOfBirth || 'Não Informada',
                stateOfBirth: studentData.stateOfBirth || 'NI',
            };

            setTranscriptData({
                student: enrichedStudentData,
                academicHistory: history,
                schoolInfo: schoolInfo,
                observations: 'Nenhuma observação.'
            });
        } else {
            setTranscriptData(null);
            alert('Dados históricos não encontrados para este aluno.');
        }
    };

    const handleDownload = () => {
        if (!transcriptData) return;
        setIsDownloading(true);
        const element = document.getElementById('transcript-content-for-pdf');
        if (element) {
            const safeFilename = `historico_escolar_${transcriptData.student.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
            html2pdf().from(element).set({
                margin: 20,
                filename: safeFilename,
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }).save().then(() => {
                setIsDownloading(false);
            }).catch((err: any) => {
                console.error("html2pdf error:", err);
                alert("Ocorreu um erro ao gerar o PDF.");
                setIsDownloading(false);
            });
        }
    };
    
    return (
        <div className="no-print">
            <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6 space-y-6">
                 <div className="flex flex-wrap gap-4 justify-between items-center">
                    <div>
                        <label htmlFor="student-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Selecione um Aluno</label>
                        <select 
                            id="student-select"
                            value={selectedStudentId ?? ''}
                            onChange={(e) => handleStudentChange(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full max-w-sm bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white"
                        >
                            <option value="">-- Escolha um aluno --</option>
                            {enrolledStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    {transcriptData && (
                        <button onClick={handleDownload} disabled={isDownloading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 disabled:bg-gray-500 flex items-center">
                            {isDownloading ? 'Baixando...' : 'Baixar Histórico (PDF)'}
                        </button>
                    )}
                </div>

                {transcriptData ? (
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg overflow-y-auto max-h-[calc(100vh-300px)]">
                        <div id="transcript-content-for-pdf">
                            <PrintableTranscript {...transcriptData} />
                        </div>
                    </div>
                ) : (
                     <div className="text-center py-20 text-gray-500">
                        <p>Selecione um aluno para visualizar seu histórico escolar completo.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportCard;