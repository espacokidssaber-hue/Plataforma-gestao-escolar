
import React, { useState, useEffect, useMemo } from 'react';
import { type Lead, type DiscountConfig, type SchoolClass } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface AllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (leadId: string, allocationData: {
    className: string;
    enrollmentFee: number;
    monthlyFee: number;
    discountPercentage: number;
  }) => void;
  lead: Lead;
  classes: SchoolClass[];
  discountConfig: DiscountConfig;
}

export const AllocationModal: React.FC<AllocationModalProps> = ({ isOpen, onClose, onConfirm, lead, classes, discountConfig }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [baseFee, setBaseFee] = useState(0);

  const availableClassesForSchool = useMemo(() => {
    return classes.filter(c => c.schoolId === lead.schoolId);
  }, [classes, lead.schoolId]);
  
  // Initialize state when the modal is opened
  useEffect(() => {
    if (isOpen && availableClassesForSchool.length > 0) {
      const initialClass = availableClassesForSchool[0];
      if (initialClass) {
        setSelectedClass(initialClass.name);
        setBaseFee(initialClass.baseMonthlyFee);
      }
    } else if (isOpen) {
        setSelectedClass('');
        setBaseFee(0);
    }
  }, [isOpen, availableClassesForSchool]);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newClassName = e.target.value;
      const classInfo = availableClassesForSchool.find(c => c.name === newClassName);
      setSelectedClass(newClassName);
      if (classInfo) {
        setBaseFee(classInfo.baseMonthlyFee);
      }
  };

  const handleConfirm = () => {
    if (selectedClass) {
      onConfirm(lead.id, {
        className: selectedClass,
        enrollmentFee: 0, // Default to 0, to be adjusted in Financial Page
        monthlyFee: baseFee, // Default to class base fee
        discountPercentage: 0, // Default to 0
      });
    }
  };
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const inputClass = "mt-1 block w-full pl-3 pr-10 py-1.5 border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Alocar Aluno(a): ${lead.studentName}`}>
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
            Selecione a turma para alocar o aluno. Os valores e condições financeiras poderão ser ajustados posteriormente no menu <strong>Financeiro</strong>.
        </p>

        {/* Class Selection */}
        <div>
          <label htmlFor="classSelector" className="block text-sm font-medium text-gray-700">
            Selecione a Turma
          </label>
          <select
            id="classSelector"
            name="classSelector"
            className={inputClass}
            value={selectedClass}
            onChange={handleClassChange}
          >
            {availableClassesForSchool.length > 0 ? (
                availableClassesForSchool.map(cls => (
                <option key={cls.id} value={cls.name}>
                    {cls.name}
                </option>
                ))
            ) : (
                <option disabled>Nenhuma turma cadastrada para esta escola.</option>
            )}
          </select>
          {baseFee > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              Valor base da mensalidade para esta turma: <span className="font-semibold">{formatCurrency(baseFee)}</span>
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-8 flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleConfirm} disabled={!selectedClass}>
          Confirmar Alocação
        </Button>
      </div>
    </Modal>
  );
};
