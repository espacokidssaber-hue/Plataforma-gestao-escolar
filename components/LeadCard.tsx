
import React from 'react';
import { type Lead, LeadStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { Button } from './ui/Button';
import { ClockIcon } from './icons/ClockIcon';
import { AlertIcon } from './icons/AlertIcon';

interface LeadCardProps {
  lead: Lead;
  onSendInvitationClick: (lead: Lead) => void;
  onLinkOpened: (leadId: string) => void;
  onEnrollmentCompleted: (leadId: string) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onSendInvitationClick, onLinkOpened, onEnrollmentCompleted }) => {
  
  const needsFollowUp = () => {
    if (!lead.invitationSentAt) return false;
    const sentDate = new Date(lead.invitationSentAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - sentDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 48;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColorInfo = STATUS_COLORS[lead.status];

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${statusColorInfo.border} transition-transform hover:scale-105 flex flex-col justify-between min-h-[220px]`}>
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-base text-gray-900">{lead.studentName}</h3>
          </div>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColorInfo.bg} ${statusColorInfo.text}`}>
            {lead.status}
          </span>
        </div>

        <div className="mt-4 border-t pt-3">
          <p className="text-xs"><span className="font-semibold">Responsável:</span> {lead.responsibleName}</p>
          <p className="text-xs text-gray-500 truncate"><span className="font-semibold">Email:</span> {lead.responsibleEmail}</p>
          <p className="text-xs text-gray-500"><span className="font-semibold">Telefone:</span> {lead.responsiblePhone}</p>
        </div>

        {/* Timestamps and Alerts */}
        {(lead.invitationSentAt || lead.linkViewedAt || (needsFollowUp() && lead.status === LeadStatus.AWAITING_ENROLLMENT)) && (
          <div className="mt-4 border-t pt-3 space-y-2">
            {lead.invitationSentAt && (
              <div className="flex items-center text-xs text-gray-600">
                <ClockIcon className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                <span>Convite enviado: {formatDate(lead.invitationSentAt)}</span>
              </div>
            )}
            {lead.linkViewedAt && (
              <div className="flex items-center text-xs text-purple-700">
                <ClockIcon className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" />
                <span>Matrícula iniciada: {formatDate(lead.linkViewedAt)}</span>
              </div>
            )}
            {needsFollowUp() && lead.status === LeadStatus.AWAITING_ENROLLMENT && (
              <div className="flex items-center text-xs text-yellow-700 mt-1 bg-yellow-100 p-2 rounded-md">
                <AlertIcon className="w-4 h-4 mr-2" />
                <span>Sugerir follow-up!</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4">
        {lead.status === LeadStatus.NEGOTIATION && (
          <div className="text-right">
            <Button onClick={() => onSendInvitationClick(lead)}>
              Enviar Convite de Matrícula
            </Button>
          </div>
        )}
        {lead.status === LeadStatus.AWAITING_ENROLLMENT && (
          <div className="text-right">
            <Button variant="secondary" onClick={() => onLinkOpened(lead.id)}>
              Simular Abertura do Link
            </Button>
          </div>
        )}
        {lead.status === LeadStatus.ENROLLMENT_STARTED && (
          <div className="text-right">
            <Button onClick={() => onEnrollmentCompleted(lead.id)}>
              Simular Conclusão
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};