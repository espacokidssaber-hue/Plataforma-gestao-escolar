import React, { useState, useRef, useMemo } from 'react';
import { Guardian, HealthInfo } from '../types';
import { useEnrollment } from '../contexts/EnrollmentContext';

interface PublicEnrollmentFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const allDocuments = [ 'Foto', 'Registro de Nascimento', 'RG do Aluno', 'Cartão de Vacina', 'Cartão do SUS', 'CPF do Responsável', 'Comprovante de Residência', 'Declaração da Escola', 'Declaração de Adimplência'];
const requiredDocs = ['Registro de Nascimento', 'CPF do Responsável'];


const PublicEnrollmentForm: React.FC<PublicEnrollmentFormProps> = ({ onClose, onSuccess }) => {
    const { submitPublicEnrollment } = useEnrollment();
    const [step, setStep] = useState(1);
    const [studentName, setStudentName] = useState('');
    const [guardian, setGuardian] = useState<Guardian>({ name: '', cpf: '', rg: '', phone: '', email: '' });
    const [healthInfo, setHealthInfo] = useState<HealthInfo>({ allergies: '', medications: '', emergencyContactName: '', emergencyContactPhone: ''});
    const [documents, setDocuments] = useState<Record<string, { file: File, base64: string }>>({});
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const validateStep = (currentStep: number): boolean => {
        const newErrors: Record<string, string> = {};
        if (currentStep === 1) {
            if (!studentName.trim()) newErrors.studentName = 'O nome do aluno é obrigatório.';
            if (!guardian.name.trim()) newErrors.guardianName = 'O nome do responsável é obrigatório.';
            if (!guardian.cpf.trim()) newErrors.guardianCpf = 'O CPF é obrigatório.';
            if (!guardian.phone.trim()) newErrors.guardianPhone = 'O telefone é obrigatório.';
            if (!guardian.email.trim() || !/\S+@\S+\.\S+/.test(guardian.email)) newErrors.guardianEmail = 'E-mail inválido.';
        }
        if (currentStep === 2) {
             requiredDocs.forEach(docName => {
                if (!documents[docName]) {
                    newErrors[docName] = 'Este documento é obrigatório.';
                }
            });
        }
        if (currentStep === 3) {
            if (!healthInfo.emergencyContactName.trim()) newErrors.emergencyContactName = 'O nome do contato é obrigatório.';
            if (!healthInfo.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = 'O telefone de emergência é obrigatório.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleNextStep = () => {
        if (validateStep(step)) {
            setStep(s => s + 1);
        }
    }


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docName: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const base64 = loadEvent.target?.result as string;
                setDocuments(prev => ({...prev, [docName]: { file, base64 }}));
                // Clear error for this doc on successful upload
                setErrors(prev => {
                    const newErrors = {...prev};
                    delete newErrors[docName];
                    return newErrors;
                })
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
            alert('Por favor, corrija os erros em todas as etapas antes de enviar.');
            if (!validateStep(1)) setStep(1);
            else if (!validateStep(2)) setStep(2);
            else if (!validateStep(3)) setStep(3);
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            try {
                const submittedDocs = Object.entries(documents).map(([name, docData]) => ({ name, fileUrl: (docData as { file: File; base64: string }).base64 }));
                submitPublicEnrollment({ studentName, guardian, healthInfo, documents: submittedDocs });
                setSubmitted(true);
            } catch (error) {
                if (error instanceof Error) {
                    alert(`Erro ao enviar matrícula:\n${error.message}`);
                } else {
                    alert('Ocorreu um erro desconhecido ao enviar a matrícula.');
                }
            } finally {
                setIsSubmitting(false);
            }
        }, 1500);
    };
    
    const isStepValid = useMemo(() => validateStep(step), [step, studentName, guardian, documents, healthInfo]);

    const renderStep = () => {
        const getInputClass = (fieldName: string) => `w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border ${errors[fieldName] ? 'border-red-500' : 'border-gray-300 dark:border-transparent'}`;
        const ErrorMessage: React.FC<{field: string}> = ({field}) => errors[field] ? <p className="text-xs text-red-400 mt-1">{errors[field]}</p> : null;
        
        switch (step) {
            case 1: // Student & Guardian
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">1. Dados do Aluno e Responsável</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Nome Completo do Aluno</label>
                            <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} className={getInputClass('studentName')} />
                            <ErrorMessage field="studentName"/>
                        </div>
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                             <input type="text" placeholder="Nome do Responsável Financeiro" value={guardian.name} onChange={e => setGuardian(g => ({...g, name: e.target.value}))} className={`${getInputClass('guardianName')} mb-2`} />
                             <ErrorMessage field="guardianName"/>
                             <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                                <div>
                                    <input type="text" placeholder="CPF" value={guardian.cpf} onChange={e => setGuardian(g => ({...g, cpf: e.target.value}))} className={getInputClass('guardianCpf')} />
                                    <ErrorMessage field="guardianCpf"/>
                                </div>
                                <input type="text" placeholder="RG" value={guardian.rg} onChange={e => setGuardian(g => ({...g, rg: e.target.value}))} className="bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-transparent" />
                                <div>
                                    <input type="text" placeholder="Telefone" value={guardian.phone} onChange={e => setGuardian(g => ({...g, phone: e.target.value}))} className={getInputClass('guardianPhone')} />
                                    <ErrorMessage field="guardianPhone"/>
                                </div>
                                <div>
                                    <input type="email" placeholder="E-mail" value={guardian.email} onChange={e => setGuardian(g => ({...g, email: e.target.value}))} className={getInputClass('guardianEmail')} />
                                    <ErrorMessage field="guardianEmail"/>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 2: // Documents
                return (
                     <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">2. Envio de Documentos</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Campos marcados com * são obrigatórios.</p>
                        <div className="space-y-2 mt-2 max-h-80 overflow-y-auto pr-2">
                            {allDocuments.map(docName => {
                                const isRequired = requiredDocs.includes(docName);
                                return (
                                <div key={docName} className={`p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg ${errors[docName] ? 'border border-red-500' : ''}`}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-700 dark:text-gray-300 text-sm">{docName}{isRequired && <span className="text-red-400 ml-1">*</span>}</span>
                                        <button onClick={() => fileInputRefs.current[docName]?.click()} className={`px-3 py-1 text-xs rounded-md ${documents[docName] ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
                                            {documents[docName] ? 'Enviado' : 'Anexar'}
                                        </button>
                                        <input type="file" ref={el => { if (el) fileInputRefs.current[docName] = el; }} onChange={(e) => handleFileChange(e, docName)} className="hidden" />
                                    </div>
                                    {errors[docName] && <p className="text-xs text-red-400 mt-1 pl-1">{errors[docName]}</p>}
                                </div>
                            )})}
                        </div>
                    </div>
                );
            case 3: // Health Info
                 return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">3. Ficha de Saúde</h3>
                        <textarea placeholder="Alergias conhecidas..." rows={2} value={healthInfo.allergies} onChange={e => setHealthInfo(h => ({...h, allergies: e.target.value}))} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-transparent" />
                        <textarea placeholder="Uso de medicação contínua..." rows={2} value={healthInfo.medications} onChange={e => setHealthInfo(h => ({...h, medications: e.target.value}))} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-transparent" />
                        <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                            <div>
                                <input type="text" placeholder="Contato de Emergência (Nome) *" value={healthInfo.emergencyContactName} onChange={e => setHealthInfo(h => ({...h, emergencyContactName: e.target.value}))} className={getInputClass('emergencyContactName')} />
                                <ErrorMessage field="emergencyContactName"/>
                            </div>
                            <div>
                                <input type="text" placeholder="Contato de Emergência (Telefone) *" value={healthInfo.emergencyContactPhone} onChange={e => setHealthInfo(h => ({...h, emergencyContactPhone: e.target.value}))} className={getInputClass('emergencyContactPhone')} />
                                <ErrorMessage field="emergencyContactPhone"/>
                            </div>
                        </div>
                    </div>
                 );
            default: return null;
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{submitted ? "Inscrição Concluída" : "Portal de Matrícula Online"}</h2>
                </header>
                
                {submitted ? (
                    <>
                        <main className="p-6 min-h-[450px] flex flex-col items-center justify-center text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-teal-500 dark:text-teal-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">DADOS ENVIADOS COM SUCESSO!</h2>
                            <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">Seja Bem-Vindo(a) à nossa instituição.</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">A secretaria fará a análise dos seus dados e documentos e entrará em contato em breve.</p>
                        </main>
                        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <button onClick={() => { onSuccess(); onClose(); }} className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500">
                                Fechar
                            </button>
                        </footer>
                    </>
                ) : (
                    <>
                        <main className="p-6 min-h-[450px]">
                            {renderStep()}
                        </main>
                        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Etapa {step} de 3</span>
                            </div>
                            <div className="space-x-2">
                                {step > 1 && <button onClick={() => setStep(s => s - 1)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500">Voltar</button>}
                                {step < 3 && <button onClick={handleNextStep} className="px-4 py-2 bg-teal-600 rounded-lg text-white hover:bg-teal-500">Avançar</button>}
                                {step === 3 && 
                                    <button onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 bg-green-600 rounded-lg text-white font-semibold w-36 disabled:bg-gray-500 disabled:cursor-wait hover:bg-green-500">
                                        {isSubmitting ? (
                                            <div className="flex justify-center items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Enviando...
                                            </div>
                                        ) : 'Enviar Matrícula'}
                                    </button>
                                }
                            </div>
                        </footer>
                    </>
                )}
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

export default PublicEnrollmentForm;