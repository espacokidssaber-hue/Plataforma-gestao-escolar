

import React, { useState } from 'react';
import { type User, type Communication, type Lead, type Staff, type SchoolClass, type School } from '../types';
import { Button } from './ui/Button';
import { CommunicationModal } from './CommunicationModal';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { InboxIcon } from './icons/InboxIcon';

interface CommunicationPageProps {
    user: User;
    schools: School[];
    communications: Communication[];
    students: Lead[];
    staff: Staff[];
    classes: SchoolClass[];
    onSendMessage: (messageData: any, schoolId: string) => Promise<void>;
}

export const CommunicationPage: React.FC<CommunicationPageProps> = ({ user, schools, communications, students, staff, classes, onSendMessage }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const sortedCommunications = [...communications].sort((a, b) => new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime());

    return (
        <>
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Comunicação</h1>
                        <p className="text-gray-600 mt-1">Envie mensagens para pais e funcionários e veja o histórico.</p>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                        Nova Mensagem
                    </Button>
                </div>

                <div className="bg-white shadow-md rounded-lg">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <InboxIcon className="w-6 h-6 mr-3 text-gray-500"/>
                            Histórico de Envios
                        </h2>
                    </div>
                    {sortedCommunications.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {sortedCommunications.map(comm => (
                                <li key={comm.id} className="p-4 hover:bg-gray-50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-gray-800">{comm.subject}</p>
                                            <p className="text-sm text-gray-500 mt-1">Para: <span className="font-medium text-gray-700">{comm.recipientSummary}</span></p>
                                        </div>
                                        <div className="text-right text-xs text-gray-500 flex-shrink-0 ml-4">
                                            <p>{new Date(comm.sentAt).toLocaleString('pt-BR')}</p>
                                            <p>Por: {comm.senderName}</p>
                                        </div>
                                    </div>
                                    <details className="mt-3">
                                        <summary className="text-sm font-medium text-teal-600 cursor-pointer">Ver mensagem</summary>
                                        <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md border">{comm.message}</p>
                                    </details>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <div className="text-center py-16 px-6">
                            <InboxIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">Nenhuma Mensagem Enviada</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Clique em "Nova Mensagem" para iniciar a comunicação.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <CommunicationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={user}
                schools={schools}
                students={students}
                staff={staff}
                classes={classes}
                onSend={onSendMessage}
            />
        </>
    );
};