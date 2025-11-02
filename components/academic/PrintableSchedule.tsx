import React, { useLayoutEffect } from 'react';
import { PrintData, DAYS_OF_WEEK } from '../../types';

interface PrintableScheduleProps extends PrintData {
    onRendered: () => void;
}

const PrintableSchedule: React.FC<PrintableScheduleProps> = (props) => {
    const { type, title, schedules, educators, classes, timeSlots, allTimeSlots, onRendered } = props;

    useLayoutEffect(() => {
        const animationFrameId = requestAnimationFrame(() => {
            onRendered();
        });

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [onRendered]);

    const getEducatorName = (id: number) => educators.find(e => e.id === id)?.name || 'N/A';

    const renderClassOrEducatorSchedule = () => {
        const scheduleId = type === 'class' ? classes[0]?.id : Object.keys(schedules)[0];
        const scheduleData = schedules[scheduleId as any];

        if (!scheduleData) return null;

        return (
            <table className="w-full border-collapse text-xs">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-1 border border-gray-300 w-24">Horário</th>
                        {DAYS_OF_WEEK.map(day => <th key={day} className="p-1 border border-gray-300">{day}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {timeSlots.map(slot => (
                        <tr key={slot.start}>
                            <td className="p-1 border border-gray-300 text-center font-mono">{slot.start} - {slot.end}</td>
                            {slot.isBreak ? (
                                <td colSpan={5} className="p-1 border border-gray-300 text-center font-semibold bg-gray-100">{slot.label}</td>
                            ) : (
                                DAYS_OF_WEEK.map(day => {
                                    const entry = scheduleData[day]?.[slot.start];
                                    return (
                                        <td key={day} className="p-1 border border-gray-300 align-top">
                                            {entry ? (
                                                <div>
                                                    <p className="font-bold">{entry.subject}</p>
                                                    <p className="text-gray-600">{type === 'class' ? getEducatorName(entry.educatorId) : (entry as any).className}</p>
                                                </div>
                                            ) : null}
                                        </td>
                                    );
                                })
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const renderGeneralSchedule = () => {
        if (!allTimeSlots) return null;
        return DAYS_OF_WEEK.map(day => (
            <div key={day} className="mb-8" style={{ pageBreakInside: 'avoid' }}>
                <h3 className="text-xl font-bold mb-2">{day}</h3>
                <table className="w-full border-collapse text-xs">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-1 border border-gray-300 w-24">Horário</th>
                            {classes.map(c => <th key={c.id} className="p-1 border border-gray-300">{c.name}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {allTimeSlots.map(slot => (
                            <tr key={slot.start}>
                                <td className="p-1 border border-gray-300 text-center font-mono">{slot.start} - {slot.end}</td>
                                {slot.isBreak ? (
                                    <td colSpan={classes.length} className="p-1 border border-gray-300 text-center font-semibold bg-gray-100">{slot.label}</td>
                                ) : (
                                    classes.map(c => {
                                        const entry = schedules[c.id]?.[day]?.[slot.start];
                                        return (
                                            <td key={c.id} className="p-1 border border-gray-300 align-top">
                                                {entry ? (
                                                    <div>
                                                        <p className="font-bold">{entry.subject}</p>
                                                        <p className="text-gray-600">{getEducatorName(entry.educatorId)}</p>
                                                    </div>
                                                ) : null}
                                            </td>
                                        );
                                    })
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ));
    };

    return (
        <div id="printable-schedule-content" className="p-4 bg-white text-black">
            <header className="mb-4 text-center">
                <h1 className="text-2xl font-bold">Plataforma de Gestão Escolar</h1>
                <h2 className="text-lg">{title}</h2>
                <p className="text-sm text-gray-500">Gerado em: {new Date().toLocaleString('pt-BR')}</p>
            </header>
            <main>
                {type === 'general' ? renderGeneralSchedule() : renderClassOrEducatorSchedule()}
            </main>
        </div>
    );
};

export default PrintableSchedule;