import React from 'react';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';

export const ArquivoMortoPage: React.FC = () => {
    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h1 className="mt-4 text-2xl font-bold text-gray-900">Arquivo Morto</h1>
                <p className="mt-2 text-gray-600">Página em construção. Aqui você poderá consultar a documentação de ex-alunos.</p>
            </div>
        </div>
    );
};
