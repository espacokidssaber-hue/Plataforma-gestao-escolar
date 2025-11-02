import React, { useState, useEffect, useRef } from 'react';
import { SchoolUnit, SchoolInfo, EnrolledStudent, Guardian, StudentAddress, StudentLifecycleStatus } from '../../types';
import { streamTextFromPdf } from '../services/geminiService';
import { useEnrollment } from '../../contexts/EnrollmentContext';
import * as XLSX from 'xlsx';
import { useSchoolInfo } from '../../App';


const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700/50">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const ToggleSwitch: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void }> = ({ label, enabled, onChange }) => (
    <label className="flex items-center justify-between cursor-pointer">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={enabled} onChange={e => onChange(e.target.checked)} />
            <div className={`block w-14 h-8 rounded-full ${enabled ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'transform translate-x-6' : ''}`}></div>
        </div>
    </label>
);

const ListEditor: React.FC<{ title: string; items: string[]; onItemsChange: (items: string[]) => void }> = ({ title, items, onItemsChange }) => {
    const [newItem, setNewItem] = useState('');

    const handleAddItem = () => {
        if (newItem.trim() && !items.includes(newItem.trim())) {
            onItemsChange([...items, newItem.trim()]);
            setNewItem('');
        }
    };

    const handleRemoveItem = (itemToRemove: string) => {
        onItemsChange(items.filter(item => item !== itemToRemove));
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{title}</label>
            <div className="space-y-2">
                {items.map(item => (
                    <div key={item} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg">
                        <span className="text-gray-900 dark:text-white text-sm">{item}</span>
                        <button onClick={() => handleRemoveItem(item)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs">Remover</button>
                    </div>
                ))}
            </div>
            <div className="flex items-center mt-2 space-x-2">
                <input
                    type="text"
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    className="flex-grow bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white text-sm"
                    placeholder="Adicionar novo item..."
                />
                <button onClick={handleAddItem} className="px-3 py-2 bg-teal-100 text-teal-700 dark:bg-teal-600/50 dark:text-teal-200 text-sm font-semibold rounded-md hover:bg-teal-200 dark:hover:bg-teal-600 hover:text-teal-800 dark:hover:text-white">Adicionar</button>
            </div>
        </div>
    );
};

interface UnitSettings {
    newEnrollmentsOpen: boolean;
    reEnrollmentStart: string;
    reEnrollmentEnd: string;
    enrollmentFee: number;
    reEnrollmentFee: number;
    annualPlan: number;
    discounts: {
        punctuality: number;
        siblings: number;
        standard: number;
    };
}

// Custom hook to manage localStorage state and ensure persistence.
function useLocalStorage<T>(key: string, initialValue: T | null): [T | null, (value: T | null | ((val: T | null) => T | null)) => void] {
  const [storedValue, setStoredValue] = useState<T | null>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null || item === 'undefined') return initialValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | null | ((val: T | null) => T | null)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (valueToStore === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// --- AVATAR UTILS START ---
const getInitials = (name: string): string => { if (!name) return '?'; const words = name.trim().split(' ').filter(Boolean); if (words.length > 1) { return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase(); } if (words.length === 1 && words[0].length > 1) { return words[0].substring(0, 2).toUpperCase(); } if (words.length === 1) { return words[0][0].toUpperCase(); } return '?'; };
const stringToColor = (str: string): string => { let hash = 0; if (!str) return '#cccccc'; for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); hash = hash & hash; } let color = '#'; for (let i = 0; i < 3; i++) { const value = (hash >> (i * 8)) & 0xFF; const adjustedValue = 100 + (value % 156); color += ('00' + adjustedValue.toString(16)).substr(-2); } return color; };
const generateAvatar = (name: string): string => { const initials = getInitials(name); const color = stringToColor(name); const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150" fill="${color}"><rect width="100%" height="100%" fill="currentColor" /><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60" fill="#ffffff">${initials}</text></svg>`; return `data:image/svg+xml;base64,${btoa(svg)}`; };
// --- AVATAR UTILS END ---

// FIX: Changed to a named export to resolve import error.
export const EnrollmentSettings: React.FC = () => {
    const { 
        leads, applicants, enrolledStudents, classes, contacts, 
        uploadedActivities, classLogs, restoreBackup, enrollStudentsFromImport
    } = useEnrollment();
    const { schoolInfo, setSchoolInfo, matrizInfo, setMatrizInfo } = useSchoolInfo();

    const [selectedUnit, setSelectedUnit] = useState<keyof typeof unitSettings>('matriz');
    // Use the custom hook for robust persistence of the contract template.
    const [contractTemplate, setContractTemplate] = useLocalStorage<{ fileName: string; extractedText: string }>('schoolContract', null);
    const [isUploading, setIsUploading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const contractInputRef = useRef<HTMLInputElement>(null);
    const restoreInputRef = useRef<HTMLInputElement>(null);
    const athenaRestoreInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [isRestoringAthena, setIsRestoringAthena] = useState(false);
    const BACKUP_VERSION = "1.0.0";

    const handleCreateBackup = async () => {
        setIsBackingUp(true);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
    
        try {
            const backupData = {
                version: BACKUP_VERSION,
                timestamp: new Date().toISOString(),
                data: {
                    // Context data
                    leads, applicants, enrolledStudents, classes, contacts, 
                    uploadedActivities, classLogs,
                    // LocalStorage data
                    localStorage: {} as Record<string, any>
                }
            };
    
            // Gather relevant localStorage items
            const relevantKeys = [
                'app_notifications', 'schoolContract', 'crmOptions', 'schoolInfo', 
                'matrizInfo', 'whatsapp_groups',
            ];
    
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    if (relevantKeys.includes(key) || key.startsWith('daily_tasks_') || key.startsWith('annual_tasks_completed_')) {
                        backupData.data.localStorage[key] = JSON.parse(localStorage.getItem(key)!);
                    }
                }
            }
            
            const jsonString = JSON.stringify(backupData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const date = new Date().toISOString().split('T')[0];
            a.download = `backup_gestao_escolar_${date}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
    
        } catch (error) {
            console.error("Backup failed:", error);
            alert(`Erro ao criar backup: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleRestoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
    
        if (file.type !== 'application/json') {
            alert('Por favor, selecione um arquivo de backup JSON válido.');
            return;
        }
    
        const reader = new FileReader();
        reader.onload = async (event) => {
            setIsRestoring(true);
            try {
                const content = event.target?.result as string;
                const backupData = JSON.parse(content);
    
                if (!backupData.version || !backupData.data || !backupData.data.localStorage) {
                    throw new Error("Arquivo de backup inválido ou corrompido.");
                }
                
                if (backupData.version !== BACKUP_VERSION) {
                    if(!window.confirm(`Atenção: A versão do backup (${backupData.version}) é diferente da versão do sistema (${BACKUP_VERSION}). A restauração pode não funcionar como esperado. Deseja continuar mesmo assim?`)) {
                        setIsRestoring(false);
                        return;
                    }
                }
    
                if (window.confirm("ATENÇÃO!\n\nRestaurar um backup substituirá TODOS os dados atuais do sistema. Esta ação não pode ser desfeita. Deseja continuar?")) {
                    const keysToRemove: string[] = [];
                     for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && (
                            key.startsWith('daily_tasks_') || 
                            key.startsWith('annual_tasks_completed_') ||
                            key.startsWith('enrollment_') ||
                            ['app_notifications', 'schoolContract', 'crmOptions', 'schoolInfo', 'matrizInfo', 'whatsapp_groups'].includes(key)
                        )) {
                            keysToRemove.push(key);
                        }
                    }
                    keysToRemove.forEach(key => localStorage.removeItem(key));
                    
                    for (const key in backupData.data.localStorage) {
                        localStorage.setItem(key, JSON.stringify(backupData.data.localStorage[key]));
                    }
                    
                    restoreBackup(backupData.data);
                    
                    alert('Backup restaurado com sucesso! O aplicativo será recarregado agora.');
                    
                    await new Promise(resolve => setTimeout(resolve, 500));
                    window.location.reload();
                }
            } catch (error) {
                console.error("Restore failed:", error);
                alert(`Erro ao restaurar backup: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
            } finally {
                setIsRestoring(false);
                if (restoreInputRef.current) {
                    restoreInputRef.current.value = '';
                }
            }
        };
        reader.readAsText(file);
    };

    const mapAthenaRowToStudent = (row: any): EnrolledStudent | null => {
        if (!row['NOME COMPLETO'] || !row['DATA DE NASCIMENTO']) {
            return null;
        }

        const guardian: Guardian = { name: row['NOME DO RESPONSÁVEL'] || '', cpf: row['CPF DO RESPONSÁVEL'] || '', rg: '', phone: String(row['TELEFONE DO RESPONSÁVEL'] || ''), email: row['EMAIL DO RESPONSÁVEL'] || '' };
        const address: StudentAddress = { street: row['ENDEREÇO'] || '', number: String(row['NÚMERO'] || ''), complement: row['COMPLEMENTO'] || '', neighborhood: row['BAIRRO'] || '', city: row['CIDADE'] || '', state: row['ESTADO'] || '', zip: String(row['CEP'] || '') };
        
        let isoDateOfBirth: string | undefined = undefined;
        if (row['DATA DE NASCIMENTO'] instanceof Date) {
            const date = row['DATA DE NASCIMENTO'];
            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
            isoDateOfBirth = new Date(date.getTime() + userTimezoneOffset).toISOString().split('T')[0];
        } else if (typeof row['DATA DE NASCIMENTO'] === 'string') {
            const parts = row['DATA DE NASCIMENTO'].split('/');
            if (parts.length === 3) isoDateOfBirth = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        
        let status: StudentLifecycleStatus;
        switch(String(row['SITUAÇÃO'] || '').toUpperCase()) {
            case 'MATRICULADO': case 'ATIVO': status = StudentLifecycleStatus.ACTIVE; break;
            case 'CANCELADO': status = StudentLifecycleStatus.CANCELLED; break;
            case 'TRANSFERIDO': status = StudentLifecycleStatus.TRANSFERRED_OUT; break;
            default: status = StudentLifecycleStatus.INACTIVE;
        }

        return {
            id: Date.now() + Math.random(), name: row['NOME COMPLETO'], avatar: generateAvatar(row['NOME COMPLETO']),
            grade: row['SÉRIE'] || 'Não informado', className: 'A alocar', classId: -1, unit: SchoolUnit.MATRIZ, status: status,
            financialStatus: 'OK', libraryStatus: 'OK', academicDocsStatus: 'OK', dateOfBirth: isoDateOfBirth,
            motherName: row['NOME DA MÃE'], fatherName: row['NOME DO PAI'], guardians: [guardian], address: address
        };
    };

    const handleRestoreAthenaBackupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (!file.name.endsWith('.xlsx')) {
            alert('Por favor, selecione um arquivo Excel (.xlsx) válido.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setIsRestoringAthena(true);
            try {
                const data = event.target?.result;
                const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);

                if (json.length === 0) {
                    throw new Error("A planilha está vazia ou em um formato não reconhecido.");
                }

                const newStudents = json.map(mapAthenaRowToStudent).filter((s): s is EnrolledStudent => s !== null);
                
                if (newStudents.length === 0) {
                     throw new Error("Nenhum aluno válido encontrado na planilha. Verifique se as colunas 'NOME COMPLETO' e 'DATA DE NASCIMENTO' estão presentes e preenchidas.");
                }

                enrollStudentsFromImport(newStudents);
                alert(`${newStudents.length} alunos foram importados com sucesso do backup Athena Web!\n\nEles foram adicionados à lista de alunos e estão prontos para serem alocados em turmas na tela de "Gestão de Turmas".`);

            } catch (error) {
                console.error("Athena restore failed:", error);
                alert(`Erro ao restaurar backup do Athena Web: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
            } finally {
                setIsRestoringAthena(false);
                if (athenaRestoreInputRef.current) {
                    athenaRestoreInputRef.current.value = '';
                }
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleContractUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || file.type !== 'application/pdf') {
            alert('Por favor, selecione um arquivo PDF.');
            return;
        }

        setIsUploading(true);
        setLoadingStatus('Lendo o arquivo...');
        let fullText = '';
        
        const previousContract = contractTemplate;

        try {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(file);
            });

            setLoadingStatus('Enviando para a IA e extraindo texto...');
            setContractTemplate({ fileName: file.name, extractedText: '' });

            const stream = await streamTextFromPdf(base64);

            for await (const chunk of stream) {
                const chunkText = chunk.text;
                fullText += chunkText;
                setContractTemplate({ fileName: file.name, extractedText: fullText });
            }

            alert('Modelo de contrato carregado e processado com sucesso!');

        } catch (error) {
            alert(`Erro ao processar o contrato: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Revertendo para o contrato anterior.`);
            setContractTemplate(previousContract);
        } finally {
            setIsUploading(false);
            setLoadingStatus('');
            if (contractInputRef.current) {
                contractInputRef.current.value = '';
            }
        }
    };


    const [unitSettings, setUnitSettings] = useState({
        matriz: {
            newEnrollmentsOpen: true,
            reEnrollmentStart: '',
            reEnrollmentEnd: '',
            enrollmentFee: 650,
            reEnrollmentFee: 500,
            annualPlan: 12000,
            discounts: { punctuality: 5, siblings: 10, standard: 25 },
        },
        filial: {
            newEnrollmentsOpen: true,
            reEnrollmentStart: '',
            reEnrollmentEnd: '',
            enrollmentFee: 600,
            reEnrollmentFee: 450,
            annualPlan: 11000,
            discounts: { punctuality: 5, siblings: 15, standard: 20 },
        },
    });
    
    const [globalSettings, setGlobalSettings] = useState({ campaignYear: '2025' });

    const [crmOptions, setCrmOptions] = useState(() => {
        const saved = localStorage.getItem('crmOptions');
        const defaults = {
            leadSources: ['Instagram', 'Google', 'Indicação', 'Fachada'],
            lossReasons: ['Preço', 'Localização', 'Metodologia', 'Concorrência'],
            cancellationReasons: ['Mudança de cidade', 'Problema financeiro', 'Insatisfação pedagógica'],
            discountPrograms: ['Nenhum', 'Bolsa Padrão (25%)', 'Convênio Empresa (15%)', 'Irmãos (10%)', 'Indicação (5%)']
        };
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    });

    useEffect(() => {
        localStorage.setItem('crmOptions', JSON.stringify(crmOptions));
    }, [crmOptions]);

    const handleSchoolInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSchoolInfo(prev => ({ ...prev, [name]: value }));
    };
    
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione um arquivo de imagem (JPG, PNG, etc.).');
                return;
            }
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert('A imagem é muito grande. Por favor, use uma imagem com menos de 2MB.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const base64Url = loadEvent.target?.result as string;
                setSchoolInfo(s => ({ ...s, logo: base64Url }));
            };
            reader.readAsDataURL(file);
        }
    };


    const handleMatrizInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setMatrizInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleUnitSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        
        setUnitSettings(prev => {
            const currentUnitSettings = prev[selectedUnit];
            let parsedValue: string | number = value;
            if (type === 'number') {
                parsedValue = Number(value);
            }
            const updatedSettings = { ...currentUnitSettings, [name]: parsedValue };
            return { ...prev, [selectedUnit]: updatedSettings };
        });
    };

     const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUnitSettings(prev => ({
            ...prev,
            [selectedUnit]: {
                ...prev[selectedUnit],
                discounts: {
                    ...prev[selectedUnit].discounts,
                    [name]: Number(value)
                }
            }
        }));
    };

    const handleToggleChange = (enabled: boolean) => {
        setUnitSettings(prev => ({
            ...prev,
            [selectedUnit]: { ...prev[selectedUnit], newEnrollmentsOpen: enabled }
        }));
    };
    
    const currentSettings = unitSettings[selectedUnit];

    const handleSave = () => {
        alert("[SIMULAÇÃO] Configurações salvas com sucesso! As novas regras de negócio foram aplicadas em todo o sistema.");
    }

    return (
        <div className="mt-6 space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SettingsCard title="Gestão de Contrato Escolar">
                    <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">
                        Carregue o modelo principal do contrato (PDF). A IA irá extrair o texto para preenchimento automático na ficha do aluno.
                    </p>
                    <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                        <div className="text-sm">
                            <p className="font-semibold text-gray-900 dark:text-white">Contrato Atual:</p>
                            <p className="text-gray-600 dark:text-gray-300 truncate mb-2">{contractTemplate?.fileName || 'Nenhum contrato carregado.'}</p>
                            <textarea
                                readOnly
                                value={contractTemplate?.extractedText || ''}
                                className="w-full h-32 bg-white dark:bg-gray-800/50 p-2 rounded-md text-xs border border-gray-300 dark:border-gray-700 font-mono"
                                placeholder="O texto extraído do PDF aparecerá aqui em tempo real..."
                            />
                        </div>
                    </div>
                     <input type="file" ref={contractInputRef} onChange={handleContractUpload} accept=".pdf" className="hidden" />
                    <button 
                        onClick={() => contractInputRef.current?.click()} 
                        disabled={isUploading}
                        className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 disabled:bg-gray-500 flex items-center justify-center"
                    >
                         Carregar Novo Contrato (PDF)
                    </button>
                    {isUploading && (
                        <div className="flex items-center justify-center space-x-2 mt-2 text-sm text-teal-600 dark:text-teal-400">
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{loadingStatus}</span>
                        </div>
                    )}
                </SettingsCard>
                 <SettingsCard title="Backup e Restauração">
                    <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">
                        Salve todos os dados da aplicação em um arquivo ou restaure a partir de um backup anterior, inclusive de outros sistemas como o Athena Web.
                    </p>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-500/50 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
                        <span className="font-bold">Atenção:</span> A restauração de um backup substituirá todos os dados existentes. Use com cuidado.
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2">
                        <button
                            onClick={handleCreateBackup}
                            disabled={isBackingUp || isRestoring || isRestoringAthena}
                            className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 disabled:bg-gray-500 flex items-center justify-center"
                        >
                            {isBackingUp ? 'Criando...' : 'Criar Backup'}
                        </button>
                        <input type="file" ref={restoreInputRef} onChange={handleRestoreChange} accept=".json" className="hidden" />
                        <button
                            onClick={() => restoreInputRef.current?.click()}
                            disabled={isBackingUp || isRestoring || isRestoringAthena}
                            className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 disabled:bg-gray-500 flex items-center justify-center"
                        >
                            {isRestoring ? 'Restaurando...' : 'Restaurar Backup'}
                        </button>
                        <input type="file" ref={athenaRestoreInputRef} onChange={handleRestoreAthenaBackupChange} accept=".xlsx" className="hidden" />
                        <button
                            onClick={() => athenaRestoreInputRef.current?.click()}
                            disabled={isBackingUp || isRestoring || isRestoringAthena}
                            title="Importar planilha de alunos do sistema Athena Web"
                            className="w-full px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500 disabled:bg-gray-500 flex items-center justify-center"
                        >
                            {isRestoringAthena ? 'Restaurando...' : 'Restaurar (Athena)'}
                        </button>
                    </div>
                </SettingsCard>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SettingsCard title="Gestão de Ano Letivo">
                    <div>
                        <label htmlFor="campaign-year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ano Letivo da Campanha (Global)</label>
                        <select id="campaign-year" value={globalSettings.campaignYear} onChange={e => setGlobalSettings(s => ({...s, campaignYear: e.target.value}))} className="w-full bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white">
                            <option>2024</option>
                            <option>2025</option>
                            <option>2026</option>
                        </select>
                    </div>
                </SettingsCard>

                <SettingsCard title="Dados da Instituição (Global)">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="md:col-span-2">
                            <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Escola</label>
                            <input type="text" id="schoolName" name="name" value={schoolInfo.name} onChange={handleSchoolInfoChange} className="w-full bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="schoolCnpj" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CNPJ</label>
                            <input type="text" id="schoolCnpj" name="cnpj" value={schoolInfo.cnpj} onChange={handleSchoolInfoChange} className="w-full bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="schoolAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endereço Completo</label>
                            <input type="text" id="schoolAddress" name="address" value={schoolInfo.address} onChange={handleSchoolInfoChange} className="w-full bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="schoolPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
                            <input type="text" id="schoolPhone" name="phone" value={schoolInfo.phone} onChange={handleSchoolInfoChange} className="w-full bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="schoolEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                            <input type="email" id="schoolEmail" name="email" value={schoolInfo.email} onChange={handleSchoolInfoChange} className="w-full bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="directorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do(a) Diretor(a)</label>
                            <input type="text" id="directorName" name="directorName" value={schoolInfo.directorName} onChange={handleSchoolInfoChange} className="w-full bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="secretaryName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do(a) Secretário(a)</label>
                            <input type="text" id="secretaryName" name="secretaryName" value={schoolInfo.secretaryName} onChange={handleSchoolInfoChange} className="w-full bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white" />
                        </div>
                         <div className="md:col-span-2">
                            <input type="file" ref={logoInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
                            <button type="button" onClick={() => logoInputRef.current?.click()} className="w-full px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg">
                                {schoolInfo.logo ? 'Alterar Logo' : 'Carregar Logo'}
                            </button>
                        </div>
                    </div>
                </SettingsCard>
            </div>

            <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
                <button onClick={() => setSelectedUnit('matriz')} className={`px-4 py-2 text-sm font-semibold ${selectedUnit === 'matriz' ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-300' : 'text-gray-500'}`}>
                    Configurações da Matriz
                </button>
                <button onClick={() => setSelectedUnit('filial')} className={`px-4 py-2 text-sm font-semibold ${selectedUnit === 'filial' ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-300' : 'text-gray-500'}`}>
                    Configurações da Filial
                </button>
            </div>

            {selectedUnit === 'matriz' && (
                <SettingsCard title="Dados da Unidade (Matriz)">
                    <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2 mb-2">
                        Preencha estes campos se os dados da Matriz (CNPJ, endereço, etc.) forem diferentes dos dados globais da instituição. Eles serão usados nas declarações da Matriz. Deixe em branco para usar os dados globais.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="matriz_cnpj" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CNPJ (Matriz)</label>
                            <input type="text" id="matriz_cnpj" name="cnpj" value={matrizInfo.cnpj} onChange={handleMatrizInfoChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="matriz_phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone (Matriz)</label>
                            <input type="text" id="matriz_phone" name="phone" value={matrizInfo.phone} onChange={handleMatrizInfoChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="matriz_address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endereço (Matriz)</label>
                            <input type="text" id="matriz_address" name="address" value={matrizInfo.address} onChange={handleMatrizInfoChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="matriz_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail (Matriz)</label>
                            <input type="email" id="matriz_email" name="email" value={matrizInfo.email} onChange={handleMatrizInfoChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="matriz_authorizationNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nº de Autorização (Matriz)</label>
                            <input type="text" id="matriz_authorizationNumber" name="authorizationNumber" value={matrizInfo.authorizationNumber} onChange={handleMatrizInfoChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white" />
                        </div>
                    </div>
                </SettingsCard>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SettingsCard title="Períodos de Matrícula">
                    <ToggleSwitch label="Portal de Novas Matrículas Aberto" enabled={currentSettings.newEnrollmentsOpen} onChange={handleToggleChange} />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="reEnrollmentStart" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Início da Rematrícula</label>
                            <input type="date" id="reEnrollmentStart" name="reEnrollmentStart" value={currentSettings.reEnrollmentStart} onChange={handleUnitSettingChange} className="w-full bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white" />
                        </div>
                         <div>
                            <label htmlFor="reEnrollmentEnd" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fim da Rematrícula</label>
                            <input type="date" id="reEnrollmentEnd" name="reEnrollmentEnd" value={currentSettings.reEnrollmentEnd} onChange={handleUnitSettingChange} className="w-full bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white" />
                        </div>
                    </div>
                </SettingsCard>
                
                <SettingsCard title="Parâmetros Financeiros da Matrícula">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="enrollmentFee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Taxa de Matrícula (R$)</label>
                            <input type="number" id="enrollmentFee" name="enrollmentFee" value={currentSettings.enrollmentFee} onChange={handleUnitSettingChange} className="w-full bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white" />
                        </div>
                         <div>
                            <label htmlFor="reEnrollmentFee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Taxa de Rematrícula (R$)</label>
                            <input type="number" id="reEnrollmentFee" name="reEnrollmentFee" value={currentSettings.reEnrollmentFee} onChange={handleUnitSettingChange} className="w-full bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="annualPlan" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Anuidade (Plano Padrão)</label>
                        <input type="number" id="annualPlan" name="annualPlan" value={currentSettings.annualPlan} onChange={handleUnitSettingChange} className="w-full bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Valor base para cálculo das 12 parcelas mensais.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Regras de Desconto Automático</label>
                        <div className="grid grid-cols-3 gap-2">
                            <input type="number" value={currentSettings.discounts.punctuality} name="punctuality" onChange={handleDiscountChange} placeholder="Pontualidade %" className="bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white text-sm" />
                            <input type="number" value={currentSettings.discounts.siblings} name="siblings" onChange={handleDiscountChange} placeholder="Irmãos %" className="bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white text-sm" />
                            <input type="number" value={currentSettings.discounts.standard} name="standard" onChange={handleDiscountChange} placeholder="Bolsa Padrão %" className="bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white text-sm" />
                        </div>
                    </div>
                </SettingsCard>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <SettingsCard title="Gestão de Templates de Documentos">
                    <div>
                        <label htmlFor="contract-new" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modelo de Contrato - Novas Matrículas</label>
                        <input type="file" id="contract-new" className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-200 dark:file:bg-gray-700 file:text-teal-700 dark:file:text-teal-200 hover:file:bg-gray-300 dark:hover:file:bg-gray-600" />
                    </div>
                     <div>
                        <label htmlFor="contract-reenroll" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modelo de Contrato - Rematrículas</label>
                        <input type="file" id="contract-reenroll" className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-200 dark:file:bg-gray-700 file:text-teal-700 dark:file:text-teal-200 hover:file:bg-gray-300 dark:hover:file:bg-gray-600" />
                    </div>
                     <div>
                        <label htmlFor="welcome-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Template de E-mail de Boas-Vindas</label>
                        <input type="file" id="welcome-email" className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-200 dark:file:bg-gray-700 file:text-teal-700 dark:file:text-teal-200 hover:file:bg-gray-300 dark:hover:file:bg-gray-600" />
                    </div>
                 </SettingsCard>
                 <SettingsCard title="Personalização de Campos (Global)">
                    <ListEditor title="Origem do Lead (CRM)" items={crmOptions.leadSources} onItemsChange={items => setCrmOptions(o => ({...o, leadSources: items}))} />
                    <ListEditor title="Motivos de Perda (CRM)" items={crmOptions.lossReasons} onItemsChange={items => setCrmOptions(o => ({...o, lossReasons: items}))} />
                    <ListEditor title="Motivos de Evasão (Movimentação)" items={crmOptions.cancellationReasons} onItemsChange={items => setCrmOptions(o => ({...o, cancellationReasons: items}))} />
                    <ListEditor title="Programas de Desconto" items={crmOptions.discountPrograms} onItemsChange={items => setCrmOptions(o => ({...o, discountPrograms: items}))} />
                 </SettingsCard>
             </div>
             <div className="flex justify-end pt-4">
                 <button onClick={handleSave} className="px-8 py-3 bg-teal-600 hover:bg-teal-500 rounded-lg font-semibold text-white transition-colors">
                    Salvar Todas as Configurações
                 </button>
             </div>
        </div>
    );
};