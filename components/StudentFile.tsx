import React from 'react';
import { Lead, Observation, School } from '../types';
import { SchoolLogoIcon } from './icons/SchoolLogoIcon';
import { UserIcon } from './icons/UserIcon';

interface StudentFileProps {
  student: Lead;
  observations: Observation[];
  school?: School;
}

export const StudentFile: React.FC<StudentFileProps> = ({ student, observations, school }) => {
  return (
    <div className="font-serif">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b mb-8">
            <div className="flex items-center gap-4">
                {school?.logoUrl ? (
                    <img src={school.logoUrl} alt="Logo da Escola" className="w-16 h-16 object-contain" />
                ) : (
                    <SchoolLogoIcon className="w-16 h-16" />
                )}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{school?.name || 'Escola Aprender Mais'}</h1>
                    <p className="text-lg text-gray-600">Ficha Acadêmica do Aluno</p>
                    {school && (
                        <div className="text-xs text-gray-500 mt-1">
                            <p>{school.address}</p>
                            <p>CNPJ: {school.cnpj} {school.phone && ` | Tel: ${school.phone}`} {school.email && ` | Email: ${school.email}`}</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-500">Data de Emissão:</p>
                <p className="text-md font-semibold">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
        </div>

        {/* Student Info */}
        <section className="mb-8">
            <h2 className="text-2xl font-bold text-teal-700 border-b-2 border-teal-200 pb-2 mb-4">Dados do Aluno</h2>
            <div className="flex items-start gap-8">
                <div className="flex-shrink-0">
                  {student.studentPhotoUrl ? (
                    <img src={student.studentPhotoUrl} alt={student.studentName} className="h-32 w-32 rounded-lg object-cover border-4 border-white shadow-md" />
                  ) : (
                    <div className="h-32 w-32 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed">
                      <UserIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 flex-1">
                    <div className="col-span-2">
                        <p className="text-sm text-gray-500">Nome Completo</p>
                        <p className="text-lg font-semibold">{student.studentName}</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-500">Data de Nascimento</p>
                        <p className="text-lg font-semibold">{student.studentBirthDate || 'N/A'}</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-500">Turma Designada</p>
                        <p className="text-lg font-semibold text-indigo-600">{student.className}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Responsável</p>
                        <p className="text-lg font-semibold">{student.responsibleName}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-sm text-gray-500">Endereço do Responsável</p>
                        <p className="text-md">
                            {student.responsibleAddress}, Nº {student.responsibleAddressNumber}
                            {student.responsibleAddressComplement && `, ${student.responsibleAddressComplement}`}
                        </p>
                        <p className="text-md text-gray-700">
                            {student.responsibleDistrict && `${student.responsibleDistrict} - `} 
                            {student.responsibleCity && `${student.responsibleCity} - `} 
                            {student.responsibleState}
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* Pedagogical Observations */}
        {observations && observations.length > 0 && (
            <section className="mb-8">
                <h2 className="text-2xl font-bold text-teal-700 border-b-2 border-teal-200 pb-2 mb-4">Observações Pedagógicas</h2>
                <div className="space-y-4">
                    {observations.map(obs => (
                        <div key={obs.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                            <p className="text-md text-gray-800 whitespace-pre-wrap">{obs.text}</p>
                            <p className="text-xs text-gray-500 mt-2 text-right">
                                Registrado por {obs.authorName} em {new Date(obs.createdAt).toLocaleString('pt-BR')}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        )}
        
        {/* Signature */}
        <footer className="mt-24 pt-8">
            <div className="grid grid-cols-2 gap-8">
                 <div className="border-t-2 border-gray-400 text-center pt-2">
                    <p className="text-md font-semibold">{/* Nome do Coordenador(a) */}</p>
                    <p className="text-sm text-gray-600">(Assinatura da Coordenação)</p>
                </div>
                <div className="border-t-2 border-gray-400 text-center pt-2">
                    <p className="text-md font-semibold">{student.responsibleName}</p>
                    <p className="text-sm text-gray-600">(Assinatura do Responsável)</p>
                </div>
            </div>
        </footer>
    </div>
  );
};