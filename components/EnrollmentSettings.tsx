import React, { useState, useEffect } from 'react';

const EnrollmentSettings: React.FC = () => {
    const [discountPrograms, setDiscountPrograms] = useState<string[]>([]);
    const [newProgram, setNewProgram] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('crmOptions');
        if (saved) {
            const options = JSON.parse(saved);
            if (options.discountPrograms && Array.isArray(options.discountPrograms)) {
                setDiscountPrograms(options.discountPrograms);
            }
        } else {
            // Default values if nothing is saved
            setDiscountPrograms(['Nenhum', 'Bolsa Padrão (25%)', 'Convênio Empresa (15%)', 'Irmãos (10%)', 'Indicação (5%)']);
        }
    }, []);

    const handleSave = () => {
        const crmOptions = {
            discountPrograms: discountPrograms,
        };
        localStorage.setItem('crmOptions', JSON.stringify(crmOptions));
        alert('Configurações salvas!');
    };

    const handleAddProgram = () => {
        if (newProgram.trim() && !discountPrograms.includes(newProgram.trim())) {
            setDiscountPrograms([...discountPrograms, newProgram.trim()]);
            setNewProgram('');
        }
    };

    const handleRemoveProgram = (programToRemove: string) => {
        setDiscountPrograms(discountPrograms.filter(p => p !== programToRemove));
    };

    return (
        <div className="bg-white dark:bg-gray-800/30 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Configurações de Matrículas e CRM</h2>
            <div className="space-y-6">
                <section>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Programas de Desconto</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Gerencie os descontos disponíveis no funil de CRM e matrículas manuais.</p>
                    <div className="space-y-2">
                        {discountPrograms.map(program => (
                            <div key={program} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700/50 p-2 rounded-md">
                                <span>{program}</span>
                                <button onClick={() => handleRemoveProgram(program)} className="text-red-500 hover:text-red-700 text-sm">Remover</button>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                        <input
                            type="text"
                            value={newProgram}
                            onChange={(e) => setNewProgram(e.target.value)}
                            placeholder="Novo programa de desconto..."
                            className="flex-grow p-2 rounded-md bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600"
                        />
                        <button onClick={handleAddProgram} className="px-4 py-2 bg-blue-600 text-white rounded-md">Adicionar</button>
                    </div>
                </section>
                
                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={handleSave} className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg">Salvar Configurações</button>
                </div>
            </div>
        </div>
    );
};

export { EnrollmentSettings };
