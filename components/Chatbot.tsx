import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageRole } from '../types';
import { streamMessage } from '../services/geminiService';
import ChatMessageComponent from './ChatMessage';
import InputBar from './InputBar';

interface ChatbotProps {
  onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: MessageRole.MODEL, content: "Olá! Sou seu assistente Gemini. Como posso ajudar hoje?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    const userMessage: ChatMessage = { role: MessageRole.USER, content: prompt };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    try {
      // streamMessage agora retorna um leitor (ReadableStreamDefaultReader)
      const reader = await streamMessage(prompt);
      
      setMessages(prev => [...prev, { role: MessageRole.MODEL, content: '' }]);

      const decoder = new TextDecoder();

      // Loop para ler o stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break; // O stream terminou
        }
        
        const chunkText = decoder.decode(value);
        setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === MessageRole.MODEL) {
                lastMessage.content += chunkText;
            }
            return newMessages;
        });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
      setError(errorMessage);
      setMessages(prev => [...prev, { role: MessageRole.MODEL, content: `Desculpe, algo deu errado: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-[90vw] max-w-md h-[70vh] max-h-[600px] flex flex-col bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/50 transition-all duration-300 ease-in-out origin-bottom-right animate-slide-in">
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
            <h1 className="text-lg font-bold text-teal-600 dark:text-teal-300">Assistente Gemini</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Powered by gemini-flash-lite-latest</p>
        </div>
        <button onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </header>
      
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
          {messages.map((msg, index) => (
            <ChatMessageComponent key={index} message={msg} />
          ))}
          {isLoading && messages[messages.length-1].role === MessageRole.USER && (
            <div className="flex justify-start items-center gap-3 my-4">
              <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-500 dark:text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
              </div>
              <div className="bg-gray-200 dark:bg-gray-800/70 px-4 py-3 rounded-2xl flex items-center space-x-2">
                <span className="w-2 h-2 bg-teal-500 dark:bg-teal-400 rounded-full animate-pulse delay-75"></span>
                <span className="w-2 h-2 bg-teal-500 dark:bg-teal-400 rounded-full animate-pulse delay-150"></span>
                <span className="w-2 h-2 bg-teal-500 dark:bg-teal-400 rounded-full animate-pulse delay-300"></span>
              </div>
            </div>
          )}
      </main>
      
      <footer className="p-2">
            {error && <div className="text-red-500 dark:text-red-400 text-center text-xs mb-2 px-2">{error}</div>}
            <InputBar onSendMessage={handleSendMessage} isLoading={isLoading} />
      </footer>
       <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;