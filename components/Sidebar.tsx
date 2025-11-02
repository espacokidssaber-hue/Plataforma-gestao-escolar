import React from 'react';
import { View } from '../types';
import { useSchoolInfo } from '../App';

interface SidebarProps {
    activeView: View;
    setActiveView: (view: View) => void;
    isSidebarOpen: boolean;
    closeSidebar: () => void;
}

const SchoolIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M12 14l9-5-9-5-9-5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-9.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-9.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20M1 12l11 6 11-6M1 12v6a2 2 0 002 2h18a2 2 0 002-2v-6" />
    </svg>
);
const NavIcon: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="h-6 w-6">{children}</span>;

const NavItem: React.FC<{icon: React.ReactNode, label: string, active?: boolean, onClick: () => void}> = ({icon, label, active, onClick}) => (
    <button onClick={onClick} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 text-left ${active ? 'bg-teal-100 dark:bg-teal-800/50 text-teal-700 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'}`}>
        <NavIcon>{icon}</NavIcon>
        <span className="font-medium">{label}</span>
    </button>
)

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isSidebarOpen, closeSidebar }) => {
    const { schoolInfo } = useSchoolInfo();

    const handleNavigation = (view: View) => {
        setActiveView(view);
        closeSidebar(); // Close sidebar after navigation on mobile
    }

    const icons = {
        dashboard: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
        admissions: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
        students: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
        academic: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
        financial: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
        communication: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
        reports: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
        declarations: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
        minutes: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6a3 3 0 00-3-3H6.75a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V9A3 3 0 0016.5 6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M18.75 10.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>,
        signatures: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>,
        archive: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={closeSidebar}></div>}

            <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700/50 flex flex-col p-4 transform transition-transform duration-300 ease-in-out md:relative md:w-64 md:translate-x-0 md:flex-shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-700/50">
                    <div className="flex items-center space-x-3">
                        {schoolInfo.logo ? (
                            <img src={schoolInfo.logo} alt="Logo da Escola" className="h-10 w-10 object-contain" />
                        ) : (
                            <SchoolIcon className="h-10 w-10 text-teal-500 dark:text-teal-400 flex-shrink-0" />
                        )}
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{schoolInfo.name || 'Gestão Escolar'}</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Plataforma Inteligente</p>
                        </div>
                    </div>
                    <button onClick={closeSidebar} className="p-2 text-gray-500 dark:text-gray-400 rounded-full md:hidden" aria-label="Fechar menu">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <nav className="flex-grow py-6 space-y-2 overflow-y-auto">
                    <NavItem icon={icons.dashboard} label={View.DASHBOARD} active={activeView === View.DASHBOARD} onClick={() => handleNavigation(View.DASHBOARD)} />
                    <NavItem icon={icons.admissions} label={View.ENROLLMENTS} active={activeView === View.ENROLLMENTS} onClick={() => handleNavigation(View.ENROLLMENTS)} />
                    <NavItem icon={icons.students} label={View.STUDENTS} active={activeView === View.STUDENTS} onClick={() => handleNavigation(View.STUDENTS)} />
                    <NavItem icon={icons.academic} label={View.ACADEMIC} active={activeView === View.ACADEMIC} onClick={() => handleNavigation(View.ACADEMIC)} />
                    <NavItem icon={icons.financial} label={View.FINANCIAL} active={activeView === View.FINANCIAL} onClick={() => handleNavigation(View.FINANCIAL)} />
                    <NavItem icon={icons.communication} label={View.COMMUNICATION} active={activeView === View.COMMUNICATION} onClick={() => handleNavigation(View.COMMUNICATION)} />
                    <NavItem icon={icons.reports} label={View.REPORTS} active={activeView === View.REPORTS} onClick={() => handleNavigation(View.REPORTS)} />
                    <NavItem icon={icons.declarations} label={View.DECLARATIONS} active={activeView === View.DECLARATIONS} onClick={() => handleNavigation(View.DECLARATIONS)} />
                    <NavItem icon={icons.minutes} label={View.ATAS} active={activeView === View.ATAS} onClick={() => handleNavigation(View.ATAS)} />
                    <NavItem icon={icons.signatures} label={View.SIGNATURES} active={activeView === View.SIGNATURES} onClick={() => handleNavigation(View.SIGNATURES)} />
                    <NavItem icon={icons.archive} label={View.ARCHIVE} active={activeView === View.ARCHIVE} onClick={() => handleNavigation(View.ARCHIVE)} />
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
