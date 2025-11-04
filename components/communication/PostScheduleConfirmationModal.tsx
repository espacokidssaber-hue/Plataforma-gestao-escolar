import React from 'react';

interface PostScheduleConfirmationModalProps {
  details: {
    channels: { email: boolean, whatsapp: boolean, app: boolean },
    isBulk: boolean
  } | null;
  onClose: () => void;
}

const PostScheduleConfirmationModal: React.FC<PostScheduleConfirmationModalProps> = ({ details, onClose }) => {
    
    const renderMessage = () => {
        if (!details) {
            return "O convite foi enviado para o(s) participante(s) selecionado(s).";
        }
        
        const selectedChannels = [];
        if (details.channels.email) selectedChannels.push('E-mail');
        if (details.channels.whatsapp) selectedChannels.push('WhatsApp');
        if (details.channels.app) selectedChannels.push('Notificação do App');
        
        if (selectedChannels.length === 0) {
            return "Nenhum canal de envio foi selecionado, mas a reunião foi agendada no sistema.";
        }
        
        const formatChannels = (channels: string[]): string => {
            if (channels.length === 0) return '';
            if (channels.length === 1) return channels[0];
            const last = channels[channels.length - 1];
            const allButLast = channels.slice(0, -1);
            return `${allButLast.join(', ')} e ${last}`;
        };
        const channelsString = formatChannels(selectedChannels);
        
        const target = details.isBulk ? "todas as educadoras" : "o(s) participante(s) selecionado(s)";

        return `O convite foi enviado para ${target} via ${channelsString}.`;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-md flex flex-col items-center text-center p-8" onClick={e => e.stopPropagation()}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-teal-500 dark:text-teal-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reunião Agendada com Sucesso!</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                    {renderMessage()}
                </p>
                <button 
                    onClick={onClose} 
                    className="mt-6 px-8 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500"
                >
                    OK
                </button>
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

export default PostScheduleConfirmationModal;