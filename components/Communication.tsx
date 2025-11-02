import React, { useState } from 'react';
import { CommunicationSubView } from '../types';
import NoticeBoard from './communication/NoticeBoard';
import DirectMessages from './communication/DirectMessages';
import BulkMessaging from './communication/BulkMessaging';
import MeetingScheduling from './communication/MeetingScheduling';

const SubNavButton: React.FC<{
    label: string;
    active: boolean;
    onClick: () => void;
}> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 whitespace-nowrap ${
            active
                ? 'bg-teal-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'
        }`}
    >
        {label}
    </button>
);

const Communication: React.FC = () => {
    const [activeSubView, setActiveSubView] = useState<CommunicationSubView>(CommunicationSubView.NOTICE_BOARD);

    const renderSubView = () => {
        switch (activeSubView) {
            case CommunicationSubView.NOTICE_BOARD:
                return <NoticeBoard />;
            case CommunicationSubView.DIRECT_MESSAGES:
                return <DirectMessages />;
            case CommunicationSubView.BULK_MESSAGING:
                return <BulkMessaging />;
            case CommunicationSubView.MEETING_SCHEDULING:
                return <MeetingScheduling />;
            default:
                return (
                    <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">
                           Selecione uma ferramenta de comunicação.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div>
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Comunicação</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Centralize avisos, mensagens e agendamentos da comunidade escolar.</p>
            </header>
            
            <nav className="flex items-center space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-3 overflow-x-auto">
                {Object.values(CommunicationSubView).map(view => (
                    <SubNavButton
                        key={view}
                        label={view}
                        active={activeSubView === view}
                        onClick={() => setActiveSubView(view)}
                    />
                ))}
            </nav>

            {renderSubView()}
        </div>
    );
};

export default Communication;