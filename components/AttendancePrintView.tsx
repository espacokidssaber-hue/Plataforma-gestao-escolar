import React from 'react';
import { type AttendanceRecord, type Lead, type School, type SchoolClass } from '../types';
import { SchoolLogoIcon } from './icons/SchoolLogoIcon';

interface AttendancePrintViewProps {
  data: {
    student: Lead;
    school?: School;
    classInfo?: SchoolClass;
    startDate: string;
    endDate: string;
    stats: {
        totalDays: number;
        presentDays: number;
        absentDays: number;
        justifiedDays: number;
        percentage: number;
    };
    records: AttendanceRecord[];
  };
}

export const AttendancePrintView: React.FC<AttendancePrintViewProps> = ({ data }) => {
  const { student, school, classInfo, startDate, endDate, stats, records } = data;

  const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const getStatusLabel = (status: string) => {
      switch(status) {
          case 'present': return 'Presente';
          case 'absent': return 'Falta';
          case 'justified': return 'Falta Justificada';
          default: return '-';
      }
  };

  return (
    <div className="font-serif text-black">
      {/* Header */}
      <header className="flex items-center justify-between pb-4 border-b-2 border-gray-800 mb-6">
        <div className="flex items-center gap-4">
          {school?.logoUrl ? (
            <img src={school.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
          ) : (
            <SchoolLogoIcon className="w-16 h-16" />
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900 uppercase">{school?.name || 'Escola'}</h1>
            <p className="text-sm text-gray-700">{school?.address}</p>
            <p className="text-sm text-gray-700">CNPJ: {school?.cnpj}</p>
          </div>
        </div>
        <div className="text-right">
            <h2 className="text-lg font-bold text-gray-900">RELATÓRIO DE FREQUÊNCIA</h2>
            <p className="text-sm text-gray-600">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </header>

      {/* Student Info */}
      <section className="mb-6 border p-4 rounded-sm bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                  <span className="font-bold">Aluno(a):</span> {student.studentName}
              </div>
              <div>
                  <span className="font-bold">Turma:</span> {classInfo?.name || student.className || 'N/A'}
              </div>
              <div>
                  <span className="font-bold">Período:</span> {formatDate(startDate)} a {formatDate(endDate)}
              </div>
              <div>
                  <span className="font-bold">Responsável:</span> {student.responsibleName}
              </div>
          </div>
      </section>

      {/* Stats Summary */}
      <section className="mb-8">
          <h3 className="font-bold text-md mb-2 border-b border-gray-400 pb-1">Resumo Estatístico</h3>
          <div className="grid grid-cols-4 gap-4 text-center border border-gray-300 p-4 rounded-sm">
              <div>
                  <p className="text-xs text-gray-500 uppercase">Dias Letivos</p>
                  <p className="text-xl font-bold">{stats.totalDays}</p>
              </div>
              <div>
                  <p className="text-xs text-gray-500 uppercase">Presenças</p>
                  <p className="text-xl font-bold text-green-700">{stats.presentDays}</p>
              </div>
              <div>
                  <p className="text-xs text-gray-500 uppercase">Faltas</p>
                  <p className="text-xl font-bold text-red-700">{stats.absentDays}</p>
              </div>
              <div>
                  <p className="text-xs text-gray-500 uppercase">Frequência</p>
                  <p className="text-xl font-bold text-blue-700">{stats.percentage.toFixed(1)}%</p>
              </div>
          </div>
      </section>

      {/* Absence Details */}
      <section>
          <h3 className="font-bold text-md mb-2 border-b border-gray-400 pb-1">Detalhamento de Ausências</h3>
          {records.filter(r => r.status !== 'present').length > 0 ? (
              <table className="w-full text-sm border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                      <tr>
                          <th className="border border-gray-300 p-2 text-left w-32">Data</th>
                          <th className="border border-gray-300 p-2 text-left">Situação</th>
                      </tr>
                  </thead>
                  <tbody>
                      {records
                        .filter(r => r.status !== 'present')
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map(record => (
                          <tr key={record.id}>
                              <td className="border border-gray-300 p-2">{formatDate(record.date)}</td>
                              <td className="border border-gray-300 p-2 uppercase text-xs font-semibold">
                                  {getStatusLabel(record.status)}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          ) : (
              <p className="text-sm text-gray-600 italic border p-4 text-center">Nenhuma ausência registrada neste período. Aluno(a) com 100% de frequência.</p>
          )}
      </section>

      <footer className="mt-16 text-center">
            <div className="w-2/3 mx-auto border-t border-black pt-2">
                <p className="text-sm">Assinatura da Coordenação / Direção</p>
            </div>
      </footer>
    </div>
  );
};