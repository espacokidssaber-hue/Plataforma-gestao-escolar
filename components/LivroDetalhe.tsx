

import React, { useEffect, useState, useRef } from 'react';
import { type LivroEscrituracao, type Lead, type Staff, type PontoRecord, TermoInspecao, InspecaoRecord, School } from '../types';
import { DOCUMENTOS_INSPECAO_TEMPLATE } from '../constants';
import { PontoManagement } from './PontoManagement';
import { TermoInspecaoForm } from './TermoInspecaoForm';
import { Button } from './ui/Button';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { DocumentArrowUpIcon } from './icons/DocumentArrowUpIcon';
import { EyeIcon } from './icons/EyeIcon';

interface LivroDetalheProps {
    livro: LivroEscrituracao;
    students: Lead[];
    conteudo: any;
    onContentChange: (newContent: any) => void;
    staff: Staff[];
    pontoRecords: PontoRecord[];
    onUploadPontoRecord: (staffId: string, year: number, month: number, file: File) => Promise<void>;
    onDeletePontoRecord: (recordId: string) => Promise<void>;
    inspecaoRecords: InspecaoRecord[];
    onSaveInspecaoRecord: (recordData: TermoInspecao, schoolId: string, recordId?: string) => Promise<void>;
    onUploadInspecaoFile: (recordId: string, file: File) => Promise<void>;
    onDeleteInspecaoRecord: (recordId: string) => Promise<void>;
    school?: School;
}

const newTermoTemplate = {
    data: new Date().toISOString().split('T')[0],
    horaInicio: '',
    horaTermino: '',
    nomeAgente: '',
    matricula: '',
    cargo: '',
    documentosExigidos: DOCUMENTOS_INSPECAO_TEMPLATE.map(d => ({ ...d })),
    outrosDocumentos: '',
    prazosConcedidos: '',
    irregularidades: '',
    autosInfracao: '',
    orientacao: '',
    numEmpregadosMaiores: '',
    numEmpregadosMenores: '',
    numEmpregadasMulheres: '',
};

export const LivroDetalhe: React.FC<LivroDetalheProps> = ({
    livro,
    students,
    conteudo,
    onContentChange,
    staff,
    pontoRecords,
    onUploadPontoRecord,
    onDeletePontoRecord,
    inspecaoRecords,
    onSaveInspecaoRecord,
    onUploadInspecaoFile,
    onDeleteInspecaoRecord,
    school
}) => {
    const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        if (livro.tipo === 'auto-matricula') {
            let generatedContent = `REGISTRO DE MATRÍCULA - ${new Date().getFullYear()}\n\n`;
            generatedContent += '----------------------------------------------------------------------------------------------------\n';
            generatedContent += 'Nº | NOME DO ALUNO                 | RESPONSÁVEL                     | TURMA\n';
            generatedContent += '----------------------------------------------------------------------------------------------------\n';
            
            students.forEach((student, index) => {
                const num = (index + 1).toString().padEnd(3);
                const nomeAluno = student.studentName.padEnd(28);
                const responsavel = student.responsibleName.padEnd(26);
                const turma = student.className || 'N/A';
                generatedContent += `${num}| ${nomeAluno}| ${responsavel}| ${turma}\n`;
            });
            
            generatedContent += '----------------------------------------------------------------------------------------------------\n';
            onContentChange(generatedContent);
        } else if (livro.tipo !== 'inspecao') {
            setIsCreatingNew(false);
            setEditingRecordId(null);
        }
    }, [livro, students]);

    const handleEdit = (record: InspecaoRecord) => {
        setEditingRecordId(record.id);
        onContentChange(record.termo);
        setIsCreatingNew(false);
    };

    const handleCreateNew = () => {
        setEditingRecordId(null);
        onContentChange(newTermoTemplate);
        setIsCreatingNew(true);
    };

    const handleCancelEdit = () => {
        setEditingRecordId(null);
        setIsCreatingNew(false);
        onContentChange(newTermoTemplate);
    };
    
    const handleSave = async () => {
        if (!school?.id) {
            alert("A escola não foi definida para salvar este registro.");
            return;
        }
        await onSaveInspecaoRecord(conteudo, school.id, editingRecordId || undefined);
        handleCancelEdit();
    };
    
    const handleFileUploadClick = (recordId: string) => {
        const fileInput = document.getElementById(`file-upload-${recordId}`) as HTMLInputElement;
        fileInput?.click();
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, recordId: string) => {
        if (e.target.files && e.target.files[0]) {
            await onUploadInspecaoFile(recordId, e.target.files[0]);
        }
    };


    if (livro.tipo === 'inspecao') {
        const isFormVisible = isCreatingNew || editingRecordId;
        return (
            <div>
                {!isFormVisible && (
                    <Button onClick={handleCreateNew} className="mb-4">Novo Termo de Inspeção</Button>
                )}
                
                {isFormVisible && (
                    <div className="mb-6">
                        <h3 className="text-md font-semibold text-gray-700 mb-2">
                            {editingRecordId ? 'Editando Termo de Inspeção' : 'Novo Termo de Inspeção'}
                        </h3>
                        <div className="p-4 border rounded-md bg-slate-50">
                            <TermoInspecaoForm data={conteudo as TermoInspecao} onDataChange={onContentChange} />
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="secondary" onClick={handleCancelEdit}>Cancelar</Button>
                                <Button onClick={handleSave}>Salvar Termo</Button>
                            </div>
                        </div>
                    </div>
                )}
                
                <h3 className="text-md font-semibold text-gray-700 mb-2">Termos de Inspeção Arquivados</h3>
                {inspecaoRecords.length > 0 ? (
                    <ul className="space-y-3">
                        {inspecaoRecords.map(record => (
                            <li key={record.id} className="p-3 border rounded-lg flex justify-between items-center bg-white shadow-sm">
                                <div>
                                    <p className="font-semibold">{`Termo de ${new Date(record.termo.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}`}</p>
                                    <p className="text-sm text-gray-500">Agente: {record.termo.nomeAgente}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                     <input type="file" id={`file-upload-${record.id}`} className="hidden" onChange={(e) => handleFileChange(e, record.id)} accept=".pdf"/>
                                    {record.fileUrl ? (
                                        <a href={record.fileUrl} target="_blank" rel="noopener noreferrer" title="Ver PDF Arquivado">
                                            <Button variant="secondary" className="!p-2"><EyeIcon className="w-4 h-4 text-blue-600"/></Button>
                                        </a>
                                    ) : (
                                        <Button variant="secondary" className="!p-2" onClick={() => handleFileUploadClick(record.id)} title="Anexar PDF assinado">
                                            <DocumentArrowUpIcon className="w-4 h-4"/>
                                        </Button>
                                    )}
                                    <Button variant="secondary" className="!p-2" onClick={() => handleEdit(record)} title="Editar"><PencilIcon className="w-4 h-4"/></Button>
                                    <Button variant="secondary" className="!p-2 !bg-red-50 hover:!bg-red-100" onClick={() => onDeleteInspecaoRecord(record.id)} title="Excluir"><TrashIcon className="w-4 h-4 text-red-600"/></Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-sm py-4">Nenhum termo arquivado.</p>
                )}
            </div>
        );
    }

    if (livro.tipo === 'ponto') {
        return (
            <PontoManagement 
                staff={staff}
                pontoRecords={pontoRecords}
                onUpload={onUploadPontoRecord}
                onDelete={onDeletePontoRecord}
            />
        );
    }
    
    if (livro.tipo === 'auto-matricula') {
        return (
            <div>
                <h3 className="text-md font-semibold text-gray-700 mb-2">Visualização Automática</h3>
                <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-4 rounded-md border min-h-[400px]">
                    {conteudo || 'Gerando conteúdo...'}
                </pre>
            </div>
        );
    }
    
    if (livro.tipo === 'manual') {
        return (
             <div>
                <h3 className="text-md font-semibold text-gray-700 mb-2">Conteúdo do Livro (Editável)</h3>
                <textarea
                    value={conteudo}
                    onChange={(e) => onContentChange(e.target.value)}
                    placeholder={`Digite aqui o conteúdo para o ${livro.titulo}...`}
                    className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm font-mono min-h-[400px]"
                />
            </div>
        );
    }

    return <p>Tipo de livro não suportado.</p>;
};
