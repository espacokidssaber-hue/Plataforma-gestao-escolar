import React, { useLayoutEffect, useMemo } from 'react';
import { SchoolInfo, AllCalendarEvents, StudentAcademicRecord } from '../../types';

const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

interface MonthlyAttendanceTableProps {
  students: { id: number; name: string; attendance: StudentAcademicRecord['attendance'] }[];
  month: number;
  year: number;
  calendarEvents: AllCalendarEvents;
}

const MonthlyAttendanceTable: React.FC<MonthlyAttendanceTableProps> = ({ students, month, year, calendarEvents }) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = MONTH_NAMES[month];
    const eventsForCurrentMonth = calendarEvents[`${year}-${month}`] || {};

    const nonSchoolDays = useMemo(() => {
        const set = new Set<number>();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
                set.add(day);
            }
            const dayEvents = eventsForCurrentMonth[day] || [];
            if (dayEvents.some((e: any) => e.type === 'holiday')) {
                set.add(day);
            }
        }
        return set;
    }, [daysInMonth, year, month, eventsForCurrentMonth]);

    const getStatusAbbreviation = (status: string) => {
        if (status === 'Falta') return 'F';
        if (status === 'Justificado') return 'J';
        return ''; // Presente é célula vazia
    }

    return (
        <>
            <h4 className="text-center font-bold mb-2">{monthName} / {year}</h4>
            <table className="w-full border-collapse text-xs">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-1 border border-gray-400 w-1/3">Nome do Aluno</th>
                        {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            return (
                                <th key={day} className={`p-1 border border-gray-400 w-6 h-6 ${nonSchoolDays.has(day) ? 'non-school-day' : ''}`}>
                                    {day}
                                </th>
                            );
                        })}
                        <th className="p-1 border border-gray-400 w-12">Faltas</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student) => {
                        let totalAbsences = 0;
                        return (
                            <tr key={student.id}>
                                <td className="p-1 border border-gray-400">{student.name}</td>
                                {Array.from({ length: daysInMonth }, (_, i) => {
                                    const day = i + 1;
                                    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                    const status = student.attendance[dateKey] || 'Presente';
                                    if (status === 'Falta' && !nonSchoolDays.has(day)) totalAbsences++;
                                    return (
                                        <td key={i} className={`p-1 border border-gray-400 h-6 text-center font-bold ${nonSchoolDays.has(day) ? 'non-school-day' : ''} ${status === 'Falta' ? 'text-red-600' : 'text-yellow-600'}`}>
                                            {!nonSchoolDays.has(day) ? getStatusAbbreviation(status) : ''}
                                        </td>
                                    );
                                })}
                                <td className="p-1 border border-gray-400 text-center font-bold">{totalAbsences}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </>
    );
};


interface PrintableMonthlyAttendanceProps {
  schoolInfo: SchoolInfo;
  classInfo: { id: number; name: string };
  students: { id: number; name: string; attendance: StudentAcademicRecord['attendance'] }[];
  month: number;
  year: number;
  calendarEvents: AllCalendarEvents;
  onRendered: () => void;
}

const PrintableMonthlyAttendance: React.FC<PrintableMonthlyAttendanceProps> = ({
  schoolInfo,
  classInfo,
  students,
  month,
  year,
  calendarEvents,
  onRendered,
}) => {
    useLayoutEffect(() => {
        const animationFrameId = requestAnimationFrame(() => {
            onRendered();
        });
        return () => cancelAnimationFrame(animationFrameId);
    }, [onRendered]);

    const monthsToRender = month === -1 ? Array.from({ length: 12 }, (_, i) => i) : [month];

    return (
        <div className="printable-diary">
            {monthsToRender.map((monthIndex) => (
                <div className="diary-page" key={monthIndex}>
                    <header className="page-header">
                        <h2 className="text-lg font-bold">{schoolInfo.name}</h2>
                        <h3 className="text-base">Relatório de Frequência - {classInfo.name}</h3>
                    </header>
                    <main className="flex-grow">
                        <MonthlyAttendanceTable
                            students={students}
                            month={monthIndex}
                            year={year}
                            calendarEvents={calendarEvents}
                        />
                    </main>
                    <footer className="page-footer">
                        <p>{schoolInfo.name} - Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
                    </footer>
                </div>
            ))}
        </div>
    );
};

export default PrintableMonthlyAttendance;