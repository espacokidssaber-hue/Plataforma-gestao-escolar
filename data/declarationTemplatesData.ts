import { DeclarationTemplate } from '../types';

export const DECLARATION_TEMPLATES_DATA: DeclarationTemplate[] = [
    {
        id: 1,
        name: 'Declaração de Matrícula Simples',
        content: 'Declaramos para os devidos fins que o(a) aluno(a) [NOME_ALUNO], nascido(a) em [DATA_NASCIMENTO_ALUNO], filho(a) de [NOME_MAE_ALUNO], está regularmente matriculado(a) no(a) [SERIE_TURMA_ALUNO] nesta instituição de ensino, no ano letivo de [ANO_LETIVO].'
    },
    {
        id: 2,
        name: 'Declaração de Matrícula para Transporte',
        content: 'Declaramos para os devidos fins, a quem possa interessar, que o(a) aluno(a) [NOME_ALUNO], CPF [CPF_ALUNO], encontra-se regularmente matriculado(a) no(a) [SERIE_TURMA_ALUNO] do turno [TURNO_ALUNO], nesta Unidade de Ensino, frequentando as aulas de segunda a sexta-feira. Esta declaração é válida para o ano letivo de [ANO_LETIVO].'
    },
    {
        id: 3,
        name: 'Declaração de Conclusão de Série',
        content: 'Declaramos que o(a) aluno(a) [NOME_ALUNO], concluiu com aproveitamento o(a) [SERIE_TURMA_ALUNO] no ano letivo de [ANO_LETIVO_CONCLUSAO], estando apto(a) a cursar a série seguinte. Nada consta em nossos arquivos que desabone sua conduta.'
    },
    {
        id: 4,
        name: 'Declaração de Transferência',
        content: 'Declaramos que o(a) aluno(a) [NOME_ALUNO] esteve matriculado(a) nesta instituição de ensino, cursando o(a) [SERIE_TURMA_ALUNO] no ano letivo de [ANO_LETIVO], tendo solicitado sua transferência em [DATA_ATUAL]. Informamos que sua situação acadêmica e financeira encontra-se regular até a presente data.'
    }
];
