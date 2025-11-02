import React, { useState } from 'react';
import { Subject, CalculationMethod, SubjectAssessment } from '../../types';

interface SubjectConfigModalProps {
  subject: Subject;
  onClose: () => void;
  onSave: (subject: Subject) => void;
}

const SubjectConfigModal: React.FC<SubjectConfigModalProps> = ({ subject, onClose, onSave }) => {
  const [method, setMethod] = useState<CalculationMethod>(subject.calculationMethod);
  const [assessments, setAssessments] = useState<SubjectAssessment[]>(subject.assessments);
  const [newAssessmentName, setNewAssessmentName] = useState('');

  const handleAddAssessment = () => {
    if (newAssessmentName.trim() && !assessments.some(a => a.name.toLowerCase() === newAssessmentName.trim().toLowerCase())) {
      setAssessments([...assessments, { name: newAssessmentName.trim(), weight: 1 }]);
      setNewAssessmentName('');
    }
  };

  const handleRemoveAssessment = (name: string) => {
    setAssessments(assessments.filter(a => a.name !== name));
  };

  const handleWeightChange = (name: string, weight: number) => {
    setAssessments(assessments.map(a => a.name === name ? { ...a, weight: weight >= 0 ? weight : 0 } : a));
  };

  const handleSaveChanges = () => {
    // If method is arithmetic, reset all weights to 1 for consistency.
    const finalAssessments = method === 'arithmetic' ? assessments.map(a => ({ ...a, weight: 1 })) : assessments;
    onSave({
      ...subject,
      calculationMethod: method,
      assessments: finalAssessments,
    });
  };

  const totalWeight = method === 'weighted' ? assessments.reduce((sum, a) => sum + (a.weight || 0), 0) : assessments.length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configurar Avaliações</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Disciplina: <span className="font-semibold text-teal-600 dark:text-teal-300">{subject.name}</span></p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <main className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div>
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Método de Cálculo da Média Final</h3>
            <div className="flex items-center space-x-2 p-1 bg-gray-200 dark:bg-gray-700/50 rounded-lg">
                <button onClick={() => setMethod('arithmetic')} className={`flex-1 px-3 py-1 text-sm rounded-md transition-colors ${method === 'arithmetic' ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-300'}`}>Média Aritmética</button>
                <button onClick={() => setMethod('weighted')} className={`flex-1 px-3 py-1 text-sm rounded-md transition-colors ${method === 'weighted' ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-300'}`}>Média Ponderada</button>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Avaliações Padrão</h3>
            <div className="space-y-2">
              {assessments.map(ass => (
                <div key={ass.name} className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-900/50 p-2 rounded-lg">
                  <span className="flex-grow text-gray-800 dark:text-gray-200">{ass.name}</span>
                  {method === 'weighted' && (
                    <div className="flex items-center space-x-1">
                        <label htmlFor={`weight-${ass.name}`} className="text-xs text-gray-500 dark:text-gray-400">Peso:</label>
                        <input 
                            type="number"
                            id={`weight-${ass.name}`}
                            value={ass.weight}
                            onChange={(e) => handleWeightChange(ass.name, parseFloat(e.target.value) || 0)}
                            className="w-16 bg-white dark:bg-gray-700 text-center text-gray-900 dark:text-white rounded-md p-1 border border-gray-300 dark:border-gray-600"
                        />
                    </div>
                  )}
                  <button type="button" onClick={() => handleRemoveAssessment(ass.name)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-semibold">
                    Remover
                  </button>
                </div>
              ))}
              {assessments.length === 0 && <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">Nenhuma avaliação cadastrada.</p>}
            </div>
             <div className="flex items-center mt-3 space-x-2">
                <input
                    type="text"
                    value={newAssessmentName}
                    onChange={e => setNewAssessmentName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAssessment())}
                    placeholder="Nome da nova avaliação..."
                    className="flex-grow bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                />
                <button type="button" onClick={handleAddAssessment} className="px-3 py-2 bg-blue-100 text-blue-700 dark:bg-blue-600/50 dark:text-blue-200 text-sm font-semibold rounded-md hover:bg-blue-200 dark:hover:bg-blue-600">
                    Adicionar
                </button>
            </div>
             {method === 'weighted' && (
                <p className="text-right text-sm text-gray-500 dark:text-gray-400 mt-2">Soma dos pesos: <span className="font-bold">{totalWeight}</span></p>
            )}
          </div>
        </main>

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
          <button type="button" onClick={handleSaveChanges} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500">Salvar Configurações</button>
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

export default SubjectConfigModal;
