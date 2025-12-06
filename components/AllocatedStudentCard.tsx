
import React, { useState, useRef, useEffect } from 'react';
import { type Lead, type School } from '../types';
import { Button } from './ui/Button';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { UserIcon } from './icons/UserIcon';
import { DotsVerticalIcon } from './icons/DotsVerticalIcon';
import { PrinterIcon } from './icons/PrinterIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { BuildingOffice2Icon } from './icons/BuildingOffice2Icon';

interface AllocatedStudentCardProps {
  lead: Lead;
  school?: School;
  onPrintEnrollmentForm?: (student: Lead) => void;
  onPrintStudentFile?: (student: Lead) => void;
}

export const AllocatedStudentCard: React.FC<AllocatedStudentCardProps> = ({ lead, school, onPrintEnrollmentForm, onPrintStudentFile }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatCurrency = (value?: number) => {
    if (value === undefined) return 'N/A';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const calculateFinalFee = () => {
    if (lead.monthlyFee === undefined || lead.discountPercentage === undefined) return lead.monthlyFee;
    return lead.monthlyFee * (1 - lead.discountPercentage / 100);
  };

  const hasActions = onPrintEnrollmentForm || onPrintStudentFile;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-gray-400 flex flex-col justify-between transition-shadow hover:shadow-lg">
        <div>
            <div className="flex items-start justify-between">
                <div className="flex items-center min-w-0">
                    <div className="flex-shrink-0 h-11 w-11 mr-4">
                      {lead.studentPhotoUrl ? (
                        <img className="h-11 w-11 rounded-full object-cover" src={lead.studentPhotoUrl} alt={lead.studentName} />
                      ) : (
                        <div className="h-11 w-11 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-md text-gray-800 truncate">{lead.studentName}</h3>
                        {lead.className && (
                            <div className="mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200 uppercase tracking-wide">
                                    {lead.className}
                                </span>
                            </div>
                        )}
                        {school && (
                            <div className="flex flex-col mt-2 text-xs text-gray-500">
                                <div className="flex items-center" title={school.name}>
                                    <BuildingOffice2Icon className="w-3 h-3 mr-1 flex-shrink-0 text-gray-400" />
                                    <span className="truncate">{school.name}</span>
                                </div>
                                {school.cnpj && (
                                    <span className="ml-4 text-gray-400">CNPJ: {school.cnpj}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-shrink-0 ml-2">
                    {hasActions ? (
                         <div className="relative" ref={menuRef}>
                            <Button variant="secondary" className="!p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                <span className="sr-only">Opções</span>
                                <DotsVerticalIcon className="w-5 h-5" />
                            </Button>
                            {isMenuOpen && (
                                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                    <div className="py-1">
                                        {onPrintEnrollmentForm && (
                                            <button onClick={() => { onPrintEnrollmentForm(lead); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                <PrinterIcon className="w-5 h-5 mr-3 text-gray-500" />
                                                Imprimir Ficha de Matrícula
                                            </button>
                                        )}
                                        {onPrintStudentFile && (
                                            <button onClick={() => { onPrintStudentFile(lead); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                <DocumentTextIcon className="w-5 h-5 mr-3 text-gray-500" />
                                                Imprimir Ficha do Aluno
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                         <CheckCircleIcon className="w-7 h-7 text-teal-600" />
                    )}
                </div>
            </div>
        </div>
        <div className="mt-3 pt-3 border-t">
            <p className="text-sm">
                <span className="font-semibold">Mensalidade: </span> {formatCurrency(calculateFinalFee())}
                {lead.discountPercentage && lead.discountPercentage > 0 && (
                    <span className="ml-2 text-xs font-semibold rounded-full bg-green-100 text-green-800 px-2 py-0.5">
                        {lead.discountPercentage}% OFF
                    </span>
                )}
            </p>
        </div>
    </div>
  );
};
