import React, { useState, useEffect, useMemo } from 'react';
import { Applicant, NewEnrollmentStatus, DocumentStatus, StudentDocument, Guardian, HealthInfo, StudentAddress } from '../types';
import EnrollmentChecklist from './EnrollmentChecklist';
import EnrollmentPaymentModal from './EnrollmentPaymentModal';
import { generateJsonFromText } from '../../services/geminiService';

interface EnrollmentValidationModalProps {
  applicant: Applicant;
  onClose: () => void;
  onSave: (updatedApplicant: Applicant) => void;
  onFinalize: (applicant: Applicant) => void;
}

const InputField: React.FC<{ label: string; name: string; value: string | undefined; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; type?: string; required?: boolean; as?: 'textarea' }> = ({ label, name, value, onChange, type = 'text', required = false, as }) => (
    <div>
        <label htmlFor={name} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        {as === 'textarea' ? (
             <textarea
                name={name}
                id={name}
                value={value || ''}
                onChange={onChange}
                rows={2}
                className="w-full bg-white dark:bg-gray-700/80 p-2 rounded-lg text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500"
            />
        ) : (
            <input
                type={type}
                name={name}
                id={name}
                value={value || ''}
                onChange={onChange}
                required={required}
                className="w-full bg-white dark:bg-gray-700/80 p-2 rounded-lg text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500"
            />
        )}
    </div>
);


const EnrollmentValidationModal: React.FC<EnrollmentValidationModalProps> = ({ applicant, onClose, onSave, onFinalize }) => {
    const DISCOUNT_PROGRAMS = useMemo(() => {
        const saved = localStorage.getItem('crmOptions');
        if (saved) {
            const options = JSON.parse(saved);
            if (options.discountPrograms && Array.isArray(options.discountPrograms)) {
                return options.discountPrograms;
            }
        }
        return ['Nenhum', 'Bolsa Padrão (25%)', 'Convênio Empresa (15%)', 'Irmãos (10%)', 'Indicação (5%)'];
    }, []);

    const [currentApplicant, setCurrentApplicant] = useState<Applicant>(() => JSON.parse(JSON.stringify(applicant)));
    const [activeTab, setActiveTab] = useState<'data' | 'documents'>('data');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [geminiSuggestion, setGeminiSuggestion] = useState<string | null>(null);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isFetchingCep, setIsFetchingCep] = useState(false);
    
    useEffect(() => {
        setCurrentApplicant(JSON.parse(JSON.stringify(applicant)));
    }, [applicant]);

    const handleSave = () => {
        onSave(currentApplicant);
    };
    
    const handleStudentDataChange = (field: keyof Applicant, value: string) => {
        setCurrentApplicant(prev => ({ ...prev, [field]: value }));
    };

    const fetchCep = async () => {
        const cep = currentApplicant.address?.zip;
        if (!cep || cep.replace(/\D/g, '').length !== 8) {
            return; // Don't fetch if CEP is incomplete
        }
        setIsFetchingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
            if (!response.ok) throw new Error('CEP não encontrado ou erro de rede.');
            const data = await response.json();
            if (data.erro) {
                alert('CEP não encontrado. Por favor, verifique o número ou preencha o endereço manualmente.');
                return;
            }
            
            // Update state with fetched data, preserving fields that weren't returned
            setCurrentApplicant(prev => ({
                ...prev,
                address: {
                    ...prev.address!,
                    street: data.logradouro || prev.address?.street || '',
                    neighborhood: data.bairro || prev.address?.neighborhood || '',
                    city: data.localidade || prev.address?.city || '',
                    state: data.uf || prev.address?.state || '',
                }
            }));

        } catch (error) {
            alert(error instanceof Error ? error.message : 'Não foi possível buscar o CEP.');
        } finally {
            setIsFetchingCep(false);
        }
    };


    const handleAddressChange = (field: keyof StudentAddress, value: string) => {
        let formattedValue = value;
        if (field === 'zip') {
             formattedValue = value
                .replace(/\D/g, '') // Remove all non-digits
                .replace(/^(\d{5})(\d)/, '$1-$2') // Add hyphen after 5 digits
                .slice(0, 9); // Limit to 9 characters (XXXXX-XXX)
        }
        setCurrentApplicant(prev => ({
            ...prev,
            address: {
                ...(prev.address || { street: '', number: '', neighborhood: '', city: '', state: '', zip: '' }),
                [field]: formattedValue
            }
        }));
    };

    const handleGuardianChange = (field: keyof Guardian, value: string) => {
        setCurrentApplicant(prev => {
            const newGuardians = [...(prev.guardians || [])];
            if (newGuardians.length === 0) {
                newGuardians.push({ name: '', cpf: '', rg: '', phone: '', email: '' });
            }
            newGuardians[0] = { ...newGuardians[0], [field]: value };
            return { ...prev, guardians: newGuardians };
        });
    };
    
    const handleHealthInfoChange = (field: keyof HealthInfo, value: string) => {
        setCurrentApplicant(prev => ({
            ...prev,
            healthInfo: {
                ...(prev.healthInfo || { allergies: '', medications: '', emergencyContactName: '', emergencyContactPhone: '' }),
                [field]: value
            }
        }));
    };

    const handlePaymentConfirm = (updatedApplicant: Applicant) => {
        setCurrentApplicant(updatedApplicant);
        setIsPaymentModalOpen(false);
    };
    
    const handleFinalizeEnrollment = () => {
        onFinalize(currentApplicant);
    };
    
    const allDocsApproved = useMemo(() => {
        return currentApplicant.documents.every(doc => doc.status === DocumentStatus.APPROVED);
    }, [currentApplicant.documents]);
    
    const canFinalize = useMemo(() => {
        return allDocsApproved && currentApplicant.dataValidated && currentApplicant.guardianDataValidated && currentApplicant.paymentConfirmed;
    }, [allDocsApproved, currentApplicant.dataValidated, currentApplicant.guardianDataValidated, currentApplicant.paymentConfirmed]);

    const handleGeminiSuggestion = async () => {
        setIsSuggesting(true);
        setGeminiSuggestion(null);
        
        const prompt = `
            Analise o status de uma nova matrícula e sugira o próximo status.
            Status atual: ${currentApplicant.status}
            Pagamento confirmado: ${currentApplicant.paymentConfirmed}
            Dados do aluno validados: ${currentApplicant.dataValidated}
            Dados do responsável validados: ${currentApplicant.guardianDataValidated}
            Documentos com reprovação: ${currentApplicant.documents.some(d => d.status === DocumentStatus.REJECTED)}
            Todos os documentos aprovados: ${allDocsApproved}

            Responda com um JSON contendo o "suggestedStatus" (use um dos valores: '${NewEnrollmentStatus.AWAITING_PAYMENT}', '${NewEnrollmentStatus.INCORRECT_DOCUMENTATION}', '${NewEnrollmentStatus.READY_TO_FINALIZE}', '${NewEnrollmentStatus.PENDING_ANALYSIS}') e uma "justification" curta.
        `;

        const schema = {
            type: 'OBJECT',
            properties: {
                suggestedStatus: { type: 'STRING' },
                justification: { type: 'STRING' },
            },
            required: ['suggestedStatus', 'justification']
        };

        try {
            const result: { suggestedStatus: string, justification: string } = await generateJsonFromText(prompt, schema);
            setGeminiSuggestion(`Sugestão: Mover para "${result.suggestedStatus}". Motivo: ${result.justification}`);
        } catch (error) {
            setGeminiSuggestion(`Erro ao obter sugestão: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsSuggesting(false);
        }
    };

    const guardian = currentApplicant.guardians?.[0] || { name: '', cpf: '', rg: '', phone: '', email: '', occupation: '' };
    const address = currentApplicant.address || { street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zip: '' };
    const healthInfo = currentApplicant.healthInfo || { allergies: '', medications: '', emergencyContactName: '', emergencyContactPhone: '' };


    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-[95vw] max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <header className="flex items-start justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <div className="flex items-center space-x-4">
                            <img src={currentApplicant.avatar} alt={currentApplicant.name} className="w-16 h-16 rounded-full" />
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Análise de Matrícula</h2>
                                <p className="text-lg text-gray-600 dark:text-gray-300">{currentApplicant.name}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </header>
                    <main className="p-6 flex-grow overflow-y-auto">
                        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 mb-4">
                            <button onClick={() => setActiveTab('data')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'data' ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-300' : 'text-gray-500'}`}>Dados Cadastrais</button>
                            <button onClick={() => setActiveTab('documents')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'documents' ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-300' : 'text-gray-500'}`}>Documentos</button>
                        </div>

                        {activeTab === 'data' && (
                            <div className="space-y-6">
                                {/* Student Data */}
                                <section className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Dados do Aluno</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField label="Nome Completo" name="name" value={currentApplicant.name} onChange={e => handleStudentDataChange('name' as keyof Applicant, e.target.value)} />
                                        <InputField label="Data de Nascimento" name="dateOfBirth" value={currentApplicant.dateOfBirth} type="date" onChange={e => handleStudentDataChange('dateOfBirth' as keyof Applicant, e.target.value)} />
                                        <div>
                                            <label htmlFor="discountProgram" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Programa de Desconto</label>
                                            <select 
                                                name="discountProgram" 
                                                id="discountProgram" 
                                                value={currentApplicant.discountProgram || 'Nenhum'} 
                                                onChange={e => setCurrentApplicant(p => ({...p, discountProgram: e.target.value}))} 
                                                className="w-full bg-white dark:bg-gray-700/80 p-2 rounded-lg text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                                            >
                                                {DISCOUNT_PROGRAMS.map(program => <option key={program} value={program}>{program}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </section>
                                
                                 {/* Address Data */}
                                <section className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Endereço</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-3"><InputField label="Logradouro" name="street" value={address.street} onChange={e => handleAddressChange('street', e.target.value)} /></div>
                                        <div><InputField label="Número" name="number" value={address.number} onChange={e => handleAddressChange('number', e.target.value)} /></div>
                                        <div className="md:col-span-2"><InputField label="Bairro" name="neighborhood" value={address.neighborhood} onChange={e => handleAddressChange('neighborhood', e.target.value)} /></div>
                                        <div className="md:col-span-2"><InputField label="Complemento" name="complement" value={address.complement} onChange={e => handleAddressChange('complement', e.target.value)} /></div>
                                        <div className="md:col-span-2"><InputField label="Cidade" name="city" value={address.city} onChange={e => handleAddressChange('city', e.target.value)} /></div>
                                        <div><InputField label="Estado (UF)" name="state" value={address.state} onChange={e => handleAddressChange('state', e.target.value)} /></div>
                                        <div className="relative">
                                            <label htmlFor="zip" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">CEP</label>
                                            <input
                                                type="text"
                                                name="zip"
                                                id="zip"
                                                value={address.zip || ''}
                                                onChange={e => handleAddressChange('zip', e.target.value)}
                                                onBlur={fetchCep}
                                                className="w-full bg-white dark:bg-gray-700/80 p-2 rounded-lg text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500 pr-10"
                                            />
                                            {isFetchingCep && (
                                                <div className="absolute inset-y-0 right-0 top-5 flex items-center pr-3 pointer-events-none">
                                                    <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>


                                {/* Guardian Data */}
                                <section className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Dados do Responsável</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField label="Nome" name="name" value={guardian.name} onChange={e => handleGuardianChange('name', e.target.value)} />
                                        <InputField label="CPF" name="cpf" value={guardian.cpf} onChange={e => handleGuardianChange('cpf', e.target.value)} />
                                        <InputField label="RG" name="rg" value={guardian.rg} onChange={e => handleGuardianChange('rg', e.target.value)} />
                                        <InputField label="Profissão" name="occupation" value={guardian.occupation} onChange={e => handleGuardianChange('occupation', e.target.value)} />
                                        <InputField label="Telefone" name="phone" value={guardian.phone} onChange={e => handleGuardianChange('phone', e.target.value)} />
                                        <InputField label="E-mail" name="email" value={guardian.email} onChange={e => handleGuardianChange('email', e.target.value)} />
                                    </div>
                                </section>

                                {/* Health Info */}
                                <section className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Ficha de Saúde</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                       <div className="md:col-span-2"><InputField label="Alergias" name="allergies" value={healthInfo.allergies} as="textarea" onChange={e => handleHealthInfoChange('allergies', e.target.value)} /></div>
                                       <div className="md:col-span-2"><InputField label="Medicação de Uso Contínuo" name="medications" value={healthInfo.medications} as="textarea" onChange={e => handleHealthInfoChange('medications', e.target.value)} /></div>
                                       <InputField label="Contato de Emergência (Nome)" name="emergencyContactName" value={healthInfo.emergencyContactName} onChange={e => handleHealthInfoChange('emergencyContactName', e.target.value)} />
                                       <InputField label="Contato de Emergência (Telefone)" name="emergencyContactPhone" value={healthInfo.emergencyContactPhone} onChange={e => handleHealthInfoChange('emergencyContactPhone', e.target.value)} />
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'documents' && (
                            <EnrollmentChecklist documents={currentApplicant.documents} onDocumentsUpdate={docs => setCurrentApplicant(prev => ({...prev, documents: docs}))} />
                        )}

                    </main>
                    
                    <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {/* Validation actions */}
                             <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg space-y-2">
                                <label className="flex items-center"><input type="checkbox" checked={currentApplicant.dataValidated} onChange={e => setCurrentApplicant(p => ({...p, dataValidated: e.target.checked}))} className="h-4 w-4 rounded text-teal-500" /><span className="ml-2 text-sm">Dados do Aluno OK</span></label>
                                <label className="flex items-center"><input type="checkbox" checked={currentApplicant.guardianDataValidated} onChange={e => setCurrentApplicant(p => ({...p, guardianDataValidated: e.target.checked}))} className="h-4 w-4 rounded text-teal-500" /><span className="ml-2 text-sm">Dados do Responsável OK</span></label>
                            </div>
                            
                            {/* Payment */}
                            <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg flex items-center justify-between">
                                {currentApplicant.paymentConfirmed ? (
                                    <div className="text-green-600 dark:text-green-400 font-semibold">✓ Pagamento Confirmado ({currentApplicant.paymentMethod})</div>
                                ) : (
                                    <div className="text-yellow-600 dark:text-yellow-400 font-semibold">! Pagamento Pendente</div>
                                )}
                                <button onClick={() => setIsPaymentModalOpen(true)} className="px-3 py-1 bg-teal-100 text-teal-700 dark:bg-teal-600/50 dark:text-teal-200 text-xs font-semibold rounded-md hover:bg-teal-200">
                                    {currentApplicant.paymentConfirmed ? 'Alterar' : 'Registrar Pagamento'}
                                </button>
                            </div>
                        </div>

                        {/* Gemini Assistant */}
                         <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg flex items-center justify-between">
                            <div className="text-sm">
                                <p className="font-bold text-teal-600 dark:text-teal-300">Assistente Gemini</p>
                                {isSuggesting ? ( <p className="text-gray-500">Analisando...</p> ) : (
                                    <p className="text-gray-600 dark:text-gray-300">{geminiSuggestion || 'Pronto para analisar o status.'}</p>
                                )}
                            </div>
                            <button onClick={handleGeminiSuggestion} disabled={isSuggesting} className="px-3 py-1 bg-teal-100 text-teal-700 dark:bg-teal-600/50 dark:text-teal-200 text-xs font-semibold rounded-md hover:bg-teal-200">Sugerir Status</button>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                            <button onClick={handleSave} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white">Salvar e Fechar</button>
                            <button onClick={handleFinalizeEnrollment} disabled={!canFinalize} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed">
                                Efetivar Matrícula
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
            {isPaymentModalOpen && (
                <EnrollmentPaymentModal
                    applicant={currentApplicant}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onConfirm={handlePaymentConfirm}
                />
            )}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            `}</style>
        </>
    );
};

export default EnrollmentValidationModal;