import React, { useState, createContext, useContext, useEffect, ReactNode } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Admissions from './components/Admissions';
import Academic from './components/Academic';
import Financial from './components/Financial';
import Communication from './components/Communication';
import Reports from './components/Reports';
// FIX: Changed to named import to resolve module export error.
import { Declarations } from './components/Declarations';
import { Minutes } from './components/Minutes';
import Archive from './components/Archive';
import Chatbot from './components/Chatbot';
import { View, SchoolInfo } from './types';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationBell from './components/NotificationBell';
import { ThemeProvider } from './contexts/ThemeContext';
import { EnrollmentProvider } from './contexts/EnrollmentContext';
import PublicEnrollmentForm from './components/PublicEnrollmentForm';
import Students from './components/Students';
import Settings from './components/Settings';
import Login from './components/Login';
import { useAuth } from './contexts/AuthContext';
import SignaturesAndContracts from './components/SignaturesAndContracts';


// --- School Info Context ---
interface SchoolInfoContextType {
    schoolInfo: SchoolInfo;
    setSchoolInfo: React.Dispatch<React.SetStateAction<SchoolInfo>>;
    matrizInfo: any;
    setMatrizInfo: React.Dispatch<React.SetStateAction<any>>;
}

const SchoolInfoContext = createContext<SchoolInfoContextType | undefined>(undefined);

const defaultSchoolInfo: SchoolInfo = {
    name: 'Escola Modelo Aprender Mais',
    cnpj: '12.345.678/0001-99',
    address: 'Rua do Saber, 123 - Bairro Educação, Cidade Exemplo - SP',
    phone: '(11) 4004-1234',
    email: 'contato@escolamodelo.com',
    directorName: 'Dr. João da Silva',
    secretaryName: 'Maria Antônia de Souza',
    logo: '',
};

const defaultMatrizInfo = {
    cnpj: '',
    address: '',
    email: '',
    phone: '',
    authorizationNumber: ''
};

const SchoolInfoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(() => {
        try {
            const savedInfo = localStorage.getItem('schoolInfo');
            return savedInfo ? { ...defaultSchoolInfo, ...JSON.parse(savedInfo) } : defaultSchoolInfo;
        } catch {
            return defaultSchoolInfo;
        }
    });
    
    const [matrizInfo, setMatrizInfo] = useState(() => {
        try {
            const saved = localStorage.getItem('matrizInfo');
            return saved ? { ...defaultMatrizInfo, ...JSON.parse(saved) } : defaultMatrizInfo;
        } catch {
            return defaultMatrizInfo;
        }
    });

    useEffect(() => {
        localStorage.setItem('schoolInfo', JSON.stringify(schoolInfo));
    }, [schoolInfo]);
    
    useEffect(() => {
        localStorage.setItem('matrizInfo', JSON.stringify(matrizInfo));
    }, [matrizInfo]);

    return (
        <SchoolInfoContext.Provider value={{ schoolInfo, setSchoolInfo, matrizInfo, setMatrizInfo }}>
            {children}
        </SchoolInfoContext.Provider>
    );
};

export const useSchoolInfo = (): SchoolInfoContextType => {
    const context = useContext(SchoolInfoContext);
    if (!context) {
        throw new Error('useSchoolInfo must be used within a SchoolInfoProvider');
    }
    return context;
};
// --- End School Info Context ---


const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
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
        return <Dashboard />;
      case View.ENROLLMENTS:
        return <Admissions />;
      case View.STUDENTS:
        return <Students />;
      case View.ACADEMIC:
        return <Academic />;
      case View.FINANCIAL:
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

  return (
    <ThemeProvider>
      <NotificationProvider>
        <EnrollmentProvider>
          <SchoolInfoProvider>
            {isPublicEnrollment ? (
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 bg-grid-pattern">
                <PublicEnrollmentForm 
                    onClose={handlePublicFormClose} 
                    onSuccess={() => { /* After submission, the "Fechar" button will only trigger onClose */ }} 
                />
              </div>
            ) : !isAuthenticated ? (
              <Login />
            ) : (
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
                    {renderView()}
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
            )}
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
          </SchoolInfoProvider>
        </EnrollmentProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;