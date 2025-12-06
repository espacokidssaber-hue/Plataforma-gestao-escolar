

import React, { useState, useMemo } from 'react';
import { type Lead, type Observation, type User } from '../types';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { UserIcon } from './icons/UserIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { PlusIcon } from './icons/PlusIcon';

interface AcademicPageProps {
  user: User;
  students: Lead[];
  observations: Observation[];
  onAddNewObservation: (studentId: string, text: string) => Promise<void>;
}

export const AcademicPage: React.FC<AcademicPageProps> = ({ user, students, observations, onAddNewObservation }) => {
  const [selectedClass, setSelectedClass] = useState('all');
  const [studentForObservation, setStudentForObservation] = useState<Lead | null>(null);
  const [studentForHistory, setStudentForHistory] = useState<Lead | null>(null);
  const [newObservationText, setNewObservationText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredStudents = useMemo(() => {
    if (selectedClass === 'all') {
      return students;
    }
    return students.filter(s => s.className === selectedClass);
  }, [students, selectedClass]);
  
  const studentObservations = useMemo(() => {
      if (!studentForHistory) return [];
      return observations
        .filter(obs => obs.studentId === studentForHistory.id)
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [observations, studentForHistory]);
  
  const uniqueClasses = useMemo(() => {
      return [...new Set(students.map(s => s.className).filter(Boolean) as string[])].sort();
  }, [students]);

  const handleOpenObservationModal = (student: Lead) => {
    setStudentForObservation(student);
    setNewObservationText('');
  };
  
  const handleCloseObservationModal = () => {
    setStudentForObservation(null);
  };
  
  const handleSaveObservation = async () => {
    if (!studentForObservation || !newObservationText.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAddNewObservation(studentForObservation.id, newObservationText);
      handleCloseObservationModal();
    } catch (error) {
      console.error("Failed to save observation", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenHistoryModal = (student: Lead) => {
    setStudentForHistory(student);
  };

  const handleCloseHistoryModal = () => {
    setStudentForHistory(null);
  };
  
  return (
    <>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Visão Geral Acadêmica</h1>
          <p className="text-gray-600 mt-1">Acompanhe os alunos e registre observações pedagógicas.</p>
        </div>

        <div>
            <div className="mb-4">
                <label htmlFor="class-filter" className="block text-sm font-medium text-gray-700">Filtrar por Turma</label>
                <select
                    id="class-filter"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="mt-1 block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                >
                    <option value="all">Todas as Turmas</option>
                    {uniqueClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.length > 0 ? filteredStudents.map(student => (
                     <div key={student.id} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-teal-500">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                                {student.studentPhotoUrl ? (
                                    <img className="h-12 w-12 rounded-full object-cover" src={student.studentPhotoUrl} alt={student.studentName} />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                        <UserIcon className="h-7 w-7 text-gray-500" />
                                    </div>
                                )}
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-bold text-gray-900">{student.studentName}</p>
                                <p className="text-xs text-gray-500">{student.className}</p>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                            <Button variant="secondary" onClick={() => handleOpenHistoryModal(student)}>
                                Ver Histórico
                            </Button>
                            <Button onClick={() => handleOpenObservationModal(student)}>
                                <PlusIcon className="w-4 h-4 mr-1" />
                                Observação
                            </Button>
                        </div>
                    </div>
                )) : <p className="text-gray-500 md:col-span-2 lg:col-span-3">Nenhum aluno encontrado para a turma selecionada.</p>}
            </div>
        </div>
      </div>
      
      {studentForObservation && (
        <Modal isOpen={!!studentForObservation} onClose={handleCloseObservationModal} title={`Nova Observação para ${studentForObservation.studentName}`}>
            <div>
                <label htmlFor="observation-text" className="block text-sm font-medium text-gray-700">
                    Observação Pedagógica
                </label>
                <textarea
                    id="observation-text"
                    rows={8}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    value={newObservationText}
                    onChange={(e) => setNewObservationText(e.target.value)}
                    placeholder="Descreva aqui o comportamento, desenvolvimento ou interações do aluno..."
                />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
                <Button variant="secondary" onClick={handleCloseObservationModal}>Cancelar</Button>
                <Button onClick={handleSaveObservation} disabled={isSubmitting || !newObservationText.trim()}>
                    {isSubmitting ? <SpinnerIcon className="w-5 h-5"/> : 'Salvar Observação'}
                </Button>
            </div>
        </Modal>
      )}

      {studentForHistory && (
          <Modal isOpen={!!studentForHistory} onClose={handleCloseHistoryModal} title={`Histórico de ${studentForHistory.studentName}`}>
              {studentObservations.length > 0 ? (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                      {studentObservations.map(obs => (
                          <div key={obs.id} className="bg-gray-50 p-3 rounded-md border">
                              <p className="text-sm text-gray-800 whitespace-pre-wrap">{obs.text}</p>
                              <p className="text-xs text-gray-500 mt-2 text-right">
                                  Por {obs.authorName} em {new Date(obs.createdAt).toLocaleString('pt-BR')}
                              </p>
                          </div>
                      ))}
                  </div>
              ) : (
                  <p className="text-center text-gray-600 py-8">Nenhuma observação registrada para este aluno.</p>
              )}
               <div className="mt-6 flex justify-end">
                <Button variant="secondary" onClick={handleCloseHistoryModal}>Fechar</Button>
              </div>
          </Modal>
      )}
    </>
  );
};