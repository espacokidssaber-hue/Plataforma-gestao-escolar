import React, { useState } from 'react';
import { StudentTranscriptData, SchoolInfo, EnrichedEnrolledStudent, StudentLifecycleStatus, SchoolUnit } from '../../types';
import { MOCK_ACADEMIC_HISTORY } from '../../data/academicHistoryData';
import PrintableTranscript from './PrintableTranscript';
import { useSchoolInfo } from '../../App';

// html2pdf is loaded globally from index.html
declare const html2pdf: any;

// --- AVATAR UTILS START ---
const getInitials = (name: string): string => { if (!name) return '?'; const words = name.trim().split(' ').filter(Boolean); if (words.length > 1) { return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase(); } if (words.length === 1 && words[0].length > 1) { return words[0].substring(0, 2).toUpperCase(); } if (words.length === 1) { return words[0][0].toUpperCase(); } return '?'; };
const stringToColor = (str: string): string => { let hash = 0; if (!str) return '#cccccc'; for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); hash = hash & hash; } let color = '#'; for (let i = 0; i < 3; i++) { const value = (hash >> (i * 8)) & 0xFF; const adjustedValue = 100 + (value % 156); color += ('00' + adjustedValue.toString(16)).substr(-2); } return color; };
const generateAvatar = (name: string): string => { const initials = getInitials(name); const color = stringToColor(name); const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150" fill="${color}"><rect width="100%" height="100%" fill="currentColor" /><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60" fill="#ffffff">${initials}</text></svg>`; return `data:image/svg+xml;base64,${btoa(svg)}`; };
// --- AVATAR UTILS END ---

const MOCK_STUDENTS_LIST: EnrichedEnrolledStudent[] = [
    { id: 302, name: 'Bento Ribeiro', avatar: generateAvatar('Bento Ribeiro'), grade: '5º Ano', className: '5º Ano A', classId: 2, unit: SchoolUnit.MATRIZ, status: StudentLifecycleStatus.ACTIVE, financialStatus: 'OK', libraryStatus: 'OK', academicDocsStatus: 'OK', dateOfBirth: '2015-04-20', enrollmentId: '000710-2', motherName: 'Juliana Ribeiro', fatherName: 'Marcos Ribeiro', cityOfBirth: 'João Pessoa', stateOfBirth: 'PB' },
    { id: 304, name: 'Dante Oliveira', avatar: generateAvatar('Dante Oliveira'), grade: '5º Ano', className: '5º Ano A', classId: 2, unit: SchoolUnit.MATRIZ, status: StudentLifecycleStatus.ACTIVE, financialStatus: 'OK', libraryStatus: 'OK', academicDocsStatus: 'OK', dateOfBirth: '2015-03-15', enrollmentId: '000711-3', motherName: 'Carla Oliveira', fatherName: 'Roberto Oliveira', cityOfBirth: 'Recife', stateOfBirth: 'PE' },
];

const ReportCard: React.FC = () => {
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

        const studentData = MOCK_STUDENTS_LIST.find(s => s.id === studentId);
        const history = MOCK_ACADEMIC_HISTORY[studentId];
        
        if (studentData && history) {
            setTranscriptData({
                student: studentData,
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
                            {MOCK_STUDENTS_LIST.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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