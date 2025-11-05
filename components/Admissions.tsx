import React, { useState, useRef } from 'react';
import { EnrollmentSubView, Lead, LeadStatus, EnrolledStudent, Guardian, StudentAddress, StudentLifecycleStatus, SchoolClass, ClassPeriod, SchoolUnit, SchoolInfo, Contact } from '../types';
import { EnrollmentFunnel } from './EnrollmentFunnel';
import NewEnrollmentsWorkflow from './NewEnrollmentsWorkflow';
import ReEnrollmentCampaign from './ReEnrollmentCampaign';
import ClassManagement from './ClassManagement';
import StudentMovement from './StudentMovement';
import { EnrollmentReports } from './EnrollmentReports';
import { EnrollmentSettings } from './EnrollmentSettings';
import PublicLinkModal from './PublicLinkModal';
import PublicEnrollmentForm from './PublicEnrollmentForm';
import { useEnrollment, useSchoolInfo } from '../contexts/EnrollmentContext';
import * as XLSX from 'xlsx';

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

const findClassForStudent = (
    serieOrFullName: string | undefined, 
    turma: string | undefined, 
    unit: SchoolUnit, 
    allClasses: SchoolClass[]
): SchoolClass | undefined => {
    if (!serieOrFullName) return undefined;

    const normalizedName = serieOrFullName.trim();
    const normalizedTurma = turma?.trim() || '';

    // Sanitize input by removing common separators, accents, and extra spaces, then converting to lowercase
    const sanitize = (str: string) => 
        str
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
        .toLowerCase()
        .replace(/[\s-ºª.:]/g, '')
        .trim();

    // --- STRATEGY 1: Match on combined full name ---
    // This handles cases like:
    // 1. serieOrFullName="1º Ano A", turma=""
    // 2. serieOrFullName="1º Ano", turma="A"
    const combinedInput = sanitize(`${normalizedName} ${normalizedTurma}`);

    // Try to find a match in the student's specified unit first
    const exactMatchInUnit = allClasses.find(c => sanitize(c.name) === combinedInput && c.unit === unit);
    if (exactMatchInUnit) {
        return exactMatchInUnit;
    }
    
    // Fallback: If no match in the specified unit, try to find in ANY unit.
    // This is useful if the unit in the CSV is wrong but the class name is correct.
    const exactMatchAnyUnit = allClasses.find(c => sanitize(c.name) === combinedInput);
    if (exactMatchAnyUnit) {
        return exactMatchAnyUnit;
    }

    // --- STRATEGY 2: If we are here, maybe the CSV only has the grade, not the class letter ---
    // Example: CSV has "1º Ano", but classes are "1º Ano A", "1º Ano B". We can't decide.
    // However, if there's only ONE class for that grade, we can match it.
    const sanitizedGradeOnly = sanitize(normalizedName);
    const classesWithSameGrade = allClasses.filter(c => sanitize(c.grade) === sanitizedGradeOnly && c.unit === unit);
    if (classesWithSameGrade.length === 1) {
        return classesWithSameGrade[0];
    }
    
    // Fallback for grade-only match in any unit
    const classesWithSameGradeAnyUnit = allClasses.filter(c => sanitize(c.grade) === sanitizedGradeOnly);
    if (classesWithSameGradeAnyUnit.length === 1) {
        return classesWithSameGradeAnyUnit[0];
    }
    
    return undefined; // No definitive match found
};


const Admissions: React.FC = () => {
    const [activeSubView, setActiveSubView] = useState<EnrollmentSubView>(EnrollmentSubView.NEW_ENROLLMENTS);
    const [highlightedClassId, setHighlightedClassId] = useState<number | null>(null);
    const [isPublicLinkModalOpen, setIsPublicLinkModalOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importStatus, setImportStatus] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { enrollStudentsFromImport, classes, addContacts, enrolledStudents } = useEnrollment();
    const { schoolInfo } = useSchoolInfo();

    const handleImportClick = () => {
        fileInputRef.current?.click();
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


    const handleCsvFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.csv')) {
            alert('Por favor, selecione um arquivo CSV.');
            return;
        }

        setIsImporting(true);
        setImportStatus('Lendo arquivo CSV...');

        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonFromSheet: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                    if (jsonFromSheet.length === 0) {
                        throw new Error("O arquivo CSV está vazio ou em um formato não reconhecido.");
                    }

                    setImportStatus('Processando alunos...');

                    const headerMap: { [key: string]: string[] } = {
                        studentName: ['nome do aluno', 'aluno', 'nome completo do aluno', 'nome'],
                        dateOfBirth: ['data de nascimento', 'nascimento', 'data de nascimento do aluno'],
                        className: ['série', 'serie', 'ano', 'série de interesse', 'turma', 'classe'],
                        studentTurma: ['turma'],
                        schoolUnit: ['unidade', 'unidade escolar'],
                        guardianName: ['nome do responsável', 'responsável', 'responsavel', 'nome completo do responsável financeiro'],
                        guardianCpf: ['cpf do responsável', 'cpf', 'cpf do responsável financeiro'],
                        guardianPhone: ['telefone do responsável', 'telefone', 'telefone do contratante'],
                        guardianEmail: ['email do responsável', 'email', 'e-mail', 'email do contratante'],
                        addressStreet: ['endereço', 'logradouro'],
                        addressNumber: ['número', 'numero'],
                        addressComplement: ['complemento'],
                        addressNeighborhood: ['bairro'],
                        addressCity: ['cidade'],
                        addressState: ['uf', 'estado'],
                        addressZip: ['cep'],
                    };

                    const getColumnValue = (row: any, key: keyof typeof headerMap): string => {
                        const possibleHeaders = headerMap[key];
                        for (const header of possibleHeaders) {
                            if (row[header] !== undefined) return String(row[header]);
                            // Check for case-insensitive headers
                            const rowHeader = Object.keys(row).find(rh => rh.toLowerCase().trim() === header);
                            if (rowHeader) return String(row[rowHeader]);
                        }
                        return '';
                    };

                    const newStudents: EnrolledStudent[] = jsonFromSheet.map((row: any, index: number): EnrolledStudent => {
                        const studentName = getColumnValue(row, 'studentName');
                        const studentUnit = stringToSchoolUnit(getColumnValue(row, 'schoolUnit'));
                        
                        let classNameFromCsv = getColumnValue(row, 'className');
                        let turmaFromCsv = getColumnValue(row, 'studentTurma');

                        if (classNameFromCsv === turmaFromCsv) {
                            turmaFromCsv = '';
                        }

                        const foundClass = findClassForStudent(classNameFromCsv, turmaFromCsv, studentUnit, classes);

                        const guardian: Guardian = {
                            name: getColumnValue(row, 'guardianName'),
                            cpf: getColumnValue(row, 'guardianCpf'),
                            phone: getColumnValue(row, 'guardianPhone'),
                            email: getColumnValue(row, 'guardianEmail'),
                            rg: '', // Not typically in CSV
                        };

                        const address: StudentAddress = {
                            street: getColumnValue(row, 'addressStreet'),
                            number: getColumnValue(row, 'addressNumber'),
                            complement: getColumnValue(row, 'addressComplement'),
                            neighborhood: getColumnValue(row, 'addressNeighborhood'),
                            city: getColumnValue(row, 'addressCity'),
                            state: getColumnValue(row, 'addressState'),
                            zip: getColumnValue(row, 'addressZip'),
                        };

                        const dateOfBirth = getColumnValue(row, 'dateOfBirth');
                        let isoDateOfBirth: string | undefined = undefined;
                        if (dateOfBirth) {
                            const dateParts = dateOfBirth.split(/[\/-]/);
                            if (dateParts.length === 3) {
                                // Try to handle DD/MM/YYYY and YYYY-MM-DD
                                const day = dateParts[0].length === 4 ? dateParts[2] : dateParts[0];
                                const month = dateParts[1];
                                const year = dateParts[0].length === 4 ? dateParts[0] : dateParts[2];
                                const date = new Date(`${year}-${month}-${day}T00:00:00`);
                                if (!isNaN(date.getTime())) {
                                    isoDateOfBirth = date.toISOString().split('T')[0];
                                }
                            }
                        }

                        return {
                            id: Date.now() + index,
                            name: studentName,
                            avatar: generateAvatar(studentName),
                            grade: foundClass ? foundClass.grade : classNameFromCsv || 'Não informada',
                            className: foundClass ? foundClass.name : 'A alocar',
                            classId: foundClass ? foundClass.id : -1,
                            unit: foundClass ? foundClass.unit : studentUnit,
                            status: StudentLifecycleStatus.ACTIVE,
                            financialStatus: 'OK', libraryStatus: 'OK', academicDocsStatus: 'OK',
                            dateOfBirth: isoDateOfBirth,
                            motherName: guardian.name,
                            guardians: [guardian],
                            address: address,
                            originClassName: classNameFromCsv,
                            originClassTurma: turmaFromCsv,
                        };
                    });

                    const newContacts: Contact[] = jsonFromSheet.map((row: any) => ({
                        name: getColumnValue(row, 'guardianName'),
                        email: getColumnValue(row, 'guardianEmail'),
                        phone: getColumnValue(row, 'guardianPhone'),
                    })).filter(c => c.name);

                    if (newContacts.length > 0) {
                        addContacts(newContacts);
                    }

                    enrollStudentsFromImport(newStudents);

                    const studentCount = newStudents.length;
                    const studentText = studentCount === 1 ? 'aluno foi importado' : 'alunos foram importados';
                    const pronoun = studentCount === 1 ? 'Ele está disponível' : 'Eles estão disponíveis';
                    const contactText = studentCount === 1 ? 'Seu contato foi adicionado' : 'Seus contatos foram adicionados';

                    alert(`${studentCount} ${studentText} com sucesso! ${pronoun} na tela de "Movimentação" para alocação. ${contactText} à agenda em Comunicação.`);
                    setActiveSubView(EnrollmentSubView.TRANSFERS);

                } catch (parseError) {
                    console.error("Erro ao analisar CSV:", parseError);
                    alert(`Erro ao processar o arquivo CSV:\n${parseError instanceof Error ? parseError.message : String(parseError)}`);
                } finally {
                    setIsImporting(false);
                    setImportStatus('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            };
            reader.onerror = (error) => {
                console.error("Erro ao ler o arquivo:", error);
                alert("Não foi possível ler o arquivo selecionado.");
                setIsImporting(false);
            };
            reader.readAsBinaryString(file);

        } catch (error) {
            console.error("Erro na importação:", error);
            alert(`Erro na importação:\n${error instanceof Error ? error.message : String(error)}`);
            setIsImporting(false);
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
                    <input type="file" ref={fileInputRef} onChange={handleCsvFileChange} accept=".csv" className="hidden" />
                    <button onClick={handleImportClick} disabled={isImporting || isExporting} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 disabled:bg-gray-400 w-48 text-center">
                        {isImporting ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>{importStatus || 'Importando...'}</span>
                            </div>
                        ) : 'Importar Alunos (CSV)'}
                    </button>
                    <button onClick={handleExportSpreadsheet} disabled={isImporting || isExporting} className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-500 disabled:bg-gray-400">
                        {isExporting ? 'Exportando...' : 'Exportar Planilha'}
                    </button>
                    <button onClick={() => setIsPublicLinkModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500">
                        Obter Link Público
                    </button>
                 </div>
            </div>

            {renderSubView()}
            {isPublicLinkModalOpen && <PublicLinkModal onClose={() => setIsPublicLinkModalOpen(false)} />}
        </div>
    );
};

export default Admissions;