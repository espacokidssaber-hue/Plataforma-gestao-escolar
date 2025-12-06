
import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { DocumentArrowDownIcon } from '../icons/DocumentArrowDownIcon';
import { SpinnerIcon } from '../icons/SpinnerIcon';

interface PrintLayoutProps {
  children: React.ReactNode;
  onClose: () => void;
  documentTitle?: string;
}

// A more robust function to wait for a library to be available on the window object.
const waitForLibrary = (libName: string, maxAttempts = 50, interval = 100): Promise<any> => {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const check = () => {
            const lib = (window as any)[libName];
            if (typeof lib === 'function') {
                resolve(lib);
            } else {
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(check, interval);
                } else {
                    reject(new Error(`${libName}.js library not loaded.`));
                }
            }
        };
        check();
    });
};


export const PrintLayout: React.FC<PrintLayoutProps> = ({ children, onClose, documentTitle = 'documento' }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    const element = document.getElementById('print-content');
    if (!element || isDownloading) {
      return;
    }

    setIsDownloading(true);

    try {
      const html2pdf = await waitForLibrary('html2pdf');
      
      const options = {
        margin: 0, // Margins are handled by padding in the element to ensure WYSIWYG
        filename: `${documentTitle}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().from(element).set(options).save();

    } catch (err: any) {
      console.error("PDF generation failed:", err);
      alert(`Ocorreu um erro ao gerar o PDF: A biblioteca de geração de PDF não foi carregada. Verifique sua conexão ou desative bloqueadores de anúncio e tente novamente.`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
       <style>{`
        @page {
          size: A4;
          margin: 0; /* Important: Disable browser margins so CSS padding controls the 2cm margin exactly */
        }
        @media print {
          .print-header {
            display: none !important;
          }
          body {
            background-color: #fff !important;
            margin: 0;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          body * {
            visibility: hidden;
          }
          #print-content, #print-content * {
            visibility: visible;
          }
          #print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 20mm !important; /* 2cm margin on all sides */
            border: none !important;
            box-shadow: none !important;
            box-sizing: border-box;
            background-color: white !important;
          }
        }
      `}</style>
      <div className="bg-slate-200 min-h-screen flex flex-col items-center">
        <header className="sticky top-0 w-full bg-white shadow-md p-3 z-50 flex justify-between items-center print-header">
          <h2 className="text-lg font-semibold text-gray-800">Visualização de Impressão (A4)</h2>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose} disabled={isDownloading}>
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Voltar
            </Button>
            <Button onClick={handleDownloadPdf} disabled={isDownloading}>
              {isDownloading ? (
                <SpinnerIcon className="w-5 h-5 mr-2" />
              ) : (
                <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              )}
              {isDownloading ? 'Baixando...' : 'Baixar PDF'}
            </Button>
          </div>
        </header>
        <main className="py-8 w-full flex justify-center overflow-auto">
            {/* 
                A4 Dimensions: 210mm x 297mm
                Padding: 20mm (2cm)
                This ensures what you see is what you get for A4 printing.
            */}
            <div id="print-content" className="bg-white w-[210mm] min-h-[297mm] shadow-2xl p-[20mm] box-border relative mx-auto text-black">
                {children}
            </div>
        </main>
      </div>
    </>
  );
};
