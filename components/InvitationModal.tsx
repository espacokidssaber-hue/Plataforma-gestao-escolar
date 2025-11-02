import React, { useState } from 'react';
import { Lead } from '../types';

interface InvitationModalProps {
  lead: Lead;
  onClose: () => void;
  onConfirm: (lead: Lead) => void;
}

const InvitationModal: React.FC<InvitationModalProps> = ({ lead, onClose, onConfirm }) => {
    const [channels, setChannels] = useState({ email: true, whatsapp: true });

    const messageTemplate = `Olá, família de ${lead.name},

Sejam bem-vindos à nossa escola! Estamos muito felizes com seu interesse.

Para dar continuidade ao processo de matrícula, por favor, acesse seu portal exclusivo através do link seguro abaixo:
[LINK_UNICO_E_SEGURO]

Lá você poderá preencher os dados, enviar os documentos e assinar o contrato digitalmente.

Atenciosamente,
Equipe de Admissões.`;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Enviar Convite de Matrícula</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Para a família de <span className="font-semibold text-teal-600 dark:text-teal-300">{lead.name}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <main className="p-6 space-y-6">
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. Confirmar Destinatários</h3>
                        <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 text-sm space-y-2 text-gray-800 dark:text-gray-300">
                           <p><strong>E-mail:</strong> responsavel@email.com (Editável)</p>
                           <p><strong>WhatsApp:</strong> (11) 99999-8888 (Editável)</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. Selecionar Canais de Envio</h3>
                        <div className="flex space-x-4">
                            <label className="flex items-center p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 flex-1">
                                <input type="checkbox" checked={channels.email} onChange={e => setChannels(c => ({...c, email: e.target.checked}))} className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-teal-500 focus:ring-teal-500" />
                                <span className="ml-3 text-gray-900 dark:text-white">E-mail</span>
                            </label>
                            <label className="flex items-center p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 flex-1">
                                <input type="checkbox" checked={channels.whatsapp} onChange={e => setChannels(c => ({...c, whatsapp: e.target.checked}))} className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-teal-500 focus:ring-teal-500" />
                                <span className="ml-3 text-gray-900 dark:text-white">WhatsApp</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. Pré-visualização da Mensagem</h3>
                        <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {messageTemplate}
                        </div>
                    </div>
                </main>
                
                <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                     <button 
                        onClick={() => onConfirm(lead)}
                        disabled={!channels.email && !channels.whatsapp}
                        className="px-6 py-3 rounded-lg bg-teal-600 text-white font-semibold flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-teal-500 transition-colors"
                    >
                        Confirmar e Enviar
                    </button>
                </footer>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default InvitationModal;
