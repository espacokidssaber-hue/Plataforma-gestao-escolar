import React, { useState, useEffect, useMemo } from 'react';
import { type User, type Lead, type DeclarationTemplate, type School, UserRole } from '../types';
import { Button } from './ui/Button';
import { DeclarationModelsModal } from './DeclarationModelsModal';
import { PrinterIcon } from './icons/PrinterIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { Cog6ToothIcon } from './icons/Cog6ToothIcon';

interface DeclarationsPageProps {
    user: User;
    schools: School[];
    students: Lead[];
    templates: DeclarationTemplate[];
    onSaveTemplate: (templateData: Omit<DeclarationTemplate, 'id' | 'schoolId'> & { schoolId?: string }, templateId?: string) => Promise<void>;
    onDeleteTemplate: (templateId: string) => Promise<void>;
    onPrintDeclaration: (content: string) => void;
    superAdminSchoolFilter: string;
}

export const DeclarationsPage: React.FC<DeclarationsPageProps> = ({ user, schools, students, templates, onSaveTemplate, onDeleteTemplate, onPrintDeclaration, superAdminSchoolFilter }) => {
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [previewContent, setPreviewContent] = useState('');
    const [isModelsModalOpen, setIsModelsModalOpen] = useState(false);

    useEffect(() => {
        if (templates.length > 0 && !selectedTemplateId) {
            setSelectedTemplateId(templates[0].id);
        }
        if (students.length > 0 && !selectedStudentId) {
            setSelectedStudentId(students[0].id);
        }
    }, [templates, students]);
    
    const generateContent = (templateContent: string, student: Lead, school?: School): string => {
        if (!templateContent || !student || !school) return '';

        const formatCurrency = (value?: number) => {
            if (value === undefined || value === null) return 'N/A';
            return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        };

        const fullAddress = `${student.responsibleAddress}, Nº ${student.responsibleAddressNumber}${student.responsibleAddressComplement ? `, ${student.responsibleAddressComplement}` : ''} - CEP: ${student.responsibleCEP}`;
        
        const anuidadeTotal = ( (student.monthlyFee || 0) * 12 ) + (student.enrollmentFee || 0);

        const replacements: { [key: string]: string } = {
            '{{aluno.nome}}': student.studentName,
            '{{responsavel.nome}}': student.responsibleName,
            '{{responsavel.cpf}}': student.responsibleCPF,
            '{{responsavel.endereco_completo}}': fullAddress,
            '{{turma.nome}}': student.className || 'Não alocado',
            '{{escola.nome}}': school.name,
            '{{escola.cnpj}}': school.cnpj,
            '{{data.atual.extenso}}': new Date().toLocaleDateString('pt-BR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            '{{valor.anuidade.total}}': formatCurrency(anuidadeTotal),
        };
      
        let content = templateContent;
        for (const variable in replacements) {
          content = content.replace(new RegExp(variable, 'g'), replacements[variable]);
        }
        return content;
    };

    const handleGenerateDocument = () => {
        const student = students.find(s => s.id === selectedStudentId);
        const template = templates.find(t => t.id === selectedTemplateId);
        
        const schoolId = student?.schoolId;
        const school = schools.find(s => s.id === schoolId);

        if (student && template && school) {
            const content = generateContent(template.content, student, school);
            setPreviewContent(content);
        } else {
            alert('Por favor, selecione um aluno e um modelo de declaração.');
        }
    };

    const handlePrint = () => {
        if (previewContent) {
            onPrintDeclaration(previewContent);
        } else {
            alert('Gere um documento antes de imprimir.');
        }
    };

    const isGenerateDisabled = !selectedStudentId || !selectedTemplateId;
    
    const inputClass = "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm transition-all";
    const previewTextareaClass = "w-full flex-grow p-4 border border-gray-200 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm font-mono bg-gray-50 min-h-[500px] transition-all shadow-sm";

    const declarationColors = useMemo(() => [
        '!bg-teal-600 hover:!bg-teal-700 focus:!ring-teal-500',
        '!bg-indigo-600 hover:!bg-indigo-700 focus:!ring-indigo-500',
        '!bg-sky-600 hover:!bg-sky-700 focus:!ring-sky-500',
        '!bg-rose-600 hover:!bg-rose-700 focus:!ring-rose-500',
        '!bg-amber-600 hover:!bg-amber-700 focus:!ring-amber-500',
    ], []);

    const buttonColorClass = useMemo(() => {
        const selectedTemplateIndex = templates.findIndex(t => t.id === selectedTemplateId);
        if (selectedTemplateIndex === -1) {
            return declarationColors[0];
        }
        return declarationColors[selectedTemplateIndex % declarationColors.length];
    }, [selectedTemplateId, templates, declarationColors]);


    return (
        <>
            <div className="py-8 px-4 sm:px-6 lg:px-8 min-h-screen bg-slate-100" style={{ backgroundImage: 'linear-gradient(rgba(241, 245, 249, 0.95), rgba(241, 245, 249, 0.95)), url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23d1d5db\' fill-opacity=\'0.6\'%3E%3Cpath d=\'M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z\'/%3E%3C/g%3E%3C/svg%3E")'}}>
                 <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="text-left">
                            <h1 className="text-3xl font-bold text-gray-900">Emissão de Declarações</h1>
                            <p className="text-gray-600 mt-1">Gere declarações para alunos utilizando modelos pré-definidos.</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-3">1. Selecione os Dados</h2>
                            <div>
                                <label htmlFor="student" className="block text-sm font-medium text-gray-700">Aluno(a)</label>
                                <select id="student" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className={inputClass}>
                                    {students.length > 0 ? (
                                        students.map(s => <option key={s.id} value={s.id}>{s.studentName}</option>)
                                    ) : (
                                        <option disabled>Nenhum aluno alocado</option>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="declarationType" className="block text-sm font-medium text-gray-700">Tipo de Declaração</label>
                                <select id="declarationType" value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)} className={inputClass}>
                                     {templates.length > 0 ? (
                                        templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)
                                    ) : (
                                        <option disabled>Nenhum modelo cadastrado</option>
                                    )}
                                </select>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-3">2. Ações</h2>
                            <div className="flex flex-col items-center space-y-4 pt-2">
                                <Button
                                    onClick={handleGenerateDocument}
                                    disabled={isGenerateDisabled}
                                    className={buttonColorClass}
                                >
                                    Gerar Documento
                                    <SparklesIcon className="w-5 h-5 ml-2" />
                                </Button>
                                <Button onClick={() => setIsModelsModalOpen(true)} variant="secondary">
                                    <Cog6ToothIcon className="w-5 h-5 mr-2" />
                                    Gerenciar Modelos
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-lg flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">3. Pré-visualização e Edição</h2>
                            <Button onClick={handlePrint} variant="secondary" disabled={!previewContent}>
                                <PrinterIcon className="w-5 h-5 mr-2" />
                                Imprimir
                            </Button>
                        </div>
                        <textarea
                            value={previewContent}
                            onChange={e => setPreviewContent(e.target.value)}
                            className={previewTextareaClass}
                            aria-label="Pré-visualização da declaração"
                            placeholder="O texto da declaração gerada aparecerá aqui para revisão e edição..."
                        />
                    </div>
                </div>
            </div>

            <DeclarationModelsModal
                isOpen={isModelsModalOpen}
                onClose={() => setIsModelsModalOpen(false)}
                templates={templates}
                onSave={onSaveTemplate}
                onDelete={onDeleteTemplate}
                user={user}
                schools={schools}
                superAdminSchoolFilter={superAdminSchoolFilter}
            />
        </>
    );
};