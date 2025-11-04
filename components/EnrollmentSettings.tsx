import React, { useState, useEffect, useMemo } from 'react';
import { useEnrollment } from '../contexts/EnrollmentContext';

export const EnrollmentSettings: React.FC = () => {
    const { crmOptions, updateCrmOptions } = useEnrollment();
    
    const [discountPrograms, setDiscountPrograms] = useState<string[]>(crmOptions.discountPrograms);
    const [newProgram, setNewProgram] = useState('');

    useEffect(() => {
        setDiscountPrograms(crmOptions.discountPrograms);
    }, [crmOptions.discountPrograms]);

    const hasChanges = useMemo(() => {
        return JSON.stringify(discountPrograms) !== JSON.stringify(crmOptions.discountPrograms);
    }, [discountPrograms, crmOptions.discountPrograms]);

    const handleSaveSettings = () => {
        updateCrmOptions({ discountPrograms });
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

    const handleCreateBackup = () => {
        const backupData: Record<string, any> = {};
        const keysToBackup = ['enrollment_data', 'auth_data', 'app_notifications', 'daily_tasks', 'annual_tasks_completed'];

        keysToBackup.forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                try {
                    // Find keys that are just prefixes for daily/annual tasks
                    if (key.endsWith('_tasks_completed')) {
                        for (let i = 0; i < localStorage.length; i++) {
                            const actualKey = localStorage.key(i);
                            if (actualKey && actualKey.startsWith(key)) {
                                backupData[actualKey] = localStorage.getItem(actualKey);
                            }
                        }
                    } else {
                         backupData[key] = item;
                    }
                } catch (e) {
                    console.warn(`Could not parse item ${key} from localStorage`, e);
                }
            }
        });
        
        const backupFile = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(backupFile);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
        a.download = `backup_gestao_escolar_${timestamp}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleRestoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File content is not valid text.");

                const backupData = JSON.parse(text);

                if (!backupData['enrollment_data'] || !backupData['auth_data']) {
                     throw new Error("Arquivo de backup inválido. Faltam dados essenciais (enrollment_data ou auth_data).");
                }

                if (window.confirm("ATENÇÃO!\n\nRestaurar este backup irá SOBRESCREVER TODOS os dados atuais da aplicação. Esta ação não pode ser desfeita.\n\nDeseja continuar?")) {
                    localStorage.clear();
                    Object.keys(backupData).forEach(key => {
                        localStorage.setItem(key, backupData[key]);
                    });
                    alert("Backup restaurado com sucesso! A aplicação será recarregada.");
                    window.location.reload();
                }

            } catch (error) {
                alert(`Erro ao restaurar backup: ${error instanceof Error ? error.message : 'Arquivo inválido.'}`);
            } finally {
                // Reset file input
                if (event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="bg-white dark:bg-gray-800/30 p-6 rounded-lg space-y-8">
            <div>
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
                        <button onClick={handleSaveSettings} disabled={!hasChanges} className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                            Salvar Configurações
                        </button>
                    </div>
                </div>
            </div>

            <div>
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Backup e Restauração</h2>
                 <div className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700/50 space-y-4">
                     <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Criar Backup</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Salve todos os dados da aplicação em um único arquivo. Guarde este arquivo em um local seguro.</p>
                        <button onClick={handleCreateBackup} className="px-4 py-2 bg-green-600 text-white rounded-md">Criar e Baixar Backup</button>
                    </div>
                     <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-red-600 dark:text-red-400">Restaurar Backup</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            Atenção: A restauração substituirá <span className="font-bold">TODOS</span> os dados atuais. Use com cuidado.
                        </p>
                        <input type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" id="restore-input" />
                        <label htmlFor="restore-input" className="cursor-pointer px-4 py-2 bg-red-600 text-white rounded-md inline-block">
                            Carregar Arquivo de Backup
                        </label>
                    </div>
                 </div>
            </div>
        </div>
    );
};