
import React, { useState, useEffect } from 'react';
import { type Lead } from '../types';
import { MESSAGE_TEMPLATE } from '../constants';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { MailIcon } from './icons/MailIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    channels: { email: boolean; whatsapp: boolean },
    updatedContactInfo: { email: string; phone: string }
  ) => void;
  lead: Lead;
}

export const InvitationModal: React.FC<InvitationModalProps> = ({ isOpen, onClose, onConfirm, lead }) => {
  const [email, setEmail] = useState(lead.responsibleEmail);
  const [phone, setPhone] = useState(lead.responsiblePhone);
  const [sendByEmail, setSendByEmail] = useState(true);
  const [sendByWhatsApp, setSendByWhatsApp] = useState(true);

  useEffect(() => {
    setEmail(lead.responsibleEmail);
    setPhone(lead.responsiblePhone);
  }, [lead]);

  const handleConfirm = () => {
    onConfirm(
      { email: sendByEmail, whatsapp: sendByWhatsApp },
      { email, phone }
    );
  };
  
  const personalizedMessage = MESSAGE_TEMPLATE
    .replace('[NOME_RESPONSAVEL]', lead.responsibleName)
    .replace('[LINK_UNICO]', `https://escola.com.br/matricula/token/${Math.random().toString(36).substring(2, 15)}`);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enviar Convite de Matrícula">
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-gray-800 mb-2">1. Confirme os Destinatários</h4>
                <div className="space-y-3">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail do Responsável</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        />
                    </div>
                     <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">WhatsApp do Responsável</label>
                        <input
                            type="tel"
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        />
                    </div>
                </div>
            </div>
            
            <div>
                <h4 className="font-semibold text-gray-800 mb-2">2. Selecione os Canais de Envio</h4>
                <div className="flex flex-col items-start space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-6">
                    <label className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={sendByEmail} onChange={() => setSendByEmail(!sendByEmail)} className="h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                        <MailIcon className="w-5 h-5 ml-2 text-gray-600" />
                        <span className="ml-2 text-gray-700">E-mail</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={sendByWhatsApp} onChange={() => setSendByWhatsApp(!sendByWhatsApp)} className="h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                        <WhatsAppIcon className="w-5 h-5 ml-2 text-gray-600" />
                        <span className="ml-2 text-gray-700">WhatsApp</span>
                    </label>
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-gray-800 mb-2">3. Pré-Visualização da Mensagem</h4>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-48 overflow-y-auto">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{personalizedMessage}</p>
                </div>
            </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleConfirm} disabled={!sendByEmail && !sendByWhatsApp}>Confirmar e Enviar</Button>
        </div>
    </Modal>
  );
};