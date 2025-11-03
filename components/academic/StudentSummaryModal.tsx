import React, { useState, useMemo } from 'react';
import { StudentAcademicRecord } from '../../types';
import { streamMessage } from '../../services/geminiService';

interface StudentSummaryModalProps {
  student: StudentAcademicRecord;
  subject: string;
  onClose: () => void;
}

const StudentSummaryModal: React.FC<StudentSummaryModalProps> = ({ student, subject, onClose }) => {
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const gradesForSubject = useMemo(() => {
        return student.grades[subject] || {};
    }, [student, subject]);

    const handleGenerateSummary = async () => {
        setIsLoading(true);
        setError(null);
        setSummary('');

        const gradesText = Object.entries(gradesForSubject)
            .map(([assessment, grade]) => `${assessment}: ${typeof grade === 'number' ? (grade as number).toFixed(1) : 'N/L'}`)
            .join(', ');
        
        const prompt = `
            Aja como um(a) coordenador(a) pedagógico(a) experiente e atencioso(a). 
            Sua tarefa é escrever uma breve observação para o boletim do(a) aluno(a) ${student.studentName}, 
            com base em seu desempenho na disciplina de ${subject}.

            As notas do(a) aluno(a) foram: ${gradesText}.

            Instruções:
            1.  Seja conciso(a), escrevendo um parágrafo de 3 a 4 frases.
            2.  Use uma linguagem positiva e encorajadora, mesmo ao apontar áreas para melhoria.
            3.  Destaque um ponto forte ou uma área de bom desempenho.
            4.  Identifique uma ou duas áreas que podem ser desenvolvidas ou que requerem mais atenção.
            5.  Finalize com uma nota de incentivo.
            6.  Não use bullet points ou listas. Escreva em formato de texto corrido.
        `;

        try {
            const reader = await streamMessage(prompt);
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                const chunkText = decoder.decode(value);
                setSummary(prev => prev + chunkText);
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resumo do Aluno</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{subject}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <main className="p-6 space-y-6">
                    <div className="flex items-center space-x-4">
                        <img src={student.avatar} alt={student.studentName} className="w-16 h-16 rounded-full" />
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{student.studentName}</h3>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Notas em {subject}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {Object.entries(gradesForSubject).map(([assessment, grade]) => {
                                const typedGrade = grade as number | null;
                                return (
                                <div key={assessment} className="bg-gray-100 dark:bg-gray-900/50 p-2 rounded-lg flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-300">{assessment}</span>
                                    <span className={`font-bold text-lg ${typedGrade === null ? 'text-gray-500' : typedGrade >= 7 ? 'text-green-600 dark:text-green-300' : typedGrade >= 5 ? 'text-yellow-500 dark:text-yellow-300' : 'text-red-500 dark:text-red-300'}`}>
                                        {typedGrade?.toFixed(1) ?? 'N/L'}
                                    </span>
                                </div>
                                );
                            })}
                             {Object.keys(gradesForSubject).length === 0 && <p className="text-sm text-gray-500 col-span-full text-center">Nenhuma nota lançada.</p>}
                        </div>
                    </div>

                     <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Observação Pedagógica (Gerada por Gemini)</h4>
                        <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg min-h-[100px] text-gray-700 dark:text-gray-300 italic whitespace-pre-wrap">
                            {isLoading ? (
                                 <div className="flex items-center justify-center h-full">
                                    <svg className="animate-spin h-6 w-6 text-teal-500 dark:text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                 </div>
                            ) : error ? (
                                <p className="text-red-400 not-italic">{error}</p>
                            ) : summary ? (
                                summary
                            ) : (
                                <p className="text-center text-gray-500 not-italic">Clique em "Gerar Análise" para obter um feedback pedagógico.</p>
                            )}
                        </div>
                    </div>

                </main>
                
                <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                     <button 
                        onClick={handleGenerateSummary}
                        disabled={isLoading}
                        className="px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-teal-500 transition-colors"
                    >
                        {isLoading ? (
                            'Analisando...'
                         ) : summary ? 'Gerar Novamente' : 'Gerar Análise com IA'}
                    </button>
                </footer>
                 <style>{`
                    @keyframes fade-in {
                        from { opacity: 0; transform: scale(0.98); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                `}</style>
            </div>
        </div>
    );
};

export default StudentSummaryModal;