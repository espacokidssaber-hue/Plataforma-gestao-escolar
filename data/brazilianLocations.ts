export interface State {
  sigla: string;
  nome: string;
  cidades: string[];
}

export const BRAZILIAN_STATES: State[] = [
  { sigla: 'AC', nome: 'Acre', cidades: ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira'] },
  { sigla: 'AL', nome: 'Alagoas', cidades: ['Maceió', 'Arapiraca', 'Palmeira dos Índios'] },
  { sigla: 'AP', nome: 'Amapá', cidades: ['Macapá', 'Santana', 'Laranjal do Jari'] },
  { sigla: 'AM', nome: 'Amazonas', cidades: ['Manaus', 'Parintins', 'Itacoatiara'] },
  { sigla: 'BA', nome: 'Bahia', cidades: ['Salvador', 'Feira de Santana', 'Vitória da Conquista'] },
  { sigla: 'CE', nome: 'Ceará', cidades: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte'] },
  { sigla: 'DF', nome: 'Distrito Federal', cidades: ['Brasília'] },
  { sigla: 'ES', nome: 'Espírito Santo', cidades: ['Serra', 'Vila Velha', 'Cariacica'] },
  { sigla: 'GO', nome: 'Goiás', cidades: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis'] },
  { sigla: 'MA', nome: 'Maranhão', cidades: ['São Luís', 'Imperatriz', 'São José de Ribamar'] },
  { sigla: 'MT', nome: 'Mato Grosso', cidades: ['Cuiabá', 'Várzea Grande', 'Rondonópolis'] },
  { sigla: 'MS', nome: 'Mato Grosso do Sul', cidades: ['Campo Grande', 'Dourados', 'Três Lagoas'] },
  { sigla: 'MG', nome: 'Minas Gerais', cidades: ['Belo Horizonte', 'Uberlândia', 'Contagem'] },
  { sigla: 'PA', nome: 'Pará', cidades: ['Belém', 'Ananindeua', 'Santarém'] },
  { sigla: 'PB', nome: 'Paraíba', cidades: ['João Pessoa', 'Campina Grande', 'Santa Rita'] },
  { sigla: 'PR', nome: 'Paraná', cidades: ['Curitiba', 'Londrina', 'Maringá'] },
  { sigla: 'PE', nome: 'Pernambuco', cidades: ['Recife', 'Jaboatão dos Guararapes', 'Olinda'] },
  { sigla: 'PI', nome: 'Piauí', cidades: ['Teresina', 'Parnaíba', 'Picos'] },
  { sigla: 'RJ', nome: 'Rio de Janeiro', cidades: ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias'] },
  { sigla: 'RN', nome: 'Rio Grande do Norte', cidades: ['Natal', 'Mossoró', 'Parnamirim'] },
  { sigla: 'RS', nome: 'Rio Grande do Sul', cidades: ['Porto Alegre', 'Caxias do Sul', 'Canoas'] },
  { sigla: 'RO', nome: 'Rondônia', cidades: ['Porto Velho', 'Ji-Paraná', 'Ariquemes'] },
  { sigla: 'RR', nome: 'Roraima', cidades: ['Boa Vista', 'Rorainópolis', 'Caracaraí'] },
  { sigla: 'SC', nome: 'Santa Catarina', cidades: ['Joinville', 'Florianópolis', 'Blumenau'] },
  { sigla: 'SP', nome: 'São Paulo', cidades: ['São Paulo', 'Guarulhos', 'Campinas'] },
  { sigla: 'SE', nome: 'Sergipe', cidades: ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto'] },
  { sigla: 'TO', nome: 'Tocantins', cidades: ['Palmas', 'Araguaína', 'Gurupi'] },
];
