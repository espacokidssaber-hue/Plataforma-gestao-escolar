import React, { useState, useRef } from 'react';
import { EnrollmentSubView, Lead, LeadStatus, EnrolledStudent, Guardian, StudentAddress, StudentLifecycleStatus, SchoolClass, ClassPeriod, SchoolUnit, SchoolInfo, Contact } from '../types';
// FIX: Changed to a named import as EnrollmentFunnel does not have a default export.
import { EnrollmentFunnel } from './EnrollmentFunnel';
import NewEnrollmentsWorkflow from './NewEnrollmentsWorkflow';
import ReEnrollmentCampaign from './ReEnrollmentCampaign';
import ClassManagement from './ClassManagement';
import StudentMovement from './StudentMovement';
import { EnrollmentReports } from './EnrollmentReports';
import { EnrollmentSettings } from './EnrollmentSettings';
import PublicLinkModal from './PublicLinkModal';
import PublicEnrollmentForm from './PublicEnrollmentForm';
import { useEnrollment } from '../contexts/EnrollmentContext';
import { extractEnrolledStudentsFromPdf, ExtractedStudent } from '../services/geminiService';
import * as XLSX from 'xlsx';
import { useSchoolInfo } from '../App';

const SubNavButton: React.FC<{
    label: string;
    active: boolean;
    onClick: () => void;
}> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 whitespace-nowrap ${
            active
                ? 'bg-teal-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'
        }`}
    >
        {label}
    </button>
);

// --- AVATAR UTILS START ---
const getInitials = (name: string): string => { if (!name) return '?'; const words = name.trim().split(' ').filter(Boolean); if (words.length > 1) { return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase(); } if (words.length === 1 && words[0].length > 1) { return words[0].substring(0, 2).toUpperCase(); } if (words.length === 1) { return words[0][0].toUpperCase(); } return '?'; };
const stringToColor = (str: string): string => { let hash = 0; if (!str) return '#cccccc'; for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); hash = hash & hash; } let color = '#'; for (let i = 0; i < 3; i++) { const value = (hash >> (i * 8)) & 0xFF; const adjustedValue = 100 + (value % 156); color += ('00' + adjustedValue.toString(16)).substr(-2); } return color; };
const generateAvatar = (name: string): string => { const initials = getInitials(name); const color = stringToColor(name); const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150" fill="${color}"><rect width="100%" height="100%" fill="currentColor" /><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60" fill="#ffffff">${initials}</text></svg>`; return `data:image/svg+xml;base64,${btoa(svg)}`; };
// --- AVATAR UTILS END ---

// Helper to convert string from AI to enum
const stringToSchoolUnit = (unitString?: string): SchoolUnit => {
    if (!unitString) return SchoolUnit.MATRIZ;
    const lowerUnit = unitString.toLowerCase();
    if (lowerUnit.includes('filial')) return SchoolUnit.FILIAL;
    if (lowerUnit.includes('anexo')) return SchoolUnit.ANEXO;
    return SchoolUnit.MATRIZ; // Default
};


const Admissions: React.FC = () => {
    const [activeSubView, setActiveSubView] = useState<EnrollmentSubView>(EnrollmentSubView.NEW_ENROLLMENTS);
    const [highlightedClassId, setHighlightedClassId] = useState<number | null>(null);
    const [isPublicLinkModalOpen, setIsPublicLinkModalOpen] = useState(false);
    const [isPublicFormOpen, setIsPublicFormOpen] = useState(false);
    const [isPdfImporting, setIsPdfImporting] = useState(false);
    const [importStatus, setImportStatus] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { enrollStudentsFromImport, classes, addContacts, enrolledStudents } = useEnrollment();
    const { schoolInfo } = useSchoolInfo();

    const handlePdfImportClick = () => {
        fileInputRef.current?.click();
    };
    
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // remove the header `data:application/pdf;base64,`
                resolve(result.split(',')[1]);
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleExportSpreadsheet = async () => {
        setIsExporting(true);
        try {
            // Simulate a brief processing time for user feedback
            await new Promise(resolve => setTimeout(resolve, 500));

            const formatDate = (isoDate?: string): string => {
                if (!isoDate) return '';
                const datePart = isoDate.split('T')[0];
                const [year, month, day] = datePart.split('-');
                return `${day}/${month}/${year}`;
            };

            const getCourseFromGrade = (grade: string): string => {
                if (!grade) return '';
                const lowerGrade = grade.toLowerCase();
                if (lowerGrade.includes('infantil')) return 'EI'; // Educação Infantil
                if (lowerGrade.includes('ano')) return 'EF'; // Ensino Fundamental
                return '';
            };
            
            const exportData = enrolledStudents.map(student => {
                const guardian = student.guardians?.[0];
                const address = student.address;

                return {
                    'CNPJ da Escola': schoolInfo.cnpj,
                    'Nome Completo do Aluno': student.name,
                    'Data de Nascimento do Aluno': formatDate(student.dateOfBirth),
                    'Ano Letivo': new Date().getFullYear(),
                    'Curso': getCourseFromGrade(student.grade),
                    'Série': student.grade,
                    'Turma': student.className,
                    'Nome completo do Responsável Financeiro': guardian?.name || '',
                    'CPF do Responsável Financeiro': guardian?.cpf || '',
                    'CEP': address?.zip || '',
                    'Logradouro': address?.street || '',
                    'Número': address?.number || '',
                    'Complemento': address?.complement || '',
                    'Bairro': address?.neighborhood || '',
                    'Cidade': address?.city || '',
                    'Estado': address?.state || '',
                    'Email do Contratante': guardian?.email || '',
                    'Telefone do Contratante': guardian?.phone || '',
                };
            });

            if (exportData.length === 0) {
                alert('Não há alunos matriculados para exportar.');
                return;
            }

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados Cadastrais');
            XLSX.writeFile(workbook, 'Planilha_de_Dados_Cadastrais.xlsx');

        } catch (error) {
            console.error("Erro ao exportar planilha:", error);
            alert(`Ocorreu um erro ao gerar a planilha:\n${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsExporting(false);
        }
    };

    const findClassForStudent = (pdfSerie: string | undefined, pdfTurma: string | undefined, unit: SchoolUnit, allClasses: SchoolClass[]): SchoolClass | undefined => {
        if (!pdfSerie) return undefined;
    
        const normalizedSerie = pdfSerie.toLowerCase().trim();
        const normalizedTurma = pdfTurma?.toUpperCase().trim() || '';
    
        // Regex to capture grade (number + "ano" or "infantil" + number or "inf" + number)
        const gradeMatch = normalizedSerie.match(/(\d+)\s*º?\s*ano|infantil\s*(\d+)|inf\s*(\d+)/);
        
        if (!gradeMatch) {
            // Fallback for names that don't match the regex pattern
            const combinedName = `${normalizedSerie} ${normalizedTurma}`.replace(/[\s-ºª.:]/g, '').trim();
            return allClasses.find(c => {
               const normalizedClassName = c.name.toLowerCase().replace(/[\s-ºª.:]/g, '');
               return normalizedClassName === combinedName && c.unit === unit;
            });
        }
    
        let targetGrade: string;
        if (gradeMatch[1]) { // e.g., "3 ano" or "3º ano"
            targetGrade = `${gradeMatch[1]}º Ano`;
        } else { // e.g., "infantil 5" or "inf 5"
            targetGrade = `Infantil ${gradeMatch[2] || gradeMatch[3]}`;
        }
        
        if (!normalizedTurma) return undefined;
    
        // Try to find an exact match first
        const perfectMatch = allClasses.find(c => 
            c.grade === targetGrade &&
            c.name.toUpperCase().endsWith(` ${normalizedTurma}`) && // Check if name ends with ' A', ' B' etc.
            c.unit === unit
        );
        if (perfectMatch) return perfectMatch;
    
        // Fallback: If no perfect match on unit, find one with matching grade and turma in any unit.
        // This handles cases where a student might be allocated to a different unit's class.
        const fallbackMatch = allClasses.find(c => 
            c.grade === targetGrade &&
            c.name.toUpperCase().endsWith(` ${normalizedTurma}`)
        );
        return fallbackMatch;
    };


    const handlePdfFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Por favor, selecione um arquivo PDF.');
            return;
        }

        setIsPdfImporting(true);
        setImportStatus('Lendo arquivo...');

        try {
            const base64Data = await fileToBase64(file);
            setImportStatus('Analisando com IA...');
            const extractedData = await extractEnrolledStudentsFromPdf(base64Data);

            if (!extractedData || extractedData.length === 0) {
                 throw new Error("Nenhum aluno foi encontrado no PDF. Verifique o formato do arquivo.");
            }
            
            setImportStatus('Processando alunos...');
            await new Promise(resolve => setTimeout(resolve, 50)); // Small delay for UI update

            const newStudents: EnrolledStudent[] = extractedData.map((item: ExtractedStudent, index: number): EnrolledStudent => {
                const studentUnit = stringToSchoolUnit(item.schoolUnit);
                const foundClass = findClassForStudent(item.className, item.studentTurma, studentUnit, classes);

                const guardian: Guardian = {
                    name: item.guardianName || '',
                    cpf: item.guardianCpf || '',
                    phone: item.guardianPhone || '',
                    email: item.guardianEmail || '',
                    rg: '', // Not in the file
                };

                const address: StudentAddress = {
                    street: item.addressStreet || '',
                    number: item.addressNumber || '',
                    complement: item.addressComplement,
                    neighborhood: item.addressNeighborhood || '',
                    city: item.addressCity || '',
                    state: item.addressState || '',
                    zip: item.addressZip || '',
                };

                let isoDateOfBirth: string | undefined = undefined;
                if (item.dateOfBirth) {
                    const dateParts = item.dateOfBirth.split('/');
                    if (dateParts.length === 3) {
                        const [day, month, year] = dateParts;
                        const date = new Date(`${year}-${month}-${day}T00:00:00`);
                        // Check for invalid date
                        if (!isNaN(date.getTime())) {
                            isoDateOfBirth = date.toISOString().split('T')[0];
                        }
                    }
                }

                return {
                    id: Date.now() + index,
                    name: item.studentName,
                    avatar: generateAvatar(item.studentName),
                    grade: foundClass ? foundClass.grade : item.className || 'Não informada',
                    className: foundClass ? foundClass.name : 'A alocar',
                    classId: foundClass ? foundClass.id : -1,
                    unit: foundClass ? foundClass.unit : studentUnit, // Use class unit if found, otherwise use student's detected unit
                    status: StudentLifecycleStatus.ACTIVE,
                    financialStatus: 'OK',
                    libraryStatus: 'OK',
                    academicDocsStatus: 'OK',
                    dateOfBirth: isoDateOfBirth,
                    motherName: item.guardianName || '',
                    guardians: [guardian],
                    address: address,
                    originClassName: item.className,
                    originClassTurma: item.studentTurma,
                };
            });
            
            const newContacts: Contact[] = extractedData.map((item: ExtractedStudent) => ({
                name: item.guardianName || '',
                email: item.guardianEmail || '',
                phone: item.guardianPhone || '',
            })).filter(c => c.name);

            if (newContacts.length > 0) {
                addContacts(newContacts);
            }

            enrollStudentsFromImport(newStudents);

            alert(`${newStudents.length} alunos foram importados com sucesso! Eles estão disponíveis na tela de "Movimentação" para alocação de turma. Seus contatos (e-mail e telefone) foram adicionados à agenda em Comunicação.`);
            setActiveSubView(EnrollmentSubView.TRANSFERS);

        } catch (error) {
            console.error("Erro ao importar PDF:", error);
            alert(`Erro ao importar PDF:\n${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsPdfImporting(false);
            setImportStatus('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };


    const handleLeadConverted = () => {
        setActiveSubView(EnrollmentSubView.NEW_ENROLLMENTS);
    };

    const renderSubView = () => {
        switch (activeSubView) {
            case EnrollmentSubView.CRM:
                return <EnrollmentFunnel onLeadConverted={handleLeadConverted} />;
            case EnrollmentSubView.NEW_ENROLLMENTS:
                return <NewEnrollmentsWorkflow />;
            case EnrollmentSubView.REENROLLMENTS:
                return <ReEnrollmentCampaign />;
            case EnrollmentSubView.CLASS_MANAGEMENT:
                return <ClassManagement setActiveSubView={setActiveSubView} setHighlightedClassId={setHighlightedClassId} />;
            case EnrollmentSubView.TRANSFERS:
                return <StudentMovement highlightedClassId={highlightedClassId} setHighlightedClassId={setHighlightedClassId} />;
            case EnrollmentSubView.REPORTS:
                return <EnrollmentReports />;
            case EnrollmentSubView.SETTINGS:
                return <EnrollmentSettings />;
            default:
                return (
                    <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">
                            A visualização para "{activeSubView}" ainda não está pronta.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div>
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Matrículas e Admissões</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie todo o ciclo de vida do aluno, desde o primeiro contato até a enturmação.</p>
            </header>
            
            <nav className="flex items-center space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-3 overflow-x-auto">
                {Object.values(EnrollmentSubView).map(view => (
                    <SubNavButton
                        key={view}
                        label={view}
                        active={activeSubView === view}
                        onClick={() => setActiveSubView(view)}
                    />
                ))}
            </nav>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-800/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700/50 mb-6 gap-4">
                 <h2 className="text-lg font-bold text-gray-900 dark:text-white flex-shrink-0">Ações Rápidas</h2>
                 <div className="flex flex-wrap items-center gap-2">
                    <input type="file" ref={fileInputRef} onChange={handlePdfFileChange} accept=".pdf" className="hidden" />
                    <button onClick={handlePdfImportClick} disabled={isPdfImporting || isExporting} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 disabled:bg-gray-400 w-48 text-center">
                        {isPdfImporting ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>{importStatus || 'Importando...'}</span>
                            </div>
                        ) : 'Importar Alunos (PDF)'}
                    </button>
                    <button onClick={handleExportSpreadsheet} disabled={isPdfImporting || isExporting} className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-500 disabled:bg-gray-400">
                        {isExporting ? 'Exportando...' : 'Exportar Planilha'}
                    </button>
                    <button onClick={() => setIsPublicLinkModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500">
                        Obter Link Público
                    </button>
                    <button onClick={() => setIsPublicFormOpen(true)} className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-500">
                        Simular Acesso ao Link
                    </button>
                 </div>
            </div>

            {renderSubView()}
            {isPublicLinkModalOpen && <PublicLinkModal onClose={() => setIsPublicLinkModalOpen(false)} />}
            {isPublicFormOpen && <PublicEnrollmentForm onClose={() => setIsPublicFormOpen(false)} onSuccess={() => alert('Simulação de matrícula pública enviada com sucesso!')} />}
        </div>
    );
};

export default Admissions;