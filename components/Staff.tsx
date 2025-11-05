import React, { useState } from 'react';
import { Staff, StaffStatus } from '../types';
import AddStaffModal from './staff/AddStaffModal';
import { useEnrollment } from '../contexts/EnrollmentContext';

// --- AVATAR UTILS START ---
const getInitials = (name: string): string => { if (!name) return '?'; const words = name.trim().split(' ').filter(Boolean); if (words.length > 1) { return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase(); } if (words.length === 1 && words[0].length > 1) { return words[0].substring(0, 2).toUpperCase(); } if (words.length === 1) { return words[0][0].toUpperCase(); } return '?'; };
const stringToColor = (str: string): string => { let hash = 0; if (!str) return '#cccccc'; for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); hash = hash & hash; } let color = '#'; for (let i = 0; i < 3; i++) { const value = (hash >> (i * 8)) & 0xFF; const adjustedValue = 100 + (value % 156); color += ('00' + adjustedValue.toString(16)).substr(-2); } return color; };
const generateAvatar = (name: string): string => { const initials = getInitials(name); const color = stringToColor(name); const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150" fill="${color}"><rect width="100%" height="100%" fill="currentColor" /><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60" fill="#ffffff">${initials}</text></svg>`; return `data:image/svg+xml;base64,${btoa(svg)}`; };
// --- AVATAR UTILS END ---

const StatusBadge: React.FC<{ status: StaffStatus }> = ({ status }) => {
    const isActive = status === StaffStatus.ACTIVE;
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isActive ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'}`}>
            {status}
        </span>
    );
};

// The type of data passed on save from the modal
type SaveStaffData = Omit<Staff, 'id' | 'avatar'> & { id?: number; avatar: string | null; };

const StaffComponent: React.FC = () => {
    const { staff, addStaff, updateStaff } = useEnrollment();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [staffToEdit, setStaffToEdit] = useState<Staff | null>(null);

    const handleOpenModal = (staffMember: Staff | null = null) => {
        setStaffToEdit(staffMember);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setStaffToEdit(null);
    };

    const handleSaveStaff = (data: SaveStaffData) => {
        if (data.id) { // Update existing
            const updatedStaff: Staff = {
                id: data.id,
                name: data.name,
                role: data.role,
                department: data.department,
                status: data.status,
                hireDate: data.hireDate,
                avatar: data.avatar || generateAvatar(data.name),
            };
            updateStaff(updatedStaff);
        } else { // Add new
            const newStaff: Omit<Staff, 'id'> = {
                name: data.name,
                role: data.role,
                department: data.department,
                status: data.status,
                hireDate: data.hireDate,
                avatar: data.avatar || generateAvatar(data.name),
            };
            addStaff(newStaff);
        }
        handleCloseModal();
    };

    return (
        <>
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Funcionários</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie os funcionários da administração e serviços gerais.</p>
            </header>
            <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quadro de Funcionários</h2>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 transition-colors flex items-center space-x-2"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        <span>Novo Funcionário</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                <th className="p-3">Nome</th>
                                <th className="p-3">Função</th>
                                <th className="p-3">Departamento</th>
                                <th className="p-3">Admissão</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map(staffMember => (
                                <tr key={staffMember.id} className="border-b border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                    <td className="p-3">
                                        <div className="flex items-center space-x-3">
                                            <img src={staffMember.avatar} alt={staffMember.name} className="w-10 h-10 rounded-full" />
                                            <span className="font-semibold text-gray-800 dark:text-white">{staffMember.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-gray-600 dark:text-gray-300">{staffMember.role}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-300 text-sm">{staffMember.department}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-300">{new Date(staffMember.hireDate).toLocaleDateString('pt-BR')}</td>
                                    <td className="p-3"><StatusBadge status={staffMember.status} /></td>
                                    <td className="p-3 text-right">
                                        <button
                                            onClick={() => handleOpenModal(staffMember)}
                                            className="px-3 py-1 bg-blue-100 dark:bg-blue-600/50 text-blue-700 dark:text-blue-200 text-sm font-semibold rounded-md hover:bg-blue-200 dark:hover:bg-blue-600 hover:text-blue-800 dark:hover:text-white transition-colors"
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {staff.length === 0 && (
                         <p className="text-center text-gray-500 dark:text-gray-400 py-10">Nenhum funcionário cadastrado.</p>
                     )}
                </div>
            </div>
            {isModalOpen && (
                <AddStaffModal
                    staffToEdit={staffToEdit}
                    onClose={handleCloseModal}
                    onSave={handleSaveStaff}
                />
            )}
        </>
    );
};

export default StaffComponent;
