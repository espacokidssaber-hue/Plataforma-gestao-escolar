// FIX: Removed Vite-specific type reference. The API key is now sourced from process.env.

import { GoogleGenAI, Chat, Type, GenerateContentResponse } from "@google/genai";
import { EventData, EnrolledStudent, SchoolInfo } from '../types';

const getAiInstance = () => {
    // FIX: Switched from Vite's import.meta.env to standard process.env.API_KEY as per guidelines, resolving type errors.
    const key = process.env.API_KEY;
    if (!key) {
        // FIX: Updated error message to reflect the correct environment variable.
        throw new Error("A chave de API do Gemini não foi configurada. Verifique se a variável de ambiente 'API_KEY' está definida.");
    }
    // Cria uma nova instância a cada chamada para garantir que a chave mais atual seja usada.
    return new GoogleGenAI({ apiKey: key });
}


export const streamMessage = async (message: string) => {
  try {
    const aiInstance = getAiInstance();
    const chat = aiInstance.chats.create({ model: 'gemini-flash-lite-latest' });
    const result = await chat.sendMessageStream({ message });
    return result;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw new Error("Falha ao obter resposta da IA. Verifique sua chave de API e conexão com a internet.");
  }
};

export const streamDocumentText = async (prompt: string) => {
  try {
    const aiInstance = getAiInstance();
    const response = await aiInstance.models.generateContentStream({
       model: "gemini-2.5-flash",
       contents: prompt,
    });
    return response;
  } catch (error) {
    console.error("Error streaming text from Gemini:", error);
    throw new Error("Falha ao obter resposta da IA.");
  }
};


export const generateJsonFromText = async (prompt: string, schema: any) => {
  try {
    const aiInstance = getAiInstance();
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    // FIX: Access the generated text via the .text property directly.
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error)
  {
    console.error("Error generating JSON from Gemini:", error);
    throw new Error("Falha ao obter uma resposta JSON válida da IA.");
  }
};


export interface ExtractedStudent {
    studentName: string;
    dateOfBirth?: string; // "DD/MM/YYYY"
    className?: string; // "SÉRIE DE INTERESSE"
    studentTurma?: string; // "TURMA"
    schoolUnit?: string; // "Matriz", "Filial", "Anexo"
    guardianName?: string;
    guardianCpf?: string;
    guardianPhone?: string;
    guardianEmail?: string;
    addressStreet?: string;
    addressNumber?: string;
    addressComplement?: string;
    addressNeighborhood?: string;
    addressCity?: string;
    addressState?: string;
    addressZip?: string;
}

export const extractEnrolledStudentsFromPdf = async (pdfBase64: string): Promise<ExtractedStudent[]> => {
    const prompt = `
        **Objetivo Principal: Extrair TODOS os alunos de um relatório de matrículas em PDF.**

        Sua tarefa mais importante é analisar o documento PDF e extrair CADA ALUNO listado. **É CRÍTICO que nenhum aluno seja ignorado**, mesmo que algumas informações estejam faltando na linha dele.

        **Instruções de Extração:**
        1.  **Não Pule Alunos:** Processe todas as linhas que parecem ser um registro de aluno.
        2.  **Campos Vazios:** Se uma informação não for encontrada para um aluno (ex: CPF do responsável está em branco), retorne a propriedade correspondente no JSON como uma string vazia ("").
        3.  **Mapeamento de Campos:** Use os seguintes cabeçalhos da planilha para preencher o JSON:
            - NOME DO ALUNO -> studentName
            - DATA DE NASCIMENTO -> dateOfBirth
            - NOME DO RESPONSÁVEL -> guardianName
            - CPF DO RESPONSÁVEL -> guardianCpf
            - TELEFONE DO RESPONSÁVEL -> guardianPhone
            - E-MAIL DO RESPONSÁVEL -> guardianEmail
            - ENDEREÇO -> addressStreet
            - NÚMERO -> addressNumber
            - COMPLEMENTO -> addressComplement
            - BAIRRO -> addressNeighborhood
            - CIDADE -> addressCity
            - UF -> addressState
            - CEP -> addressZip

        **Extração de Série e Turma (Regras Específicas):**
        1.  **Série (\`className\`):**
            - Procure por colunas como "SÉRIE", "SÉRIE DE INTERESSE", "ETAPA".
            - Extraia o nome da série (ex: "1º Ano", "Infantil II").
            - Se a coluna contiver "1º ANO A", extraia APENAS a série ("1º ANO") para o campo \`className\`.

        2.  **Turma (\`studentTurma\`):**
            - **Prioridade 1:** Procure por uma coluna "TURMA". Use o valor dela.
            - **Prioridade 2:** Se não houver, verifique se a turma está junto da série (ex: "1º ANO A"). Extraia a letra ('A') para \`studentTurma\`.
            - **Se não encontrar:** Deixe o campo \`studentTurma\` como uma string vazia ("").

        **Extração da Unidade Escolar (\`schoolUnit\`):**
        - Analise o nome da série ou turma para identificar a unidade. 'MATRIZ'/'MAT' -> 'Matriz'. 'FILIAL'/'FIL' -> 'Filial'. 'ANEXO' -> 'Anexo'. Se não encontrar, use 'Matriz' como padrão.

        **Formato de Saída:**
        Retorne um array de objetos JSON. Garanta que **TODOS** os alunos do PDF estejam no array final.
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                studentName: { type: Type.STRING },
                dateOfBirth: { type: Type.STRING },
                className: { type: Type.STRING },
                studentTurma: { type: Type.STRING },
                schoolUnit: { type: Type.STRING },
                guardianName: { type: Type.STRING },
                guardianCpf: { type: Type.STRING },
                guardianPhone: { type: Type.STRING },
                guardianEmail: { type: Type.STRING },
                addressStreet: { type: Type.STRING },
                addressNumber: { type: Type.STRING },
                addressComplement: { type: Type.STRING },
                addressNeighborhood: { type: Type.STRING },
                addressCity: { type: Type.STRING },
                addressState: { type: Type.STRING },
                addressZip: { type: Type.STRING },
            },
            // Relaxing the requirements to ensure no student is skipped due to missing data.
            // The name is the absolute minimum to identify a student record.
            required: ['studentName']
        }
    };
    
    try {
        const aiInstance = getAiInstance();
        const pdfPart = {
            inlineData: {
                mimeType: 'application/pdf',
                data: pdfBase64,
            },
        };
        
        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [ { text: prompt }, pdfPart ] },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonText = response.text.trim();
        if (!jsonText) {
            return [];
        }
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error extracting students from PDF with Gemini:", error);
        throw new Error("A IA não conseguiu processar o arquivo PDF. Verifique se o formato é legível e contém os dados esperados.");
    }
};


export const generateDocumentText = async (prompt: string): Promise<string> => {
  try {
    const aiInstance = getAiInstance();
    const stream = await aiInstance.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let fullText = '';
    for await (const chunk of stream) {
        fullText += chunk.text;
    }
    
    if (!fullText || fullText.trim() === '') {
        throw new Error("A IA retornou uma resposta vazia. Tente novamente com um tópico mais específico.");
    }
    return fullText;
  } catch (error) {
    console.error("Error generating document text from Gemini:", error);
    // Re-throw the error to be caught and displayed by the calling component.
    throw error;
  }
};

export const streamTextFromPdf = async (pdfBase64: string): Promise<AsyncGenerator<GenerateContentResponse>> => {
    const prompt = `Extraia todo o texto deste documento PDF. Preserve a formatação de parágrafos e quebras de linha o máximo possível. Retorne apenas o texto extraído.`;
    const pdfPart = {
        inlineData: {
            mimeType: 'application/pdf',
            data: pdfBase64,
        },
    };
    try {
        const aiInstance = getAiInstance();
        const response = await aiInstance.models.generateContentStream({
            model: 'gemini-2.5-flash', // Switched to a faster model
            contents: { parts: [{ text: prompt }, pdfPart] },
        });
        return response;
    } catch (error) {
        console.error("Error extracting text from PDF with Gemini:", error);
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
        const aiInstance = getAiInstance();
        const pdfPart = { inlineData: { mimeType: 'application/pdf', data: pdfBase64 } };
        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [{ text: prompt }, pdfPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error parsing calendar from PDF with Gemini:", error);
        throw new Error("A IA não conseguiu processar o arquivo PDF do calendário. Verifique se o formato é legível e tente novamente.");
    }
};

export const fillContractWithData = async (contractText: string, student: EnrolledStudent, schoolInfo: SchoolInfo): Promise<string> => {
    const guardian = student.guardians?.[0];
    const address = student.address;
    const addressString = address 
        ? `${address.street}, ${address.number}${address.complement ? `, ${address.complement}` : ''} - ${address.neighborhood}, ${address.city} - ${address.state}, CEP: ${address.zip}`
        : 'Não informado';
    
    const totalAnnualCost = (student.enrollmentFee || 0) + ((student.monthlyFee || 0) * 11);

    const prompt = `
        Você é um assistente de secretaria escolar. Sua tarefa é preencher um modelo de contrato com os dados de um aluno.
        
        **MODELO DO CONTRATO:**
        ---
        ${contractText}
        ---

        **DADOS PARA INSERIR:**
        - Nome do Aluno: ${student.name}
        - Data de Nascimento do Aluno: ${student.dateOfBirth ? new Date(student.dateOfBirth + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informado'}
        - Nome do Responsável (Contratante): ${guardian?.name || 'Não informado'}
        - CPF do Responsável: ${guardian?.cpf || 'Não informado'}
        - RG do Responsável: ${guardian?.rg || 'Não informado'}
        - Endereço do Responsável: ${addressString}
        - Ano Letivo: ${new Date().getFullYear()}
        - Série/Turma: ${student.className}
        - Valor da Mensalidade: ${student.monthlyFee?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'Não informado'}
        - Valor da Matrícula: ${student.enrollmentFee?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'Não informado'}
        - Valor Total Anual: ${totalAnnualCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'Não informado'}
        - Nome da Escola (Contratada): ${schoolInfo.name}
        - CNPJ da Escola: ${schoolInfo.cnpj}
        - Endereço da Escola: ${schoolInfo.address}

        **INSTRUÇÕES:**
        1. Identifique os placeholders no modelo, como [NOME DO ALUNO], [CPF DO RESPONSÁVEL], [VALOR_MENSALIDADE], etc.
        2. Substitua CADA placeholder com o dado correspondente da lista "DADOS PARA INSERIR".
        3. Se um dado não estiver disponível, substitua o placeholder por "Não informado".
        4. Retorne o texto do contrato completo e preenchido, preservando a estrutura original de parágrafos e quebras de linha do modelo. Não adicione nenhum comentário ou formatação extra como markdown.
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
        const aiInstance = getAiInstance();
        const pdfPart = { inlineData: { mimeType: 'application/pdf', data: pdfBase64 } };
        
        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [ { text: prompt }, pdfPart ] },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonText = response.text.trim();
        if (!jsonText) {
            return [];
        }
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error extracting grades from PDF with Gemini:", error);
        throw new Error("A IA não conseguiu processar o boletim em PDF. Verifique se o formato é legível e contém os dados esperados.");
    }
};