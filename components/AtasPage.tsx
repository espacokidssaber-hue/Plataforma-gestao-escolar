import React, { useState, useMemo, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { type User, type School, UserRole } from '../types';
import { Button } from './ui/Button';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { PrinterIcon } from './icons/PrinterIcon';
import { ATA_TYPES } from '../constants';
import { AtaPrintData } from '../types';

interface AtasPageProps {
    user: User;
    school: School | undefined;
    onPrintAta: (data: AtaPrintData) => void;
}

const initialFormData = {
    type: ATA_TYPES[0],
    eventDate: new Date().toISOString().split('T')[0],
    participants: 'Diretoria, Coordenação Pedagógica e Corpo Docente.',
    agenda: '1. Análise dos resultados do bimestre.\n2. Discussão sobre casos de alunos com dificuldades.\n3. Planejamento das próximas atividades pedagógicas.',
    deliberations: 'Ficou decidido que será implementado um programa de reforço escolar para os alunos identificados. A coordenação apresentará o plano detalhado na próxima semana.',
};

export const AtasPage: React.FC<AtasPageProps> = ({ user, school, onPrintAta }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [educatorTerm, setEducatorTerm] = useState('Educadora');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [schoolInfo, setSchoolInfo] = useState({ name: '', cnpj: '', address: '' });

    useEffect(() => {
        if (school) {
            setSchoolInfo({ name: school.name, cnpj: school.cnpj, address: school.address });
        } else {
            setSchoolInfo({ name: '', cnpj: '', address: '' });
        }
    }, [school]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSchoolInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSchoolInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError('');
        setGeneratedContent('');
        
        const schoolData = user.role === UserRole.SUPER_ADMINISTRADOR ? schoolInfo : school;

        if (!schoolData?.name || !schoolData?.cnpj || !schoolData?.address) {
            setError('Dados da escola incompletos. Para Super Administradores, selecione uma escola ou preencha os dados manualmente. Para outros usuários, verifique se sua escola está configurada.');
            setIsGenerating(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});

            const prompt = `
                Aja como um(a) secretário(a) escolar experiente e redija uma ata de reunião formal em português do Brasil. Utilize as informações a seguir para construir o documento de forma clara, coesa e profissional.

                **Dados da Instituição para o Cabeçalho:**
                - Nome da Escola: ${schoolData.name}
                - CNPJ: ${schoolData.cnpj}
                - Endereço: ${schoolData.address}

                **Informações da Reunião:**
                - Tipo de Ata: ${formData.type}
                - Data do Evento: ${new Date(formData.eventDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' })}
                - Participantes Presentes: ${formData.participants}
                - Pauta da Reunião (Ordem do Dia):
                ${formData.agenda}
                - Principais Deliberações e Decisões:
                ${formData.deliberations}

                **Instruções de Formato:**
                1.  **Cabeçalho da Instituição:** Crie um cabeçalho claro e formatado no topo do documento com o Nome da Escola, CNPJ e Endereço fornecidos. Use asteriscos para negrito (ex: **Nome da Escola**).
                2.  **Título da Ata:** Abaixo do cabeçalho da instituição, adicione o título da ata (ex: "**ATA DA REUNIÃO DE RESULTADOS FINAIS**").
                3.  **Introdução:** Comece com um parágrafo introdutório formal, mencionando a data, hora (use um horário genérico como 14h00), local (use "sala de reuniões da instituição"), os participantes presentes e o objetivo da reunião.
                4.  **Desenvolvimento:** Discorra sobre os pontos da pauta, detalhando as discussões e as decisões tomadas conforme as deliberações fornecidas. Use uma linguagem formal.
                5.  **Conclusão e Encerramento:** Finalize a ata com um parágrafo de encerramento, como "Nada mais havendo a tratar, a reunião foi encerrada às [horário de término, ex: 15h30], e eu, [seu nome como secretário(a)], lavrei a presente ata que, após lida e aprovada, será assinada pelos presentes."

                O texto final deve ser apenas o conteúdo da ata, começando pelo cabeçalho da instituição, sem incluir este prompt ou qualquer comentário adicional. O documento NÃO deve conter uma seção de assinaturas, pois isso será adicionado separadamente.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            setGeneratedContent(response.text);

        } catch (err) {
            console.error("Error generating ata:", err);
            setError("Não foi possível gerar a ata. Verifique sua conexão ou tente novamente mais tarde.");
            setGeneratedContent("Ocorreu um erro. Por favor, tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handlePrint = () => {
        if (!generatedContent) {
            alert('Gere uma ata antes de imprimir.');
            return;
        }
        onPrintAta({ content: generatedContent, educatorTerm });
    };


    const isGenerateDisabled = isGenerating || !formData.participants.trim() || !formData.agenda.trim() || !formData.deliberations.trim();
    
    const inputClass = "mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm transition-all";
    const textareaClass = "mt-1 block w-full p-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm transition-all";
    const previewTextareaClass = "w-full flex-grow p-4 border border-gray-200 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm font-mono bg-gray-50 min-h-[500px] transition-all shadow-sm";

    const ataColors = useMemo(() => [
        '!bg-teal-600 hover:!bg-teal-700 focus:!ring-teal-500',
        '!bg-cyan-600 hover:!bg-cyan-700 focus:!ring-cyan-500',
        '!bg-blue-600 hover:!bg-blue-700 focus:!ring-blue-500',
        '!bg-violet-600 hover:!bg-violet-700 focus:!ring-violet-500',
        '!bg-slate-600 hover:!bg-slate-700 focus:!ring-slate-500',
    ], []);

    const buttonColorClass = useMemo(() => {
        const selectedAtaIndex = ATA_TYPES.findIndex(t => t === formData.type);
        if (selectedAtaIndex === -1) {
            return ataColors[0];
        }
        return ataColors[selectedAtaIndex % ataColors.length];
    }, [formData.type, ataColors]);


    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8 min-h-screen bg-slate-100" style={{ backgroundImage: 'linear-gradient(rgba(241, 245, 249, 0.95), rgba(241, 245, 249, 0.95)), url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23d1d5db\' fill-opacity=\'0.6\'%3E%3Cpath d=\'M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z\'/%3E%3C/g%3E%3C/svg%3E")' }}>
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="text-left">
                        <h1 className="text-3xl font-bold text-gray-900">Geração de Atas</h1>
                        <p className="text-gray-600 mt-1">Utilize a IA para gerar atas de reunião de forma rápida e formal.</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">1. Informações da Ata</h2>
                        
                        {user.role === UserRole.SUPER_ADMINISTRADOR && (
                            <div className="space-y-4 mb-4 p-4 border rounded-md bg-slate-50">
                                <h3 className="text-md font-semibold text-gray-700">Dados da Instituição (Editável)</h3>
                                <div>
                                    <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700">Nome da Escola</label>
                                    <input type="text" id="schoolName" name="name" value={schoolInfo.name} onChange={handleSchoolInfoChange} className={inputClass} placeholder="Insira o nome da escola" />
                                </div>
                                <div>
                                    <label htmlFor="schoolCnpj" className="block text-sm font-medium text-gray-700">CNPJ</label>
                                    <input type="text" id="schoolCnpj" name="cnpj" value={schoolInfo.cnpj} onChange={handleSchoolInfoChange} className={inputClass} placeholder="Insira o CNPJ"/>
                                </div>
                                <div>
                                    <label htmlFor="schoolAddress" className="block text-sm font-medium text-gray-700">Endereço</label>
                                    <input type="text" id="schoolAddress" name="address" value={schoolInfo.address} onChange={handleSchoolInfoChange} className={inputClass} placeholder="Insira o endereço completo" />
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo de Ata</label>
                            <select id="type" name="type" value={formData.type} onChange={handleChange} className={`${inputClass.replace('pr-4', 'pr-10')}`}>
                                {ATA_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">Data do Evento</label>
                            <input type="date" id="eventDate" name="eventDate" value={formData.eventDate} onChange={handleChange} className={inputClass}/>
                        </div>
                         <div>
                            <label htmlFor="participants" className="block text-sm font-medium text-gray-700">Participantes</label>
                            <textarea id="participants" name="participants" value={formData.participants} onChange={handleChange} rows={3} className={textareaClass}></textarea>
                        </div>
                         <div>
                            <label htmlFor="agenda" className="block text-sm font-medium text-gray-700">Pauta / Ordem do Dia</label>
                            <textarea id="agenda" name="agenda" value={formData.agenda} onChange={handleChange} rows={5} className={textareaClass}></textarea>
                        </div>
                         <div>
                            <label htmlFor="deliberations" className="block text-sm font-medium text-gray-700">Principais Deliberações</label>
                            <textarea id="deliberations" name="deliberations" value={formData.deliberations} onChange={handleChange} rows={5} className={textareaClass}></textarea>
                        </div>
                        <div>
                            <label htmlFor="educatorTerm" className="block text-sm font-medium text-gray-700">Termo para Assinaturas</label>
                            <input type="text" id="educatorTerm" name="educatorTerm" value={educatorTerm} onChange={(e) => setEducatorTerm(e.target.value)} className={inputClass} placeholder="Ex: Educadora, Professor(a)"/>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg p-6 flex justify-center items-center">
                        <Button onClick={handleGenerate} disabled={isGenerateDisabled} className={buttonColorClass}>
                           {isGenerating ? (
                                <>
                                    <SpinnerIcon className="w-5 h-5 mr-2" />
                                    Gerando...
                                </>
                            ) : (
                                <>
                                    2. Gerar Ata com IA
                                    <SparklesIcon className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-lg flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Pré-visualização e Edição</h2>
                        <Button onClick={handlePrint} variant="secondary" disabled={!generatedContent}>
                            <PrinterIcon className="w-5 h-5 mr-2" />
                            Imprimir / Salvar PDF
                        </Button>
                    </div>
                    {error && <p className="text-red-600 bg-red-100 p-2 rounded-md text-sm mb-2">{error}</p>}
                    <textarea
                        value={generatedContent}
                        onChange={e => setGeneratedContent(e.target.value)}
                        className={previewTextareaClass}
                        aria-label="Pré-visualização da ata"
                        placeholder={isGenerating ? 'Gerando o texto da ata...' : 'O texto da ata gerada pela IA aparecerá aqui para sua revisão e edição...'}
                    />
                </div>
            </div>
        </div>
    );
};