import React, { useState, useEffect, useRef } from 'react';
import { DeclarationTemplate, SchoolInfo, EnrolledStudent, StudentLifecycleStatus, SchoolUnit } from '../types';
import { generateDocumentText } from '../services/geminiService';
import PrintableDeclaration from './declarations/PrintableDeclaration';
import ManageDeclarationTypesModal from './declarations/ManageDeclarationTypesModal';
import { useSchoolInfo } from '../App';

// --- AVATAR UTILS START ---
const getInitials = (name: string): string => { if (!name) return '?'; const words = name.trim().split(' ').filter(Boolean); if (words.length > 1) { return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase(); } if (words.length === 1 && words[0].length > 1) { return words[0].substring(0, 2).toUpperCase(); } if (words.length === 1) { return words[0][0].toUpperCase(); } return '?'; };
const stringToColor = (str: string): string => { let hash = 0; if (!str) return '#cccccc'; for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); hash = hash & hash; } let color = '#'; for (let i = 0; i < 3; i++) { const value = (hash >> (i * 8)) & 0xFF; const adjustedValue = 100 + (value % 156); color += ('00' + adjustedValue.toString(16)).substr(-2); } return color; };
const generateAvatar = (name: string): string => { const initials = getInitials(name); const color = stringToColor(name); const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150" fill="${color}"><rect width="100%" height="100%" fill="currentColor" /><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60" fill="#ffffff">${initials}</text></svg>`; return `data:image/svg+xml;base64,${btoa(svg)}`; };
// --- AVATAR UTILS END ---

// FIX: Add missing 'unit' property to MOCK_STUDENTS_LIST items to conform to the EnrolledStudent type.
const MOCK_STUDENTS_LIST: EnrolledStudent[] = [
    { 
        id: 301, 
        name: 'Alice Braga', 
        avatar: generateAvatar('Alice Braga'), 
        grade: 'Infantil II', 
        className: 'Infantil II A', 
        classId: 1, 
        unit: SchoolUnit.MATRIZ, 
        status: StudentLifecycleStatus.ACTIVE, 
        financialStatus: 'OK', 
        libraryStatus: 'OK', 
        academicDocsStatus: 'OK',
        guardians: [{ name: 'Fernanda Braga', cpf: '111.222.333-44', rg: '', phone: '', email: '' }],
        address: { street: 'Rua das Flores', number: '123', neighborhood: 'Centro', city: 'João Pessoa', state: 'PB', zip: '58000-000' }
    },
    { 
        id: 302, 
        name: 'Bento Ribeiro', 
        avatar: generateAvatar('Bento Ribeiro'), 
        grade: '1º Ano', 
        className: '1º Ano A', 
        classId: 2, 
        unit: SchoolUnit.MATRIZ, 
        status: StudentLifecycleStatus.ACTIVE, 
        financialStatus: 'Pendente', 
        libraryStatus: 'OK', 
        academicDocsStatus: 'OK',
        guardians: [{ name: 'Ricardo Ribeiro', cpf: '222.333.444-55', rg: '', phone: '', email: '' }],
        address: { street: 'Avenida das Árvores', number: '456', neighborhood: 'Bessa', city: 'João Pessoa', state: 'PB', zip: '58111-000' }
    },
    { 
        id: 303, 
        name: 'Clara Nunes', 
        avatar: generateAvatar('Clara Nunes'), 
        grade: '2º Ano', 
        className: '2º Ano B', 
        classId: 3, 
        unit: SchoolUnit.FILIAL, 
        status: StudentLifecycleStatus.ACTIVE, 
        financialStatus: 'OK', 
        libraryStatus: 'Pendente', 
        academicDocsStatus: 'OK',
        guardians: [{ name: 'Mariana Nunes', cpf: '333.444.555-66', rg: '', phone: '', email: '' }],
        address: { street: 'Travessa dos Pássaros', number: '789', neighborhood: 'Manaíra', city: 'João Pessoa', state: 'PB', zip: '58222-000' }
    },
];

const INITIAL_TEMPLATES: DeclarationTemplate[] = [
    { id: 1, name: 'Declaração de Matrícula' },
    { id: 2, name: 'Declaração de Conclusão' },
    { id: 3, name: 'Declaração de Transferência' },
    { id: 4, name: 'Declaração de Quitação Financeira' },
    { id: 5, name: 'Comprovante de Escolaridade para Imposto de Renda' },
];


// FIX: Changed to a named export to resolve an import error.
export const Declarations: React.FC = () => {
    const { schoolInfo, matrizInfo } = useSchoolInfo();

    const [declarationTemplates, setDeclarationTemplates] = useState<DeclarationTemplate[]>(() => {
        const savedTemplates = localStorage.getItem('declarationTemplates');
        return savedTemplates ? JSON.parse(savedTemplates) : INITIAL_TEMPLATES;
    });

    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(declarationTemplates[0]?.id || null);
    const [generatedText, setGeneratedText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [printContent, setPrintContent] = useState<{ text: string; schoolInfo: SchoolInfo; student: EnrolledStudent; title: string } | null>(null);
    const [isManageTypesModalOpen, setIsManageTypesModalOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('declarationTemplates', JSON.stringify(declarationTemplates));
    }, [declarationTemplates]);

    useEffect(() => {
        const handleAfterPrint = () => setPrintContent(null);
        if (printContent) {
            window.addEventListener('afterprint', handleAfterPrint);
            const timer = setTimeout(() => window.print(), 100);
            return () => {
                clearTimeout(timer);
                window.removeEventListener('afterprint', handleAfterPrint);
            };
        }
    }, [printContent]);

    const getInfoForStudent = (student: EnrolledStudent | undefined): SchoolInfo => {
        let info: SchoolInfo = { ...schoolInfo };
        if (student && student.unit === SchoolUnit.MATRIZ) {
            if (matrizInfo) {
                // Override global info with matriz-specific info only if it's filled
                info.cnpj = matrizInfo.cnpj || info.cnpj;
                info.address = matrizInfo.address || info.address;
                info.email = matrizInfo.email || info.email;
                info.phone = matrizInfo.phone || info.phone;
                info.authorizationNumber = matrizInfo.authorizationNumber;
            }
        }
        return info;
    };

    const handleGenerate = async () => {
        const selectedTemplate = declarationTemplates.find(t => t.id === selectedTemplateId);
        if (!selectedStudentId || !selectedTemplate) {
            alert('Por favor, selecione um aluno e um tipo de declaração.');
            return;
        }
        const student = MOCK_STUDENTS_LIST.find(s => s.id === selectedStudentId);
        if (!student) return;

        setIsGenerating(true);
        setGeneratedText('');

        const infoForGeneration = getInfoForStudent(student);

        const guardian = student.guardians?.[0];
        const address = student.address;
        const addressString = address 
            ? `${address.street}, ${address.number}${address.complement ? `, ${address.complement}` : ''} - ${address.neighborhood}, ${address.city} - ${address.state}, CEP: ${address.zip}`
            : 'Não informado';

        const prompt = `
            Você é um(a) secretário(a) escolar com vasta experiência na redação de documentos oficiais. Sua escrita é formal, precisa e está em conformidade com as normas da língua portuguesa.

            **TAREFA PRINCIPAL:**
            Redija o corpo de um documento oficial para a finalidade específica de: **"${selectedTemplate.name}"**.

            **DADOS OBRIGATÓRIOS A SEREM UTILIZADOS:**
            - Aluno: ${student.name}
            - Série/Turma: ${student.className}
            - ID do Aluno (simulado): ${student.id}
            - Nome da Escola: ${infoForGeneration.name}
            - Dados da Unidade: CNPJ ${infoForGeneration.cnpj}, Endereço ${infoForGeneration.address}, Tel ${infoForGeneration.phone}, E-mail ${infoForGeneration.email}, Autorização ${infoForGeneration.authorizationNumber || 'N/A'}.
            - Responsável: ${guardian?.name || 'Não informado'}
            - CPF do Responsável: ${guardian?.cpf || 'Não informado'}
            - Endereço do Responsável: ${addressString}

            **REGRAS ESTRITAS:**
            1.  **FOCO ABSOLUTO NA TAREFA:** O texto deve atender **exclusivamente** à solicitação de "${selectedTemplate.name}". Use seu conhecimento sobre documentos escolares para criar o texto mais apropriado. Por exemplo, uma declaração de matrícula deve afirmar que o(a) aluno(a), filho(a) de (nome do responsável), está devidamente matriculado(a).
            2.  **FORMATO:** O texto deve ser um único parágrafo contínuo. Comece com uma frase formal como "Declaramos para os devidos fins que..." ou similar.
            3.  **NÃO INCLUIR:** Não adicione título, cabeçalho, data, cidade ou linhas de assinatura. O sistema cuidará disso. Gere **apenas** o parágrafo do corpo do texto.
            4.  **NÃO INVENTE INFORMAÇÕES:** Utilize apenas os dados fornecidos. Incorpore o nome do responsável, CPF e endereço no texto da declaração de forma natural, quando aplicável (por exemplo, "filho(a) de [responsável], portador(a) do CPF nº [CPF], residente e domiciliado(a) em [endereço do responsável]").

            Gere o texto solicitado.
        `;

        try {
            const result = await generateDocumentText(prompt);
            setGeneratedText(result);
        } catch (error) {
            console.error(error);
            setGeneratedText('Ocorreu um erro ao gerar o documento. Tente novamente.');
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handlePrint = () => {
        const student = MOCK_STUDENTS_LIST.find(s => s.id === selectedStudentId);
        const selectedTemplate = declarationTemplates.find(t => t.id === selectedTemplateId);
        if (generatedText && student && selectedTemplate) {
            const infoForPrint = getInfoForStudent(student);
            setPrintContent({ text: generatedText, schoolInfo: infoForPrint, student, title: selectedTemplate.name });
        } else {
            alert("Gere um documento, selecione um aluno e um tipo de declaração antes de imprimir.");
        }
    };
    
    const handleSaveTemplates = (newTemplates: DeclarationTemplate[]) => {
        setDeclarationTemplates(newTemplates);
        setIsManageTypesModalOpen(false);
    };

    return (
        <div className="no-print">
            <header className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerador de Declarações</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Crie documentos oficiais com a ajuda do Gemini.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna de Controles */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
                        <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-2">1. Seleção de Dados</h2>
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="student-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aluno</label>
                                <select id="student-select" value={selectedStudentId ?? ''} onChange={e => setSelectedStudentId(Number(e.target.value))} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg">
                                    <option value="">Selecione...</option>
                                    {MOCK_STUDENTS_LIST.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Declaração</label>
                                <select id="template-select" value={selectedTemplateId ?? ''} onChange={e => setSelectedTemplateId(Number(e.target.value))} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg">
                                    <option value="">Selecione...</option>
                                    {declarationTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                                <button onClick={() => setIsManageTypesModalOpen(true)} className="text-xs text-teal-600 dark:text-teal-400 hover:underline mt-1">Gerenciar tipos</button>
                            </div>
                        </div>
                    </div>
                     <button onClick={handleGenerate} disabled={isGenerating || !selectedStudentId || !selectedTemplateId} className="w-full flex items-center justify-center px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 disabled:bg-gray-500">
                        {isGenerating && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        {isGenerating ? 'Gerando...' : '2. Gerar Documento com IA'}
                    </button>
                </div>

                {/* Coluna de Visualização */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700/50 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pré-visualização</h2>
                        <button onClick={handlePrint} disabled={!generatedText} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 disabled:bg-gray-500">
                            Imprimir
                        </button>
                    </div>
                    <div className="flex-grow bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg">
                        <textarea 
                            value={generatedText}
                            onChange={e => setGeneratedText(e.target.value)}
                            className="w-full h-full bg-transparent text-gray-800 dark:text-gray-200 resize-none focus:outline-none"
                            placeholder="O texto da declaração gerada aparecerá aqui..."
                        />
                    </div>
                </div>
            </div>

            {isManageTypesModalOpen && <ManageDeclarationTypesModal templates={declarationTemplates} onClose={() => setIsManageTypesModalOpen(false)} onSave={handleSaveTemplates} />}
            
            <div className="print-container">
                {printContent && <PrintableDeclaration {...printContent} />}
            </div>
        </div>
    );
};