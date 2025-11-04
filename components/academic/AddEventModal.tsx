

import React, { useState } from 'react';
// FIX: Removed local EventData definition and imported from central types file.
import { EventData } from '../../types';

interface AddEventModalProps {
    day: number | null;
    onClose: () => void;
    onSave: (event: EventData) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ day, onClose, onSave }) => {
    const [eventDay, setEventDay] = useState(day || 1);
    const [label, setLabel] = useState('');
    const [type, setType] = useState<'exam' | 'holiday' | 'event' | 'other'>('event');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (label.trim() && eventDay > 0 && eventDay < 32) {
            onSave({ day: eventDay, label, type });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Adicionar Evento ao Calendário</h2>
                    <button type="button" onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="p-6 space-y-4">
                    <div>
                        <label htmlFor="event-day" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dia</label>
                        <input type="number" id="event-day" value={eventDay} onChange={e => setEventDay(parseInt(e.target.value))} min="1" max="31" required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" />
                    </div>
                    <div>
                        <label htmlFor="event-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição do Evento</label>
                        <input type="text" id="event-label" value={label} onChange={e => setLabel(e.target.value)} required placeholder="Ex: Festa Junina" className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" />
                    </div>
                    <div>
                        <label htmlFor="event-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Evento</label>
                        <select id="event-type" value={type} onChange={e => setType(e.target.value as any)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                            <option value="event">Evento</option>
                            <option value="exam">Prova/Avaliação</option>
                            <option value="holiday">Feriado</option>
                            <option value="other">Outro</option>
                        </select>
                    </div>
                </main>
                <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-teal-600 rounded-lg text-white font-semibold hover:bg-teal-500">Salvar Evento</button>
                </footer>
                 <style>{`
                    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                    .animate-fade-in { animation: fade-in 0.2s ease-out; }
                `}</style>
            </form>
        </div>
    );
};

export default AddEventModal;