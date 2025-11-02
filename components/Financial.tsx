import React, { useState } from 'react';
import { FinancialSubView } from '../types';
import FinancialOverview from './financial/FinancialOverview';
import AccountsReceivable from './financial/AccountsReceivable';
import AccountsPayable from './financial/AccountsPayable';
import CashFlow from './financial/CashFlow';

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

const Financial: React.FC = () => {
    const [activeSubView, setActiveSubView] = useState<FinancialSubView>(FinancialSubView.OVERVIEW);

    const renderSubView = () => {
        switch (activeSubView) {
            case FinancialSubView.OVERVIEW:
                return <FinancialOverview />;
            case FinancialSubView.ACCOUNTS_RECEIVABLE:
                return <AccountsReceivable />;
            case FinancialSubView.ACCOUNTS_PAYABLE:
                return <AccountsPayable />;
            case FinancialSubView.CASH_FLOW:
                return <CashFlow />;
            default:
                return (
                    <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">
                           Selecione uma visualização.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div>
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financeiro</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Controle o faturamento, inadimplência e o fluxo de caixa da escola.</p>
            </header>
            
            <nav className="flex items-center space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-3 overflow-x-auto">
                {Object.values(FinancialSubView).map(view => (
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

export default Financial;