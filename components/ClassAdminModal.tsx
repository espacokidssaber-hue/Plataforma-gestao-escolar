import React, { useState, useEffect } from 'react';
import { SchoolClass, ClassPeriod, ClassCapacity, SchoolUnit } from '../types';

interface ClassAdminModalProps {
  schoolClass: SchoolClass | null; // null for creating a new class
  onClose: () => void;
  onSave: (schoolClass: SchoolClass) => void;
}

// FIX: Changed teacher IDs from strings to null to match the SchoolClass type.
const initialFormState: Omit<SchoolClass, 'id' | 'students'> = {
    name: '',
    grade: '',
    period: ClassPeriod.MORNING,
    unit: SchoolUnit.MATRIZ,
    room: '',
    teachers: { matriz: null, filial: null, anexo: null },
    capacity: { matriz: 20, filial: 0, anexo: 0 },
};

// FIX: Updated teachers prop to accept number or null.
interface UnitConfigProps {
    unit: 'matriz' | 'filial' | 'anexo';
    teachers: { matriz: number | null; filial: number | null; anexo: number | null; };
    capacity: { matriz: number; filial: number; anexo: number; };
    onTeacherChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCapacityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UnitConfig: React.FC<UnitConfigProps> = ({ unit, teachers, capacity, onTeacherChange, onCapacityChange }) => (
    <div className="bg-gray-100 dark:bg-gray-700/30 p-4 rounded-lg space-y-3">
        <h4 className="font-bold text-center text-gray-900 dark:text-white mb-2">{unit.charAt(0).toUpperCase() + unit.slice(1)}</h4>
        <div>
            <label htmlFor={`teacher-${unit}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Professor(a)</label>
            <input 
                type="text" 
                id={`teacher-${unit}`} 
                name={unit} 
                // FIX: Handle null value for input by converting to empty string.
                value={teachers[unit] ?? ''} 
                onChange={onTeacherChange} 
                className="w-full bg-white dark:bg-gray-700/80 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 transition" 
            />
        </div>
        <div>
            <label htmlFor={`capacity-${unit}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vagas</label>
            <input 
                type="number" 
                id={`capacity-${unit}`} 
                name={unit} 
                value={capacity[unit]} 
                onChange={onCapacityChange} 
                className="w-full bg-white dark:bg-gray-700/80 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 transition" 
            />
        </div>
    </div>
);


const ClassAdminModal: React.FC<ClassAdminModalProps> = ({ schoolClass, onClose, onSave }) => {
  const [formData, setFormData] = useState<Omit<SchoolClass, 'id' | 'students'>>(initialFormState);

  useEffect(() => {
    if (schoolClass) {
        setFormData({
            name: schoolClass.name,
            grade: schoolClass.grade,
            period: schoolClass.period,
            unit: schoolClass.unit,
            room: schoolClass.room,
            teachers: schoolClass.teachers,
            capacity: schoolClass.capacity,
        });
    } else {
        setFormData(initialFormState);
    }
  }, [schoolClass]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const classData: SchoolClass = {
        ...formData,
        id: schoolClass?.id || Date.now(),
        students: schoolClass?.students || [],
    };
    onSave(classData);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'unit') {
        const newUnit = value as SchoolUnit;
        setFormData(prev => {
            const oldUnit = prev.unit;
            const oldUnitKey = oldUnit.toLowerCase() as keyof ClassCapacity;
            const newUnitKey = newUnit.toLowerCase() as keyof ClassCapacity;
            
            if (oldUnitKey !== newUnitKey) {
                const newCapacity = { ...prev.capacity };
                
                // Move the capacity value from the old unit to the new one,
                // but only if the new one is currently zero.
                if (newCapacity[newUnitKey] === 0) {
                    newCapacity[newUnitKey] = newCapacity[oldUnitKey];
                    newCapacity[oldUnitKey] = 0;
                }
                 // If the moved value is also 0 (e.g., from an unconfigured unit), set a default of 20.
                if (newCapacity[newUnitKey] === 0) {
                    newCapacity[newUnitKey] = 20;
                }
                
                return { ...prev, unit: newUnit, capacity: newCapacity };
            }
            // If unit didn't really change, just update it (shouldn't happen often but is safe)
            return { ...prev, unit: newUnit };
        });
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        capacity: {
            ...prev.capacity,
            [name]: Number(value) < 0 ? 0 : Number(value)
        }
    }));
  };
  
  // FIX: Convert input value from string to number or null to match type.
  const handleTeacherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
          ...prev,
          teachers: {
              ...prev.teachers,
              [name]: value === '' ? null : Number(value)
          }
      }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-3xl flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{schoolClass ? 'Editar Turma' : 'Criar Nova Turma'}</h2>
          <button onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <main className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Turma (Ex: 1º Ano A)</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 transition" />
                </div>
                 <div>
                    <label htmlFor="grade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Série (Ex: 1º Ano)</label>
                    <input type="text" id="grade" name="grade" value={formData.grade} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 transition" />
                </div>
                 <div>
                    <label htmlFor="period" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Período</label>
                    <select id="period" name="period" value={formData.period} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 transition">
                        <option value={ClassPeriod.MORNING}>Manhã</option>
                        <option value={ClassPeriod.AFTERNOON}>Tarde</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="room" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sala</label>
                    <input type="text" id="room" name="room" value={formData.room} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 transition" />
                </div>
                <div className="md:col-span-2">
                     <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unidade Escolar</label>
                    <select id="unit" name="unit" value={formData.unit} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 transition">
                        {Object.values(SchoolUnit).map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configuração por Unidade</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                     <UnitConfig 
                         unit="matriz" 
                         teachers={formData.teachers} 
                         capacity={formData.capacity}
                         onTeacherChange={handleTeacherChange}
                         onCapacityChange={handleCapacityChange}
                     />
                     <UnitConfig 
                         unit="filial"
                         teachers={formData.teachers}
                         capacity={formData.capacity}
                         onTeacherChange={handleTeacherChange}
                         onCapacityChange={handleCapacityChange}
                     />
                     <UnitConfig 
                         unit="anexo" 
                         teachers={formData.teachers}
                         capacity={formData.capacity}
                         onTeacherChange={handleTeacherChange}
                         onCapacityChange={handleCapacityChange}
                     />
                 </div>
            </div>
          </main>
          <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500">
                Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-teal-600 rounded-lg text-white font-semibold hover:bg-teal-500">
                Salvar Turma
            </button>
          </footer>
        </form>
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: scale(0.98); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        `}</style>
      </div>
    </div>
  );
};

export default ClassAdminModal;
