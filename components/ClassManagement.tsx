import React, { useState } from 'react';
import { SchoolClass, SchoolUnit, EnrollmentSubView } from '../types';
import { useEnrollment } from '../contexts/EnrollmentContext';
import ClassAdminModal from './ClassAdminModal';

interface ClassManagementProps {
    setActiveSubView: (view: EnrollmentSubView) => void;
    setHighlightedClassId: (id: number) => void;
}

const getCapacityForClass = (schoolClass: SchoolClass): number => {
    if (!schoolClass || !schoolClass.capacity) return 0;
    const capacityKey = schoolClass.unit.toLowerCase() as keyof typeof schoolClass.capacity;
    return schoolClass.capacity[capacityKey] || 0;
};

const ClassCard: React.FC<{ schoolClass: SchoolClass, onEdit: () => void, enrolledCount: number, onClick: () => void }> = ({ schoolClass, onEdit, enrolledCount, onClick }) => {
    const totalCapacity = getCapacityForClass(schoolClass);
    const occupancy = totalCapacity > 0 ? (enrolledCount / totalCapacity) * 100 : 0;
    
    let occupancyColor = 'bg-green-500';
    if (occupancy > 80) occupancyColor = 'bg-yellow-500';
    if (occupancy >= 100) occupancyColor = 'bg-red-500';

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Impede que o clique no botão de edição acione o onClick do card
        onEdit();
    };

    return (
        <div 
            onClick={onClick}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700/50 flex flex-col cursor-pointer hover:shadow-md hover:border-teal-400 dark:hover:border-teal-600 transition-all duration-200"
        >
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{schoolClass.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{schoolClass.grade} - {schoolClass.period}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${schoolClass.unit === SchoolUnit.MATRIZ ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : schoolClass.unit === SchoolUnit.FILIAL ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'}`}>{schoolClass.unit}</span>
                </div>
                <button onClick={handleEditClick} className="text-gray-400 hover:text-gray-700 dark:hover:text-white z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                </button>
            </div>
            <div className="mt-4 flex-grow">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Ocupação</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{enrolledCount} / {totalCapacity}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <div className={`${occupancyColor} h-2 rounded-full`} style={{ width: `${occupancy > 100 ? 100 : occupancy}%` }}></div>
                </div>
            </div>
        </div>
    );
};


const GridIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM11 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
    </svg>
);

const ListIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);


const ClassManagement: React.FC<ClassManagementProps> = ({ setActiveSubView, setHighlightedClassId }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [classToEdit, setClassToEdit] = useState<SchoolClass | null>(null);

    const { classes, addSchoolClass, updateSchoolClass, enrolledStudents } = useEnrollment();

    const handleOpenModal = (schoolClass: SchoolClass | null = null) => {
        setClassToEdit(schoolClass);
        setIsModalOpen(true);
    };

    const handleSaveClass = (data: SchoolClass) => {
        if (data.id && classes.some(c => c.id === data.id)) {
            updateSchoolClass(data);
        } else {
            addSchoolClass(data as Omit<SchoolClass, 'id' | 'students'>);
        }
        setIsModalOpen(false);
    };

    const handleClassClick = (classId: number) => {
        setHighlightedClassId(classId);
        setActiveSubView(EnrollmentSubView.TRANSFERS);
    };

    const renderContent = () => {
        switch(viewMode) {
            case 'grid':
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {classes.map(c => {
                            const enrolledCount = enrolledStudents.filter(s => s.classId === c.id).length;
                            return <ClassCard key={c.id} schoolClass={c} onEdit={() => handleOpenModal(c)} enrolledCount={enrolledCount} onClick={() => handleClassClick(c.id)} />;
                        })}
                    </div>
                );
            case 'list':
                return (
                    <div className="bg-white dark:bg-gray-800/30 rounded-lg p-4">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                    <th className="p-2">Turma</th>
                                    <th className="p-2">Série</th>
                                    <th className="p-2">Período</th>
                                    <th className="p-2">Unidade</th>
                                    <th className="p-2">Ocupação</th>
                                    <th className="p-2 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classes.map(c => {
                                    const totalCapacity = getCapacityForClass(c);
                                    const enrolledCount = enrolledStudents.filter(s => s.classId === c.id).length;
                                    return (
                                    <tr key={c.id} onClick={() => handleClassClick(c.id)} className="border-b border-gray-200 dark:border-gray-700/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                        <td className="p-2 font-semibold text-gray-900 dark:text-white">{c.name}</td>
                                        <td className="p-2">{c.grade}</td>
                                        <td className="p-2">{c.period}</td>
                                        <td className="p-2">{c.unit}</td>
                                        <td className="p-2">{enrolledCount} / {totalCapacity}</td>
                                        <td className="p-2 text-right">
                                            <button onClick={(e) => { e.stopPropagation(); handleOpenModal(c); }} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-800/50 dark:text-blue-300 rounded-md">Editar</button>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                );
        }
    }

    return (
        <div className="mt-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerenciador de Turmas</h2>

                <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-1 p-1 bg-gray-200 dark:bg-gray-700/50 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}
                            aria-label="Visualização em Grade"
                        >
                            <GridIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}
                            aria-label="Visualização em Lista"
                        >
                            <ListIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 transition-colors flex items-center space-x-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        <span>Nova Turma</span>
                    </button>
                </div>
            </div>
            {renderContent()}
            {isModalOpen && <ClassAdminModal schoolClass={classToEdit} onClose={() => setIsModalOpen(false)} onSave={handleSaveClass} />}
        </div>
    );
};

export default ClassManagement;