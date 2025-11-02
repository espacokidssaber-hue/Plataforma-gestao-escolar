import React, { useState } from 'react';

interface PublicLinkModalProps {
  onClose: () => void;
}

const PublicLinkModal: React.FC<PublicLinkModalProps> = ({ onClose }) => {
    const [copyText, setCopyText] = useState('Copiar Link');
    const publicUrl = `${window.location.href.split('?')[0]}?enroll=new`;

    const handleCopy = () => {
        navigator.clipboard.writeText(publicUrl).then(() => {
            setCopyText('Copiado!');
            setTimeout(() => setCopyText('Copiar Link'), 2000);
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Link de Matrícula Pública</h2>
                  <button onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </header>
                <main className="p-6 space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">Compartilhe este link com os responsáveis interessados. Eles serão direcionados para um portal onde poderão preencher todos os dados e enviar os documentos para a pré-matrícula.</p>
                    <div className="flex space-x-2">
                        <input 
                            type="text" 
                            readOnly 
                            value={publicUrl}
                            className="w-full bg-gray-100 dark:bg-gray-900/50 p-2 rounded-lg text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600"
                        />
                        <button onClick={handleCopy} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 w-32 text-center">
                            {copyText}
                        </button>
                    </div>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center">Nota: O link é apenas demonstrativo. Para simular o acesso, use o botão "Simular Acesso ao Link" na tela principal.</p>
                </main>
                 <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500">
                        Fechar
                    </button>
                </footer>
                <style>{`
                    @keyframes fade-in {
                        from { opacity: 0; transform: scale(0.98); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                `}</style>
            </div>
        </div>
    );
};

export default PublicLinkModal;