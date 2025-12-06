import React from 'react';
import { SchoolLogoIcon } from './icons/SchoolLogoIcon';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow text-center">
        <SchoolLogoIcon className="w-16 h-16 mx-auto text-teal-600" />
        <h2 className="text-2xl font-bold text-gray-900 mt-4">Sistema de Matrículas</h2>
        <p className="mt-2 text-gray-600">Aguarde o carregamento...</p>
      </div>
    </div>
  );
};

export default LoginPage;