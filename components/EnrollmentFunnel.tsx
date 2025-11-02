import React, { useState } from 'react';
import { Lead, LeadStatus } from '../types';
import { useEnrollment } from '../contexts/EnrollmentContext';
import InvitationModal from './InvitationModal';
import AddLeadModal, { NewLeadData } from './AddLeadModal';

const LeadCard: React.FC<{ lead: Lead; onInvite: (lead: Lead) => void; onUpdateAction: (lead: Lead, newAction: string) => void; }> = ({ lead, onInvite, onUpdateAction }) => {
    const nextActionOptions = [
        'Ligar para apresentar a escola',
        'Agendar visita',
        'Realizar visita',
        'Enviar proposta financeira',
        'Follow-up sobre proposta',
        'Aguardando preenchimento',
        'Nenhuma ação pendente'
    ];
    
    // Add current action if it's not in the standard list to ensure it's selectable
    if (!nextActionOptions.includes(lead.nextAction)) {
        nextActionOptions.unshift(lead.nextAction);
    }

    return (
        <div 
            draggable
            onDragStart={(e) => e.dataTransfer.setData('leadId', lead.id.toString())}
            className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3 cursor-grab active:cursor-grabbing"
        >
            <div className="flex items-center space-x-2">
                <img src={lead.avatar} alt={lead.name} className="w-8 h-8 rounded-full" />
                <h4 className="font-semibold text-gray-900 dark:text-white">{lead.name}</h4>
            </div>
            {lead.discountProgram && lead.discountProgram !== 'Nenhum' && (
                <p className="text-xs text-yellow-800 dark:text-yellow-200 font-semibold bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded-md inline-block">
                    ✓ {lead.discountProgram}
                </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">Interesse: <span className="text-gray-700 dark:text-gray-300">{lead.interest}</span></p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Fonte: <span className="text-gray-700 dark:text-gray-300">{lead.source}</span></p>
            
            <div>
              <label htmlFor={`next-action-${lead.id}`} className="text-xs text-gray-500 dark:text-gray-400">Próxima Ação:</label>
              <select
                id={`next-action-${lead.id}`}
                value={lead.nextAction}
                onChange={(e) => onUpdateAction(lead, e.target.value)}
                onClick={(e) => e.stopPropagation()} // Prevents drag from firing on click
                className="w-full mt-1 bg-gray-100 dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600 text-teal-700 dark:text-teal-200 text-xs rounded-md p-1.5 focus:ring-teal-500 focus:border-teal-500 transition"
              >
                {nextActionOptions.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>

            {lead.status === LeadStatus.NEGOTIATION && (
                <button 
                    onClick={() => onInvite(lead)}
                    className="w-full mt-2 px-3 py-1.5 bg-teal-50 dark:bg-teal-600/50 text-teal-700 dark:text-teal-200 text-xs font-semibold rounded-md hover:bg-teal-100 dark:hover:bg-teal-600 hover:text-teal-800 dark:hover:text-white transition-colors"
                >
                    Enviar Convite de Matrícula
                </button>
            )}
            
            {lead.invitationSent && (
                <div className="text-xs text-yellow-600 dark:text-yellow-400/80 border-t border-gray-200 dark:border-gray-700 pt-2 space-y-1">
                     <p>✓ Convite enviado em {new Date(lead.invitationSent).toLocaleDateString('pt-BR')}</p>
                     <p className="font-bold">[ASSISTENTE] O responsável ainda não visualizou o link. Sugerir follow-up em 48h.</p>
                </div>
            )}
        </div>
    );
};

const FunnelColumn: React.FC<{
    title: LeadStatus;
    leads: Lead[];
    onInvite: (lead: Lead) => void;
    onUpdateAction: (lead: Lead, newAction: string) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
    isDraggingOver: boolean;
}> = ({ title, leads, onInvite, onUpdateAction, onDrop, onDragOver, onDragLeave, isDraggingOver }) => (
    <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`flex-shrink-0 w-72 bg-gray-100 dark:bg-gray-900/50 p-3 rounded-lg transition-all duration-200 ${isDraggingOver ? 'bg-teal-100 dark:bg-teal-900/40 ring-2 ring-teal-500' : ''}`}
    >
        <h3 className="font-bold text-gray-900 dark:text-white mb-3 px-1">{title} ({leads.length})</h3>
        <div className="space-y-3 h-[60vh] overflow-y-auto pr-1 rounded-lg">
            {leads.map(lead => <LeadCard key={lead.id} lead={lead} onInvite={onInvite} onUpdateAction={onUpdateAction} />)}
            {title === LeadStatus.WON && (
                <div className="flex flex-col items-center justify-center text-center p-4 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-full text-sm">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-500 dark:text-teal-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <h4 className="font-semibold text-teal-600 dark:text-teal-300">Lead Convertido!</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                        Leads arrastados para esta coluna são movidos para a fila de "Novas Matrículas" para validação.
                    </p>
                </div>
            )}
        </div>
    </div>
);

// --- AVATAR UTILS START ---
const getInitials = (name: string): string => { if (!name) return '?'; const words = name.trim().split(' ').filter(Boolean); if (words.length > 1) { return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase(); } if (words.length === 1 && words[0].length > 1) { return words[0].substring(0, 2).toUpperCase(); } if (words.length === 1) { return words[0][0].toUpperCase(); } return '?'; };
const stringToColor = (str: string): string => { let hash = 0; if (!str) return '#cccccc'; for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); hash = hash & hash; } let color = '#'; for (let i = 0; i < 3; i++) { const value = (hash >> (i * 8)) & 0xFF; const adjustedValue = 100 + (value % 156); color += ('00' + adjustedValue.toString(16)).substr(-2); } return color; };
const generateAvatar = (name: string): string => { const initials = getInitials(name); const color = stringToColor(name); const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150" fill="${color}"><rect width="100%" height="100%" fill="currentColor" /><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60" fill="#ffffff">${initials}</text></svg>`; return `data:image/svg+xml;base64,${btoa(svg)}`; };
// --- AVATAR UTILS END ---

export const EnrollmentFunnel: React.FC<{ onLeadConverted: () => void }> = ({ onLeadConverted }) => {
    const { leads, addLead, updateLead, convertLeadToApplicant } = useEnrollment();
    const [draggingOverColumn, setDraggingOverColumn] = useState<LeadStatus | null>(null);
    const [leadToInvite, setLeadToInvite] = useState<Lead | null>(null);
    const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: LeadStatus) => {
        const leadId = parseInt(e.dataTransfer.getData('leadId'), 10);
        const lead = leads.find(l => l.id === leadId);
        if (lead && lead.status !== targetStatus) {
            if (targetStatus === LeadStatus.WON) {
                convertLeadToApplicant(lead.id);
                onLeadConverted();
            } else {
                updateLead({ ...lead, status: targetStatus });
            }
        }
        setDraggingOverColumn(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: LeadStatus) => {
        e.preventDefault();
        setDraggingOverColumn(status);
    };

    const handleDragLeave = () => {
        setDraggingOverColumn(null);
    };

    const handleUpdateAction = (lead: Lead, newAction: string) => {
        updateLead({ ...lead, nextAction: newAction });
    };

    const handleInvite = (lead: Lead) => {
        setLeadToInvite(lead);
    };

    const handleConfirmInvite = (lead: Lead) => {
        updateLead({ ...lead, status: LeadStatus.ENROLLMENT_INVITED, invitationSent: new Date().toISOString() });
        setLeadToInvite(null);
    };

    const handleAddLead = (data: NewLeadData) => {
        const newLead: Lead = {
            id: Date.now(),
            name: data.name,
            avatar: generateAvatar(data.name),
            status: LeadStatus.NEW,
            source: data.source,
            interest: data.interest,
            lastContact: new Date().toISOString().split('T')[0],
            nextAction: 'Ligar para apresentar a escola',
            discountProgram: data.discountProgram,
        };
        addLead(newLead);
        setIsAddLeadModalOpen(false);
    };

    return (
        <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Funil de Matrículas (CRM)</h2>
                <button 
                    onClick={() => setIsAddLeadModalOpen(true)}
                    className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 transition-colors flex items-center space-x-2"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Adicionar Lead Manual</span>
                </button>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4">
                {Object.values(LeadStatus).map(status => (
                    <FunnelColumn
                        key={status}
                        title={status}
                        leads={leads.filter(lead => lead.status === status)}
                        onInvite={handleInvite}
                        onUpdateAction={handleUpdateAction}
                        onDrop={(e) => handleDrop(e, status)}
                        onDragOver={(e) => handleDragOver(e, status)}
                        onDragLeave={handleDragLeave}
                        isDraggingOver={draggingOverColumn === status}
                    />
                ))}
            </div>
            {leadToInvite && <InvitationModal lead={leadToInvite} onClose={() => setLeadToInvite(null)} onConfirm={handleConfirmInvite} />}
            {isAddLeadModalOpen && <AddLeadModal onClose={() => setIsAddLeadModalOpen(false)} onAddLead={handleAddLead} />}
        </div>
    );
};
