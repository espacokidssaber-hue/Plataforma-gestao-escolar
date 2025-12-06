import React from 'react';
import { type LivroEscrituracao, type School, type TermoInspecao } from '../types';
import { SchoolLogoIcon } from './icons/SchoolLogoIcon';

const TermoInspecaoPrint: React.FC<{ termo: TermoInspecao }> = ({ termo }) => {
    return (
        <div className="font-serif text-sm">
            <h2 className="text-xl font-bold text-center uppercase mb-8">Termo de Registro de Inspeção</h2>
            
            <div className="grid grid-cols-3 gap-x-8 gap-y-4 mb-4">
                <div className="border-b border-dotted border-black">Data: <span className="font-semibold">{termo.data ? new Date(termo.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '___/___/______'}</span></div>
                <div className="border-b border-dotted border-black">Hora de Início: <span className="font-semibold">{termo.horaInicio || '____:____'}</span></div>
                <div className="border-b border-dotted border-black">Término: <span className="font-semibold">{termo.horaTermino || '____:____'}</span></div>
            </div>

            <div className="border-b border-dotted border-black mb-4">Nome do Agente da Inspeção do Trabalho: <span className="font-semibold">{termo.nomeAgente}</span></div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6">
                <div className="border-b border-dotted border-black">Matrícula: <span className="font-semibold">{termo.matricula}</span></div>
                <div className="border-b border-dotted border-black">Cargo ou função: <span className="font-semibold">{termo.cargo}</span></div>
            </div>

            <div className="mb-6">
                <h3 className="font-semibold mb-2">Documentos exigidos:</h3>
                <ul className="space-y-1">
                    {termo.documentosExigidos.map(doc => (
                        <li key={doc.id} className="flex justify-between items-center">
                            <span>{doc.id} - {doc.nome}</span>
                            <span className="font-semibold mr-4">({doc.exigido === 'sim' ? 'X' : ' '}) Sim ({doc.exigido === 'nao' ? 'X' : ' '}) Não ({doc.exigido === 'nao_se_aplica' ? 'X' : ' '}) N/A</span>
                        </li>
                    ))}
                    <li className="flex justify-between items-center">
                        <span>16 - E mais: {termo.outrosDocumentos}</span>
                        <span>( )</span>
                    </li>
                </ul>
            </div>

            <div className="space-y-4 mb-6">
                <div className="border-b border-dotted border-black min-h-[2rem]">Prazos concedidos: <span className="font-normal">{termo.prazosConcedidos}</span></div>
                <div className="border-b border-dotted border-black min-h-[3rem]">Irregularidades encontradas: <span className="font-normal">{termo.irregularidades}</span></div>
                <div className="border-b border-dotted border-black min-h-[2rem]">Autos de Infração lavrados: <span className="font-normal">{termo.autosInfracao}</span></div>
                <div className="border-b border-dotted border-black min-h-[2rem]">Orientação dada: <span className="font-normal">{termo.orientacao}</span></div>
            </div>
            
            <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                <div className="border-b border-dotted border-black">Nº de Empregados em atividade: Maiores: <span className="font-semibold">{termo.numEmpregadosMaiores}</span></div>
                <div className="border-b border-dotted border-black">Menores: <span className="font-semibold">{termo.numEmpregadosMenores}</span></div>
                <div className="border-b border-dotted border-black">Mulheres: <span className="font-semibold">{termo.numEmpregadasMulheres}</span></div>
            </div>

            <div className="mt-24 text-center">
                <div className="inline-block">
                    <div className="border-t-2 border-black w-72 pt-1">Agente da Inspeção do Trabalho</div>
                </div>
            </div>
        </div>
    );
};

interface LivroPrintViewProps {
    livro: LivroEscrituracao;
    conteudo: any;
    school?: School;
}

export const LivroPrintView: React.FC<LivroPrintViewProps> = ({ livro, conteudo, school }) => {
    
    const renderContent = () => {
        if (livro.tipo === 'inspecao' && conteudo) {
            return <TermoInspecaoPrint termo={conteudo as TermoInspecao} />;
        }
        return <pre className="whitespace-pre-wrap text-sm font-mono">{conteudo as string}</pre>;
    };

    return (
        <div className="font-serif">
            {school && (
                <header className="flex items-center justify-between pb-4 border-b mb-8">
                    <div className="flex items-center gap-4">
                        {school.logoUrl ? (
                            <img src={school.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
                        ) : (
                            <SchoolLogoIcon className="w-16 h-16" />
                        )}
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">{school.name}</h1>
                            <p className="text-sm text-gray-600">{school.cnpj}</p>
                            <p className="text-xs text-gray-500">{school.address}</p>
                        </div>
                    </div>
                </header>
            )}

            {livro.tipo !== 'inspecao' && (
                 <h2 className="text-2xl font-bold text-center mb-6">{livro.titulo}</h2>
            )}
            
            {renderContent()}

            <footer className="mt-16 text-center text-xs text-gray-500">
                <p>Página 1</p>
                <p>Gerado em {new Date().toLocaleString('pt-BR')}</p>
            </footer>
        </div>
    );
};