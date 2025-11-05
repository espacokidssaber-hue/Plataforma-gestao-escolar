import { Type } from "@google/genai";
import { EventData, EnrolledStudent, SchoolInfo } from '../types';

// ==================================================================================
// FUNÇÃO CENTRAL DE COMUNICAÇÃO COM A API
// Todas as chamadas para a IA agora passam por esta função robusta e centralizada.
// ==================================================================================

interface GeminiApiOptions {
    prompt?: string;
    stream?: boolean;
    model?: string;
    pdfBase64?: string;
    schema?: any;
}

const callGeminiApi = async (options: GeminiApiOptions): Promise<Response> => {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(options),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `Erro HTTP: ${response.status} - ${response.statusText}` }));
            throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
        }
        
        return response;

    } catch (error) {
        console.error("Erro na função central callGeminiApi:", error);
        if (error instanceof Error) {
            throw new Error(`Falha na comunicação com o servidor da IA: ${error.message}`);
        }
        throw new Error("Falha desconhecida na comunicação com o servidor da IA.");
    }
};

// ==================================================================================
// FUNÇÕES DE SERVIÇO PÚBLICAS (Wrappers)
// Estas são as funções que os componentes da aplicação usam.
// Elas agora são simples, legíveis e apenas delegam a chamada para a função central.
// ==================================================================================


// Helper para converter a resposta de stream do fetch em um gerador assíncrono.
const createStreamGenerator = (response: Response) => {
    if (!response.body) {
        throw new Error("A resposta da API não contém um corpo de fluxo.");
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    return (async function* () {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        // Simula a estrutura de resposta do SDK original ({ text: '...' }), que alguns componentes esperam.
        yield { text: decoder.decode(value) };
      }
    })();
};

export const streamMessage = async (message: string) => {
  const response = await callGeminiApi({ prompt: message, stream: true });
  if (!response.body) {
    throw new Error("A resposta da API não contém um corpo de fluxo.");
  }
  return response.body.getReader();
};

export const streamDocumentText = async (prompt: string): Promise<AsyncGenerator<{ text: string }>> => {
  const response = await callGeminiApi({ prompt, stream: true });
  return createStreamGenerator(response);
};

export const generateJsonFromText = async (prompt: string, schema: any) => {
  const response = await callGeminiApi({ prompt, schema, stream: false });
  return await response.json();
};

export const generateDocumentText = async (prompt: string, pdfBase64?: string): Promise<string> => {
  try {
    const response = await callGeminiApi({ 
      prompt, 
      stream: false, 
      pdfBase64,
      model: pdfBase64 ? 'gemini-2.5-flash' : undefined,
    });
    
    const responseBody = await response.text();
    if (!responseBody) {
        if (pdfBase64) return "";
        throw new Error("A IA retornou uma resposta vazia.");
    }

    let fullText = '';
    try {
        // A API deve retornar um JSON { "text": "..." }
        const result = JSON.parse(responseBody);
        fullText = result.text ?? '';
    } catch (e) {
        // Se a análise JSON falhar (ex: a API retornou um erro de texto simples com status 200),
        // trate como se nenhum texto pudesse ser extraído do PDF para evitar um erro grave.
        console.warn("Falha ao analisar JSON da API, tratando a resposta como texto puro. Resposta:", responseBody);
        if (pdfBase64) {
            return ""; // Trata como se o PDF fosse ilegível.
        }
        // Para outras tarefas, podemos assumir que a resposta inteira é o texto.
        fullText = responseBody;
    }
    
    if (!fullText.trim()) {
        if (pdfBase64) {
             // Este é o resultado desejado para um PDF ilegível (ex: somente imagem).
             return "";
        }
        // Para tarefas que não são de PDF, um texto vazio é um erro.
        throw new Error("A IA retornou uma resposta vazia. Tente novamente com um tópico mais específico.");
    }
    return fullText;
  } catch (error) {
    console.error("Error generating document text from Gemini via proxy:", error);
    // A função chamadora (extractEnrolledStudentsFromPdf) irá capturar isso e mostrar o erro para o usuário.
    if (error instanceof Error) { throw error; }
    throw new Error("Falha ao se comunicar com o serviço de IA. Por favor, tente novamente mais tarde.");
  }
};

export const streamTextFromPdf = async (pdfBase64: string): Promise<AsyncGenerator<{ text: string }>> => {
    const prompt = `Extraia todo o texto deste documento PDF. Preserve a formatação de parágrafos e quebras de linha o máximo possível. Retorne apenas o texto extraído.`;
    
    try {
        const response = await callGeminiApi({
            prompt,
            pdfBase64,
            model: 'gemini-2.5-flash',
            stream: true
        });
        return createStreamGenerator(response);
    } catch (error) {
        console.error("Error extracting text from PDF with Gemini via proxy:", error);
        throw new Error("A IA não conseguiu processar o arquivo PDF. Verifique se o arquivo não está corrompido ou protegido.");
    }
};


export const extractCalendarEventsFromPdf = async (pdfBase64: string): Promise<{ year: number, month: number, events: EventData[] }[]> => {
    const prompt = `
      Você é um assistente de secretaria escolar altamente preciso e meticuloso. Sua tarefa é analisar o calendário escolar em PDF fornecido e extrair CADA evento, sem deixar NENHUM de fora.

      **Instruções Críticas:**
      1.  **Extração Completa:** Identifique e extraia todos os eventos, datas comemorativas, feriados, períodos de prova, recessos, reuniões e qualquer outra data marcada.
      2.  **Múltiplos Meses e Anos:** O documento pode conter vários meses e atravessar anos. Você deve processar todos eles. Se um ano é mencionado no título (ex: "2025"), assuma que ele se aplica a todos os meses, a menos que um novo ano seja explicitamente especificado em uma data (ex: "05/01/2026").
      3.  **Formatos de Data:** Esteja preparado para diversos formatos: 'dd/mm', 'dd de Mês', 'dd.mm.yyyy', 'Mês dd', 'dd/mm/aaaa'.
      4.  **Intervalos de Datas:** Para intervalos (ex: 'Recesso de 01 a 15/07' ou 'Provas: 28/Jan a 02/Fev'), você **DEVE** criar uma entrada para **CADA DIA INDIVIDUALMENTE**, mesmo que o intervalo atravesse meses ou anos. Por exemplo, "Recesso de 23/12/2025 a 02/01/2026" deve gerar eventos diários do dia 23/12 até o dia 02/01.
      5.  **Filtro de Ruído:** Ignore textos irrelevantes como cabeçalhos, rodapés ou anotações genéricas que não representem um evento datado.
      6.  **Revisão Final:** Antes de finalizar, revise sua extração para garantir que **ABSOLUTAMENTE NENHUM** evento foi omitido.
      7.  **Falha Graciosa:** Se o documento PDF for ilegível, não for um calendário ou não contiver nenhum evento, retorne um array JSON vazio: \`[]\`.

      **Formato de Saída:**
      Retorne um array de objetos JSON, onde cada objeto representa um mês. Siga o schema fornecido de forma estrita. Mapeie os eventos para os seguintes tipos: 'exam' (provas, avaliações), 'holiday' (feriados), 'event' (festas, eventos gerais), 'other' (conselho de classe, reuniões, recesso).
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                year: { type: Type.INTEGER, description: 'O ano do calendário.' },
                month: { type: Type.INTEGER, description: 'O mês do calendário (1-12).' },
                events: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            day: { type: Type.INTEGER, description: 'O dia do mês.' },
                            label: { type: Type.STRING, description: 'A descrição do evento.' },
                            type: { type: Type.STRING, description: "O tipo: 'exam', 'holiday', 'event', ou 'other'." },
                        },
                         required: ['day', 'label', 'type'],
                    },
                },
            },
            required: ['year', 'month', 'events'],
        }
    };
    
    try {
        const response = await callGeminiApi({
            prompt,
            schema,
            pdfBase64,
            model: 'gemini-2.5-pro',
            stream: false
        });
        const jsonText = await response.text();
        return jsonText ? JSON.parse(jsonText) : [];
    } catch (error) {
        console.error("Error parsing calendar from PDF with Gemini via proxy:", error);
        throw new Error("A IA não conseguiu processar o arquivo PDF do calendário. Verifique se o formato é legível e tente novamente.");
    }
};

export const fillContractWithData = async (contractText: string, student: EnrolledStudent, schoolInfo: SchoolInfo): Promise<string> => {
    const guardian = student.guardians?.[0];
    const address = student.address;
    const studentAddress = student.address;

    const guardianAddressString = address 
        ? `${address.street}, ${address.number}${address.complement ? `, ${address.complement}` : ''}, ${address.neighborhood}, ${address.city}-${address.state}, CEP: ${address.zip}`
        : 'Não informado';
    
    const studentAddressString = studentAddress
        ? `${studentAddress.street}, ${studentAddress.number}${studentAddress.complement ? `, ${studentAddress.complement}` : ''}, ${studentAddress.neighborhood}, ${studentAddress.city}-${studentAddress.state}, CEP: ${studentAddress.zip}`
        : 'Não informado';
    
    const totalAnnualCost = (student.enrollmentFee || 0) + ((student.monthlyFee || 0) * 11);

    const prompt = `
        Você é um assistente de secretaria que preenche contratos. Sua tarefa é substituir os placeholders (ex: [NOME_ALUNO]) em um modelo de contrato com os dados fornecidos.

        **MODELO DO CONTRATO:**
        ---
        ${contractText}
        ---

        **DADOS PARA PREENCHER:**
        - [NOME_RESPONSAVEL]: ${guardian?.name || 'Não informado'}
        - [ENDERECO_COMPLETO_RESPONSAVEL]: ${guardianAddressString}
        - [RG_RESPONSAVEL]: ${guardian?.rg || 'Não informado'}
        - [CPF_RESPONSAVEL]: ${guardian?.cpf || 'Não informado'}
        - [PROFISSAO_RESPONSAVEL]: ${guardian?.occupation || 'Não informado'}
        - [TELEFONE_RESPONSAVEL]: ${guardian?.phone || 'Não informado'}
        - [EMAIL_RESPONSAVEL]: ${guardian?.email || 'Não informado'}
        - [NOME_ALUNO]: ${student.name}
        - [DATA_NASCIMENTO_ALUNO]: ${student.dateOfBirth ? new Date(student.dateOfBirth + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informado'}
        - [ENDERECO_COMPLETO_ALUNO]: ${studentAddressString}
        - [SERIE_ALUNO]: ${student.grade || student.className || 'Não informado'}
        - [VALOR_ANUIDADE]: ${totalAnnualCost > 0 ? totalAnnualCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Não informado'}
        - [VALOR_MATRICULA]: ${student.enrollmentFee?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'Não informado'}
        - [VALOR_MENSALIDADE]: ${student.monthlyFee?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'Não informado'}
        - [PROGRAMA_DESCONTO]: ${student.discountProgram || 'Nenhum'}

        **INSTRUÇÕES:**
        1.  Substitua **CADA** placeholder no modelo pelo dado correspondente.
        2.  Se um dado não for fornecido, use "Não informado".
        3.  Retorne o texto completo do contrato, mantendo a formatação original (quebras de linha, espaçamento, etc.). **NÃO** adicione markdown, comentários ou qualquer texto extra. A saída deve ser apenas o texto do contrato preenchido.
    `;
    return generateDocumentText(prompt);
};


export const generateEducatorObservation = async (studentName: string, grades: any): Promise<string> => {
    const gradesText = Object.entries(grades)
        .map(([subject, assessments]) => {
            const assessmentText = Object.entries(assessments as Record<string, number | null>)
                .map(([name, grade]) => `${name}: ${grade?.toFixed(1) ?? 'N/L'}`)
                .join(', ');
            return `${subject} (${assessmentText})`;
        })
        .join('; ');

    const prompt = `
        Aja como um(a) educador(a) experiente e atencioso(a).
        Sua tarefa é escrever um parágrafo de observação pedagógica sobre o(a) aluno(a) ${studentName}, 
        com base em seu desempenho acadêmico até o momento.

        As notas do(a) aluno(a) são: ${gradesText}.

        Instruções:
        1. Seja conciso(a), escrevendo um parágrafo de 4 a 5 frases.
        2. Use uma linguagem positiva e encorajadora, mesmo ao apontar áreas para melhoria.
        3. Analise o desempenho geral, destaque pontos fortes (ex: disciplinas com boas notas) e identifique áreas que podem ser desenvolvidas.
        4. Finalize com uma nota de incentivo.
        5. Escreva em formato de texto corrido.
    `;
    return generateDocumentText(prompt);
};

export interface ExtractedGrade {
    subjectName: string;
    assessmentName: string;
    grade: number;
}

export const extractGradesFromPdf = async (pdfBase64: string, studentName: string): Promise<ExtractedGrade[]> => {
    const prompt = `
        Analise o documento PDF fornecido, que é um boletim escolar do aluno(a) ${studentName}.
        Para cada disciplina listada no boletim, extraia CADA avaliação (como "Prova 1", "Trabalho", "Média 1º Bimestre", "Nota Final", etc.) e sua respectiva nota numérica.

        **Instruções Críticas:**
        1.  **Foco no Aluno:** Certifique-se de que os dados são do aluno ${studentName}.
        2.  **Extração Detalhada:** Para cada disciplina (ex: "Matemática", "Português"), identifique todas as colunas ou campos que representam uma avaliação e sua nota.
        3.  **Notas Numéricas:** Converta todas as notas para formato numérico (ex: 7,5 deve ser 7.5). Se uma nota não for numérica (ex: "C" para "compareceu"), ignore-a.
        4.  **Ignorar Faltas e Frequência:** Não extraia informações de faltas ou frequência, apenas nomes de avaliações e notas.
        5.  **Estrutura de Saída:** Retorne os dados como um array de objetos JSON, seguindo estritamente o schema. Cada objeto deve representar uma única nota de uma avaliação específica. Não agrupe as notas por disciplina no JSON final; crie um objeto para cada par avaliação/nota.
        6.  **Falha Graciosa:** Se o documento for ilegível, não parecer um boletim ou não contiver nenhuma nota, retorne um array JSON vazio: \`[]\`.

        **Exemplo de Saída Esperada:**
        [
            { "subjectName": "Matemática", "assessmentName": "Prova 1 Bimestre", "grade": 8.5 },
            { "subjectName": "Matemática", "assessmentName": "Trabalho em Grupo", "grade": 9.0 },
            { "subjectName": "Português", "assessmentName": "Prova 1 Bimestre", "grade": 7.0 }
        ]
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                subjectName: { type: Type.STRING, description: 'O nome da disciplina.' },
                assessmentName: { type: Type.STRING, description: 'O nome da avaliação (ex: Prova, Trabalho, Média Bimestral).' },
                grade: { type: Type.NUMBER, description: 'A nota numérica da avaliação.' },
            },
            required: ['subjectName', 'assessmentName', 'grade']
        }
    };
    
    try {
        const response = await callGeminiApi({
            prompt,
            schema,
            pdfBase64,
            model: 'gemini-2.5-pro',
            stream: false
        });
        
        const jsonText = await response.text();
        return jsonText ? JSON.parse(jsonText) : [];
    } catch (error) {
        console.error("Error extracting grades from PDF with Gemini via proxy:", error);
        throw new Error("A IA não conseguiu processar o boletim em PDF. Verifique se o formato é legível e contém os dados esperados.");
    }
};