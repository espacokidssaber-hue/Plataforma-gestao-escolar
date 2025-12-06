import React from 'react';
import { type Schedule, type ScheduleTimeSlot } from '../types';
import { SchoolLogoIcon } from './icons/SchoolLogoIcon';

const weekDays = {
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
};

export const SchedulePrintView: React.FC<{ schedule: Schedule }> = ({ schedule }) => {
    
    const allSlots = Object.values(schedule.schedule).flat();
    const timeIntervals = [...new Set(
        allSlots
            .filter((s: ScheduleTimeSlot): s is ScheduleTimeSlot => s && typeof s.startTime === 'string' && typeof s.endTime === 'string')
            .map((s: ScheduleTimeSlot) => `${s.startTime} - ${s.endTime}`)
    )].sort((a, b) => {
        const aStart = a.split(' - ')[0];
        const bStart = b.split(' - ')[0];
        if (!aStart || !bStart) return 0;
        return aStart.localeCompare(bStart);
    });

    return (
        <div className="font-sans">
            <header className="flex items-center justify-between pb-4 border-b mb-8">
                <div className="flex items-center gap-4">
                    <SchoolLogoIcon className="w-16 h-16" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Horário Escolar</h1>
                        <p className="text-lg text-gray-600">Ano Letivo {new Date().getFullYear()}</p>
                    </div>
                </div>
            </header>
            
            <section className="mb-6">
                <h2 className="text-xl font-semibold text-center text-teal-800 bg-teal-50 py-2 rounded-md">
                    {schedule.type === 'class' ? 'Horário da Turma' : 'Horário do(a) Educador(a)'}: 
                    <span className="font-bold ml-2">{schedule.name}</span>
                </h2>
            </section>

            {timeIntervals.length > 0 ? (
                <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2 font-semibold w-36">Horário</th>
                            {Object.values(weekDays).map(dayName => (
                                <th key={dayName} className="border border-gray-300 p-2 font-semibold">{dayName}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeIntervals.map(interval => (
                        <tr key={interval} className="even:bg-gray-50">
                            <td className="border border-gray-300 p-2 font-medium text-center">{interval}</td>
                            {Object.keys(weekDays).map(dayKey => {
                                const dayKeyTyped = dayKey as keyof typeof weekDays;
                                const slot = schedule.schedule[dayKeyTyped]?.find((s: ScheduleTimeSlot) => s && s.startTime && s.endTime && `${s.startTime} - ${s.endTime}` === interval);
                                return (
                                <td key={dayKey} className="border border-gray-300 p-2 text-center align-top">
                                    {slot ? slot.activity : ''}
                                </td>
                                );
                            })}
                        </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-center text-gray-600 py-10">Nenhum horário definido para este cronograma.</p>
            )}

            <footer className="mt-16 text-center text-xs text-gray-500">
                <p>Gerado em {new Date().toLocaleString('pt-BR')}</p>
                <p>Plataforma de Gestão Escolar Inteligente</p>
            </footer>
        </div>
    );
};