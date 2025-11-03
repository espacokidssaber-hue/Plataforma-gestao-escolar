// api/gemini.ts
import { GoogleGenAI, Part, GenerateContentParameters, Content } from "@google/genai";

// Esta função será executada no servidor da Vercel
export async function POST(request: Request) {
  try {
    const { prompt, stream, model, pdfBase64, schema } = await request.json();

    if (!prompt && !pdfBase64) {
      return new Response(JSON.stringify({ error: "O prompt ou dados de PDF são obrigatórios." }), { status: 400 });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY não foi encontrada nas variáveis de ambiente.");
    }
    
    const ai = new GoogleGenAI({ apiKey });

    let contentsPayload: string | Content;
    if (pdfBase64) {
        const parts: Part[] = [];
        if (prompt) parts.push({ text: prompt });
        parts.push({ inlineData: { mimeType: 'application/pdf', data: pdfBase64 } });
        contentsPayload = { parts: parts };
    } else {
        // Must be text-only if no pdfBase64
        contentsPayload = prompt;
    }
    
    const payload: GenerateContentParameters = {
        model: model || 'gemini-2.5-flash',
        contents: contentsPayload,
        config: {},
    };
    
    if (schema) {
        payload.config!.responseMimeType = "application/json";
        payload.config!.responseSchema = schema;
    }

    if (stream) {
      const streamResult = await ai.models.generateContentStream(payload);
      const readableStream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          for await (const chunk of streamResult) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        },
      });
      return new Response(readableStream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

    } else {
      const result = await ai.models.generateContent(payload);
      const responseText = result.text;
      
      // Se um schema foi fornecido, o Gemini já retorna um string JSON.
      // Caso contrário, é texto puro que envolvemos em um objeto JSON para consistência.
      const responseBody = schema ? responseText : JSON.stringify({ text: responseText });
      
      return new Response(responseBody, {
          headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error("Erro na rota da API Gemini:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: `Erro ao se comunicar com a IA: ${errorMessage}` }), { status: 500 });
  }
}