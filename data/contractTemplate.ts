export const contractTemplate = `
ESPAÇO KIDS DO SABER
CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS - ${new Date().getFullYear() + 1}

======================================================================
DADOS DO ALUNO E FINANCEIRO
======================================================================

CONTRATANTES:
1 CONTRATANTE (Responsável Financeiro):
NOME: [NOME_RESPONSAVEL]
ENDEREÇO: [ENDERECO_COMPLETO_RESPONSAVEL]
RG/ORGÃO EXPEDIDOR: [RG_RESPONSAVEL]
CPF: [CPF_RESPONSAVEL]
PROFISSÃO: [PROFISSAO_RESPONSAVEL]
TELEFONE: [TELEFONE_RESPONSAVEL]
E-MAIL: [EMAIL_RESPONSAVEL]

BENEFICIADO
NOME COMPLETO DO ALUNO: [NOME_ALUNO]
DATA DE NASCIMENTO: [DATA_NASCIMENTO_ALUNO]
ENDEREÇO COMPLETO: [ENDERECO_COMPLETO_ALUNO]
ANO/SÉRIE: [SERIE_ALUNO]

QUADRO RESUMO:
Início das aulas: 15 DE JANEIRO
Valor da anuidade: [VALOR_ANUIDADE]
Valor da matrícula (1ª parcela): [VALOR_MATRICULA]
Valor das parcelas (11x): [VALOR_MENSALIDADE]
Desconto aplicado: [PROGRAMA_DESCONTO]
Vencimento das parcelas: DIA 10 DE CADA MÊS

======================================================================
CLÁUSULAS CONTRATUAIS
======================================================================

CONTRATADO:
ESPAÇO KIDS DO SABER
CNPJ: 19.457.550/0001-62
RUA: SERÁFICO DA NÓBREGA, 152, JOÃO PESSOA - PB

Pelo presente Contrato de Prestação de Serviços Educacionais, as partes acima qualificadas, a primeira como CONTRATANTE e a segunda como CONTRATADA, têm justo e contratado o seguinte:

I - DO OBJETO
CLÁUSULA 1ª – O objeto do presente contrato é a prestação de serviços educacionais, pela CONTRATADA ao(à) ALUNO(A), no ano letivo de ${new Date().getFullYear() + 1}, na série/ano [SERIE_ALUNO], em conformidade com o plano de estudos, programas e currículos da Escola e a legislação em vigor.

II - DAS OBRIGAÇÕES DAS PARTES
CLÁUSULA 2ª - A CONTRATADA obriga-se a ministrar o ensino através de aulas e demais atividades escolares, cumprindo o calendário letivo e o planejamento pedagógico.
CLÁUSULA 3ª - O(A) CONTRATANTE obriga-se a efetuar o pagamento do valor total da anuidade, dividido em 12 (doze) parcelas, sendo a primeira no ato da matrícula e as demais com vencimento no dia 10 (dez) de cada mês subsequente, de fevereiro a dezembro.

IV - DO PAGAMENTO E VALORES
CLÁUSULA 4ª - Como contraprestação pelos serviços, o(a) CONTRATANTE pagará à CONTRATADA o valor total de [VALOR_ANUIDADE], dividido em uma parcela de matrícula no valor de [VALOR_MATRICULA] e 11 (onze) parcelas mensais de [VALOR_MENSALIDADE].
Parágrafo Primeiro – O não pagamento da parcela na data de vencimento implicará em multa de 2% (dois por cento) e juros de mora de 1% (um por cento) ao mês, além de correção monetária.

V - DA VIGÊNCIA E RESCISÃO
CLÁUSULA 5ª - O presente contrato tem a duração do ano letivo, terminando com a conclusão do calendário escolar.
CLÁUSULA 6ª - Em caso de desistência da matrícula antes do início das aulas, será restituído 70% do valor pago. Após o início das aulas, não haverá restituição.

XIV - DO FORO
CLÁUSULA 7ª - Para dirimir questões oriundas deste Contrato, fica eleito o Foro da Cidade de JOÃO PESSOA, PB.

E por estarem justos e contratados, assinam o presente instrumento.

João Pessoa, _____ de _______________ de _______.


_________________________________________
[NOME_RESPONSAVEL]
(CONTRATANTE)


_________________________________________
ESPAÇO KIDS DO SABER
(CONTRATADA)
`;