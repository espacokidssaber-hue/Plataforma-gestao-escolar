import React, { useState, useMemo } from 'react';

export interface NewLeadData {
  name: string;
  guardianName: string;
  phone: string;
  email: string;
  interest: string;
  source: string;
  discountProgram: string;
}

interface AddLeadModalProps {
  onClose: () => void;
  onAddLead: (leadData: NewLeadData) => void;
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ onClose, onAddLead }) => {
  const DISCOUNT_PROGRAMS = useMemo(() => {
    const saved = localStorage.getItem('crmOptions');
    if (saved) {
        const options = JSON.parse(saved);
        if (options.discountPrograms && Array.isArray(options.discountPrograms)) {
            return options.discountPrograms;
        }
    }
    return ['Nenhum', 'Bolsa Padrão (25%)', 'Convênio Empresa (15%)', 'Irmãos (10%)', 'Indicação (5%)'];
  }, []);
  
  const [formData, setFormData] = useState<NewLeadData>({
    name: '',
    guardianName: '',
    phone: '',
    email: '',
    interest: '',
    source: 'WhatsApp', // Default value
    discountProgram: 'Nenhum',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
        onAddLead(formData);
    }
  };
  
  const isFormValid = formData.name.trim() !== '' && formData.guardianName.trim() !== '' && formData.interest.trim() !== '';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Adicionar Novo Lead Manual</h2>
          <button onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Aluno (Obrigatório)</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Responsável (Obrigatório)</label>
              <input type="text" name="guardianName" id="guardianName" value={formData.guardianName} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" />
            </div>
             <div className="md:col-span-2">
              <label htmlFor="interest" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Série de Interesse (Obrigatório)</label>
              <input type="text" name="interest" id="interest" value={formData.interest} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" placeholder="Ex: 1º Ano, Infantil III..."/>
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
              <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" />
            </div>
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Origem do Contato</label>
              <select name="source" id="source" value={formData.source} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <option>WhatsApp</option>
                <option>Telefone</option>
                <option>Presencial</option>
                <option>Instagram</option>
                <option>Google</option>
                <option>Indicação</option>
                <option>Fachada</option>
              </select>
            </div>
             <div>
              <label htmlFor="discountProgram" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Programa de Desconto</label>
              <select name="discountProgram" id="discountProgram" value={formData.discountProgram} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                {DISCOUNT_PROGRAMS.map(program => <option key={program} value={program}>{program}</option>)}
              </select>
            </div>
          </main>
          <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500">
                Cancelar
            </button>
            <button type="submit" disabled={!isFormValid} className="px-4 py-2 bg-teal-600 rounded-lg text-white font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-teal-500">
                Adicionar ao Funil
            </button>
          </footer>
        </form>
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: scale(0.98); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        `}</style>
      </div>
    </div>
  );
};

export default AddLeadModal;