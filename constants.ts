

import { type Lead, LeadStatus, PaymentStatus, User, UserRole, PrintActivityStatus, type PrintActivity, type DeclarationTemplate, type LivroEscrituracao, type DocumentoExigido } from './types';

// This data is used to seed the database if it's empty.
// Firestore will generate the IDs automatically.
export const SEED_LEADS: Omit<Lead, 'id'>[] = [
  {
    studentName: 'Lucas Silva',
    responsibleName: 'João Silva',
    responsibleCPF: '111.222.333-44',
    responsibleCEP: '01001-000',
    responsibleAddress: 'Praça da Sé, Sé, São Paulo - SP',
    responsibleAddressNumber: '123',
    responsibleAddressComplement: 'Lado A',
    responsibleEmail: 'joao.silva@example.com',
    responsiblePhone: '+55 11 98765-4321',
    status: LeadStatus.NEGOTIATION,
    schoolId: 'escola-aprender-mais',
  },
  {
    studentName: 'Mariana Oliveira',
    responsibleName: 'Ana Oliveira',
    responsibleCPF: '222.333.444-55',
    responsibleCEP: '22071-060',
    responsibleAddress: 'Rua Francisco Otaviano, Copacabana, Rio de Janeiro - RJ',
    responsibleAddressNumber: '50',
    responsibleAddressComplement: 'Apto 202',
    responsibleEmail: 'ana.oliveira@example.com',
    responsiblePhone: '+55 21 91234-5678',
    status: LeadStatus.NEGOTIATION,
    schoolId: 'escola-aprender-mais',
  },
  {
    studentName: 'Pedro Costa',
    responsibleName: 'Carlos Costa',
    responsibleCPF: '333.444.555-66',
    responsibleCEP: '30140-072',
    responsibleAddress: 'Avenida Getúlio Vargas, Savassi, Belo Horizonte - MG',
    responsibleAddressNumber: '800',
    responsibleAddressComplement: '',
    responsibleEmail: 'carlos.costa@example.com',
    responsiblePhone: '+55 31 95555-8888',
    status: LeadStatus.COMPLETED, // Changed to COMPLETED so it appears in Allocation list
    invitationSentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    linkViewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    schoolId: 'escola-aprender-mais',
    className: 'Jardim II - Manhã' // Suggested class
  },
   {
    studentName: 'Beatriz Souza',
    responsibleName: 'Fernanda Souza',
    responsibleCPF: '444.555.666-77',
    responsibleCEP: '80420-190',
    responsibleAddress: 'Rua Coronel Dulcídio, Batel, Curitiba - PR',
    responsibleAddressNumber: '1550',
    responsibleAddressComplement: 'Casa',
    responsibleEmail: 'fernanda.s@example.com',
    responsiblePhone: '+55 41 99999-1111',
    status: LeadStatus.NEGOTIATION,
    schoolId: 'colegio-saber',
  },
];

// The only seeded user is the Super Admin. Other users (Admins, Secretaries, Educators) must be created by them.
export const SEED_USERS: (Omit<User, 'id'> & { password_plaintext: string })[] = [
  { username: 'superadmin', password_plaintext: 'super123', role: UserRole.SUPER_ADMINISTRADOR },
];

export const SEED_PRINT_ACTIVITIES: PrintActivity[] = [
  {
    id: 'seed-activity-fonologica-1',
    schoolId: 'escola-aprender-mais',
    uploaderId: 'seed-uploader-id-ana-silva',
    uploaderName: 'Prof. Ana Silva',
    title: 'Atividade de Consciência Fonológica - Vogais',
    className: 'Jardim II - Tarde',
    copies: 18,
    observations: 'Imprimir em modo paisagem e cortar as figuras para as crianças, por favor.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Using a public dummy PDF
    fileName: 'atividade_vogais.pdf',
    uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: PrintActivityStatus.PENDING,
  }
];

export const SEED_DECLARATION_TEMPLATES: Omit<DeclarationTemplate, 'id'>[] = [
  {
    schoolId: 'escola-aprender-mais',
    name: 'Declaração de Matrícula Simples',
    content: `DECLARAÇÃO

Declaramos, para os devidos fins, que o(a) aluno(a) {{aluno.nome}}, está regularmente matriculado(a) nesta instituição de ensino, {{escola.nome}}, no ano letivo de ${new Date().getFullYear()}.

O(A) aluno(a) está cursando a turma {{turma.nome}}.

Esta declaração é emitida a pedido do(a) responsável, {{responsavel.nome}}, portador(a) do CPF nº {{responsavel.cpf}}.

Local, {{data.atual.extenso}}.

_________________________
Assinatura da Secretaria
`
  },
  {
    schoolId: 'escola-aprender-mais',
    name: 'Declaração de Conclusão de Série',
    content: `DECLARAÇÃO DE CONCLUSÃO

Declaramos, para os devidos fins, que o(a) aluno(a) {{aluno.nome}}, concluiu com aproveitamento a série/ano letivo correspondente à turma {{turma.nome}}, no ano letivo de ${new Date().getFullYear() - 1}, nesta instituição de ensino, {{escola.nome}}.

Esta declaração é válida para comprovação de escolaridade.

Local, {{data.atual.extenso}}.

_________________________
Assinatura da Secretaria
`
  },
  {
    schoolId: 'escola-aprender-mais',
    name: 'Declaração para Passe Escolar',
    content: `DECLARAÇÃO PARA FINS DE PASSE ESCOLAR

Declaramos, para os devidos fins que se fizerem necessários, que o(a) aluno(a) {{aluno.nome}}, filho(a) de {{responsavel.nome}}, portador(a) do CPF nº {{responsavel.cpf}}, está regularmente matriculado(a) nesta instituição de ensino, {{escola.nome}}.

O(A) aluno(a) está cursando a turma {{turma.nome}} e reside no seguinte endereço:
{{responsavel.endereco_completo}}.

Esta declaração é emitida com o propósito exclusivo de solicitar ou renovar o passe escolar junto à entidade de transporte competente.

Local, {{data.atual.extenso}}.

_________________________
Assinatura da Secretaria
`
  },
   {
    schoolId: 'escola-aprender-mais',
    name: 'Declaração de Frequência Escolar',
    content: `DECLARAÇÃO DE FREQUÊNCIA

Declaramos, para os devidos fins, que o(a) aluno(a) {{aluno.nome}}, está regularmente matriculado(a) e frequentando as aulas na turma {{turma.nome}}, nesta instituição de ensino, {{escola.nome}}, no presente ano letivo.

Até a presente data, o(a) aluno(a) mantém frequência regular, em conformidade com as normas vigentes.

Local, {{data.atual.extenso}}.

_________________________
Assinatura da Secretaria
`
  },
  {
    schoolId: 'escola-aprender-mais',
    name: 'Declaração para Imposto de Renda',
    content: `DECLARAÇÃO PARA FINS DE IMPOSTO DE RENDA

Declaramos, para fins de comprovação junto à Receita Federal para a Declaração de Imposto de Renda, que o(a) Sr(a). {{responsavel.nome}}, portador(a) do CPF nº {{responsavel.cpf}}, efetuou pagamentos a esta instituição, {{escola.nome}}, CNPJ nº {{escola.cnpj}}, referentes aos serviços educacionais prestados ao(à) aluno(a) {{aluno.nome}}.

O valor total referente à anuidade do ano letivo de ${new Date().getFullYear()} é de {{valor.anuidade.total}}.

Esta declaração não quita débitos pendentes e refere-se apenas aos valores contratados para o ano letivo. Para comprovação dos valores efetivamente pagos, devem ser utilizados os recibos e comprovantes bancários.

Local, {{data.atual.extenso}}.

_________________________
Assinatura da Secretaria
`
  }
];

export const STATUS_COLORS: { [key in LeadStatus]: { bg: string; text: string; border: string } } = {
    [LeadStatus.NEGOTIATION]: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-500' },
    [LeadStatus.AWAITING_ENROLLMENT]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500' },
    [LeadStatus.ENROLLMENT_STARTED]: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-500' },
    [LeadStatus.COMPLETED]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500' },
    [LeadStatus.ALLOCATED]: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-500' },
};

export const PAYMENT_STATUS_COLORS: { [key in PaymentStatus]: { bg: string; text: string; } } = {
    [PaymentStatus.PENDING]: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    [PaymentStatus.PAID]: { bg: 'bg-green-100', text: 'text-green-800' },
    [PaymentStatus.OVERDUE]: { bg: 'bg-red-100', text: 'text-red-800' },
};

export const PRINT_STATUS_COLORS: { [key in PrintActivityStatus]: { bg: string; text: string; } } = {
    [PrintActivityStatus.PENDING]: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    [PrintActivityStatus.PRINTED]: { bg: 'bg-green-100', text: 'text-green-800' },
};


export const MESSAGE_TEMPLATE = `
Olá, [NOME_RESPONSAVEL]!

Seja bem-vindo(a) à nossa escola! Estamos muito felizes com a sua decisão.

Para dar continuidade ao processo de matrícula, por favor, acesse o link seguro abaixo. Nele, você poderá preencher os dados, enviar os documentos necessários e assinar o contrato de forma 100% online.

Seu link de acesso exclusivo é:
[LINK_UNICO]

Caso tenha qualquer dúvida, estamos à disposição.

Atenciosamente,
Secretaria da Escola
`.trim();

export const CLASS_PERIODS = ['Manhã', 'Tarde', 'Integral'];
export const CLASS_LEVELS = ['Maternal', 'Jardim', 'Pré-escola', 'Fundamental'];

export const AVAILABLE_ROLES = [
  'Professor(a)',
  'Coordenador(a) Pedagógico(a)',
  'Diretor(a)',
  'Secretário(a)',
  'Auxiliar de Secretaria',
  'Psicólogo(a) Escolar',
  'Bibliotecário(a)',
  'Serviços Gerais',
  'Porteiro(a)',
];

export const AVAILABLE_SUBJECTS = [
  'Português',
  'Matemática',
  'Ciências',
  'História',
  'Geografia',
  'Artes',
  'Educação Física',
  'Inglês',
];

export const ATA_TYPES = [
  'Ata de Resultados Finais',
  'Ata de Reunião Pedagógica',
  'Ata de Conselho de Classe',
  'Ata de Reunião de Pais e Mestres',
  'Ata de Reunião Administrativa',
];

export const DOCUMENTOS_INSPECAO_TEMPLATE: DocumentoExigido[] = [
  { id: 1, nome: 'Livro ou Fichas de Registro de Empregados', exigido: 'nao_se_aplica' },
  { id: 2, nome: 'Comprovante da Contribuição Sindical (Patronal) - Ano', exigido: 'nao_se_aplica' },
  { id: 3, nome: 'Comprovante da Contribuição Sindical (Empregados) - Ano', exigido: 'nao_se_aplica' },
  { id: 4, nome: 'Relação dos Empregados que recolheram a Contribuição Sindical', exigido: 'nao_se_aplica' },
  { id: 5, nome: 'Relação de Empregados (Lei de 2/3) - Ano', exigido: 'nao_se_aplica' },
  { id: 6, nome: 'Cadastro Permanente de Admissões e Dispensas', exigido: 'nao_se_aplica' },
  { id: 7, nome: 'Relação de Empregados Menores - Ano', exigido: 'nao_se_aplica' },
  { id: 8, nome: 'Acordo para Prorrogação da Duração do Trabalho', exigido: 'nao_se_aplica' },
  { id: 9, nome: 'Acordo para Compensação da Duração do Trabalho', exigido: 'nao_se_aplica' },
  { id: 10, nome: 'Escala de Revezamento', exigido: 'nao_se_aplica' },
  { id: 11, nome: 'Ficha ou Papeleta de Horário de Serviço Externo', exigido: 'nao_se_aplica' },
  { id: 12, nome: 'Recibo de Férias - Ano', exigido: 'nao_se_aplica' },
  { id: 13, nome: 'Folhas de Pagamento - Mês', exigido: 'nao_se_aplica' },
  { id: 14, nome: 'Atestados Médicos de Admissão dos Empregados', exigido: 'nao_se_aplica' },
  { id: 15, nome: 'Convênio de Aprendizagem com o SENAI ou SENAC', exigido: 'nao_se_aplica' },
];

export const LIVROS_ESCRITURACAO: LivroEscrituracao[] = [
  { id: 'livro-registro-matricula', titulo: 'Livro de Registro de Matrícula', descricao: 'Registra todos os alunos matriculados na instituição.', tipo: 'auto-matricula' },
  { id: 'livro-ponto-pessoal', titulo: 'Livro de Ponto de Pessoal de Apoio', descricao: 'Registra a frequência diária do pessoal de apoio.', tipo: 'ponto' },
  { id: 'livro-ponto-professores', titulo: 'Livro de Ponto de Especialista e Professores', descricao: 'Registra a frequência diária de especialistas e professores.', tipo: 'ponto' },
  { id: 'livro-atas-resultados-finais', titulo: 'Livro de Atas de Resultados Finais', descricao: 'Registra os resultados finais de todos os alunos (aprovados, reprovados, etc.).', tipo: 'manual' },
  { id: 'livro-registro-diplomas', titulo: 'Livro de Registro de Diplomas', descricao: 'Registra os diplomas expedidos (para cursos profissionalizantes).', tipo: 'manual' },
  { id: 'livro-registro-certificados', titulo: 'Livro de Registro de Certificados', descricao: 'Registra os certificados expedidos.', tipo: 'manual' },
  { id: 'livro-atas-incineracao', titulo: 'Livro de Atas de Incineração', descricao: 'Contém os termos referentes à incineração de documentos.', tipo: 'manual' },
  { id: 'livro-inventario-material', titulo: 'Livro de Inventário de Material Permanente', descricao: 'Registra móveis, equipamentos e demais materiais da escola.', tipo: 'manual' },
  { id: 'livro-termos-inspecao', titulo: 'Livro de Termos de Inspeção', descricao: 'Destinado às anotações feitas pelos Inspetores de Ensino.', tipo: 'inspecao' },
  { id: 'livro-protocolo', titulo: 'Livro de Protocolo', descricao: 'Utilizado para registrar a expedição de correspondências ou documentos.', tipo: 'manual' },
];