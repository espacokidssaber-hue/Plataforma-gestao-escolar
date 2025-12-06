import React, { useState, useEffect } from 'react';
import { type SchoolClass, type DiarioPrintData } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface DiarioPrintOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    classes: SchoolClass[];
    onConfirm: (printData: Omit<DiarioPrintData, 'school' | 'entries' | 'disciplines'>) => void;
}

export const DiarioPrintOptionsModal: React.FC<DiarioPrintOptionsModalProps> = ({ isOpen, onClose, classes, onConfirm }) => {
    const today = new Date().toISOString().split('T')[0];
    const [printType, setPrintType] = useState<'filled' | 'blank'>('filled');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    useEffect(() => {
        if (isOpen && classes.length > 0 && !selectedClassId) {
            setSelectedClassId(classes[0].id);
        }
    }, [isOpen, classes, selectedClassId]);

    const handleConfirm = () => {
        const classInfo = classes.find(c => c.id === selectedClassId);
        if (!classInfo) {
            alert("Por favor, selecione uma turma.");
            return;
        }

        const finalEndDate = printType === 'blank' ? startDate : endDate;

        onConfirm({
            classInfo,
            type: printType,
            startDate,
            endDate: finalEndDate,
        });
        onClose();
    };
    
    const isConfirmDisabled = !selectedClassId || !startDate || (printType === 'filled' && !endDate);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Imprimir Diário de Classe">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">1. Tipo de Impressão</label>
                    <div className="mt-2 flex gap-4">
                        <label className="flex items-center"><input type="radio" name="printType" value="filled" checked={printType === 'filled'} onChange={() => setPrintType('filled')} className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500" /> <span className="ml-2">Diário Preenchido</span></label>
                        <label className="flex items-center"><input type="radio" name="printType" value="blank" checked={printType === 'blank'} onChange={() => setPrintType('blank')} className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500" /> <span className="ml-2">Diário em Branco</span></label>
                    </div>
                </div>
                <div>
                    <label htmlFor="classId" className="block text-sm font-medium text-gray-700">2. Turma</label>
                    <select id="classId" value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
                        {classes.length > 0 ? classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>) : <option disabled>Nenhuma turma disponível</option>}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">3. Período</label>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {printType === 'filled' ? (
                            <>
                                <div>
                                    <label htmlFor="startDate" className="text-xs text-gray-600">Data Inicial</label>
                                    <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="endDate" className="text-xs text-gray-600">Data Final</label>
                                    <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                                </div>
                            </>
                        ) : (
                            <div>
                                <label htmlFor="blankDate" className="text-xs text-gray-600">Data</label>
                                <input type="date" id="blankDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button onClick={handleConfirm} disabled={isConfirmDisabled}>Confirmar e Gerar</Button>
            </div>
        </Modal>
    );
};