
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { type Lead, LeadStatus, DiscountConfig, User, SchoolClass, School, UserRole } from '../types';
import { AllocatedStudentCard } from './AllocatedStudentCard';
import { AllocationModal } from './AllocationModal';
import { BulkAllocationModal } from './BulkAllocationModal';
import { Button } from './ui/Button';
import { DocumentArrowUpIcon } from './icons/DocumentArrowUpIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';

interface EnrollmentManagementProps {
  user: User;
  schools: School[];
  leads: Lead[];
  classes: SchoolClass[];
  onAllocateStudent: (leadId: string, allocationData: {
    className: string;
    enrollmentFee: number;
    monthlyFee: number;
    discountPercentage: number;
  }) => void;
  onBulkAllocateStudents: (leadIds: string[], className: string) => Promise<void>;
  discountConfig: DiscountConfig;
  onImportLeadsFromCSV: (file: File, schoolId: string) => Promise<void>;
  superAdminSchoolFilter: string;
  setSuperAdminSchoolFilter?: (schoolId: string) => void;
  onPrintEnrollmentForm: (student: Lead) => void;
  onPrintStudentFile: (student: Lead) => void;
}

export const EnrollmentManagement: React.FC<EnrollmentManagementProps> = ({ 
  user, 
  schools, 
  leads, 
  classes, 
  onAllocateStudent, 
  onBulkAllocateStudents, 
  discountConfig, 
  onImportLeadsFromCSV, 
  superAdminSchoolFilter, 
  setSuperAdminSchoolFilter, 
  onPrintEnrollmentForm, 
  onPrintStudentFile 
}) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [importSchoolId, setImportSchoolId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for bulk selection
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local import dropdown with global filter
  useEffect(() => {
    if (user.role === UserRole.SUPER_ADMINISTRADOR) {
        if (superAdminSchoolFilter !== 'all') {
            setImportSchoolId(superAdminSchoolFilter);
        } else {
            setImportSchoolId('');
        }
    }
  }, [superAdminSchoolFilter, user.role]);

  const filteredLeads = useMemo(() => {
    let list = leads;
    if (user.role === UserRole.SUPER_ADMINISTRADOR && superAdminSchoolFilter && superAdminSchoolFilter !== 'all') {
        list = list.filter(lead => lead.schoolId === superAdminSchoolFilter);
    }
    
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        list = list.filter(l => 
            l.studentName.toLowerCase().includes(lowerTerm) || 
            l.responsibleName.toLowerCase().includes(lowerTerm)
        );
    }
    return list;
  }, [leads, user.role, superAdminSchoolFilter, searchTerm]);

  const completedLeads = filteredLeads.filter(lead => lead.status === LeadStatus.COMPLETED);
  const allocatedLeads = filteredLeads.filter(lead => lead.status === LeadStatus.ALLOCATED);
  
  // Reset selection when leads change or school filter changes
  useEffect(() => {
      // Optional: Clear selection on filter change to avoid confusion
      // setSelectedLeadIds(new Set()); 
  }, [superAdminSchoolFilter]);

  const availableClassesForBulk = useMemo(() => {
      if (selectedLeadIds.size === 0) return [];
      
      const selectedLeads = leads.filter(l => selectedLeadIds.has(l.id));
      const firstSchoolId = selectedLeads[0]?.schoolId;
      const allSameSchool = selectedLeads.every(l => l.schoolId === firstSchoolId);
      
      if (allSameSchool && firstSchoolId) {
          return classes.filter(c => c.schoolId === firstSchoolId);
      }
      return [];
  }, [selectedLeadIds, leads, classes]);

  const commonSuggestedClass = useMemo(() => {
      if (selectedLeadIds.size === 0) return undefined;
      // Use array from set to get first ID, then find lead
      const firstId = selectedLeadIds.values().next().value;
      const firstLead = leads.find(l => l.id === firstId);
      if (!firstLead?.className) return undefined;
      
      // Check if all selected leads have the same className
      const allSame = Array.from(selectedLeadIds).every(id => {
          const l = leads.find(lead => lead.id === id);
          return l?.className === firstLead.className;
      });
      
      return allSame ? firstLead.className : undefined;
  }, [selectedLeadIds, leads]);


  const handleOpenModal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedLead(null);
    setIsModalOpen(false);
  };

  const handleConfirmAllocation = (leadId: string, allocationData: {
    className: string;
    enrollmentFee: number;
    monthlyFee: number;
    discountPercentage: number;
  }) => {
    onAllocateStudent(leadId, allocationData);
    handleCloseModal();
  };

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSchoolId = e.target.value;
      setImportSchoolId(newSchoolId);
      setImportMessage(null);
      
      // Sync with global filter to update the lists below immediately
      if (user.role === UserRole.SUPER_ADMINISTRADOR && setSuperAdminSchoolFilter) {
          setSuperAdminSchoolFilter(newSchoolId || 'all');
      }
  };
  
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const schoolIdForImport = user.role === UserRole.SUPER_ADMINISTRADOR ? importSchoolId : user.schoolId;

    if (user.role !== UserRole.SUPER_ADMINISTRADOR && !schoolIdForImport) {
        setImportMessage({ type: 'error', text: 'Usuário não associado a uma escola.' });
        return;
    }

    setIsImporting(true);
    setImportMessage(null);
    try {
        await onImportLeadsFromCSV(file, schoolIdForImport || '');
        setImportMessage({ type: 'success', text: 'Alunos importados com sucesso! Todos estão na lista de "Aguardando Alocação".' });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    } catch (error) {
        console.error("CSV Import Error:", error);
        setImportMessage({ type: 'error', text: (error as Error).message || 'Falha ao importar o arquivo CSV.' });
    } finally {
        setIsImporting(false);
    }
  };

  // Bulk Selection Handlers
  const handleToggleSelect = (targetLead: Lead) => {
      const targetClass = targetLead.className;
      const targetSchool = targetLead.schoolId;

      // If student doesn't have a class, behave like a normal checkbox
      if (!targetClass) {
          const newSelection = new Set(selectedLeadIds);
          if (newSelection.has(targetLead.id)) newSelection.delete(targetLead.id);
          else newSelection.add(targetLead.id);
          setSelectedLeadIds(newSelection);
          return;
      }

      // Find all leads in the current view that match the same class and school
      const relatedLeads = completedLeads.filter(l => 
          l.className === targetClass && l.schoolId === targetSchool
      );
      
      const relatedIds = relatedLeads.map(l => l.id);
      const newSelection = new Set(selectedLeadIds);
      
      // Determine if we are selecting or deselecting based on the clicked item state
      // If the target is currently checked, we assume intent to uncheck group.
      const isTargetChecked = newSelection.has(targetLead.id);

      if (isTargetChecked) {
          // Deselect the group
          relatedIds.forEach(id => newSelection.delete(id));
      } else {
          // Select the group
          relatedIds.forEach(id => newSelection.add(id));
      }
      
      setSelectedLeadIds(newSelection);
  };

  const handleSelectAll = () => {
      if (selectedLeadIds.size === completedLeads.length) {
          setSelectedLeadIds(new Set());
      } else {
          setSelectedLeadIds(new Set(completedLeads.map(l => l.id)));
      }
  };

  const handleBulkAllocateConfirm = async (className: string) => {
      try {
        await onBulkAllocateStudents(Array.from(selectedLeadIds), className);
      } catch (error) {
        console.error("Erro na alocação em massa:", error);
        alert("Ocorreu um erro ao alocar os alunos. Tente novamente.");
      } finally {
        // Ensure modal closes and selection is cleared regardless of success/failure
        setIsBulkModalOpen(false);
        setSelectedLeadIds(new Set());
      }
  };

  const canBulkAllocate = selectedLeadIds.size > 0;

  return (
    <>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Matrículas</h1>
          <p className="text-gray-600 mt-1">Aloque alunos em suas respectivas turmas ou importe múltiplos alunos de uma só vez.</p>
        </div>

        {/* Import Section */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
             <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <DocumentArrowUpIcon className="w-5 h-5 mr-2 text-teal-600" />
                Importar Alunos (CSV)
             </h2>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                 {user.role === UserRole.SUPER_ADMINISTRADOR && (
                      <div className="w-full md:w-1/3">
                          <label htmlFor="importSchoolId" className="block text-sm font-medium text-gray-700">Escola de Destino</label>
                          <select
                              id="importSchoolId"
                              value={importSchoolId}
                              onChange={handleSchoolChange}
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                          >
                              <option value="">Determinar pelo CSV</option>
                              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                      </div>
                  )}
                  <div className="w-full md:flex-1">
                      <label htmlFor="csv-upload" className="block text-sm font-medium text-gray-700">Selecione o Arquivo</label>
                      <input
                          ref={fileInputRef}
                          type="file"
                          id="csv-upload"
                          accept=".csv"
                          onChange={handleFileImport}
                          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                          disabled={isImporting}
                      />
                  </div>
              </div>
            {isImporting && (
                <div className="mt-4 flex items-center text-sm text-blue-600">
                    <SpinnerIcon className="w-4 h-4 mr-2" />
                    Processando arquivo...
                </div>
            )}
            {importMessage && (
                <div className={`mt-4 p-3 rounded-md text-sm flex items-center ${importMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {importMessage.type === 'success' ? <CheckCircleIcon className="w-5 h-5 mr-2" /> : null}
                    {importMessage.text}
                </div>
            )}
        </div>

        <div className="space-y-12">
          {/* Waiting Allocation Section */}
          <section className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">Aguardando Alocação</h2>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{completedLeads.length}</span>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="search"
                            className="block w-full rounded-md border-gray-300 pl-10 focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-1.5"
                            placeholder="Buscar aluno..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {completedLeads.length > 0 && (
                        <Button onClick={() => setIsBulkModalOpen(true)} disabled={!canBulkAllocate} className="text-xs">
                            Alocar Selecionados ({selectedLeadIds.size})
                        </Button>
                    )}
                </div>
            </div>

            {completedLeads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                        <input 
                            type="checkbox" 
                            checked={selectedLeadIds.size === completedLeads.length && completedLeads.length > 0}
                            onChange={() => handleSelectAll()}
                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                        />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turma</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Escola / CNPJ</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {completedLeads.map((lead) => {
                        const studentSchool = schools.find(s => s.id === lead.schoolId);
                        return (
                            <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedLeadIds.has(lead.id)}
                                        onChange={() => handleToggleSelect(lead)}
                                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            {lead.studentPhotoUrl ? (
                                                <img className="h-10 w-10 rounded-full object-cover" src={lead.studentPhotoUrl} alt="" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                                    {lead.studentName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-bold text-gray-900">{lead.studentName}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{lead.responsibleName}</div>
                                    <div className="text-xs text-gray-500">{lead.responsiblePhone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {lead.className ? (
                                        <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {lead.className}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">Não definida</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{studentSchool?.name || 'N/A'}</div>
                                    {studentSchool?.cnpj && (
                                        <div className="text-xs text-gray-500 font-mono mt-0.5">CNPJ: {studentSchool.cnpj}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Button onClick={() => handleOpenModal(lead)} className="!py-1 !px-3 text-xs">
                                        Alocar
                                    </Button>
                                </td>
                            </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-lg">Nenhum aluno aguardando alocação no momento.</p>
                <p className="text-sm text-gray-400 mt-2">Novas matrículas online ou importações aparecerão aqui.</p>
              </div>
            )}
          </section>

          {/* Allocated Students Section */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-900">Alunos Alocados</h2>
                <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{allocatedLeads.length}</span>
            </div>
             {allocatedLeads.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {allocatedLeads.map(lead => {
                  const studentSchool = schools.find(s => s.id === lead.schoolId);
                  return (
                    <AllocatedStudentCard 
                      key={lead.id} 
                      lead={lead} 
                      school={studentSchool}
                      onPrintEnrollmentForm={onPrintEnrollmentForm}
                      onPrintStudentFile={onPrintStudentFile}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-dashed border-gray-300 p-12 text-center">
                <p className="text-gray-500">Nenhum aluno alocado ainda.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {selectedLead && (
        <AllocationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmAllocation}
          lead={selectedLead}
          classes={classes}
          discountConfig={discountConfig}
        />
      )}

      <BulkAllocationModal
         isOpen={isBulkModalOpen}
         onClose={() => setIsBulkModalOpen(false)}
         onConfirm={handleBulkAllocateConfirm}
         classes={availableClassesForBulk}
         count={selectedLeadIds.size}
         initialClass={commonSuggestedClass}
      />
    </>
  );
};
