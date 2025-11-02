import React from 'react';

interface ImportGradesResultModalProps {
  onClose: () => void;
  result: {
    newSubjects: string[];
    updatedCount: number;
    studentName: string;
  } | null;
}

const ImportGradesResultModal: React.FC<ImportGradesResultModalProps> = ({ onClose, result }) => {
  if (!result) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 text-center" onClick={e => e.stopPropagation()}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 dark:text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Importação Concluída!</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">As notas do boletim de <strong>{result.studentName}</strong> foram importadas.</p>

        <div className="text-left mt-4 space-y-2">
            <p><strong>Notas importadas/atualizadas:</strong> {result.updatedCount}</p>
            {result.newSubjects.length > 0 && (
                <div>
                    <strong>Novas disciplinas criadas:</strong>
                    <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400">
                        {result.newSubjects.map(s => <li key={s}>{s}</li>)}
                    </ul>
                </div>
            )}
        </div>

        <button onClick={onClose} className="mt-6 px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg">OK</button>
      </div>
    </div>
  );
};

export default ImportGradesResultModal;
