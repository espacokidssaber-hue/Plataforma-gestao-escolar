import React, { useState, useEffect } from 'react';
import { SchoolInfo } from '../types';
import { generateDocumentText } from '../services/geminiService';
import PrintableMinutes from './minutes/PrintableMinutes';

const MINUTE_TYPES = [
    'Ata de Resultados Finais',
    'Ata de Reunião Pedagógica',
    'Ata de Conselho de Classe',
    'Ata de Reunião de Pais e Mestres',
    'Ata de Posse da Diretoria',
    'Ata de Constituição de Comissão',
];

export const Minutes: React.FC = () => {
    const [schoolInfo] = useState<SchoolInfo>(() => {
        const savedInfo = localStorage.getItem('schoolInfo');
        const defaults = {
            name: 'Escola Modelo Aprender Mais',
            cnpj: '12.345.678/0001-99',
            address: 'Rua do Saber, 123 - Bairro Educação, Cidade Exemplo - SP',
            phone: '(11) 4004-1234',
            email: 'contato@escolamodelo.com',
            directorName: 'Dr. João da Silva',
            secretaryName: 'Maria Antônia de Souza',
            logo: '',
        };
        return savedInfo ? { ...defaults, ...JSON.parse(savedInfo) } : defaults;
    });

    const [selectedType, setSelectedType] = useState(MINUTE_TYPES[0]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [participants, setParticipants] = useState('Diretoria, Coordenação Pedagógica e Corpo Docente.');
    const [agenda, setAgenda] = useState('1. Análise do desempenho acadêmico do bimestre.\n2. Discussão sobre casos de alunos com dificuldades.\n3. Planejamento das próximas atividades pedagógicas.');
    const [deliberations, setDeliberations] = useState('Ficou decidido que será implementado um programa de reforço escolar para os alunos identificados. A coordenação apresentará o plano detalhado na próxima semana.');
    const [generatedText, setGeneratedText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [printContent, setPrintContent] = useState<{ text: string; schoolInfo: SchoolInfo; title: string; date: string } | null>(null);

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

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGeneratedText('');

        const prompt = `
            Você é um(a) secretário(a) escolar experiente, com profundo conhecimento em redação de documentos oficiais. Sua tarefa é redigir o texto completo de uma ata escolar formal.

            **INFORMAÇÕES PARA A ATA:**
            - **Tipo de Ata:** ${selectedType}
            - **Data da Reunião/Evento:** ${new Date(date + 'T00:00:00-03:00').toLocaleDateString('pt-BR')}
            - **Participantes Presentes:** ${participants}
            - **Pauta/Ordem do Dia:**\n${agenda}
            - **Principais Deliberações/Decisões:**\n${deliberations}
            - **Nome da Escola:** ${schoolInfo.name}

            **REGRAS ESTRITAS DE FORMATAÇÃO:**
            1.  **Estrutura Formal:** Siga a estrutura clássica de uma ata. Comece com a abertura formal, mencionando a data, local, hora (pode usar "às nove horas"), e os presentes, para discutir a pauta informada.
            2.  **Desenvolvimento:** Descreva os pontos da pauta que foram discutidos e as deliberações tomadas. Incorpore as informações de "Pauta" e "Deliberações" de forma fluida e oficial no corpo do texto.
            3.  **Encerramento:** Conclua a ata com a frase de encerramento padrão, como "Nada mais havendo a tratar, eu, ${schoolInfo.secretaryName}, Secretário(a), lavrei a presente ata que, depois de lida e aprovada, será assinada por mim e pelo(a) Diretor(a), ${schoolInfo.directorName}."
            4.  **Texto Único:** Gere todo o conteúdo como um único parágrafo contínuo, sem quebras de linha duplas, como é tradicional em atas.
            5.  **NÃO INCLUIR:** Não adicione o título "Ata de...", nem a data e local por extenso no final, nem as linhas de assinatura. O sistema cuidará disso. Gere APENAS o corpo do texto da ata.

            Redija a ata completa.
        `;

        try {
            const result = await generateDocumentText(prompt);
            setGeneratedText(result);
        } catch (error) {
            console.error(error);
            setGeneratedText('Ocorreu um erro ao gerar a ata. Tente novamente.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = () => {
        if (generatedText) {
            setPrintContent({
                text: generatedText,
                schoolInfo,
                title: selectedType,
                date: new Date(date + 'T00:00:00-03:00').toLocaleDateString('pt-BR')
            })
        } else {
            alert('Gere uma ata antes de imprimir.');
        }
    };

    return (
        <div className="no-print">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerador de Atas</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Crie atas formais para reuniões e conselhos com a ajuda da IA.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna de Controles */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
                        <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-2">1. Informações da Ata</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="minute-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Ata</label>
                                <select id="minute-type" value={selectedType} onChange={e => setSelectedType(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg">
                                    {MINUTE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="minute-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data do Evento</label>
                                <input type="date" id="minute-date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                            </div>
                            <div>
                                <label htmlFor="participants" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Participantes</label>
                                <textarea id="participants" value={participants} onChange={e => setParticipants(e.target.value)} rows={2} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label htmlFor="agenda" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pauta / Ordem do Dia</label>
                                <textarea id="agenda" value={agenda} onChange={e => setAgenda(e.target.value)} rows={4} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-sm" />
                            </div>
                             <div>
                                <label htmlFor="deliberations" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Principais Deliberações</label>
                                <textarea id="deliberations" value={deliberations} onChange={e => setDeliberations(e.target.value)} rows={4} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-sm" />
                            </div>
                        </div>
                    </div>
                     <button onClick={handleGenerate} disabled={isGenerating} className="w-full flex items-center justify-center px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 disabled:bg-gray-500">
                        {isGenerating && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        {isGenerating ? 'Gerando...' : '2. Gerar Ata com IA'}
                    </button>
                </div>

                {/* Coluna de Visualização */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700/50 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pré-visualização e Edição</h2>
                        <button onClick={handlePrint} disabled={!generatedText} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 disabled:bg-gray-500">
                            Imprimir
                        </button>
                    </div>
                    <div className="flex-grow bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg">
                        <textarea 
                            value={generatedText}
                            onChange={e => setGeneratedText(e.target.value)}
                            className="w-full h-full bg-transparent text-gray-800 dark:text-gray-200 resize-none focus:outline-none"
                            placeholder="O texto da ata gerada pela IA aparecerá aqui para sua revisão e edição..."
                        />
                    </div>
                </div>
            </div>
            
            <div className="print-container">
                {printContent && <PrintableMinutes {...printContent} />}
            </div>
        </div>
    );
};