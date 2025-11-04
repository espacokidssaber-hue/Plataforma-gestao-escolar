import React, { useState, useMemo } from 'react';
import { Applicant, NewEnrollmentStatus, StudentDocument, EnrolledStudent, SchoolUnit, StudentLifecycleStatus } from '../types';
import EnrollmentChecklist from './EnrollmentChecklist';
import EnrollmentPaymentModal from './EnrollmentPaymentModal';
import { useEnrollment, useSchoolInfo } from '../contexts/EnrollmentContext';
import { fillContractWithData } from '../services/geminiService';
import { contractTemplate } from '../data/contractTemplate';
import PrintableContract from './contracts/PrintableContract';

// html2pdf is loaded globally from index.html
declare const html2pdf: any;


interface EnrollmentValidationModalProps {
  applicant: Applicant;
  onClose: () => void;
  onSave: (updatedApplicant: Applicant) => void;
  onFinalize: (applicantToFinalize: Applicant) => void;
}

const LabeledInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.id || props.name} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input {...props} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-sm border border-gray-300 dark:border-transparent focus:ring-teal-500 focus:border-teal-500" />
    </div>
);

const LabeledSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, ...props }) => (
    <div>
        <label htmlFor={props.id || props.name} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <select {...props} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-sm border border-gray-300 dark:border-transparent focus:ring-teal-500 focus:border-teal-500">
            {children}
        </select>
    </div>
);


const ValidationStep: React.FC<{ title: string; isChecked: boolean; onToggle: () => void; children: React.ReactNode }> = ({ title, isChecked, onToggle, children }) => (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/30">
        <label className="flex items-center justify-between cursor-pointer">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
            <div className="flex items-center">
                <span className={`text-xs font-semibold mr-2 ${isChecked ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                    {isChecked ? 'Validado' : 'Pendente'}
                </span>
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={onToggle}
                    className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-teal-500 focus:ring-teal-500"
                />
            </div>
        </label>
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/50">
            {children}
        </div>
    </div>
);


const EnrollmentValidationModal: React.FC<EnrollmentValidationModalProps> = ({ applicant, onClose, onSave, onFinalize }) => {
    const { classes, crmOptions } = useEnrollment();
    const { schoolInfo } = useSchoolInfo();
    const [editedApplicant, setEditedApplicant] = useState<Applicant>(applicant);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [financialsValidated, setFinancialsValidated] = useState(false);
    const [isDownloadingContract, setIsDownloadingContract] = useState(false);
    const [contractContent, setContractContent] = useState<string | null>(null);

    const availableGrades = useMemo(() => {
        const gradeSet = new Set<string>();
        classes.forEach(c => gradeSet.add(c.grade));
        return Array.from(gradeSet).sort();
    }, [classes]);

    const handleDocumentsUpdate = (updatedDocuments: StudentDocument[]) => {
        setEditedApplicant(prev => ({ ...prev, documents: updatedDocuments }));
    };

    const handlePaymentConfirm = (updatedApplicant: Applicant) => {
        setEditedApplicant(updatedApplicant);
        setIsPaymentModalOpen(false);
    };
    
    const handleFinancialChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumericField = name === 'enrollmentFee' || name === 'monthlyFee';
        const numericValue = isNumericField ? parseFloat(value) || 0 : value;

        setEditedApplicant(prev => ({
            ...prev,
            [name]: numericValue,
        }));
    };

    const isReadyToFinalize = useMemo(() => {
        return (
            editedApplicant.dataValidated &&
            editedApplicant.guardianDataValidated &&
            editedApplicant.paymentConfirmed &&
            financialsValidated &&
            editedApplicant.documents.every(d => d.status === 'Aprovado')
        );
    }, [editedApplicant, financialsValidated]);

    const handleSaveChanges = () => {
        let applicantWithUpdatedStatus = { ...editedApplicant };
        if (isReadyToFinalize) {
            applicantWithUpdatedStatus.status = NewEnrollmentStatus.READY_TO_FINALIZE;
        } else if (applicant.status === NewEnrollmentStatus.READY_TO_FINALIZE) {
            applicantWithUpdatedStatus.status = NewEnrollmentStatus.PENDING_ANALYSIS;
        }
        onSave(applicantWithUpdatedStatus);
    };

    const handleFinalizeEnrollment = () => {
        if (isReadyToFinalize) {
            onFinalize(editedApplicant);
        } else {
            alert('Ainda há pendências. Verifique se todos os dados, documentos, finanças e o pagamento foram validados.');
        }
    }

    const handleDownloadContract = async () => {
        if (!isReadyToFinalize) {
            alert("Valide todos os itens antes de gerar o contrato.");
            return;
        }
        setIsDownloadingContract(true);
        try {
            const studentDataForContract: EnrolledStudent = {
                id: editedApplicant.id,
                name: editedApplicant.name,
                avatar: editedApplicant.avatar,
                grade: editedApplicant.interest || 'Não informado',
                className: editedApplicant.interest || 'Não informado',
                classId: -1,
                unit: SchoolUnit.MATRIZ, 
                status: StudentLifecycleStatus.ACTIVE,
                financialStatus: 'OK', libraryStatus: 'OK', academicDocsStatus: 'OK',
                dateOfBirth: editedApplicant.dateOfBirth,
                guardians: editedApplicant.guardians,
                address: editedApplicant.address,
                enrollmentFee: editedApplicant.enrollmentFee,
                monthlyFee: editedApplicant.monthlyFee,
                discountProgram: editedApplicant.discountProgram,
            };

            const filledText = await fillContractWithData(contractTemplate, studentDataForContract, schoolInfo);
            setContractContent(filledText);
        } catch (error) {
            console.error("Error generating contract:", error);
            alert(`Erro ao gerar contrato: ${error instanceof Error ? error.message : 'Tente novamente.'}`);
            setIsDownloadingContract(false);
        }
    };

    const handleContractRendered = () => {
        const element = document.getElementById('printable-contract-content');
        if (element) {
            const safeFilename = `contrato_${editedApplicant.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
            html2pdf().from(element).set({
                margin: 20,
                filename: safeFilename,
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }).save().then(() => {
                setIsDownloadingContract(false);
                setContractContent(null);
            }).catch(() => {
                alert("Erro ao gerar PDF do contrato.");
                setIsDownloadingContract(false);
                setContractContent(null);
            });
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Validar Matrícula</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{editedApplicant.name}</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </header>
                    <main className="flex-grow p-6 space-y-4 overflow-y-auto">
                        <ValidationStep
                            title="Dados do Aluno"
                            isChecked={editedApplicant.dataValidated}
                            onToggle={() => setEditedApplicant(p => ({ ...p, dataValidated: !p.dataValidated }))}
                        >
                             <p><strong>Nome:</strong> {editedApplicant.name}</p>
                             <p><strong>Nascimento:</strong> {editedApplicant.dateOfBirth ? new Date(editedApplicant.dateOfBirth + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informado'}</p>
                        </ValidationStep>

                        <ValidationStep
                            title="Dados do Responsável"
                            isChecked={editedApplicant.guardianDataValidated}
                            onToggle={() => setEditedApplicant(p => ({ ...p, guardianDataValidated: !p.guardianDataValidated }))}
                        >
                            {editedApplicant.guardians.map((g, i) => (
                                <div key={i} className="text-sm">
                                    <p><strong>Nome:</strong> {g.name}</p>
                                    <p><strong>CPF:</strong> {g.cpf}</p>
                                    <p><strong>Email:</strong> {g.email}</p>
                                    <p><strong>Telefone:</strong> {g.phone}</p>
                                </div>
                            ))}
                        </ValidationStep>

                        <ValidationStep
                            title="Dados da Matrícula e Financeiro"
                            isChecked={financialsValidated}
                            onToggle={() => setFinancialsValidated(p => !p)}
                        >
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <LabeledSelect label="Série de Interesse *" name="interest" value={editedApplicant.interest || ''} onChange={handleFinancialChange} required>
                                    <option value="">Selecione a série...</option>
                                    {availableGrades.map(gradeName => (
                                        <option key={gradeName} value={gradeName}>{gradeName}</option>
                                    ))}
                                </LabeledSelect>
                                <LabeledSelect label="Programa de Desconto" name="discountProgram" value={editedApplicant.discountProgram || 'Nenhum'} onChange={handleFinancialChange}>
                                    {crmOptions.discountPrograms.map(program => (
                                        <option key={program} value={program}>{program}</option>
                                    ))}
                                </LabeledSelect>
                                <LabeledInput label="Taxa de Matrícula (R$) *" name="enrollmentFee" type="number" step="0.01" value={editedApplicant.enrollmentFee || 0} onChange={handleFinancialChange} required />
                                <LabeledInput label="Valor da Mensalidade (R$) *" name="monthlyFee" type="number" step="0.01" value={editedApplicant.monthlyFee || 0} onChange={handleFinancialChange} required />
                            </div>
                        </ValidationStep>
                        
                        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/30">
                            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Documentação</h3>
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/50">
                                <EnrollmentChecklist documents={editedApplicant.documents} onDocumentsUpdate={handleDocumentsUpdate} />
                            </div>
                        </div>

                        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/30">
                            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Pagamento da Taxa de Matrícula</h3>
                             <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/50 flex justify-between items-center">
                                {editedApplicant.paymentConfirmed ? (
                                    <div className="text-green-600 dark:text-green-400 font-semibold flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        Pagamento Confirmado ({editedApplicant.paymentMethod})
                                    </div>
                                ) : (
                                    <div className="text-yellow-600 dark:text-yellow-400 font-semibold">Aguardando Confirmação</div>
                                )}
                                <button onClick={() => setIsPaymentModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm">
                                    {editedApplicant.paymentConfirmed ? 'Alterar Pagamento' : 'Confirmar Pagamento'}
                                </button>
                            </div>
                        </div>
                    </main>
                    <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={handleDownloadContract} 
                                disabled={!isReadyToFinalize || isDownloadingContract}
                                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-500"
                            >
                               {isDownloadingContract ? 'Gerando...' : 'Baixar Contrato'}
                            </button>
                            <button 
                                onClick={handleFinalizeEnrollment} 
                                disabled={!isReadyToFinalize} 
                                className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-500"
                            >
                               Efetivar Matrícula
                            </button>
                        </div>
                        <div className="space-x-2">
                            <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-sm">Cancelar</button>
                             <button onClick={handleSaveChanges} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg text-sm">Salvar Alterações</button>
                        </div>
                    </footer>
                </div>
            </div>
             {isPaymentModalOpen && <EnrollmentPaymentModal applicant={editedApplicant} onClose={() => setIsPaymentModalOpen(false)} onConfirm={handlePaymentConfirm} />}
             {contractContent && (
                <div className="fixed -top-[9999px] left-0">
                    <PrintableContract text={contractContent} onRendered={handleContractRendered} />
                </div>
            )}
             <style>{`.animate-fade-in { animation: fade-in 0.2s ease-out forwards; }`}</style>
        </>
    );
};

export default EnrollmentValidationModal;
