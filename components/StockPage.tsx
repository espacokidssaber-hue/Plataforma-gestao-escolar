import React, { useState, useMemo, useEffect } from 'react';
import { type User, type StockItem, type StockMovement, type Lead, type School, UserRole } from '../types';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { CubeIcon } from './icons/CubeIcon';
import { ArrowLeftOnRectangleIcon } from './icons/ArrowLeftOnRectangleIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';

interface StockPageProps {
    user: User;
    schools: School[];
    items: StockItem[];
    movements: StockMovement[];
    students: Lead[];
    onSaveItem: (itemData: Omit<StockItem, 'id' | 'schoolYear'>, itemId?: string) => Promise<void>;
    onDeleteItem: (itemId: string) => Promise<void>;
    onRegisterMovement: (movementData: Omit<StockMovement, 'id' | 'date' | 'userId' | 'userName' | 'schoolYear'>) => Promise<void>;
    superAdminSchoolFilter: string;
    selectedYear: number;
}

const StockItemModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any, id?: string) => Promise<void>;
    item: StockItem | null;
    user: User;
    schools: School[];
    superAdminSchoolFilter: string;
}> = ({ isOpen, onClose, onSave, item, user, schools, superAdminSchoolFilter }) => {
    const initialForm = {
        name: '',
        category: 'Papelaria',
        unit: 'un',
        quantityInitial: '',
        minThreshold: '10'
    };
    const [formData, setFormData] = useState(initialForm);
    const [selectedSchoolId, setSelectedSchoolId] = useState('');

    useEffect(() => {
        if (isOpen) {
            const schoolId = user.role === UserRole.SUPER_ADMINISTRADOR 
                ? (superAdminSchoolFilter !== 'all' ? superAdminSchoolFilter : (schools[0]?.id || ''))
                : user.schoolId || '';
            
            if (item) {
                setFormData({
                    name: item.name,
                    category: item.category,
                    unit: item.unit,
                    quantityInitial: item.quantityInitial.toString(),
                    minThreshold: item.minThreshold.toString()
                });
                setSelectedSchoolId(item.schoolId);
            } else {
                setFormData(initialForm);
                setSelectedSchoolId(schoolId);
            }
        }
    }, [isOpen, item, user, schools, superAdminSchoolFilter]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: any = {
            ...formData,
            quantityInitial: parseInt(formData.quantityInitial) || 0,
            quantityCurrent: item ? item.quantityCurrent : parseInt(formData.quantityInitial) || 0, // Current starts as Initial for new items
            minThreshold: parseInt(formData.minThreshold) || 0,
            schoolId: selectedSchoolId
        };
        await onSave(payload, item?.id);
        onClose();
    };

    const inputClass = "mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Editar Item' : 'Novo Item de Estoque'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {user.role === UserRole.SUPER_ADMINISTRADOR && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Escola</label>
                        <select value={selectedSchoolId} onChange={e => setSelectedSchoolId(e.target.value)} className={inputClass} disabled={!!item || superAdminSchoolFilter !== 'all'}>
                            <option value="">Selecione...</option>
                            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nome do Material</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} required placeholder="Ex: Resma de Papel A4" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Categoria</label>
                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className={inputClass}>
                            <option>Papelaria</option>
                            <option>Artes</option>
                            <option>Higiene</option>
                            <option>Limpeza</option>
                            <option>Outros</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Unidade</label>
                        <input type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className={inputClass} placeholder="un, cx, pct" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Qtd. Inicial (Coletada)</label>
                        <input type="number" value={formData.quantityInitial} onChange={e => setFormData({...formData, quantityInitial: e.target.value})} className={inputClass} required min="0" />
                        {item && <p className="text-xs text-gray-500 mt-1">Alterar isso não muda o estoque atual.</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Estoque Mínimo (Alerta)</label>
                        <input type="number" value={formData.minThreshold} onChange={e => setFormData({...formData, minThreshold: e.target.value})} className={inputClass} required min="0" />
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                </div>
            </form>
        </Modal>
    );
};

const MovementModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onRegister: (data: any) => Promise<void>;
    item: StockItem | null;
}> = ({ isOpen, onClose, onRegister, item }) => {
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [type, setType] = useState<'exit' | 'entry'>('exit');

    if (!item) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) return;
        
        await onRegister({
            itemId: item.id,
            schoolId: item.schoolId,
            type,
            quantity: qty,
            reason
        });
        setQuantity('');
        setReason('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Registrar Movimentação: ${item.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4 mb-4">
                    <button type="button" onClick={() => setType('exit')} className={`flex-1 py-2 rounded-md font-medium text-sm ${type === 'exit' ? 'bg-red-100 text-red-700 ring-2 ring-red-500' : 'bg-gray-100 text-gray-600'}`}>
                        Saída (Consumo)
                    </button>
                    <button type="button" onClick={() => setType('entry')} className={`flex-1 py-2 rounded-md font-medium text-sm ${type === 'entry' ? 'bg-green-100 text-green-700 ring-2 ring-green-500' : 'bg-gray-100 text-gray-600'}`}>
                        Entrada (Reposição)
                    </button>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Quantidade ({item.unit})</label>
                    <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm" required min="1" />
                    <p className="text-xs text-gray-500 mt-1">Estoque atual: {item.quantityCurrent} {item.unit}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Motivo / Destino</label>
                    <input type="text" value={reason} onChange={e => setReason(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm" placeholder={type === 'exit' ? "Ex: Aula de Artes Turma A" : "Ex: Compra Extra"} required />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Confirmar</Button>
                </div>
            </form>
        </Modal>
    );
};

export const StockPage: React.FC<StockPageProps> = ({ user, schools, items, movements, students, onSaveItem, onDeleteItem, onRegisterMovement, superAdminSchoolFilter, selectedYear }) => {
    const [activeTab, setActiveTab] = useState<'inventory' | 'forecast'>('inventory');
    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [movementModalOpen, setMovementModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StockItem | null>(null);
    const [selectedItemForMovement, setSelectedItemForMovement] = useState<StockItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = useMemo(() => {
        let list = items;
        if (user.role === UserRole.SUPER_ADMINISTRADOR && superAdminSchoolFilter !== 'all') {
            list = list.filter(i => i.schoolId === superAdminSchoolFilter);
        } else if (user.schoolId) {
            list = list.filter(i => i.schoolId === user.schoolId);
        }
        
        if (searchTerm) {
            list = list.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.category.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return list;
    }, [items, user, superAdminSchoolFilter, searchTerm]);

    const activeStudentsCount = useMemo(() => {
        // Filter students for the selected school/year context
        let list = students;
        if (user.role === UserRole.SUPER_ADMINISTRADOR && superAdminSchoolFilter !== 'all') {
            list = list.filter(s => s.schoolId === superAdminSchoolFilter);
        } else if (user.schoolId) {
            list = list.filter(s => s.schoolId === user.schoolId);
        }
        // Assuming students for the year are filtered in parent App component
        return list.length || 1; // Prevent division by zero
    }, [students, user, superAdminSchoolFilter]);

    const handleEdit = (item: StockItem) => {
        setEditingItem(item);
        setItemModalOpen(true);
    };

    const handleMovement = (item: StockItem) => {
        setSelectedItemForMovement(item);
        setMovementModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Tem certeza? O histórico de movimentações também será perdido.")) {
            await onDeleteItem(id);
        }
    };

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Estoque de Materiais</h1>
                    <p className="text-gray-600 mt-1">Gerencie o material coletivo e planeje o próximo ano letivo.</p>
                </div>
                <Button onClick={() => { setEditingItem(null); setItemModalOpen(true); }}>
                    <PlusIcon className="w-5 h-5 mr-2" /> Novo Material
                </Button>
            </div>

            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`${activeTab === 'inventory' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <CubeIcon className="w-5 h-5 mr-2" />
                        Visão Geral e Consumo
                    </button>
                    <button
                        onClick={() => setActiveTab('forecast')}
                        className={`${activeTab === 'forecast' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <ChartBarIcon className="w-5 h-5 mr-2" />
                        Previsibilidade {selectedYear + 1}
                    </button>
                </nav>
            </div>

            {activeTab === 'inventory' && (
                <>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Buscar material..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map(item => {
                            const percentage = Math.min(100, Math.max(0, (item.quantityCurrent / item.quantityInitial) * 100)) || 0;
                            const isLow = item.quantityCurrent <= item.minThreshold;

                            return (
                                <div key={item.id} className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col">
                                    <div className="p-4 flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                                                    {item.category}
                                                </span>
                                            </div>
                                            <div className="flex space-x-1">
                                                <button onClick={() => handleEdit(item)} className="p-1 text-gray-400 hover:text-teal-600"><PencilIcon className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-400 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-500">Estoque Atual:</span>
                                                <span className={`font-bold ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {item.quantityCurrent} / {item.quantityInitial} {item.unit}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div 
                                                    className={`h-2.5 rounded-full ${isLow ? 'bg-red-500' : 'bg-teal-500'}`} 
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            {isLow && <p className="text-xs text-red-500 mt-1 font-medium">Estoque Baixo!</p>}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-3 border-t border-gray-200">
                                        <Button variant="secondary" className="w-full justify-center !text-sm" onClick={() => handleMovement(item)}>
                                            <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-2" />
                                            Registrar Movimentação
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredItems.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                Nenhum material encontrado. Cadastre os itens solicitados na lista de material.
                            </div>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'forecast' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Análise de Consumo e Previsão {selectedYear + 1}</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Baseado no consumo deste ano e no total de {activeStudentsCount} alunos ativos.
                        </p>
                    </div>
                    <div className="border-t border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Consumido</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Média / Aluno</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-teal-50 text-teal-700">Sugestão Lista {selectedYear + 1}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredItems.map(item => {
                                    // Determine total consumed based on Movements (Type: Exit)
                                    // Or simpler: Initial - Current (assuming no re-stock entries for simplicity, or complex math)
                                    // Let's use Initial - Current + Entries to be precise, but for MVP: Initial - Current is net consumption
                                    const consumption = Math.max(0, item.quantityInitial - item.quantityCurrent); 
                                    const avgPerStudent = consumption / activeStudentsCount;
                                    const suggested = Math.ceil(avgPerStudent * 1.1); // +10% margin

                                    return (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{consumption} {item.unit}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{avgPerStudent.toFixed(2)} {item.unit}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-teal-700 bg-teal-50">
                                                {suggested === 0 ? 'Revisar' : `${suggested} ${item.unit}`}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <StockItemModal 
                isOpen={itemModalOpen} 
                onClose={() => setItemModalOpen(false)} 
                onSave={onSaveItem} 
                item={editingItem}
                user={user}
                schools={schools}
                superAdminSchoolFilter={superAdminSchoolFilter}
            />

            <MovementModal
                isOpen={movementModalOpen}
                onClose={() => setMovementModalOpen(false)}
                onRegister={onRegisterMovement}
                item={selectedItemForMovement}
            />
        </div>
    );
};