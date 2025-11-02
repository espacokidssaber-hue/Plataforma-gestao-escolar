import React, { useState, useMemo, useLayoutEffect } from 'react';
import { EnrolledStudent, Guardian, StudentAddress, AcademicHistoryEntry, SchoolInfo, Subject as SubjectType, StudentTranscriptData, EnrichedEnrolledStudent } from '../../types';
import { useEnrollment } from '../../contexts/EnrollmentContext';
import { MOCK_ACADEMIC_HISTORY } from '../../data/academicHistoryData';
import EditHistoryEntryModal from './EditHistoryEntryModal';
import { streamDocumentText } from '../../services/geminiService';
import { MOCK_STUDENTS_ACADEMIC } from '../../data/academicRecordsData';
import { MOCK_SUBJECTS } from '../../data/subjectsData';
import PrintableFullRecord from './PrintableFullRecord';
import PrintableTranscript from '../academic/PrintableTranscript';
import PrintableEnrollmentForm from './PrintableEnrollmentForm';


// html2pdf is loaded globally from index.html
declare const html2pdf: any;


interface RegistrationFormProps {
  student: EnrolledStudent;
  onClose: () => void;
}

const InputField: React.FC<{ label: string; name: string; value: string | undefined; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; }> = ({ label, name, value, onChange, type = 'text' }) => (
    <div>
        <label htmlFor={name} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input type={type} name={name} id={name} value={value || ''} onChange={onChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-sm" />
    </div>
);

const RegistrationForm: React.FC<RegistrationFormProps> = ({ student, onClose }) => {
    const { updateEnrolledStudent } = useEnrollment();
    const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'financial'>('personal');
    const [editedStudent, setEditedStudent] = useState<EnrolledStudent>(() => JSON.parse(JSON.stringify(student)));
    
    const initialHistory = useMemo(() => MOCK_ACADEMIC_HISTORY[student.id] || [], [student.id]);
    const [academicHistory, setAcademicHistory] = useState<AcademicHistoryEntry[]>(() => JSON.parse(JSON.stringify(initialHistory)));
    const [entryToEdit, setEntryToEdit] = useState<AcademicHistoryEntry | null>(null);
    const [isAddingNewEntry, setIsAddingNewEntry] = useState(false);
    const [pedagogicalObservation, setPedagogicalObservation] = useState('');
    const [isGeneratingObs, setIsGeneratingObs] = useState(false);

    const [isDownloading, setIsDownloading] = useState<string | null>(null);
    const [printableContent, setPrintableContent] = useState<React.ReactNode | null>(null);

    const hasChanges = useMemo(() => {
        const studentChanged = JSON.stringify(editedStudent) !== JSON.stringify(student);
        const historyChanged = JSON.stringify(academicHistory) !== JSON.stringify(initialHistory);
        // Observation is new data, so if it has content, it's a change.
        const observationChanged = pedagogicalObservation.trim() !== '';

        return studentChanged || historyChanged || observationChanged;
    }, [editedStudent, student, academicHistory, initialHistory, pedagogicalObservation]);

    useLayoutEffect(() => {
        if (!printableContent || !isDownloading) return;

        const generatePdf = (elementId: string, fileName: string, errorMessage: string) => {
            // A short delay to ensure the component has rendered to the DOM.
            const timer = setTimeout(() => {
                const element = document.getElementById(elementId);
                if (element) {
                    html2pdf().from(element).set({
                        margin: 20, // 2cm margin
                        filename: fileName,
                        html2canvas: { scale: 2, useCORS: true },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                    }).save().then(() => {
                        setIsDownloading(null);
                        setPrintableContent(null);
                    }).catch(() => {
                        alert(errorMessage);
                        setIsDownloading(null);
                        setPrintableContent(null);
                    });
                } else {
                    alert(`Erro: Elemento para impressão não encontrado (${elementId}).`);
                    setIsDownloading(null);
                    setPrintableContent(null);
                }
            }, 150);

            return () => clearTimeout(timer);
        };

        switch (isDownloading) {
            case 'registration':
                generatePdf('printable-full-record-wrapper', `ficha_cadastral_${student.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`, "Ocorreu um erro ao gerar o PDF da Ficha Cadastral.");
                break;
            case 'transcript':
                generatePdf('printable-transcript-for-download', `historico_escolar_${student.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`, "Ocorreu um erro ao gerar o PDF do Histórico Escolar.");
                break;
            case 'enrollment':
                generatePdf('printable-enrollment-form-for-download', `ficha_matricula_${student.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`, "Ocorreu um erro ao gerar o PDF da Ficha de Matrícula.");
                break;
        }
    }, [printableContent, isDownloading, student.name]);


    const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedStudent(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedStudent(prev => ({
            ...prev,
            address: {
                ...(prev.address || { street: '', number: '', neighborhood: '', city: '', state: '', zip: '' }),
                [name]: value
            }
        }));
    };
    
    const handleGuardianChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedStudent(prev => {
            const newGuardians = [...(prev.guardians || [])];
            if (newGuardians[index]) {
                newGuardians[index] = { ...newGuardians[index], [name as keyof Guardian]: value };
            }
            return { ...prev, guardians: newGuardians };
        });
    };
    
    const handleSave = () => {
        updateEnrolledStudent(editedStudent);
        // In a real app, you would also save academicHistory and observation.
        onClose();
    };

    const handleSaveHistoryEntry = (updatedEntry: AcademicHistoryEntry) => {
        if (isAddingNewEntry) {
            setAcademicHistory(prev => [...prev, updatedEntry]);
        } else {
            setAcademicHistory(prev => prev.map(e => e.year === updatedEntry.year ? updatedEntry : e));
        }
        setEntryToEdit(null);
        setIsAddingNewEntry(false);
    };

    const handleAddNewEntry = () => {
        setIsAddingNewEntry(true);
        setEntryToEdit({
            year: new Date().getFullYear(),
            gradeLevel: '',
            schoolName: '',
            schoolLocation: '',
            grades: {},
            workload: {},
            attendance: 0,
            totalSchoolDays: 200,
            status: 'Aprovado'
        });
    };

    const generateObservation = async () => {
        setIsGeneratingObs(true);
        setPedagogicalObservation('');
        const studentAcademicRecord = MOCK_STUDENTS_ACADEMIC[student.classId]?.find(rec => rec.studentId === student.id);
        if (!studentAcademicRecord) {
            alert('Dados acadêmicos do ano corrente não encontrados para gerar observação.');
            setIsGeneratingObs(false);
            return;
        }

        const prompt = `
            Baseado no histórico e no desempenho atual do(a) aluno(a) ${student.name}, escreva uma observação pedagógica geral para a ficha do aluno.
            Desempenho atual: ${JSON.stringify(studentAcademicRecord.grades)}.
            Histórico: ${academicHistory.map(h => `${h.year}: ${h.status}`).join(', ')}.
            Seja conciso, profissional e construtivo.
        `;
        
        try {
            const stream = await streamDocumentText(prompt);
            for await (const chunk of stream) {
                setPedagogicalObservation(prev => prev + (chunk.text || ''));
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao gerar observação.");
        } finally {
            setIsGeneratingObs(false);
        }
    };

    const handleDownloadRegistrationForm = () => {
        const schoolInfo = JSON.parse(localStorage.getItem('schoolInfo') || '{}');
        const academicRecord = MOCK_STUDENTS_ACADEMIC[student.classId]?.find(rec => rec.studentId === student.id);

        if (!academicRecord) {
            alert("Não foi possível encontrar o registro acadêmico para gerar o PDF.");
            return;
        }
        setPrintableContent(
            <div id="printable-full-record-wrapper">
                <PrintableFullRecord
                    student={editedStudent}
                    academicRecord={academicRecord}
                    subjects={MOCK_SUBJECTS}
                    observations={pedagogicalObservation}
                    schoolInfo={schoolInfo}
                />
            </div>
        );
        setIsDownloading('registration');
    };

    const handleDownloadTranscript = () => {
        const schoolInfo = JSON.parse(localStorage.getItem('schoolInfo') || '{}');

        // Create the data object for the transcript, mocking missing EnrichedEnrolledStudent fields
        const transcriptData: StudentTranscriptData = {
            student: {
                ...editedStudent,
                enrollmentId: String(editedStudent.id).padStart(6, '0') + '-' + String(editedStudent.id % 10),
                cityOfBirth: 'Não informado',
                stateOfBirth: 'NI',
                motherName: editedStudent.guardians?.[0]?.name || 'Não informado',
                fatherName: editedStudent.fatherName || 'Não informado',
            },
            schoolInfo: schoolInfo,
            academicHistory: academicHistory,
            observations: "Documento emitido para fins de transferência."
        };
        
        setPrintableContent(
            <div id="printable-transcript-for-download">
                <PrintableTranscript {...transcriptData} />
            </div>
        );
        setIsDownloading('transcript');
    };

    const handleDownloadEnrollmentForm = () => {
        const schoolInfo = JSON.parse(localStorage.getItem('schoolInfo') || '{}');
        setPrintableContent(
            <div id="printable-enrollment-form-for-download">
                 <PrintableEnrollmentForm
                    student={editedStudent}
                    schoolInfo={schoolInfo}
                />
            </div>
        );
        setIsDownloading('enrollment');
    };

    const anyDownloadInProgress = !!isDownloading;

    return (
        <>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-[95vw] max-w-5xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex-shrink-0 flex items-start justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                        <img src={editedStudent.avatar} alt={editedStudent.name} className="w-16 h-16 rounded-full" />
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ficha Cadastral do Aluno</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300">{editedStudent.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <nav className="flex-shrink-0 flex space-x-2 border-b border-gray-200 dark:border-gray-700 px-6">
                    <button onClick={() => setActiveTab('personal')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'personal' ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-300' : 'text-gray-500'}`}>Ficha Cadastral</button>
                    <button onClick={() => setActiveTab('academic')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'academic' ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-300' : 'text-gray-500'}`}>Vida Acadêmica</button>
                    <button onClick={() => setActiveTab('financial')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'financial' ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-300' : 'text-gray-500'}`}>Financeiro</button>
                </nav>

                <main className="flex-grow p-6 overflow-y-auto space-y-6">
                    {activeTab === 'personal' && (
                        <div className="space-y-6">
                            <section className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/30">
                                <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Dados do Aluno</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2"><InputField label="Nome Completo" name="name" value={editedStudent.name} onChange={handleStudentChange} /></div>
                                    <InputField label="Data de Nascimento" name="dateOfBirth" type="date" value={editedStudent.dateOfBirth} onChange={handleStudentChange} />
                                </div>
                            </section>
                            <section className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/30">
                                <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Endereço</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                     <InputField label="CEP" name="zip" value={editedStudent.address?.zip} onChange={handleAddressChange} />
                                     <div className="md:col-span-3"><InputField label="Logradouro" name="street" value={editedStudent.address?.street} onChange={handleAddressChange} /></div>
                                     <InputField label="Número" name="number" value={editedStudent.address?.number} onChange={handleAddressChange} />
                                     <InputField label="Complemento" name="complement" value={editedStudent.address?.complement} onChange={handleAddressChange} />
                                     <div className="md:col-span-2"><InputField label="Bairro" name="neighborhood" value={editedStudent.address?.neighborhood} onChange={handleAddressChange} /></div>
                                     <InputField label="Cidade" name="city" value={editedStudent.address?.city} onChange={handleAddressChange} />
                                     <InputField label="Estado" name="state" value={editedStudent.address?.state} onChange={handleAddressChange} />
                                 </div>
                            </section>
                            {editedStudent.guardians?.map((guardian, index) => (
                                <section key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/30">
                                    <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Dados do Responsável {index + 1}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField label="Nome" name="name" value={guardian.name} onChange={(e) => handleGuardianChange(index, e)} />
                                        <InputField label="CPF" name="cpf" value={guardian.cpf} onChange={(e) => handleGuardianChange(index, e)} />
                                        <InputField label="Telefone" name="phone" value={guardian.phone} onChange={(e) => handleGuardianChange(index, e)} />
                                        <InputField label="E-mail" name="email" value={guardian.email} onChange={(e) => handleGuardianChange(index, e)} />
                                    </div>
                                </section>
                            ))}
                            <section className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/30">
                                <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Permissões</h3>
                                <label className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        checked={editedStudent.imageUsagePermission ?? true}
                                        onChange={e => setEditedStudent(prev => ({...prev, imageUsagePermission: e.target.checked}))}
                                        className="h-4 w-4 rounded text-teal-500" 
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        Responsável autoriza o uso da imagem do aluno para fins pedagógicos e de divulgação da escola.
                                    </span>
                                </label>
                            </section>
                        </div>
                    )}
                     {activeTab === 'academic' && (
                        <div>
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Histórico Escolar Anterior</h3>
                                <button onClick={handleAddNewEntry} className="px-3 py-1 bg-teal-600 text-white rounded-lg text-sm font-semibold">+ Adicionar Ano Letivo</button>
                            </div>
                            <div className="overflow-x-auto mt-2">
                                <table className="w-full text-left text-sm">
                                    <thead><tr className="border-b dark:border-gray-700"><th className="p-2">Ano</th><th className="p-2">Série</th><th className="p-2">Escola</th><th className="p-2">Situação</th><th className="p-2">Ação</th></tr></thead>
                                    <tbody>
                                    {academicHistory.map(entry => (
                                        <tr key={entry.year} className="border-b dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                            <td className="p-2">{entry.year}</td>
                                            <td className="p-2">{entry.gradeLevel}</td>
                                            <td className="p-2">{entry.schoolName}</td>
                                            <td className="p-2">{entry.status}</td>
                                            <td className="p-2"><button onClick={() => { setIsAddingNewEntry(false); setEntryToEdit(entry); }} className="text-blue-500 text-xs font-semibold">Editar</button></td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            <h3 className="text-lg font-bold mt-6 text-gray-800 dark:text-gray-200">Observação Pedagógica Geral</h3>
                            <textarea value={pedagogicalObservation} onChange={(e) => setPedagogicalObservation(e.target.value)} rows={5} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg mt-2 text-sm" placeholder="Clique em 'Gerar com IA' para uma sugestão de texto ou escreva manualmente."></textarea>
                            <button onClick={generateObservation} disabled={isGeneratingObs} className="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200">{isGeneratingObs ? 'Gerando...' : 'Gerar com IA'}</button>
                        </div>
                    )}
                    {activeTab === 'financial' && (
                        <section className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/30">
                            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Dados Financeiros</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputField label="Taxa de Matrícula (R$)" name="enrollmentFee" value={editedStudent.enrollmentFee?.toString()} onChange={handleStudentChange} />
                                <InputField label="Mensalidade (R$)" name="monthlyFee" value={editedStudent.monthlyFee?.toString()} onChange={handleStudentChange} />
                            </div>
                        </section>
                    )}
                </main>
                
                <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                         <button 
                            onClick={handleDownloadEnrollmentForm} 
                            disabled={anyDownloadInProgress || hasChanges} 
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            title={hasChanges ? "Salve as alterações para baixar a ficha atualizada." : "Baixar Ficha de Matrícula em PDF"}
                        >
                           {isDownloading === 'enrollment' ? 'Baixando...' : 'Baixar Ficha de Matrícula'}
                        </button>
                         <button 
                            onClick={handleDownloadRegistrationForm} 
                            disabled={anyDownloadInProgress || hasChanges} 
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            title={hasChanges ? "Salve as alterações para baixar a ficha atualizada." : "Baixar Ficha Cadastral em PDF"}
                        >
                           {isDownloading === 'registration' ? 'Baixando...' : 'Baixar Ficha Cadastral'}
                        </button>
                         <button 
                            onClick={handleDownloadTranscript} 
                            disabled={anyDownloadInProgress || hasChanges} 
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            title={hasChanges ? "Salve as alterações para baixar o histórico atualizado." : "Baixar Histórico Escolar em PDF"}
                        >
                           {isDownloading === 'transcript' ? 'Baixando...' : 'Baixar Histórico Escolar'}
                        </button>
                    </div>
                    <div className="space-x-2">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-sm">Cancelar</button>
                        <button 
                            onClick={handleSave} 
                            disabled={!hasChanges} 
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </footer>
            </div>
        </div>
        {(entryToEdit) && (
            <EditHistoryEntryModal
                entry={entryToEdit}
                isAddingNew={isAddingNewEntry}
                onClose={() => { setEntryToEdit(null); setIsAddingNewEntry(false); }}
                onSave={handleSaveHistoryEntry}
            />
        )}
        {printableContent && (
            <div className="fixed -top-[9999px] left-0">{printableContent}</div>
        )}
        </>
    );
};

export default RegistrationForm;