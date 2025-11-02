import React from 'react';
import { EnrolledStudent, ClearanceStatus } from '../types';

interface StudentModalProps {
  student: EnrolledStudent | null;
  onClose: () => void;
}

const StatusIndicator: React.FC<{ status: ClearanceStatus }> = ({ status }) => {
    const isOk = status === 'OK';
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isOk ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'}`}>
            {status}
        </span>
    );
};


const StudentModal: React.FC<StudentModalProps> = ({ student, onClose }) => {
  if (!student) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detalhes do Aluno</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <main className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <img src={student.avatar} alt={student.name} className="w-20 h-20 rounded-full" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{student.name}</h3>
              <p className="text-gray-500 dark:text-gray-400">{student.grade} - {student.className}</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">ID do Aluno: {student.id}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Status de Liberação</h4>
            <div className="space-y-2">
                <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-900/50 p-3 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Financeiro</span>
                    <StatusIndicator status={student.financialStatus} />
                </div>
                 <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-900/50 p-3 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Biblioteca</span>
                    <StatusIndicator status={student.libraryStatus} />
                </div>
                 <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-900/50 p-3 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Documentos Acadêmicos</span>
                    <StatusIndicator status={student.academicDocsStatus} />
                </div>
            </div>
          </div>
        </main>
         <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500">
                Fechar
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

export default StudentModal;