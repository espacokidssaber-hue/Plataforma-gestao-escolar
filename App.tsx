import React, { useState, createContext, useContext, useEffect, ReactNode, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';
import { View } from './types';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationBell from './components/NotificationBell';
import { ThemeProvider } from './contexts/ThemeContext';
import { EnrollmentProvider } from './contexts/EnrollmentContext';
import PublicEnrollmentForm from './components/PublicEnrollmentForm';
import Login from './components/Login';
import { useAuth } from './contexts/AuthContext';

// Lazy load components
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Admissions = React.lazy(() => import('./components/Admissions'));
const Students = React.lazy(() => import('./components/Students'));
const Staff = React.lazy(() => import('./components/Staff'));
const Academic = React.lazy(() => import('./components/Academic'));
const Financial = React.lazy(() => import('./components/Financial'));
const Communication = React.lazy(() => import('./components/Communication'));
const Reports = React.lazy(() => import('./components/Reports'));
const Declarations = React.lazy(() => import('./components/Declarations'));
const Minutes = React.lazy(() => import('./components/Minutes'));
const Archive = React.lazy(() => import('./components/archive/Archive'));
const Settings = React.lazy(() => import('./components/Settings'));
const SignaturesAndContracts = React.lazy(() => import('./components/SignaturesAndContracts'));


const LoadingFallback: React.FC = () => (
    <div className="flex items-center justify-center h-full">
        <svg className="animate-spin h-8 w-8 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const AppContent: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
    // Check for public enrollment link
    const urlParams = new URLSearchParams(window.location.search);
    const isPublicEnrollment = urlParams.get('enroll') === 'new';
  
    const handlePublicFormClose = () => {
      // Redirects to the main page without the query parameter
      window.location.href = window.location.pathname;
    };
  
    const renderView = () => {
      switch (activeView) {
        case View.DASHBOARD:
          return <Dashboard setActiveView={setActiveView} />;
        case View.ENROLLMENTS:
          return <Admissions />;
        case View.STUDENTS:
          return <Students />;
        case View.STAFF:
            return <Staff />;
        case View.ACADEMIC:
          return <Academic setActiveView={setActiveView} />;
        case View.FINANCIAL:
          if (user?.role !== 'admin') {
            return (
                <div className="flex items-center justify-center h-full text-center">
                    <div>
                        <h1 className="text-2xl font-bold text-red-500">Acesso Negado</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Você não tem permissão para visualizar a área financeira.</p>
                    </div>
                </div>
            );
          }
          return <Financial />;
        case View.COMMUNICATION:
          return <Communication />;
        case View.REPORTS:
          return <Reports />;
        case View.DECLARATIONS:
          return <Declarations />;
        case View.ATAS:
          return <Minutes />;
        case View.SIGNATURES:
          return <SignaturesAndContracts />;
        case View.SETTINGS:
          return <Settings />;
        case View.ARCHIVE:
          return <Archive />;
        default:
          return (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Em Desenvolvimento</h1>
                <p className="text-gray-500 dark:text-gray-400">A visualização para "{activeView}" ainda não está pronta.</p>
              </div>
            </div>
          );
      }
    };

    if (isPublicEnrollment) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 bg-grid-pattern">
              <PublicEnrollmentForm 
                  onClose={handlePublicFormClose} 
                  onSuccess={() => { /* After submission, the "Fechar" button will only trigger onClose */ }} 
              />
            </div>
        );
    }
    
    if (!isAuthenticated) {
        return <Login />;
    }

    return (
        <div className="relative min-h-screen md:flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 font-sans bg-grid-pattern">
          <Sidebar activeView={activeView} setActiveView={setActiveView} isSidebarOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col">
            <header className="flex-shrink-0 flex justify-between md:justify-end items-center mb-6">
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md md:hidden" aria-label="Abrir menu">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <NotificationBell />
            </header>
            <div className="flex-grow">
              <Suspense fallback={<LoadingFallback />}>
                {renderView()}
              </Suspense>
            </div>
          </main>

          {!isChatbotOpen && (
            <button
              onClick={() => setIsChatbotOpen(true)}
              className="fixed bottom-6 right-6 bg-teal-500 hover:bg-teal-400 text-white p-4 rounded-full shadow-lg transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-300 animate-pulse-slow"
              aria-label="Abrir assistente Gemini"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          )}

          {isChatbotOpen && <Chatbot onClose={() => setIsChatbotOpen(false)} />}
        </div>
    );
}


const App: React.FC = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <EnrollmentProvider>
            <AppContent />
            <style>{`
              .bg-grid-pattern {
                background-image: linear-gradient(var(--grid-pattern-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-pattern-color) 1px, transparent 1px);
                background-size: 2rem 2rem;
              }
              @keyframes pulse-slow {
                0%, 100% {
                  transform: scale(1);
                  box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.4);
                }
                50% {
                  transform: scale(1.05);
                  box-shadow: 0 0 0 10px rgba(20, 184, 166, 0);
                }
              }
              .animate-pulse-slow {
                animation: pulse-slow 3s infinite;
              }
            `}</style>
        </EnrollmentProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;