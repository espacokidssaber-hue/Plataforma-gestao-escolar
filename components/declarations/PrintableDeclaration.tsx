import React from 'react';
import { SchoolInfo, EnrolledStudent, SchoolUnit } from '../../types';

interface PrintableDeclarationProps {
    text: string;
    schoolInfo: SchoolInfo;
    student: EnrolledStudent;
    title: string;
}

const SchoolLogo: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path d="M12 14l9-5-9-5-9-5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-9.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-9.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20M1 12l11 6 11-6M1 12v6a2 2 0 002 2h18a2 2 0 002-2v-6" />
    </svg>
);


const PrintableDeclaration: React.FC<PrintableDeclarationProps> = ({ text, schoolInfo, student, title }) => {

    const city = schoolInfo.address?.split(',').slice(-2, -1)[0]?.trim() || 'Sua Cidade';
    const formattedDate = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="printable-declaration bg-white text-black font-serif">
            <header className="flex items-center space-x-4 border-b-2 border-gray-700 pb-4">
                <div className="h-20 w-20 flex-shrink-0 flex items-center justify-center">
                    {schoolInfo.logo ? (
                        <img src={schoolInfo.logo} alt="Logo da Instituição" className="max-h-full max-w-full object-contain" />
                    ) : (
                        <SchoolLogo className="h-20 w-20 text-gray-800" />
                    )}
                </div>
                <div className="text-center flex-grow">
                    <h1 className="text-2xl font-bold uppercase">{schoolInfo.name}</h1>
                    <p className="text-sm">{schoolInfo.address}</p>
                    <p className="text-sm">CNPJ: {schoolInfo.cnpj} | Telefone: {schoolInfo.phone} | E-mail: {schoolInfo.email}</p>
                    {schoolInfo.authorizationNumber && <p className="text-sm">Nº de Autorização: {schoolInfo.authorizationNumber}</p>}
                </div>
            </header>
            
            <main className="mt-16">
                 <h2 className="text-2xl font-bold uppercase text-center mb-10">
                    {title}
                </h2>
                <p className="leading-relaxed" style={{ textIndent: '3em', textAlign: 'justify', hyphens: 'auto' }}>
                    {text}
                </p>
            </main>

            <footer className="mt-20">
                <p className="text-right mb-20">
                    {city}, {formattedDate}.
                </p>

                <div className="flex justify-around items-start">
                    <div className="text-center w-72">
                        <div className="border-t border-black pt-2">
                            <p className="font-semibold">{schoolInfo.secretaryName}</p>
                            <p className="text-sm">Secretaria</p>
                        </div>
                    </div>
                    <div className="text-center w-72">
                        <div className="border-t border-black pt-2">
                            <p className="font-semibold">{schoolInfo.directorName}</p>
                            <p className="text-sm">Diretoria</p>
                        </div>
                    </div>
                </div>
                
                 {student.unit === SchoolUnit.MATRIZ && (
                    <div className="relative mt-20 w-fit mx-auto text-center" style={{ fontFamily: 'Consolas, "Courier New", monospace' }}>
                        {/* Brackets using unicode characters for better rendering and positioning */}
                        <div className="absolute -top-2 -left-4 text-6xl font-bold text-black select-none">┌</div>
                        <div className="absolute -bottom-2 -right-4 text-6xl font-bold text-black select-none">┘</div>
                        <div className="px-8 py-4">
                            <p className="text-2xl font-bold tracking-wider">{schoolInfo.cnpj}</p>
                            <p className="font-semibold text-sm leading-tight">{schoolInfo.name.includes('Ltda') ? schoolInfo.name : `${schoolInfo.name} Ltda`}</p>
                            <p className="text-xs leading-tight max-w-xs">{schoolInfo.address}</p>
                        </div>
                    </div>
                )}
            </footer>
        </div>
    );
};

export default PrintableDeclaration;