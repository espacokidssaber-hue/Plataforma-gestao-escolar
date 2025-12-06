
import React from 'react';
import { type Lead, type School } from '../types';
import { Button } from './ui/Button';
import { BuildingOffice2Icon } from './icons/BuildingOffice2Icon';
import { UserIcon } from './icons/UserIcon';

interface EnrollmentCardProps {
  lead: Lead;
  school?: School;
  onAllocateClick: (lead: Lead) => void;
  isSelected?: boolean;
  onToggleSelect?: (leadId: string) => void;
}

export const EnrollmentCard: React.FC<EnrollmentCardProps> = ({ lead, school, onAllocateClick, isSelected, onToggleSelect }) => {
  return (
    <div 
        className={`
            group relative bg-white rounded-xl border transition-all duration-200 ease-in-out flex flex-col
            ${isSelected 
                ? 'border-teal-500 ring-1 ring-teal-500 bg-teal-50/20 shadow-md' 
                : 'border-gray-200 shadow-sm hover:shadow-lg hover:border-teal-200'
            }
        `}
    >
        <div className="p-5 flex gap-4 items-start flex-1">
             {/* Checkbox */}
             {onToggleSelect && (
                 <div className="pt-1">
                     <input
                        type="checkbox"
                        className="h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer transition-colors"
                        checked={isSelected}
                        onChange={() => onToggleSelect(lead.id)}
                     />
                 </div>
             )}

             {/* Avatar */}
             <div className="flex-shrink-0">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center border shadow-sm ${isSelected ? 'bg-teal-100 text-teal-700 border-teal-200' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                    {lead.studentPhotoUrl ? (
                        <img src={lead.studentPhotoUrl} alt={lead.studentName} className="h-full w-full rounded-full object-cover" />
                    ) : (
                        <span className="text-lg font-bold">{lead.studentName.charAt(0).toUpperCase()}</span>
                    )}
                </div>
             </div>

             {/* Info */}
             <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 leading-snug group-hover:text-teal-700 transition-colors">
                            {lead.studentName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5 flex items-center">
                            <span className="font-medium text-gray-700 mr-1">Responsável:</span> {lead.responsibleName}
                        </p>
                    </div>
                </div>
                
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    {lead.className && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {lead.className}
                        </span>
                    )}
                </div>
             </div>
        </div>

        {/* Footer / Actions */}
        <div className="bg-gray-50/50 px-5 py-3 border-t border-gray-100 rounded-b-xl flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
                {school && (
                    <div className="flex flex-col">
                        <div className="flex items-center text-xs font-medium text-gray-600 mb-0.5">
                            <BuildingOffice2Icon className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                            <span className="truncate" title={school.name}>{school.name}</span>
                        </div>
                        {school.cnpj && (
                            <span className="text-[10px] text-gray-400 pl-5">{school.cnpj}</span>
                        )}
                    </div>
                )}
            </div>
            
            <Button onClick={() => onAllocateClick(lead)} className="shrink-0 shadow-sm hover:shadow transition-shadow !text-xs !px-4 !py-2">
                Alocar Aluno
            </Button>
        </div>
    </div>
  );
};
