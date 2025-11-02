import React from 'react';
import { SchoolInfo } from '../../types';

interface PrintableMinutesProps {
    text: string;
    schoolInfo: SchoolInfo;
    title: string;
    date: string; // The date of the event, not the generation date
}

const PrintableMinutes: React.FC<PrintableMinutesProps> = ({ text, schoolInfo, title, date }) => {
    const city = schoolInfo.address?.split(',').slice(-2, -1)[0]?.trim() || 'Sua Cidade';
    const generationDate = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="printable-declaration bg-white text-black font-serif">
            <header className="text-center mb-10">
                <h1 className="text-2xl font-bold uppercase">{schoolInfo.name}</h1>
                <h2 className="text-xl font-bold uppercase mt-4">{title}</h2>
            </header>
            
            <main>
                <p className="whitespace-pre-wrap leading-relaxed text-justify" style={{ textIndent: '3em' }}>
                    {text}
                </p>
            </main>

            <footer className="mt-20">
                <p className="text-right mb-20">
                    {city}, {generationDate}.
                </p>

                <div className="flex flex-col items-center space-y-16">
                    <div className="text-center w-80">
                        <div className="border-t border-black pt-2">
                            <p className="font-semibold">{schoolInfo.directorName}</p>
                            <p className="text-sm">Diretor(a)</p>
                        </div>
                    </div>
                    <div className="text-center w-80">
                        <div className="border-t border-black pt-2">
                            <p className="font-semibold">{schoolInfo.secretaryName}</p>
                            <p className="text-sm">Secretário(a)</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PrintableMinutes;