
import React, { useState } from 'react';
import { type Lead, LeadStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { LeadCard } from './LeadCard';
import { InvitationModal } from './InvitationModal';

interface LeadDashboardProps {
  leads: Lead[];
  onSendInvitation: (
    leadId: string, 
    channels: { email: boolean; whatsapp: boolean }, 
    updatedContactInfo: { email: string; phone: string }
  ) => void;
  onLinkOpened: (leadId: string) => void;
  onEnrollmentCompleted: (leadId: string) => void;
}

const statusOrder = [
    LeadStatus.NEGOTIATION,
    LeadStatus.AWAITING_ENROLLMENT,
    LeadStatus.ENROLLMENT_STARTED,
    LeadStatus.COMPLETED
];

export const LeadDashboard: React.FC<LeadDashboardProps> = ({ leads, onSendInvitation, onLinkOpened, onEnrollmentCompleted }) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleOpenModal = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleCloseModal = () => {
    setSelectedLead(null);
  };

  const handleConfirmSend = (
    channels: { email: boolean; whatsapp: boolean },
    updatedContactInfo: { email: string; phone: string }
  ) => {
    if (selectedLead) {
      onSendInvitation(selectedLead.id, channels, updatedContactInfo);
      handleCloseModal();
    }
  };
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusOrder.map(status => (
          <div key={status} className="rounded-lg">
            <h2 className={`font-bold text-base mb-4 pb-2 border-b-4 ${STATUS_COLORS[status].border}`}>
              {status} ({leads.filter(l => l.status === status).length})
            </h2>
            <div className="space-y-4">
              {leads
                .filter(lead => lead.status === status)
                .map(lead => (
                  <LeadCard 
                    key={lead.id} 
                    lead={lead} 
                    onSendInvitationClick={handleOpenModal}
                    onLinkOpened={onLinkOpened}
                    onEnrollmentCompleted={onEnrollmentCompleted}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
      {selectedLead && (
        <InvitationModal
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={handleCloseModal}
          onConfirm={handleConfirmSend}
        />
      )}
    </>
  );
};