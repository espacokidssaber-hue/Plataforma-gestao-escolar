import React, { useState } from 'react';
import { WhatsAppGroup } from '../../types';

interface ManageGroupsModalProps {
  initialGroups: WhatsAppGroup[];
  onClose: () => void;
  onSave: (groups: WhatsAppGroup[]) => void;
}

const ManageGroupsModal: React.FC<ManageGroupsModalProps> = ({ initialGroups, onClose, onSave }) => {
  const [groups, setGroups] = useState<WhatsAppGroup[]>(initialGroups);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupLink, setNewGroupLink] = useState('');
  const [error, setError] = useState('');

  const handleAddGroup = () => {
    if (!newGroupName.trim() || !newGroupLink.trim()) {
        setError('O nome e o link do grupo são obrigatórios.');
        return;
    }
    if (!newGroupLink.trim().startsWith('https://chat.whatsapp.com/')) {
        setError('O link parece ser inválido. Deve começar com "https://chat.whatsapp.com/".');
        return;
    }
    setError('');
    const newGroup: WhatsAppGroup = {
      id: Date.now(),
      name: newGroupName.trim(),
      link: newGroupLink.trim(),
    };
    setGroups([...groups, newGroup]);
    setNewGroupName('');
    setNewGroupLink('');
  };

  const handleRemoveGroup = (id: number) => {
    setGroups(groups.filter(group => group.id !== id));
  };

  const handleSaveChanges = () => {
    onSave(groups);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerenciar Grupos do WhatsApp</h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        
        <main className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Add new group form */}
            <div className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg space-y-3 border border-gray-200 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Adicionar Novo Grupo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                        type="text"
                        value={newGroupName}
                        onChange={e => setNewGroupName(e.target.value)}
                        placeholder="Nome do Grupo (Ex: Pais - Infantil II)"
                        className="w-full bg-white dark:bg-gray-700/80 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                    />
                    <input
                        type="url"
                        value={newGroupLink}
                        onChange={e => setNewGroupLink(e.target.value)}
                        placeholder="Cole o link do grupo aqui"
                        className="w-full bg-white dark:bg-gray-700/80 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                    />
                </div>
                {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
                <button type="button" onClick={handleAddGroup} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500">
                    Adicionar
                </button>
            </div>
            
            {/* List of saved groups */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Grupos Salvos</h3>
                <div className="space-y-2">
                    {groups.map(group => (
                        <div key={group.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{group.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{group.link}</p>
                            </div>
                            <button onClick={() => handleRemoveGroup(group.id)} className="px-3 py-1 text-xs font-semibold bg-red-100 dark:bg-red-600/50 text-red-700 dark:text-red-200 rounded-md hover:bg-red-200">
                                Remover
                            </button>
                        </div>
                    ))}
                    {groups.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">Nenhum grupo salvo.</p>
                    )}
                </div>
            </div>
        </main>
        
        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button type="button" onClick={handleSaveChanges} className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500">
            Salvar e Fechar
          </button>
        </footer>
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

export default ManageGroupsModal;