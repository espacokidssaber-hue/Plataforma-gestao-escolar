import React, { useMemo } from 'react';
import { PrintDiaryData, AllCalendarEvents, StudentAcademicRecord, Subject as SubjectType, ClassLogEntry, ClassPeriod, MORNING_TIME_SLOTS, AFTERNOON_TIME_SLOTS, DAYS_OF_WEEK } from '../../types';
import { MOCK_CLASSES } from '../../data/classesData';
import { MOCK_SCHEDULES_INITIAL_STATE } from '../../data/schedulesData';

const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const Page: React.FC<{ children: React.ReactNode, schoolName: string, pageTitle: string }> = ({ children, schoolName, pageTitle }) => (
    <div className="diary-page">
        <header className="page-header">
            <h2 className="text-lg font-bold">{schoolName}</h2>
            <h3 className="text-base">{pageTitle}</h3>
        </header>
        <main className="flex-grow">
            {children}
        </main>
        <footer className="page-footer">
            <p>{schoolName}</p>
        </footer>
    </div>
);

interface AttendancePageProps {
    students: { name: string }[];
    month: number;
    year: number;
    calendarEvents: AllCalendarEvents;
}

const AttendancePage: React.FC<AttendancePageProps> = ({ students, month, year, calendarEvents }) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = MONTH_NAMES[month];
    const eventsForCurrentMonth = calendarEvents[`${year}-${month}`] || {};

    const nonSchoolDaysMap = useMemo(() => {
        const map = new Map<number, { isNonSchool: boolean, label: string }>();
        const eventEntries = Object.entries(eventsForCurrentMonth) as [string, { type: string, label: string }[]][];

        // Logic to handle date ranges, like "Início do Recesso" to "Fim do Recesso"
        const recessStartEntry = eventEntries.find(([, events]) => (events as { label: string }[]).some(e => e.label.toLowerCase().includes('início do recesso')));
        const recessEndEntry = eventEntries.find(([, events]) => (events as { label: string }[]).some(e => e.label.toLowerCase().includes('fim do recesso')));

        if (recessStartEntry && recessEndEntry) {
            const startDay = parseInt(recessStartEntry[0], 10);
            const endDay = parseInt(recessEndEntry[0], 10);
            if (!isNaN(startDay) && !isNaN(endDay)) {
                for (let day = startDay; day <= endDay; day++) {
                    map.set(day, { isNonSchool: true, label: 'Recesso Escolar' });
                }
            }
        }
        
        // Logic for single-day holidays and specific non-school "other" events
        for (const [dayStr, dayEvents] of eventEntries) {
            const day = parseInt(dayStr, 10);
            if (map.has(day)) continue; // Already handled by range logic

            const nonSchoolEvent = (dayEvents as { type: string, label: string }[]).find(e =>
                e.type === 'holiday' ||
                (e.type === 'other' && (
                    e.label.toLowerCase().includes('conselho de classe') ||
                    e.label.toLowerCase().includes('reunião pedagógica') ||
                    e.label.toLowerCase().includes('não haverá aula')
                ))
            );

            if (nonSchoolEvent) {
                map.set(day, { isNonSchool: true, label: nonSchoolEvent.label });
            }
        }
        return map;
    }, [eventsForCurrentMonth]);

    const getDayInfo = (day: number) => {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay(); // 0 for Sunday, 6 for Saturday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        const eventInfo = nonSchoolDaysMap.get(day);
        const isEventDay = eventInfo?.isNonSchool || false;

        return {
            isNonSchoolDay: isWeekend || isEventDay,
            holidayName: eventInfo?.label || (isWeekend ? (dayOfWeek === 0 ? 'Domingo' : 'Sábado') : undefined)
        };
    };

    return (
        <>
            <h4 className="text-center font-bold mb-2">Registro de Frequência - {monthName} / {year}</h4>
            <table className="w-full border-collapse text-xs">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-1 border border-gray-400 w-8">Nº</th>
                        <th className="p-1 border border-gray-400 w-1/3">Nome do Aluno</th>
                        {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const { isNonSchoolDay, holidayName } = getDayInfo(day);
                            return (
                                <th 
                                    key={day} 
                                    className={`p-1 border border-gray-400 w-6 h-6 ${isNonSchoolDay ? 'non-school-day' : ''}`}
                                    title={holidayName}
                                >
                                    {day}
                                </th>
                            );
                        })}
                        <th className="p-1 border border-gray-400 w-12">Total Faltas</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student, index) => (
                        <tr key={student.name}>
                            <td className="p-1 border border-gray-400 text-center">{index + 1}</td>
                            <td className="p-1 border border-gray-400">{student.name}</td>
                            {Array.from({ length: daysInMonth }, (_, i) => {
                                const day = i + 1;
                                const { isNonSchoolDay } = getDayInfo(day);
                                return (
                                    <td 
                                        key={i} 
                                        className={`p-1 border border-gray-400 h-6 ${isNonSchoolDay ? 'non-school-day' : ''}`}
                                    ></td>
                                );
                            })}
                            <td className="p-1 border border-gray-400"></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

interface GradesPageProps {
    students: { name: string; id: number }[];
    subjects: SubjectType[];
    academicRecords: StudentAcademicRecord[];
}

const GradesPage: React.FC<GradesPageProps> = ({ students, subjects, academicRecords }) => {
    const getAssessmentsForSubject = (subjectName: string): string[] => {
        const configuredSubject = subjects.find(s => s.name === subjectName);
        if (configuredSubject && configuredSubject.assessments.length > 0) {
            return configuredSubject.assessments.map(a => a.name);
        }
        const assessmentNames = new Set<string>();
        academicRecords.forEach(record => {
            if (record.grades[subjectName]) {
                Object.keys(record.grades[subjectName]).forEach(assName => assessmentNames.add(assName));
            }
        });
        return Array.from(assessmentNames);
    };

    const subjectsWithGrades = subjects.filter(s =>
        academicRecords.some(ar => ar.grades[s.name] && Object.keys(ar.grades[s.name]).length > 0)
    );

    return (
        <>
            <h4 className="text-center font-bold mb-2">Registro de Avaliações</h4>
            {subjectsWithGrades.map(subject => {
                const assessments = getAssessmentsForSubject(subject.name);
                if (assessments.length === 0) return null;

                return (
                    <div key={subject.id} className="mb-4 print-avoid-break" style={{ breakInside: 'avoid' }}>
                        <table className="w-full border-collapse text-xs">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th colSpan={assessments.length + 2} className="p-1 border border-gray-400 font-bold text-base">{subject.name}</th>
                                </tr>
                                <tr className="bg-gray-100">
                                    <th className="p-1 border border-gray-400 w-1/3">Nome do Aluno</th>
                                    {assessments.map(ass => <th key={ass} className="p-1 border border-gray-400">{ass}</th>)}
                                    <th className="p-1 border border-gray-400 w-16">Média</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => {
                                    const studentRecord = academicRecords.find(ar => ar.studentId === student.id);
                                    const grades = studentRecord?.grades[subject.name] || {};
                                    const numericGrades = Object.values(grades).filter(g => typeof g === 'number') as number[];
                                    const average = numericGrades.length > 0
                                        ? (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(1)
                                        : '-';

                                    return (
                                        <tr key={student.id}>
                                            <td className="p-1 border border-gray-400">{student.name}</td>
                                            {assessments.map(ass => (
                                                <td key={ass} className="p-1 border border-gray-400 text-center">
                                                    {(grades[ass] as number)?.toFixed(1) ?? ''}
                                                </td>
                                            ))}
                                            <td className="p-1 border border-gray-400 text-center font-bold">{average}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                );
            })}
        </>
    );
};

interface LessonLogPageProps {
    classId: number;
    classLogs: ClassLogEntry[];
    month: number;
    year: number;
    calendarEvents: AllCalendarEvents;
}

const LessonLogPage: React.FC<LessonLogPageProps> = ({ classId, classLogs, month, year, calendarEvents }) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const eventsForCurrentMonth = calendarEvents[`${year}-${month}`] || {};
    
    const classInfo = MOCK_CLASSES.find(c => c.id === classId);
    const timeSlots = classInfo?.period === ClassPeriod.MORNING ? MORNING_TIME_SLOTS : AFTERNOON_TIME_SLOTS;
    const classSchedule = MOCK_SCHEDULES_INITIAL_STATE[classId];

    const schoolDays = useMemo(() => {
        const days = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const dayEvents = eventsForCurrentMonth[day] || [];
            const isHoliday = dayEvents.some((e: any) => e.type === 'holiday');

            if (!isWeekend && !isHoliday) {
                days.push(day);
            }
        }
        return days;
    }, [daysInMonth, year, month, eventsForCurrentMonth]);

    const logsByDateAndSubject = useMemo(() => {
        const map = new Map<string, Map<string, string>>();
        classLogs.forEach(log => {
            if (!map.has(log.date)) {
                map.set(log.date, new Map<string, string>());
            }
            map.get(log.date)!.set(log.subject, log.content);
        });
        return map;
    }, [classLogs]);

    const dayIndexToName = (index: number): string => {
        if (index > 0 && index < 6) return DAYS_OF_WEEK[index - 1];
        return index === 0 ? 'Domingo' : 'Sábado';
    };

    return (
        <>
            <h4 className="text-center font-bold mb-2">Registro de Aulas Ministradas</h4>
            <table className="w-full border-collapse text-xs" style={{ tableLayout: 'fixed' }}>
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-1 border border-gray-400 w-16">Data</th>
                        <th className="p-1 border border-gray-400 w-20">Horário</th>
                        <th className="p-1 border border-gray-400 w-28">Disciplina</th>
                        <th className="p-1 border border-gray-400">Conteúdo Ministrado e Atividades Realizadas</th>
                    </tr>
                </thead>
                <tbody>
                    {schoolDays.map(day => {
                        const date = new Date(year, month, day);
                        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const dayOfWeekName = dayIndexToName(date.getDay());
                        
                        const dailySchedule = classSchedule?.[dayOfWeekName] || {};
                        const scheduledSlots = timeSlots.filter(slot => !slot.isBreak && dailySchedule[slot.start]);

                        if (scheduledSlots.length === 0) {
                            return (
                                <tr key={day}>
                                    <td className="p-1 border border-gray-400 text-center h-16">{date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</td>
                                    <td colSpan={3} className="p-1 border border-gray-400 text-center text-gray-500">Nenhuma aula programada.</td>
                                </tr>
                            );
                        }

                        return scheduledSlots.map((slot, index) => {
                            const subjectName = dailySchedule[slot.start].subject;
                            const content = logsByDateAndSubject.get(dateKey)?.get(subjectName) || '';
                            
                            return (
                                <tr key={`${day}-${slot.start}`}>
                                    {index === 0 ? (
                                        <td rowSpan={scheduledSlots.length} className="p-1 border border-gray-400 align-top text-center">
                                            {date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                        </td>
                                    ) : null}
                                    <td className="p-1 border border-gray-400 text-center font-mono text-[9px] align-top">{slot.start}-{slot.end}</td>
                                    <td className="p-1 border border-gray-400 align-top font-semibold">{subjectName}</td>
                                    <td className="p-1 border border-gray-400 align-top">
                                        <div className="lined-paper h-full w-full min-h-[4rem] whitespace-pre-wrap">{content}</div>
                                    </td>
                                </tr>
                            );
                        });
                    })}
                </tbody>
            </table>
        </>
    );
};

const CalendarPage: React.FC<{ year: number }> = ({ year }) => (
    <>
        <h4 className="text-center font-bold mb-2">Calendário Escolar - {year}</h4>
        <div className="grid grid-cols-3 gap-4">
            {MONTH_NAMES.map((monthName, monthIndex) => {
                 const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
                 const startDay = new Date(year, monthIndex, 1).getDay();
                 const days = Array(startDay).fill(null).concat(Array.from({length: daysInMonth}, (_, i) => i + 1));
                return (
                    <div key={monthName} className="border border-gray-400 p-1">
                        <h5 className="text-center font-bold text-xs">{monthName}</h5>
                        <div className="grid grid-cols-7 text-center text-[8px] font-bold">
                           <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
                        </div>
                         <div className="grid grid-cols-7 text-center text-[8px]">
                            {days.map((day, i) => <div key={i}>{day}</div>)}
                        </div>
                    </div>
                )
            })}
        </div>
    </>
);


const PrintableDiary: React.FC<PrintDiaryData> = ({ schoolInfo, classInfo, students, config, calendarEvents, classLogs, subjects, academicRecords }) => {
    const coverPageTitle = `Diário de Classe - ${config.year}`;
    const containerClass = `printable-diary ${config.includeAttendance ? 'print-landscape' : 'print-portrait'}`;

    return (
        <div className={containerClass}>
            {/* Capa */}
            <div className="diary-page" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <h1 className="text-4xl font-bold">{schoolInfo.name}</h1>
                <h2 className="text-3xl mt-8">{coverPageTitle}</h2>
                <div className="mt-20 text-lg">
                    <p><span className="font-bold">Turma:</span> {classInfo.name}</p>
                    <p><span className="font-bold">Professor(a):</span> {config.teacherName}</p>
                </div>
            </div>

            {/* Frequência */}
            {config.includeAttendance && (
                <Page schoolName={schoolInfo.name} pageTitle={coverPageTitle}>
                    <AttendancePage students={students} month={config.month} year={config.year} calendarEvents={calendarEvents} />
                </Page>
            )}

            {/* Notas */}
            {config.includeGrades && (
                 <Page schoolName={schoolInfo.name} pageTitle={coverPageTitle}>
                    <GradesPage students={students} subjects={subjects} academicRecords={academicRecords} />
                </Page>
            )}

            {/* Registro de Aulas */}
            {config.includeLessonLog && (
                <Page schoolName={schoolInfo.name} pageTitle={coverPageTitle}>
                    <LessonLogPage 
                        classId={classInfo.id}
                        classLogs={classLogs} 
                        month={config.month} 
                        year={config.year} 
                        calendarEvents={calendarEvents} 
                    />
                </Page>
            )}

            {/* Calendário */}
            {config.includeCalendar && (
                <Page schoolName={schoolInfo.name} pageTitle={coverPageTitle}>
                    <CalendarPage year={config.year} />
                </Page>
            )}
        </div>
    );
};

export default PrintableDiary;