
import React from 'react';
import { Bars3Icon } from '../icons/Bars3Icon';

interface HeaderProps {
    onMenuClick: () => void;
    pageTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, pageTitle }) => {
    return (
        <header className="lg:hidden sticky top-0 z-30 flex h-16 items-center gap-x-6 border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 print:hidden">
            <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-700"
                onClick={onMenuClick}
            >
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-1 text-md font-semibold leading-6 text-gray-900">
                {pageTitle}
            </div>
        </header>
    );
};
