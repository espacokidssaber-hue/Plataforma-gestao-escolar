import React, { useState } from 'react';
import { StudentAcademicRecord, Subject as SubjectType, SchoolInfo } from '../../types';
import PrintableAnnualReport from './PrintableAnnualReport';
import { generateDocumentText } from '../../services/geminiService';

// html2pdf is loaded globally from index.html
declare const html2pdf: any;

interface AnnualStudentGradesModalProps {
  student: StudentAcademicRecord;
  subjects: SubjectType[];
  onClose: () => void;
}

const AnnualStudentGradesModal: React.FC<AnnualStudentGradesModalProps> = ({ student, subjects, onClose }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [printableContent, setPrintableContent] = useState<React.ReactNode | null>(null);
    const [observation, setObservation] = useState<string>('');
    const [isGeneratingObs, setIsGeneratingObs] = useState(false);

    const handleGenerateObservation = async () => {
        setIsGeneratingObs(true);
        setObservation('');

        const gradesText = Object.entries(student.grades)
            .map(([subject, assessments]) => {
                const assessmentText = Object.entries(assessments as Record<string, number | null>)
                    .map(([name, grade]) => `${name}: ${grade?.toFixed(1) ?? 'N/L'}`)
                    .join(', ');
                return `${subject} (${assessmentText})`;
            })
            .join('; ');

        const prompt = `
            Aja como um(a) educador(a) experiente e atencioso(a).
            Sua tarefa é escrever um parágrafo de observação pedagógica para o boletim do(a) aluno(a) ${student.studentName}, 
            com base em seu desempenho acadêmico até o momento.

            As notas do(a) aluno(a) são: ${gradesText}.

            Instruções:
            1. Seja conciso(a), escrevendo um parágrafo de 4 a 5 frases.
            2. Use uma linguagem positiva e encorajadora, mesmo ao apontar áreas para melhoria.
            3. Analise o desempenho geral, destaque pontos fortes (ex: disciplinas com boas notas) e identifique áreas que podem ser desenvolvidas.
            4. Finalize com uma nota de incentivo.
            5. Escreva em formato de texto corrido, sem títulos ou saudações.
        `;

        try {
            const result = await generateDocumentText(prompt);
            setObservation(result);
        } catch (error) {
            alert("Erro ao gerar observação: " + (error instanceof Error ? error.message : "Tente novamente."));
        } finally {
            setIsGeneratingObs(false);
        }
    };

    const handleDownload = () => {
        setIsDownloading(true);
        const schoolInfo: SchoolInfo = JSON.parse(localStorage.getItem('schoolInfo') || '{}');

        const doPdfGeneration = () => {
            const element = document.getElementById('printable-annual-report');
            if (element) {
                const safeFilename = `boletim_${student.studentName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
                html2pdf().from(element).set({
                    margin: 20,
                    filename: safeFilename,
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
                }).save().then(() => {
                    setPrintableContent(null);
                    setIsDownloading(false);
                }).catch((err: any) => {
                    console.error("html2pdf error:", err);
                    alert("Ocorreu um erro ao gerar o PDF.");
                    setPrintableContent(null);
                    setIsDownloading(false);
                });
            } else {
                console.error("Printable element not found!");
                setIsDownloading(false);
                setPrintableContent(null);
                alert("Erro: Elemento para impressão não foi encontrado.");
            }
        };

        setPrintableContent(<PrintableAnnualReport student={student} subjects={subjects} schoolInfo={schoolInfo} observation={observation} onRendered={doPdfGeneration} />);
    };

    const schoolInfoForPreview: SchoolInfo = JSON.parse(localStorage.getItem('schoolInfo') || '{}');

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-[95vw] max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Boletim Anual - {student.studentName}</h2>
                        <button type="button" onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </header>
                    <main className="flex-grow p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
                        <PrintableAnnualReport student={student} subjects={subjects} schoolInfo={schoolInfoForPreview} observation={observation} onRendered={() => {}} isPreview />
                    </main>
                    <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center space-x-3">
                         <button onClick={handleGenerateObservation} disabled={isGeneratingObs} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 disabled:bg-gray-500 flex items-center">
                            {isGeneratingObs ? 'Gerando...' : 'Gerar Observação com IA ✨'}
                        </button>
                        <div className="flex items-center space-x-3">
                            <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500">
                                Fechar
                            </button>
                            <button onClick={handleDownload} disabled={isDownloading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 disabled:bg-gray-500 flex items-center">
                                {isDownloading ? 'Baixando...' : 'Baixar PDF'}
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
            {isDownloading && printableContent && (
                <div className="fixed -top-[9999px] left-0">
                    {printableContent}
                </div>
            )}
            <style>{`.animate-fade-in { animation: fade-in 0.2s ease-out forwards; }`}</style>
        </>
    );
};

export default AnnualStudentGradesModal;