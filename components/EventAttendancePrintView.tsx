
import React from 'react';
import { Lead } from '../types';
import { SchoolLogoIcon } from './icons/SchoolLogoIcon';

interface EventAttendancePrintViewProps {
  data: {
    eventName: string;
    eventDate: string;
    classes: {
      name: string;
      students: Lead[];
    }[];
    schoolName?: string;
  };
}

export const EventAttendancePrintView: React.FC<EventAttendancePrintViewProps> = ({ data }) => {
  const { eventName, eventDate, classes, schoolName } = data;

  return (
    <div className="font-serif w-full">
      <header className="flex items-center justify-between pb-4 border-b-2 border-gray-800 mb-6">
        <div className="flex items-center gap-4">
          <SchoolLogoIcon className="w-12 h-12" />
          <div>
            <h1 className="text-lg font-bold text-gray-900 uppercase">{schoolName || 'Escola'}</h1>
            <p className="text-sm text-gray-700">Lista de Presença - Evento Escolar</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-md font-bold text-gray-900">{eventName}</p>
          <p className="text-sm text-gray-700 font-medium">
            {new Date(eventDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
          </p>
        </div>
      </header>

      {classes.map((cls, index) => (
        <div key={index} className="mb-8 break-inside-avoid">
          <div className="bg-gray-200 p-1.5 border border-gray-400 font-bold text-center mb-0 uppercase tracking-wide text-sm text-black">
            Turma: {cls.name}
          </div>
          <table className="w-full border-collapse border border-gray-400 text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-1.5 w-10 text-center font-bold text-black">Nº</th>
                <th className="border border-gray-400 p-1.5 text-left font-bold text-black">Nome do Aluno</th>
                <th className="border border-gray-400 p-1.5 w-32 text-center font-bold text-black">Assinatura / Visto</th>
              </tr>
            </thead>
            <tbody>
              {cls.students.length > 0 ? (
                cls.students
                  .sort((a, b) => a.studentName.localeCompare(b.studentName))
                  .map((student, idx) => (
                    <tr key={student.id}>
                      <td className="border border-gray-400 p-1.5 text-center">{idx + 1}</td>
                      <td className="border border-gray-400 p-1.5 uppercase font-medium">{student.studentName}</td>
                      <td className="border border-gray-400 p-1.5 text-center">
                        
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={3} className="border border-gray-400 p-4 text-center italic text-gray-600">
                    Nenhum aluno alocado nesta turma para este evento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="mt-2 flex justify-between text-[10px] text-gray-600 mb-6 pb-2">
             <span className="font-semibold">Responsável: ____________________________________</span>
             <span className="font-semibold">Total Presentes: _____ / {cls.students.length}</span>
          </div>
        </div>
      ))}

      <footer className="fixed bottom-0 left-0 w-full text-center text-[8px] text-gray-400 pb-2">
        <p>Documento gerado automaticamente pelo sistema de gestão escolar.</p>
      </footer>
    </div>
  );
};
