import React, { useState } from 'react';
import { PrintDiaryData } from '../../types';
import PrintableDiary from './PrintableDiary';

// html2pdf is loaded globally from index.html
declare const html2pdf: any;

interface DiaryViewerModalProps {
  diaryData: PrintDiaryData;
  onClose: () => void;
}

const DiaryViewerModal: React.FC<DiaryViewerModalProps> = ({ diaryData, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    const element = document.getElementById('printable-diary-content');
    if (element) {
        const safeFilename = `diario_de_classe_${diaryData.classInfo.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        html2pdf().from(element).set({
            margin: 20,
            filename: safeFilename,
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).save().then(() => {
            setIsDownloading(false);
        }).catch((err: any) => {
            console.error("html2pdf error:", err);
            alert("Ocorreu um erro ao gerar o PDF.");
            setIsDownloading(false);
        });
    } else {
        alert("Erro ao encontrar o conteúdo para gerar o PDF.");
        setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-[95vw] max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Visualizar Diário de Classe - {diaryData.classInfo.name}</h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        <main className="flex-grow p-4 overflow-y-auto bg-gray-100 dark:bg-gray-900/50">
          {/* Wrapper with ID for PDF generation */}
          <div id="printable-diary-content">
            <PrintableDiary {...diaryData} />
          </div>
        </main>
        <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center space-x-3">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500">
                Fechar
            </button>
            <button onClick={handleDownload} disabled={isDownloading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 disabled:bg-gray-500 flex items-center">
                 {isDownloading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                 ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" /></svg>
                 )}
                Baixar Diário (PDF)
            </button>
        </footer>
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: scale(0.98); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            #printable-diary-content { 
                /* Style for preview: scale down to fit */
                transform: scale(0.9);
                transform-origin: top center;
            }
        `}</style>
      </div>
    </div>
  );
};

export default DiaryViewerModal;