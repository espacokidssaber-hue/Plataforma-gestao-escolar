
import React, { useState, useMemo, useEffect } from 'react';
import { type SchoolClass } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface BulkAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (className: string) => Promise<void>;
  classes: SchoolClass[];
  count: number;
  initialClass?: string;
}

export const BulkAllocationModal: React.FC<BulkAllocationModalProps> = ({ isOpen, onClose, onConfirm, classes, count, initialClass }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [useCsvClass, setUseCsvClass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset on open
  useEffect(() => {
      if (isOpen) {
          setUseCsvClass(false);
          setIsSubmitting(false);
          
          if (initialClass && classes.some(c => c.name === initialClass)) {
              setSelectedClass(initialClass);
          } else if (classes.length > 0) {
              setSelectedClass(classes[0].name);
          } else {
              setSelectedClass('');
          }
      }
  }, [isOpen, classes, initialClass]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
        if (useCsvClass) {
            await onConfirm(""); // Empty string signals to use the CSV suggested class per student
        } else if (selectedClass) {
            await onConfirm(selectedClass);
        }
    } catch (error) {
        console.error("Error in bulk allocation modal:", error);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const inputClass = "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-500";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Alocação em Massa (${count} alunos)`}>
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
            Configure como deseja alocar os {count} alunos selecionados.
        </p>
        
        <div className="flex items-center mb-4">
            <input
                id="useCsvClass"
                type="checkbox"
                checked={useCsvClass}
                onChange={(e) => setUseCsvClass(e.target.checked)}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                disabled={isSubmitting}
            />
            <label htmlFor="useCsvClass" className="ml-2 block text-sm text-gray-900 font-medium cursor-pointer">
                Respeitar turma sugerida (CSV/Importação)
            </label>
        </div>
        
        <div className={`transition-opacity ${useCsvClass ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <label htmlFor="bulkClassSelector" className="block text-sm font-medium text-gray-700">
            Ou selecione uma Turma de Destino única para todos
          </label>
          <select
            id="bulkClassSelector"
            name="bulkClassSelector"
            className={inputClass}
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={useCsvClass || isSubmitting}
          >
            {classes.length > 0 ? (
                classes.map(cls => (
                <option key={cls.id} value={cls.name}>
                    {cls.name}
                </option>
                ))
            ) : (
                <option disabled>Nenhuma turma disponível.</option>
            )}
          </select>
           <p className="mt-1 text-xs text-gray-500">
              Se não marcar a opção acima, todos os alunos selecionados serão movidos para esta turma.
          </p>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button onClick={handleConfirm} disabled={(!useCsvClass && !selectedClass) || isSubmitting}>
          {isSubmitting ? (
              <>
                <SpinnerIcon className="w-4 h-4 mr-2" />
                Processando...
              </>
          ) : 'Confirmar Alocação'}
        </Button>
      </div>
    </Modal>
  );
};
