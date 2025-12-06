
import React, { useState } from 'react';
import { SchoolLogoIcon } from './icons/SchoolLogoIcon';
import { Button } from './ui/Button';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface PlatformLoginProps {
  onLogin: (username: string, password_plaintext: string) => Promise<void>;
}

export const PlatformLogin: React.FC<PlatformLoginProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await onLogin('superadmin', 'super123');
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao tentar login automático.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8" style={{ backgroundImage: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)' }}>
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-teal-50">
        <div>
          <div className="flex justify-center">
            <div className="p-3 bg-teal-50 rounded-full">
                <SchoolLogoIcon className="w-16 h-16" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-gray-900">
            Acessar o Sistema
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Plataforma Inteligente de Gestão Escolar
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
           {error && (
            <div className="text-sm text-red-600 text-center bg-red-50 border border-red-200 p-3 rounded-md flex items-center justify-center animate-pulse" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div>
            <Button onClick={handleLoginClick} className="w-full py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200 bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <SpinnerIcon className="w-5 h-5 mr-3 -ml-1" />
                  Acessando...
                </>
              ) : (
                'Entrar como Super Administrador (Dev)'
              )}
            </Button>
          </div>
        </div>
         <div className="text-center text-xs text-gray-400 mt-8 border-t border-gray-100 pt-6">
            <p className="font-medium">Ambiente de Desenvolvimento Seguro</p>
            <p className="mt-1 font-mono">v2.0.4-platform-access</p>
        </div>
      </div>
    </div>
  );
};
