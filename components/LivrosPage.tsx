
import React, { useState } from 'react';
import { LIVROS_ESCRITURACAO, DOCUMENTOS_INSPECAO_TEMPLATE } from '../constants';
import { type LivroEscrituracao, type Lead, type School, type Staff, type PontoRecord, TermoInspecao, InspecaoRecord } from '../types';
import { LivroDetalhe } from './LivroDetalhe';
import { Button } from './ui/Button';
import { PrinterIcon } from './icons/PrinterIcon';

interface LivrosPageProps {
    students: Lead[];
    school?: School;
    onPrintLivro: (livro: LivroEscrituracao, conteudo: any, school?: School) => void;
    staff: Staff[];
    pontoRecords: PontoRecord[];
    onUploadPontoRecord: (staffId: string, year: number, month: number, file: File) => Promise<void>;
    onDeletePontoRecord: (recordId: string) => Promise<void>;
    inspecaoRecords: InspecaoRecord[];
    onSaveInspecaoRecord: (recordData: TermoInspecao, schoolId: string, recordId?: string) => Promise<void>;
    onUploadInspecaoFile: (recordId: string, file: File) => Promise<void>;
    onDeleteInspecaoRecord: (recordId: string) => Promise<void>;
}

export const LivrosPage: React.FC<LivrosPageProps> = ({ students, school, onPrintLivro, staff, pontoRecords, onUploadPontoRecord, onDeletePontoRecord, inspecaoRecords, onSaveInspecaoRecord, onUploadInspecaoFile, onDeleteInspecaoRecord }) => {
    const [selectedLivro, setSelectedLivro] = useState<LivroEscrituracao | null>(null);
    const [conteudo, setConteudo] = useState<any>('');

    const handleSelectLivro = (livro: LivroEscrituracao) => {
        setSelectedLivro(livro);
        if (livro.tipo === 'inspecao') {
            setConteudo({
                data: new Date().toISOString().split('T')[0],
                horaInicio: '',
                horaTermino: '',
                nomeAgente: '',
                matricula: '',
                cargo: '',
                documentosExigidos: DOCUMENTOS_INSPECAO_TEMPLATE.map(d => ({ ...d })), // Create a copy
                outrosDocumentos: '',
                prazosConcedidos: '',
                irregularidades: '',
                autosInfracao: '',
                orientacao: '',
                numEmpregadosMaiores: '',
                numEmpregadosMenores: '',
                numEmpregadasMulheres: '',
            } as TermoInspecao);
        } else {
            setConteudo('');
        }
    };
    
    const isPrintDisabled = !selectedLivro || selectedLivro.tipo === 'ponto' || (selectedLivro.tipo === 'manual' && !conteudo) || (selectedLivro.tipo === 'inspecao' && !conteudo);


    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Livros de Escrituração</h1>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <ul className="space-y-1">
                            {LIVROS_ESCRITURACAO.map(livro => (
                                <li key={livro.id}>
                                    <button
                                        onClick={() => handleSelectLivro(livro)}
                                        className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                                            selectedLivro?.id === livro.id
                                                ? 'bg-teal-100 text-teal-800 font-semibold'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {livro.titulo}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="md:col-span-3">
                    {selectedLivro ? (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-start mb-4 border-b pb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">{selectedLivro.titulo}</h2>
                                    <p className="text-sm text-gray-500">{selectedLivro.descricao}</p>
                                </div>
                                <Button onClick={() => onPrintLivro(selectedLivro, conteudo, school)} disabled={isPrintDisabled}>
                                    <PrinterIcon className="w-5 h-5 mr-2" />
                                    Imprimir / Salvar PDF
                                </Button>
                            </div>
                            <LivroDetalhe
                                livro={selectedLivro}
                                students={students}
                                conteudo={conteudo}
                                onContentChange={setConteudo}
                                staff={staff}
                                pontoRecords={pontoRecords}
                                onUploadPontoRecord={onUploadPontoRecord}
                                onDeletePontoRecord={onDeletePontoRecord}
                                inspecaoRecords={inspecaoRecords}
                                onSaveInspecaoRecord={onSaveInspecaoRecord}
                                onUploadInspecaoFile={onUploadInspecaoFile}
                                onDeleteInspecaoRecord={onDeleteInspecaoRecord}
                                school={school}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-white p-6 rounded-lg shadow-md min-h-[400px]">
                            <p className="text-gray-500">Selecione um livro à esquerda para visualizar ou editar.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
