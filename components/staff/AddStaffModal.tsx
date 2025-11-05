import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Staff, StaffStatus } from '../../types';

type SaveStaffData = Omit<Staff, 'id' | 'avatar'> & { id?: number; avatar: string | null; };

interface AddStaffModalProps {
  staffToEdit?: Staff | null;
  onClose: () => void;
  onSave: (staff: SaveStaffData) => void;
}

const DefaultAvatar: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const AddStaffModal: React.FC<AddStaffModalProps> = ({ staffToEdit, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState<StaffStatus>(StaffStatus.ACTIVE);
  const [hireDate, setHireDate] = useState(new Date().toISOString().split('T')[0]);
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!staffToEdit;

  useEffect(() => {
    if (staffToEdit) {
      setName(staffToEdit.name);
      setRole(staffToEdit.role);
      setDepartment(staffToEdit.department);
      setStatus(staffToEdit.status);
      setHireDate(staffToEdit.hireDate);
      setAvatar(staffToEdit.avatar);
    }
  }, [staffToEdit]);
  
  const hasChanges = useMemo(() => {
    if (!isEditing) {
        return name.trim() !== '' || role.trim() !== '' || department.trim() !== '';
    }
    return (
        name !== staffToEdit?.name ||
        role !== staffToEdit?.role ||
        department !== staffToEdit?.department ||
        status !== staffToEdit?.status ||
        hireDate !== staffToEdit?.hireDate ||
        avatar !== staffToEdit?.avatar
    );
  }, [name, role, department, status, hireDate, avatar, staffToEdit, isEditing]);


  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
              const base64Url = loadEvent.target?.result as string;
              setAvatar(base64Url);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: staffToEdit?.id,
      name,
      role,
      department,
      status,
      hireDate,
      avatar,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Funcionário' : 'Adicionar Novo Funcionário'}
          </h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        <main className="p-6 space-y-4">
           <div className="flex flex-col items-center space-y-2">
                {avatar ? (
                    <img src={avatar} alt="Foto do funcionário" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <DefaultAvatar className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                    </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
                <div className="flex space-x-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1 text-xs font-semibold bg-gray-200 dark:bg-gray-600/50 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
                        {avatar ? 'Alterar Foto' : 'Adicionar Foto'}
                    </button>
                    {avatar && (
                        <button type="button" onClick={() => setAvatar(null)} className="px-3 py-1 text-xs font-semibold bg-red-100 dark:bg-red-600/50 text-red-700 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-600">
                            Remover
                        </button>
                    )}
                </div>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
            <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" />
            </div>
            <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Função</label>
                <input type="text" id="role" value={role} onChange={e => setRole(e.target.value)} required placeholder="Ex: Secretária(o)" className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" />
            </div>
            <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departamento</label>
                <input type="text" id="department" value={department} onChange={e => setDepartment(e.target.value)} required placeholder="Ex: Administrativo" className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" />
            </div>
             <div>
                <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Admissão</label>
                <input type="date" id="hireDate" value={hireDate} onChange={e => setHireDate(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" />
            </div>
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select id="status" value={status} onChange={e => setStatus(e.target.value as StaffStatus)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                    <option value={StaffStatus.ACTIVE}>Ativo</option>
                    <option value={StaffStatus.INACTIVE}>Inativo</option>
                </select>
            </div>
          </div>
        </main>
        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white">Cancelar</button>
          <button 
            type="submit" 
            disabled={!hasChanges}
            className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isEditing ? 'Salvar Alterações' : 'Salvar Funcionário'}
          </button>
        </footer>
         <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: scale(0.98); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        `}</style>
      </form>
    </div>
  );
};

export default AddStaffModal;
