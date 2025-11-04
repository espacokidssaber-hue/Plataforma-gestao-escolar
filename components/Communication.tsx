import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { CommunicationSubView } from '../types';
import { useAuth } from '../contexts/AuthContext';
import NoticeBoard from './communication/NoticeBoard';
import DirectMessages from './communication/DirectMessages';
import BulkMessaging from './communication/BulkMessaging';
import MeetingScheduling from './communication/MeetingScheduling';

const InternalMessages = lazy(() => import('./communication/InternalMessages'));

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
    const { user } = useAuth();

    const availableSubViews = useMemo(() => {
        if (!user) return [];
        switch (user.role) {
            case 'admin':
                return Object.values(CommunicationSubView);
            case 'secretary':
                return [
                    CommunicationSubView.NOTICE_BOARD,
                    CommunicationSubView.DIRECT_MESSAGES,
                    CommunicationSubView.INTERNAL_MESSAGES,
                    CommunicationSubView.MEETING_SCHEDULING,
                ];
            case 'educator':
                return [
                    CommunicationSubView.NOTICE_BOARD,
                    CommunicationSubView.INTERNAL_MESSAGES,
                ];
            default:
                return [];
        }
    }, [user]);
    
    // Set initial view based on role
    const getInitialView = () => {
        if (user?.role === 'educator') {
            return CommunicationSubView.INTERNAL_MESSAGES;
        }
        return CommunicationSubView.NOTICE_BOARD;
    };

    const [activeSubView, setActiveSubView] = useState<CommunicationSubView>(getInitialView());
    
    // Effect to ensure the active view is always valid for the user
    useEffect(() => {
        if (availableSubViews.length > 0 && !availableSubViews.includes(activeSubView)) {
            setActiveSubView(getInitialView());
        }
    }, [availableSubViews, activeSubView, user]);


    const renderSubView = () => {
        if (!availableSubViews.includes(activeSubView)) {
             return (
                <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">
                        Você não tem permissão para acessar esta área.
                    </p>
                </div>
            );
        }

        switch (activeSubView) {
            case CommunicationSubView.NOTICE_BOARD:
                return <NoticeBoard />;
            case CommunicationSubView.DIRECT_MESSAGES:
                return <DirectMessages />;
            case CommunicationSubView.INTERNAL_MESSAGES:
                return (
                    <Suspense fallback={<div>Carregando...</div>}>
                        <InternalMessages />
                    </Suspense>
                );
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
                {availableSubViews.map(view => (
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