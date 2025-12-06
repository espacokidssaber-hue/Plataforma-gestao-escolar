import React, { useState, useMemo } from 'react';
import { type Staff, type PontoRecord } from '../types';
import { Button } from './ui/Button';
import { PontoUploadModal } from './PontoUploadModal';
import { DocumentPlusIcon } from './icons/DocumentPlusIcon';
import { EyeIcon } from './icons/EyeIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ClockIcon } from './icons/ClockIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';

interface PontoManagementProps {
    staff: Staff[];
    pontoRecords: PontoRecord[];
    onUpload: (staffId: string, year: number, month: number, file: File) => Promise<void>;
    onDelete: (recordId: string) => Promise<void>;
}

const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export const PontoManagement: React.FC<PontoManagementProps> = ({ staff, pontoRecords, onUpload, onDelete }) => {
    const [selectedStaffId, setSelectedStaffId] = useState<string | null>(staff.length > 0 ? staff[0].id : null);
    const [currentYear] = useState(new Date().getFullYear());
    const [uploadInfo, setUploadInfo] = useState<{ month: number, monthName: string } | null>(null);

    const selectedStaff = useMemo(() => staff.find(s => s.id === selectedStaffId), [staff, selectedStaffId]);

    const recordsByMonth = useMemo(() => {
        if (!selectedStaffId) return {};
        const staffRecords = pontoRecords.filter(r => r.staffId === selectedStaffId && r.year === currentYear);
        const recordMap: { [month: number]: PontoRecord } = {};
        staffRecords.forEach(record => {
            recordMap[record.month] = record;
        });
        return recordMap;
    }, [pontoRecords, selectedStaffId, currentYear]);

    const handleDelete = async (recordId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este registro de ponto? O arquivo será removido permanentemente.')) {
            await onDelete(recordId);
        }
    };

    if (staff.length === 0) {
         return (
            <div className="text-center py-12 px-6">
                <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum Funcionário Cadastrado</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Cadastre funcionários na aba 'Funcionários' para poder gerenciar os pontos.
                </p>
            </div>
        );
    }
    
    return (
        <div>
            <div className="mb-6">
                <label htmlFor="staff-selector" className="block text-sm font-medium text-gray-700">Selecione o Funcionário</label>
                <select
                    id="staff-selector"
                    value={selectedStaffId || ''}
                    onChange={e => setSelectedStaffId(e.target.value)}
                    className="mt-1 block w-full max-w-md pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm"
                >
                    {staff.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.role})</option>)}
                </select>
            </div>

            {selectedStaffId && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Registros de Ponto de <span className="text-teal-700">{currentYear}</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {monthNames.map((monthName, index) => {
                            const month = index + 1;
                            const record = recordsByMonth[month];
                            const isFutureMonth = new Date(currentYear, month, 1) > new Date();

                            let status: 'archived' | 'pending' | 'future' = 'pending';
                            if (record) status = 'archived';
                            if (isFutureMonth) status = 'future';
                            
                            const statusInfo = {
                                archived: { text: 'Arquivado', icon: CheckCircleIcon, color: 'text-green-600', bgColor: 'bg-green-50' },
                                pending: { text: 'Pendente', icon: ClockIcon, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
                                future: { text: 'Futuro', icon: ClockIcon, color: 'text-gray-400', bgColor: 'bg-gray-50' }
                            };
                            
                            const currentStatus = statusInfo[status];
                            const StatusIcon = currentStatus.icon;

                            return (
                                <div key={month} className={`p-4 rounded-lg shadow border ${currentStatus.bgColor}`}>
                                    <p className="font-bold text-gray-900">{monthName}</p>
                                    <div className={`flex items-center text-sm mt-2 ${currentStatus.color}`}>
                                        <StatusIcon className="w-4 h-4 mr-1.5" />
                                        <span>{currentStatus.text}</span>
                                    </div>
                                    <div className="mt-4 border-t pt-3 flex items-center justify-end space-x-2">
                                        {record ? (
                                            <>
                                                <a href={record.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"><EyeIcon className="w-5 h-5"/></a>
                                                <button onClick={() => handleDelete(record.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"><TrashIcon className="w-5 h-5"/></button>
                                            </>
                                        ) : (
                                             <Button 
                                                onClick={() => setUploadInfo({ month, monthName })} 
                                                variant="secondary"
                                                disabled={isFutureMonth}
                                                className="!text-xs !py-1 !px-2"
                                            >
                                                <DocumentPlusIcon className="w-4 h-4 mr-1" />
                                                Anexar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            
            {uploadInfo && selectedStaff && (
                <PontoUploadModal 
                    isOpen={!!uploadInfo}
                    onClose={() => setUploadInfo(null)}
                    onUpload={onUpload}
                    staffMember={selectedStaff}
                    year={currentYear}
                    month={uploadInfo.month}
                    monthName={uploadInfo.monthName}
                />
            )}
        </div>
    );
};