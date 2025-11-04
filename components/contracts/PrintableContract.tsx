import React, { useLayoutEffect } from 'react';
import { SchoolInfo, EnrolledStudent } from '../../types';

interface PrintableContractProps {
    text: string;
    schoolInfo: SchoolInfo;
    student: EnrolledStudent;
    onRendered: () => void;
}

const SchoolLogo: React.FC<{ logoUrl?: string; className?: string }> = ({ logoUrl, className }) => (
    logoUrl ?
        <img src={logoUrl} alt="Logo da Escola" className={className} /> :
        <div className={className + " flex items-center justify-center bg-gray-200 text-gray-500"}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9-5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-9.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-9.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20M1 12l11 6 11-6M1 12v6a2 2 0 002 2h18a2 2 0 002-2v-6" /></svg>
        </div>
);

const PrintableContract: React.FC<PrintableContractProps> = ({ text, schoolInfo, student, onRendered }) => {
    useLayoutEffect(() => {
        const animationFrameId = requestAnimationFrame(() => {
            onRendered();
        });

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [onRendered]);

    const city = schoolInfo.address?.split(',').slice(-2, -1)[0]?.trim() || 'Sua Cidade';
    const formattedDate = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const guardian = student.guardians?.[0];

    return (
        <div id="printable-contract-content" className="printable-declaration p-8 bg-white text-black font-serif">
            <header className="flex items-start space-x-4 border-b-2 border-gray-700 pb-4">
                 <div className="h-20 w-20 flex-shrink-0 flex items-center justify-center">
                    {schoolInfo.logo ? (
                        <img src={schoolInfo.logo} alt="Logo da Instituição" className="max-h-full max-w-full object-contain" />
                    ) : (
                        <SchoolLogo className="h-20 w-20 text-gray-800" />
                    )}
                </div>
                <div className="text-center flex-grow">
                    <h1 className="text-xl font-bold uppercase">{schoolInfo.name}</h1>
                    <p className="text-xs">{schoolInfo.address}</p>
                </div>
            </header>
            
            <main className="mt-8">
                 <h2 className="text-xl font-bold uppercase text-center mb-8">
                    CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS
                </h2>
                <p className="leading-relaxed" style={{ textAlign: 'justify', hyphens: 'auto' }}>
                    {text}
                </p>
            </main>

            <footer className="mt-16">
                <p className="text-right mb-16">
                    {city}, {formattedDate}.
                </p>

                <div className="flex flex-col items-center space-y-12">
                    <div className="text-center w-96">
                        <div className="border-t border-black pt-2">
                            <p className="font-semibold">{guardian?.name || '___________________________'}</p>
                            <p className="text-sm">CONTRATANTE (Responsável pelo Aluno)</p>
                        </div>
                    </div>
                    <div className="text-center w-96">
                        <div className="border-t border-black pt-2">
                            <p className="font-semibold">{schoolInfo.name}</p>
                            <p className="text-sm">CONTRATADA</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PrintableContract;