import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSchoolInfo } from '../contexts/EnrollmentContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { schoolInfo } = useSchoolInfo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      login(username, password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro desconhecido.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 bg-grid-pattern">
      <style>{`
        .bg-grid-pattern {
          background-image: linear-gradient(var(--grid-pattern-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-pattern-color) 1px, transparent 1px);
          background-size: 2rem 2rem;
        }
      `}</style>
      <div className="w-full max-w-md p-8 space-y-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700/50">
        <div className="text-center">
          {schoolInfo.logo && <img src={schoolInfo.logo} alt="Logo da Escola" className="mx-auto h-20 w-auto object-contain mb-4" />}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Acessar Plataforma</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{schoolInfo.name}</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Usuário
            </label>
            <div className="mt-1">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white"
                placeholder="admin ou secretaria"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password"  className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Senha
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white"
                placeholder="123"
              />
            </div>
          </div>

          {error && <p className="text-sm text-center text-red-500 dark:text-red-400">{error}</p>}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;