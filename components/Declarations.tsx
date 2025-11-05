import React, { useState, useMemo } from 'react';
import { useEnrollment } from '../contexts/EnrollmentContext';
import { useSchoolInfo } from '../contexts/EnrollmentContext';
import { EnrolledStudent, DeclarationTemplate } from '../types';
import PrintableDeclaration from './declarations/PrintableDeclaration';
import ManageDeclarationTemplatesModal from './declarations/ManageDeclarationTypesModal';

const Declarations: React.FC = () => {
    const { enrolledStudents, declarationTemplates } = useEnrollment();
    const { schoolInfo } = useSchoolInfo();

    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(declarationTemplates[0]?.id.toString() || '');
    const [generatedText, setGeneratedText] = useState('');
    const [printContent, setPrintContent] = useState<React.ReactNode | null>(null);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);

    const selectedStudent = useMemo(() => 
        enrolledStudents.find(s => s.id.toString() === selectedStudentId),
        [enrolledStudents, selectedStudentId]
    );

    const selectedTemplate = useMemo(() => 
        declarationTemplates.find(t => t.id.toString() === selectedTemplateId),
        [declarationTemplates, selectedTemplateId]
    );

    const handleGenerate = () => {
        if (!selectedStudent || !selectedTemplate) {
            alert('Por favor, selecione um aluno e um modelo de declaração.');
            return;
        }

        let text = selectedTemplate.content;
        const replacements: Record<string, string> = {
            '[NOME_ALUNO]': selectedStudent.name,
            '[DATA_NASCIMENTO_ALUNO]': selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth + 'T00:00:00').toLocaleDateString('pt-BR') : 'não informada',
            '[NOME_MAE_ALUNO]': selectedStudent.motherName || selectedStudent.guardians?.[0]?.name || 'não informado',
            '[SERIE_TURMA_ALUNO]': selectedStudent.className,
            '[ANO_LETIVO]': new Date().getFullYear().toString(),
            '[TURNO_ALUNO]': selectedStudent.className, // Simplified, needs period info
            '[ANO_LETIVO_CONCLUSAO]': (new Date().getFullYear() - 1).toString(),
            '[DATA_ATUAL]': new Date().toLocaleDateString('pt-BR'),
            '[CPF_ALUNO]': 'não informado', // Placeholder, needs to be added to student data
        };

        Object.entries(replacements).forEach(([key, value]) => {
            text = text.replace(new RegExp(key, 'g'), value);
        });

        setGeneratedText(text);
    };

    const handlePrint = () => {
        if (generatedText && selectedStudent && selectedTemplate) {
            setPrintContent(
                <PrintableDeclaration 
                    text={generatedText}
                    schoolInfo={schoolInfo}
                    student={selectedStudent}
                    title={selectedTemplate.name}
                />
            );
            setTimeout(() => {
                window.print();
                setPrintContent(null);
            }, 100);
        }
    };

    return (
        <div>
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Emissão de Declarações</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Gere declarações para alunos utilizando modelos pré-definidos.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Control Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
                        <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-3">1. Selecione os Dados</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="student-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aluno(a)</label>
                                <select id="student-select" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg">
                                    <option value="">Selecione...</option>
                                    {enrolledStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Declaração</label>
                                <select id="template-select" value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg">
                                    <option value="">Selecione...</option>
                                    {declarationTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleGenerate} disabled={!selectedStudentId || !selectedTemplateId} className="w-full px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 disabled:bg-gray-400">
                        2. Gerar Documento
                    </button>
                     <button onClick={() => setIsManageModalOpen(true)} className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50">
                        Gerenciar Modelos
                    </button>
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700/50 flex flex-col">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">3. Pré-visualização</h2>
                        <button onClick={handlePrint} disabled={!generatedText} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 disabled:bg-gray-400">
                            Imprimir
                        </button>
                    </div>
                    <div className="flex-grow bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg">
                        <textarea
                            value={generatedText}
                            onChange={e => setGeneratedText(e.target.value)}
                            className="w-full h-full bg-transparent text-gray-800 dark:text-gray-200 resize-none focus:outline-none leading-relaxed"
                            placeholder="O texto da declaração gerada aparecerá aqui para revisão e edição..."
                        />
                    </div>
                </div>
            </div>
            
            {isManageModalOpen && <ManageDeclarationTemplatesModal onClose={() => setIsManageModalOpen(false)} />}

            <div className="print-container">
                {printContent}
            </div>
        </div>
    );
};

export default Declarations;
