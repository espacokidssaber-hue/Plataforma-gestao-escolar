import React from 'react';
import { Lead, School } from '../types';
import { SchoolLogoIcon } from './icons/SchoolLogoIcon';
import { UserIcon } from './icons/UserIcon';

interface EnrollmentFormProps {
  student: Lead;
  school?: School;
}

export const EnrollmentForm: React.FC<EnrollmentFormProps> = ({ student, school }) => {

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const calculateFinalFee = () => {
    if (student.monthlyFee === undefined || student.discountPercentage === undefined) return student.monthlyFee;
    return student.monthlyFee * (1 - student.discountPercentage / 100);
  };

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
                    <p className="text-lg text-gray-600">Ficha de Matrícula - Ano Letivo {new Date().getFullYear()}</p>
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
                </div>
            </div>
        </section>

        {/* Responsible Info */}
        <section className="mb-8">
            <h2 className="text-2xl font-bold text-teal-700 border-b-2 border-teal-200 pb-2 mb-4">Dados do Responsável</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                 <div>
                    <p className="text-sm text-gray-500">Nome Completo</p>
                    <p className="text-lg font-semibold">{student.responsibleName}</p>
                </div>
                 <div>
                    <p className="text-sm text-gray-500">CPF</p>
                    <p className="text-lg font-semibold">{student.responsibleCPF}</p>
                </div>
                <div className="col-span-2">
                    <p className="text-sm text-gray-500">E-mail</p>
                    <p className="text-lg font-semibold">{student.responsibleEmail}</p>
                </div>
                <div className="col-span-2">
                    <p className="text-sm text-gray-500">Telefone / WhatsApp</p>
                    <p className="text-lg font-semibold">{student.responsiblePhone}</p>
                </div>
                <div className="col-span-2">
                     <p className="text-sm text-gray-500">Endereço Completo</p>
                     <p className="text-lg font-semibold">
                         {student.responsibleAddress}, Nº {student.responsibleAddressNumber}
                         {student.responsibleAddressComplement && `, ${student.responsibleAddressComplement}`}
                     </p>
                     <p className="text-md text-gray-700">
                        {student.responsibleDistrict && `${student.responsibleDistrict} - `} 
                        {student.responsibleCity && `${student.responsibleCity} - `} 
                        {student.responsibleState}
                     </p>
                     <p className="text-md text-gray-700">CEP: {student.responsibleCEP}</p>
                </div>
            </div>
        </section>

         {/* Additional Info */}
        <section className="mb-8">
            <h2 className="text-2xl font-bold text-teal-700 border-b-2 border-teal-200 pb-2 mb-4">Informações Adicionais</h2>
             <div className="space-y-4">
                <div>
                    <p className="text-sm font-semibold text-gray-600">Restrições Alimentares:</p>
                    <p className="text-md text-gray-800 whitespace-pre-wrap">{student.foodRestrictions || 'Nenhuma informação fornecida.'}</p>
                </div>
                 <div>
                    <p className="text-sm font-semibold text-gray-600">Informações sobre Medicamentos:</p>
                    <p className="text-md text-gray-800 whitespace-pre-wrap">{student.medicationInfo || 'Nenhuma informação fornecida.'}</p>
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-600">Horário de Retirada Padrão:</p>
                    <p className="text-md text-gray-800">{student.pickupTime || 'Não informado.'}</p>
                </div>
                {student.authorizedPickups && student.authorizedPickups.length > 0 && (
                    <div>
                        <p className="text-sm font-semibold text-gray-600">Pessoas Autorizadas a Retirar:</p>
                        <ul className="list-disc list-inside text-md text-gray-800 mt-1">
                            {student.authorizedPickups.map((person, index) => (
                                <li key={index}>{person.name} ({person.kinship})</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </section>

        {/* Financial Info */}
        <section className="mb-8">
            <h2 className="text-2xl font-bold text-teal-700 border-b-2 border-teal-200 pb-2 mb-4">Condições Financeiras</h2>
            <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-500">Valor da Matrícula</p>
                        <p className="text-lg font-bold">{formatCurrency(student.enrollmentFee)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Mensalidade</p>
                        <p className="text-lg font-bold">{formatCurrency(calculateFinalFee())}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Desconto Aplicado</p>
                        <p className="text-lg font-bold text-green-600">{student.discountPercentage || 0}%</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Signature */}
        <footer className="mt-24 pt-8">
            <div className="grid grid-cols-2 gap-16">
                 <div className="border-t-2 border-gray-400 text-center pt-2">
                    <p className="text-md font-semibold">Secretaria Escolar</p>
                    <p className="text-sm text-gray-600">(Assinatura da Escola)</p>
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