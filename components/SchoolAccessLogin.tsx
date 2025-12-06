import React, { useState } from 'react';
import { SchoolLogoIcon } from './icons/SchoolLogoIcon';
import { Button } from './ui/Button';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface SchoolAccessLoginProps {
  onLogin: (username: string, password_plaintext: string) => Promise<void>;
}

export const SchoolAccessLogin: React.FC<SchoolAccessLoginProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulates a login with the default superadmin credentials
      await onLogin('superadmin', 'super123');
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao tentar login automático.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E0E7FF] relative overflow-hidden font-sans">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-[20%] w-[50%] h-[50%] bg-pink-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md bg-white/60 backdrop-blur-lg border border-white/40 shadow-2xl rounded-3xl p-8 relative z-10 mx-4 transition-transform hover:scale-[1.01] duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-white/80 rounded-2xl shadow-sm mb-4 border border-white/50">
            <SchoolLogoIcon className="w-16 h-16" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight text-center drop-shadow-sm">
            Portal Escolar
          </h1>
          <p className="text-sm text-gray-600 font-medium mt-1 tracking-wide">
            Acesso Administrativo
          </p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="p-3 bg-red-100/80 border border-red-200 text-red-700 text-sm rounded-xl flex items-center animate-fadeIn backdrop-blur-sm">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="bg-white/40 p-4 rounded-xl border border-white/50">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2 text-center">Credenciais Padrão (Demo)</p>
            <div className="flex justify-between text-sm text-gray-700 font-mono bg-white/50 p-2 rounded border border-white/30">
              <span>user: superadmin</span>
              <span>pass: super123</span>
            </div>
          </div>

          <Button 
            onClick={handleLoginClick} 
            disabled={isLoading}
            className="w-full py-4 text-base font-bold bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20 border-none rounded-xl transition-all hover:translate-y-[-2px] active:translate-y-[0px]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <SpinnerIcon className="w-5 h-5 mr-2 text-white" />
                <span>Autenticando...</span>
              </div>
            ) : "Acessar Plataforma"}
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200/30 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/30 border border-white/40 shadow-sm backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            <p className="text-[10px] font-mono text-gray-600 font-semibold tracking-widest">
              v3.33.0 • SYSTEM ACTIVE
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};