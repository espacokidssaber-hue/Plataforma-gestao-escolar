import React from 'react';
import { type DiarioPrintData } from '../types';
import { SchoolLogoIcon } from './icons/SchoolLogoIcon';

export const DiarioPrintView: React.FC<{ data: DiarioPrintData }> = ({ data }) => {
    const { school, classInfo, disciplines, type, startDate, endDate, entries } = data;

    const renderFilledDiary = () => {
        const entriesByDate = entries.reduce((acc, entry) => {
            (acc[entry.classDate] = acc[entry.classDate] || []).push(entry);
            return acc;
        }, {} as Record<string, typeof entries>);

        return Object.keys(entriesByDate).sort().map(date => (
            <div key={date} className="break-after-page">
                <h3 className="text-lg font-semibold my-4 border-b pb-2">Data: {new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</h3>
                {entriesByDate[date].map(entry => (
                    <div key={entry.id} className="mb-4 pl-2 border-l-2">
                        <p><span className="font-bold">Disciplina:</span> {entry.subject}</p>
                        <p><span className="font-bold">Assunto:</span> {entry.topic}</p>
                        <p><span className="font-bold">Objetivo:</span> {entry.objective}</p>
                        <p><span className="font-bold">Metodologia:</span> {entry.methodology}</p>
                        <p><span className="font-bold">Recursos:</span> {entry.resources}</p>
                        <p><span className="font-bold">Avaliação:</span> {entry.evaluation}</p>
                        <p className="text-xs text-gray-500 mt-1">Registrado por: {entry.authorName}</p>
                    </div>
                ))}
            </div>
        ));
    };

    const renderBlankDiary = () => {
        const subjects = disciplines.length > 0 ? disciplines.map(d => d.name) : ['Disciplina 1', 'Disciplina 2', 'Disciplina 3', 'Disciplina 4'];
        return subjects.map(subject => (
            <div key={subject} className="mb-6 border rounded-lg p-4">
                <h4 className="text-md font-bold mb-3 border-b pb-2">Disciplina: {subject}</h4>
                <div className="space-y-4">
                    <div className="min-h-[4rem]"><p className="font-semibold text-sm">Assunto:</p></div>
                    <div className="min-h-[6rem]"><p className="font-semibold text-sm">Objetivo:</p></div>
                    <div className="min-h-[6rem]"><p className="font-semibold text-sm">Metodologia:</p></div>
                    <div className="min-h-[4rem]"><p className="font-semibold text-sm">Recursos:</p></div>
                    <div className="min-h-[4rem]"><p className="font-semibold text-sm">Avaliação:</p></div>
                </div>
            </div>
        ));
    };

    return (
        <div className="font-serif">
            {school && (
                <header className="flex items-center justify-between pb-4 border-b mb-6">
                    <div className="flex items-center gap-4">
                        {school.logoUrl ? <img src={school.logoUrl} alt="Logo" className="w-16 h-16 object-contain" /> : <SchoolLogoIcon className="w-16 h-16" />}
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">{school.name}</h1>
                            <p className="text-xs text-gray-500">{school.address}</p>
                        </div>
                    </div>
                </header>
            )}
            <h2 className="text-2xl font-bold text-center mb-2">Diário de Classe</h2>
            <div className="text-center font-semibold mb-6">
                <p>Turma: {classInfo.name}</p>
                <p>Período: {type === 'filled' ? `${new Date(startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} a ${new Date(endDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}` : new Date(startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
            </div>

            {type === 'filled' ? renderFilledDiary() : renderBlankDiary()}
            
            <footer className="mt-16 text-center">
                 <div className="w-1/2 mx-auto">
                    <div className="border-t-2 border-gray-400 text-center pt-2">
                        <p className="text-sm text-gray-600">(Assinatura do(a) Educador(a))</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};