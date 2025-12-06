
import React, { useState, useMemo } from 'react';
import { Lead, LeadStatus, User, UserRole, School } from '../types';
import { UserIcon } from './icons/UserIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { AllocatedStudentCard } from './AllocatedStudentCard';

interface StudentsPageProps {
  user: User;
  leads: Lead[];
  schools: School[];
  onPrintEnrollmentForm: (student: Lead) => void;
  onPrintStudentFile: (student: Lead) => void;
  superAdminSchoolFilter: string;
}

export const StudentsPage: React.FC<StudentsPageProps> = ({ user, leads, schools, onPrintEnrollmentForm, onPrintStudentFile, superAdminSchoolFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const allocatedStudents = useMemo(() => {
    const baseList = leads.filter(lead => lead.status === LeadStatus.ALLOCATED);
    if (user.role === UserRole.SUPER_ADMINISTRADOR && superAdminSchoolFilter && superAdminSchoolFilter !== 'all') {
        return baseList.filter(lead => lead.schoolId === superAdminSchoolFilter);
    }
    return baseList;
  }, [leads, user.role, superAdminSchoolFilter]);


  const filteredStudents = allocatedStudents.filter(student =>
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.className && student.className.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Alunos Matriculados</h1>
        <p className="text-gray-600 mt-1">Visualize os alunos alocados em turmas e acesse ações rápidas.</p>
      </div>

      <div className="mb-6">
        <div className="relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="search"
            name="search-student"
            id="search-student"
            className="block w-full max-w-lg rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
            placeholder="Buscar por nome do aluno ou turma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {allocatedStudents.length > 0 ? (
        <div>
          {filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => {
                const studentSchool = schools.find(s => s.id === student.schoolId);
                return (
                  <AllocatedStudentCard 
                    key={student.id} 
                    lead={student} 
                    school={studentSchool}
                    onPrintEnrollmentForm={onPrintEnrollmentForm} 
                    onPrintStudentFile={onPrintStudentFile}
                  />
                );
              })}
            </div>
          ) : (
             <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md">
                <p className="text-sm font-semibold text-gray-700">Nenhum resultado encontrado</p>
                <p className="text-sm text-gray-500">Tente ajustar seus termos de busca.</p>
              </div>
          )}
        </div>
      ) : (
         <div className="text-center py-12 px-6 bg-white rounded-lg shadow-md">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum Aluno Alocado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Vá para a seção de Gestão de Matrículas para alocar alunos em suas turmas.
            </p>
          </div>
      )}

    </div>
  );
};
