import React from 'react';
import { SchoolDocument } from '../types';
import GitHubVercelGuide from '../components/archive/GitHubVercelGuide';

const HighlightedContent: React.FC<{ children: React.ReactNode; highlight?: string }> = ({ children, highlight }) => {
    if (!highlight) {
        return React.createElement(React.Fragment, null, children);
    }

    const highlightText = (node: React.ReactNode): React.ReactNode => {
        if (typeof node === 'string') {
            const parts = node.split(new RegExp(`(${highlight})`, 'gi'));
            return parts.map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase() ?
                React.createElement("mark", { key: i, className: "bg-yellow-200 dark:bg-yellow-500/50 rounded-sm px-0.5" }, part) :
                part
            );
        }
        if (Array.isArray(node)) {
            return node.map(highlightText);
        }
        // FIX: Safely access props and children of React elements.
        if (React.isValidElement(node)) {
            const props = node.props as { children?: React.ReactNode; [key: string]: any };
            if (props.children) {
                return React.cloneElement(node, { ...props, children: highlightText(props.children) });
            }
        }
        return node;
    };
    
    return highlightText(children);
};


export const DOCUMENT_SECTIONS: SchoolDocument[] = [
    {
        title: 'Guia: Publicando Projetos com GitHub e Vercel',
        content: React.createElement(GitHubVercelGuide),
    },
    {
        title: 'Secretaria',
        content: React.createElement(HighlightedContent, null,
            React.createElement('div', null,
                React.createElement('p', null, 'A Secretaria, é encarregada de todo o serviço burocrático da escola, executando as normas administrativas e organizando os serviços de escrituração da escola.'),
                React.createElement('p', null, 'Deve a Direção estar atenta às atividades da Secretaria Escolar, no que diz respeito ao controle das fichas individuais dos alunos. É imprescindível que o lançamento das notas, nas referidas fichas, seja efetuado ao término de cada bimestre, a fim de que melhor se possa fazer o acompanhamento no que diz respeito ao rendimento, à frequência do aluno e à média avaliativa da turma.'),
                React.createElement('p', null, 'Outra atividade inerente à Secretaria da Escola consiste no controle às aulas ministradas cujo trabalho deve ser realizado em integração com os coordenadores pedagógicos. A estes, cabe a responsabilidade do controle do conteúdo ministrado, segundo o plano de trabalho de cada professor. À Secretaria cabe o controle do número de aulas, orientando os professores no sentido de fazerem lançamentos que especifiquem os assuntos abordados.'),
                React.createElement('p', null, 'Os serviços da Secretaria deverão ser executados sob a orientação e responsabilidade de um Secretário Escolar, legalmente habilitado, auxiliado por Subsecretário, quando for o caso, e por tantos servidores quantos forem necessários.'),
                React.createElement('p', null, 'Todas as atividades da secretaria deve ser distribuídas entre seus membros, de modo a que não venham sofrer solução de continuidade.'),
                React.createElement('p', null, 'O horário de trabalho do Secretário deve ser estabelecido de tal forma que ele atenda aos diferentes turnos em funcionamento da unidade escolar.'),
                React.createElement('p', null, 'Semanalmente, em horário previamente estabelecido, o Secretário deverá reunir-se com seus auxiliares, a fim de assegurar a unidade dos trabalhos.'),
                React.createElement('p', null, 'Uma das condições básicas para que uma escola possa funcionar bem é ter a sua Secretaria bem estruturada, haja vista que a ação escolar deve, obrigatoriamente, ser legitimada à luz da legislação.'),
                React.createElement('p', null, 'Sob a responsabilidade da Secretaria está a preservação dos direitos adquiridos pelo aluno no decorrer dos estudos realizados no estabelecimento de ensino, podendo, assim, o discente assegurar, em qualquer tempo, a verificação da identidade e regularidade de sua vida escolar.'),
                React.createElement('h3', null, 'Estrutura e Setores'),
                React.createElement('p', null, 'É necessário, para o bom funcionamento as Secretaria, que ela disponha de:'),
                React.createElement('ul', { className: 'list-disc list-inside' },
                    React.createElement('li', null, 'I - arquivo contendo toda a legislação educacional vigente;'),
                    React.createElement('li', null, 'II - espaço físico apropriado;'),
                    React.createElement('li', null, 'III - secretário devidamente habilitado, ou autorizado, conforme as normas estabelecidas;'),
                    React.createElement('li', null, 'IV - material permanente, de consumo e de expediente.')
                ),
                React.createElement('p', null, 'Para a busca permanente, da eficácia de seus trabalhos, a Secretaria poderá se estruturar mediante a divisão nos seguintes setores:'),
                React.createElement('ul', { className: 'list-disc list-inside' },
                    React.createElement('li', null, 'I - Setor de Escrituração Escolar;'),
                    React.createElement('li', null, 'II - Setor de Arquivo;'),
                    React.createElement('li', null, 'III - Setor de Serviços Auxiliares.')
                )
            )
        )
    },
    {
        title: 'Atividades por Setor',
        content: React.createElement(HighlightedContent, null,
            React.createElement('div', null,
                React.createElement('h3', null, 'I - Setor de Escrituração Escolar:'),
                React.createElement('ul', { className: 'list-disc list-inside' },
                    React.createElement('li', null, 'a) registrar, sistematicamente, os fatos relativos à vida escolar de cada aluno;'),
                    React.createElement('li', null, 'b) proceder à matrícula do alunado;'),
                    React.createElement('li', null, 'd) anotar os dados referentes à matrícula, evasão, aprovação e reprovação dos aluno;'),
                    React.createElement('li', null, 'e) registrar a frequência do aluno, em termos percentuais, na Ficha Individual;'),
                    React.createElement('li', null, 'f) expedir certificados e diplomas;'),
                    React.createElement('li', null, 'g) preparar documentos escolares em geral, como atas, relatório anual, transferências, dentre outros;')
                ),
                React.createElement('h3', null, 'II - Setor de Arquivo:'),
                React.createElement('ul', { className: 'list-disc list-inside' },
                    React.createElement('li', null, 'a) garantir a rápida utilização dos documentos que forem entregues a sua guarda depois de classificados;'),
                    React.createElement('li', null, 'b) guardar tais documentos em satisfatórias condições de segurança;'),
                    React.createElement('li', null, 'c) classificar e ordenar referido material de modo a facilitar sua rápida localização e consulta;')
                ),
                React.createElement('h3', null, 'III - Setor de Serviços Auxiliares:'),
                React.createElement('p', null, 'Este setor é composto dos elementos que participam do processo como apoio à administração no que diz respeito à conservação, limpeza, manutenção e preservação do estabelecimento. São eles: vigilante; auxiliar de serviço e outros.')
            )
        )
    },
    {
        title: 'Cronograma de Tarefas',
        content: React.createElement(HighlightedContent, null,
            React.createElement('div', null,
                React.createElement('p', null, 'Os secretários de escola têm, ao longo do ano, uma série de atividades que podem ser agrupados nos diferentes meses do ano civil.'),
                React.createElement('h3', null, 'Janeiro'),
                React.createElement('ul', { className: 'list-disc list-inside' },
                    React.createElement('li', null, 'encerrar Fichas Individuais;'),
                    React.createElement('li', null, 'escriturar Históricos Escolares dos concluintes e dos alunos que solicitem transferência;'),
                    React.createElement('li', null, 'matricular novos alunos;'),
                    React.createElement('li', null, 'concluir organização das classes;'),
                    React.createElement('li', null, 'encaminhar à Inspetoria Técnica de Ensino, a Ata de Resultado Finais.')
                ),
                React.createElement('h3', null, 'Fevereiro'),
                React.createElement('ul', { className: 'list-disc list-inside' },
                    React.createElement('li', null, 'verificar se ainda existe matrícula com declaração provisória. Caso positivo, comunicar ao interessado que o prazo está esgotado;'),
                    React.createElement('li', null, 'organizar horário de aulas;'),
                    React.createElement('li', null, 'arquivar prontuário de concluintes, transferidos e desistentes;'),
                    React.createElement('li', null, 'abrir prontuário de alunos novos;'),
                    React.createElement('li', null, 'escriturar nomes dos alunos nos diários de classe;'),
                    React.createElement('li', null, 'analisar históricos escolares de alunos transferidos para encaminhar à equipe técnica os casos dependentes de adaptação de currículo.')
                ),
                React.createElement('h3', null, 'Março'),
                React.createElement('ul', { className: 'list-disc list-inside' },
                    React.createElement('li', null, 'verificar se os diários de classe estão com os devidos registros;'),
                    React.createElement('li', null, 'expedir Diplomas e Certificados de Habilitação Profissional. Esta tarefa deve ser contínua enquanto houver Diplomas ou Certificados a expedir;'),
                    React.createElement('li', null, 'verificar, diàriamente, o livro de pontos de professores, funcionários.')
                ),
                React.createElement('h3', null, 'Abril'),
                React.createElement('ul', { className: 'list-disc list-inside' },
                    React.createElement('li', null, 'preencher Fichas Individuais, em consonância com os diários de classe;'),
                    React.createElement('li', null, 'escriturar Atas de Rendimento Escolar;'),
                    React.createElement('li', null, 'verificar os diários de classe e elaborar calendário de reposição de aulas para os professores faltosos;'),
                    React.createElement('li', null, 'verificar o livro de ponto.')
                ),
                React.createElement('h3', null, 'Maio'),
                React.createElement('ul', { className: 'list-disc list-inside' },
                    React.createElement('li', null, 'escriturar notas nas Fichas Individuais. Esta tarefa será repetida no final de cada bimestre.')
                ),
                React.createElement('h3', null, 'Junho/Julho/Agosto/Setembro e Outubro'),
                React.createElement('ul', { className: 'list-disc list-inside' }, React.createElement('li', null, 'Atividades de rotina.')),
                React.createElement('h3', null, 'Novembro'),
                React.createElement('ul', { className: 'list-disc list-inside' }, React.createElement('li', null, 'publicar, em local visível, relação nominal de alunos que dependem de Estudos de Recuperação. Esta tarefa deve ser cumprida bimestralmente.')),
                React.createElement('h3', null, 'Dezembro'),
                React.createElement('ul', { className: 'list-disc list-inside' },
                    React.createElement('li', null, 'publicar relação nominal dos alunos aprovados e reprovados após recuperação.'),
                    React.createElement('li', null, 'Planejar a matrícula do ano seguinte.')
                )
            )
        )
    },
    {
        title: 'Atribuições do Secretário',
        content: React.createElement(HighlightedContent, null,
            React.createElement('div', null,
                React.createElement('ul', { className: 'list-disc list-inside' },
                    React.createElement('li', null, 'I - responder pelo expediente e pelos serviços gerais da secretaria;'),
                    React.createElement('li', null, 'II - organizar e superintender os serviços de escrituração escolar e os registros relacionados com a administração do pessoal e os pertinentes à secretaria;'),
                    React.createElement('li', null, 'III - Ter sob sua guarda, devidamente organizados, os fichários, arquivos e livros da Escola;'),
                    React.createElement('li', null, 'IV - organizar o serviço de atendimento a professores, alunos e funcionários bem como a terceiros, no que se refere a informes e esclarecimentos solicitados, atentando para as normas da Direção para tal serviço;'),
                    React.createElement('li', null, 'V - secretariar as solenidades de entrega de certificados e outras que forem promovidas por ordem do Diretor;'),
                    React.createElement('li', null, 'VI - supervisionar o processo de verificação da frequência dos alunos matriculados, mantendo sempre em ordem os respectivos assentamentos;'),
                    React.createElement('li', null, 'VII - responsabilizar-se pelos processos de levantamento das notas obtidas pelos alunos e do cálculo das médias por disciplinas, através das fichas individuais;'),
                    React.createElement('li', null, 'VIII - manter, sem rasuras ou emendas, a escrituração de todos os livros e documentos escolares;'),
                    React.createElement('li', null, 'IX - providenciar à vista dos resultados obtidos pelos alunos, a expedição de certificados a que fizerem jus;'),
                    React.createElement('li', null, 'X - elaborar relatórios a serem enviados às autoridades, de acordo com as normas expedidas;'),
                    React.createElement('li', null, 'XI - manter atualizado o arquivo de legislação e de documentos pertinentes à Escola;'),
                    React.createElement('li', null, 'XII - zelar pela atualização dos diários de classe de cada professor, não permitindo a retirada dos mesmos do estabelecimento, sob nenhum pretexto;'),
                    React.createElement('li', null, 'XIII - lavrar e subscrever atas de avaliação e apuração dos trabalhos escolares;'),
                    React.createElement('li', null, 'XIV - desempenhar outras atividades relativas a seu cargo e não previstas no Regimento Interno.')
                ),
                React.createElement('p', null, 'Cabe aos funcionários subordinados ao Secretário Escolar, executar os serviços que lhe forem atribuídos, sendo inclusive responsável pelo turno para o qual for designado pelo Diretor Escolar.')
            )
        )
    },
    {
        title: 'Procedimento na Matrícula',
        content: React.createElement(HighlightedContent, null,
            React.createElement('div', null,
                React.createElement('p', null, 'No ato da matrícula, é importante o secretário verificar se a documentação está completa, sem rasuras e se atende as exigências legais. Verificará, também, se contém o seguinte:'),
                React.createElement('ul', { className: 'list-disc list-inside' },
                    React.createElement('li', null, 'identificação completa da escola de origem, com seu respectivo carimbo e timbre;'),
                    React.createElement('li', null, 'situação legal da escola. Deve constar, no documento, o número do ato que autorizou ou reconheceu o funcionamento do curso, fornecido pelo Conselho Estadual de Educação;'),
                    React.createElement('li', null, 'número do decreto de criação (se o aluno for proveniente de escola pública);'),
                    React.createElement('li', null, 'identificação completa do aluno;'),
                    React.createElement('li', null, 'situação referente a Educação Física e sua eventual dispensa;'),
                    React.createElement('li', null, 'correlação dos estudos realizados e a carga horária mínima exigida, por série, em cada componente curricular, bem como o percentual de frequência em cada uma delas;'),
                    React.createElement('li', null, 'assinaturas do diretor e secretário escolar, com seus respectivos números de registros ou autorização à título precário;'),
                    React.createElement('li', null, 'observação sobre o critério de avaliação adotado pela escola de origem. Caso os resultados obtidos pelo aluno sejam apresentados sob a forma de conceito, deve-se respeitá-los. Em nenhum momento pode haver conversão de conceito em nota ou vice-versa. No momento do fornecer o histórico escolar a esse aluno, basta transcrever os conceitos.')
                )
            )
        )
    },
    {
        title: 'Documentos para Matrícula',
        content: React.createElement(HighlightedContent, null,
            React.createElement('div', null,
                React.createElement('p', null, 'No ato da primeira matrícula o candidato deverá apresentar:'),
                React.createElement('ul', { className: 'list-disc list-inside' },
                    React.createElement('li', null, 'I - Cópia de certidão de nascimento;'),
                    React.createElement('li', null, 'II - 01 (uma) foto 3x4;'),
                    React.createElement('li', null, 'III - Comprovante de estar em dia com as obrigações eleitorais e militares, quando couber;'),
                    React.createElement('li', null, 'IV - Documentação referente à escolaridade, quando couber (históricos escolar).')
                ),
                React.createElement('p', null, 'Na renovação da matrícula, será desnecessária a apresentação dos documentos citados nos itens I, II e IV.'),
                React.createElement('p', null, 'Será nula, em qualquer responsabilidade para a Escola, a matrícula que se fizer com documento falso ou adulterado, cabendo a direção comunicar, quando for o caso')
            )
        )
    }
];