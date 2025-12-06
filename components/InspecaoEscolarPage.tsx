import React from 'react';
import { DocumentTextIcon } from './icons/DocumentTextIcon';

export const InspecaoEscolarPage: React.FC = () => {
    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h1 className="mt-4 text-2xl font-bold text-gray-900">Livro de Visita do Inspetor Escolar</h1>
                <p className="mt-2 text-gray-600">Página em construção. Aqui você poderá registrar as visitas e anotações dos inspetores escolares.</p>
            </div>
        </div>
    );
};
