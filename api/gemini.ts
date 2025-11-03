// api/gemini.ts
import { GoogleGenAI } from "@google/genai";

// Esta função será executada no servidor da Vercel
export async function POST(request: Request) {
  // 1. Pega o prompt e a flag de streaming enviados pelo frontend
  const { prompt, stream } = await request.json();

  if (!prompt) {
    return new Response(JSON.stringify({ error: "O prompt é obrigatório." }), { status: 400 });
  }

  try {
    // 2. Acessa a chave de API de forma segura (do Environment Variable)
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY não encontrada.");
    }
    
    const ai = new GoogleGenAI({ apiKey });

    // 3. Decide entre streaming e resposta completa
    if (stream) {
      // 3a. Lida com a requisição de streaming
      const streamResult = await ai.models.generateContentStream({
          model: "gemini-flash-lite-latest",
          contents: prompt,
      });

      // 4a. Cria um fluxo de resposta para enviar de volta ao frontend em tempo real
      const readableStream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          for await (const chunk of streamResult) {
            const text = chunk.text;
            if (text) {
              // Envia cada pedaço de texto de volta para o navegador
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        },
      });

      // 5a. Retorna o fluxo como resposta para o frontend
      return new Response(readableStream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });

    } else {
      // 3b. Lida com a requisição de texto completo
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      const fullText = result.text;
      
      // 4b. Retorna o texto completo em um objeto JSON
      return new Response(JSON.stringify({ text: fullText }), {
          headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error("Erro na rota da API Gemini:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: `Erro ao se comunicar com a IA: ${errorMessage}` }), { status: 500 });
  }
}
