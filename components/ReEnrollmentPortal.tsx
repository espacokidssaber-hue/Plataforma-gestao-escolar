import React, { useState, useRef } from 'react';
import { ReEnrollingStudent, StudentDocument, DocumentStatus, NotificationType, ReEnrollmentStatus } from '../types';
import { useNotification } from '../contexts/NotificationContext';

interface ReEnrollmentPortalProps {
  student: ReEnrollingStudent;
  onClose: () => void;
  onSave: (updatedStudent: ReEnrollingStudent) => void;
}

const ReEnrollmentPortal: React.FC<ReEnrollmentPortalProps> = ({ student, onClose, onSave }) => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStudentData, setCurrentStudentData] = useState<ReEnrollingStudent>(student);
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
    const { addNotification } = useNotification();

    const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>, docName: string) => {
        const file = e.target.files?.[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const base64Url = loadEvent.target?.result as string;
                setCurrentStudentData(prev => ({
                    ...prev,
                    documents: prev.documents.map(d => d.name === docName ? {...d, fileUrl: base64Url, status: DocumentStatus.ANALYSIS, deliveryMethod: 'Digital'} : d)
                }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleFinalSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            const finalStudentState = {...currentStudentData, status: ReEnrollmentStatus.COMPLETED, lastActionDate: new Date().toISOString().split('T')[0] };
            onSave(finalStudentState);
             addNotification({
                type: NotificationType.ENROLLMENT,
                title: 'Pré-Matrícula Concluída',
                message: `${finalStudentState.name} concluiu o processo de pré-matrícula.`
            });
        }, 1000);
    }
    
    const renderStepContent = () => {
        switch (step) {
            case 1: // Data Validation
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">1. Confirmação de Dados</h3>
                        <div className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg space-y-2">
                             <p><strong className="text-gray-500 dark:text-gray-400 w-24 inline-block">Aluno:</strong> {currentStudentData.name}</p>
                             <p><strong className="text-gray-500 dark:text-gray-400 w-24 inline-block">Responsável:</strong> {currentStudentData.guardianName}</p>
                             <p><strong className="text-gray-500 dark:text-gray-400 w-24 inline-block">Turma Atual:</strong> {currentStudentData.currentGrade}</p>
                             <p><strong className="text-gray-500 dark:text-gray-400 w-24 inline-block">Próxima Turma:</strong> {currentStudentData.nextGrade}</p>
                        </div>
                        <label className="flex items-center p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
                           <input type="checkbox" className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-teal-500 focus:ring-teal-500" />
                           <span className="ml-3 text-gray-900 dark:text-white">Confirmo que os dados acima estão corretos.</span>
                        </label>
                    </div>
                );
            case 2: // Documents
                 return (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">2. Documentos Pendentes</h3>
                        {currentStudentData.documents.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center mt-8">Nenhum documento pendente para esta pré-matrícula.</p>
                        ) : (
                            <div className="space-y-2 mt-2 max-h-80 overflow-y-auto pr-2">
                                {currentStudentData.documents.map(doc => (
                                    <div key={doc.name} className="p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
                                        <span className="text-gray-700 dark:text-gray-300 text-sm">{doc.name}</span>
                                        <button onClick={() => fileInputRefs.current[doc.name]?.click()} className={`px-3 py-1 text-xs rounded-md ${doc.fileUrl ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
                                            {doc.fileUrl ? 'Enviado' : 'Anexar'}
                                        </button>
                                        <input type="file" ref={el => { if (el) fileInputRefs.current[doc.name] = el; }} onChange={(e) => handleDocumentUpload(e, doc.name)} className="hidden" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 3: // Payment
                 return (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">3. Pagamento da Taxa</h3>
                        <div className="mt-4 text-center bg-gray-100 dark:bg-gray-900/50 p-6 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400">Valor da Taxa de Pré-Matrícula</p>
                            <p className="text-4xl font-bold text-gray-900 dark:text-white my-2">R$ {currentStudentData.reenrollmentFee.toFixed(2)}</p>
                            {currentStudentData.paymentStatus === 'Pago' ? (
                                <div className="mt-4 text-green-500 dark:text-green-400 font-semibold flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    Pagamento Confirmado!
                                </div>
                            ) : (
                                <button onClick={() => setCurrentStudentData(p => ({...p, paymentStatus: 'Pago'}))} className="mt-4 px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500">
                                    Pagar com PIX (Simulação)
                                </button>
                            )}
                        </div>
                    </div>
                 );
            case 4: // Contract
                return (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">4. Assinatura do Contrato</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Escolha como deseja formalizar o novo contrato de prestação de serviços.</p>
                        <div className="space-y-3">
                            <button onClick={() => setCurrentStudentData(p => ({...p, contractSignature: 'Digital'}))} className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${currentStudentData.contractSignature === 'Digital' ? 'bg-teal-50 dark:border-teal-500 dark:bg-teal-900/50' : 'bg-gray-100 dark:bg-gray-700/50 border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}>
                                <h4 className="font-bold text-gray-900 dark:text-white">Assinatura Digital</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-300">Receba o contrato por e-mail para assinar eletronicamente. Rápido e seguro.</p>
                            </button>
                             <button onClick={() => setCurrentStudentData(p => ({...p, contractSignature: 'Presencial'}))} className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${currentStudentData.contractSignature === 'Presencial' ? 'bg-teal-50 dark:border-teal-500 dark:bg-teal-900/50' : 'bg-gray-100 dark:bg-gray-700/50 border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}>
                                <h4 className="font-bold text-gray-900 dark:text-white">Assinatura na Escola</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-300">Agende um horário para vir à secretaria e assinar o contrato fisicamente.</p>
                            </button>
                        </div>
                    </div>
                );
            case 5: // Confirmation
                return (
                     <div className="flex flex-col items-center justify-center text-center h-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-teal-500 dark:text-teal-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pré-Matrícula Concluída!</h2>
                        <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">Agradecemos por continuar conosco!</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">A vaga de {student.name} para o próximo ano letivo está garantida. Em breve, a secretaria enviará a confirmação final e os próximos passos.</p>
                    </div>
                )
            default: return null;
        }
    };


    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Portal de Pré-Matrícula</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Aluno(a): {student.name}</p>
                </header>
                
                <main className="p-6 min-h-[350px] flex flex-col justify-center">
                    {renderStepContent()}
                </main>
                
                {step < 5 && (
                    <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Etapa {step} de 4</span>
                        </div>
                        <div className="space-x-2">
                            {step > 1 && <button onClick={() => setStep(s => s - 1)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500">Voltar</button>}
                            {step < 4 && <button onClick={() => setStep(s => s + 1)} className="px-4 py-2 bg-teal-600 rounded-lg text-white hover:bg-teal-500">Avançar</button>}
                            {step === 4 && 
                                <button onClick={handleFinalSubmit} disabled={isSubmitting} className="px-4 py-2 bg-green-600 rounded-lg text-white font-semibold w-48 disabled:bg-gray-500">
                                    {isSubmitting ? 'Finalizando...' : 'Finalizar Pré-Matrícula'}
                                </button>
                            }
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default ReEnrollmentPortal;