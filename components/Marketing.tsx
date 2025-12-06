

import React, { useState, useEffect } from 'react';
import { type Lead, type User, UserRole, type School } from '../types';
import { Button } from './ui/Button';
import { LeadDashboard } from './LeadDashboard';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { AlertIcon } from './icons/AlertIcon';

interface MarketingProps {
    user: User;
    schools: School[];
    onAddNewLead: (
        newLeadData: Omit<Lead, 'id' | 'status' | 'invitationSentAt' | 'linkViewedAt' | 'className' | 'paymentStatus' | 'studentPhotoUrl' | 'schoolId' | 'grades'>,
        schoolId: string
    ) => Promise<void>;
    leads: Lead[];
    onSendInvitation: (leadId: string, channels: { email: boolean; whatsapp: boolean }, updatedContactInfo: { email: string; phone: string }) => void;
    onLinkOpened: (leadId: string) => void;
    onEnrollmentCompleted: (leadId: string) => void;
}

const formatCPF = (v: string): string => {
  v = v.replace(/\D/g, "");
  v = v.substring(0, 11);
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return v;
};

const formatCEP = (v: string): string => {
  v = v.replace(/\D/g, "");
  v = v.substring(0, 8);
  v = v.replace(/(\d{5})(\d)/, "$1-$2");
  return v;
};


export const Marketing: React.FC<MarketingProps> = ({ user, schools, onAddNewLead, leads, onSendInvitation, onLinkOpened, onEnrollmentCompleted }) => {
    const [formData, setFormData] = useState({
        studentName: '',
        responsibleName: '',
        responsibleCPF: '',
        responsibleCEP: '',
        responsibleAddress: '',
        responsibleAddressNumber: '',
        responsibleAddressComplement: '',
        responsibleEmail: '',
        responsiblePhone: '',
    });
    const [selectedSchoolId, setSelectedSchoolId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [cpfStatus, setCpfStatus] = useState<{
        checking: boolean;
        message: string | null;
        status: 'success' | 'warning' | null;
    }>({ checking: false, message: null, status: null });
    
    useEffect(() => {
        if (user.role !== UserRole.SUPER_ADMINISTRADOR && user.schoolId) {
            setSelectedSchoolId(user.schoolId);
        } else if (schools.length > 0) {
            setSelectedSchoolId(schools[0].id);
        }
    }, [user, schools]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        const formatters: { [key: string]: (val: string) => string } = {
            responsibleCPF: formatCPF,
            responsibleCEP: formatCEP,
        };

        const formattedValue = formatters[name] ? formatters[name](value) : value;

        setFormData(prev => ({ ...prev, [name]: formattedValue }));
    };
    
    const handleCpfBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cpf = e.target.value.replace(/\D/g, '');
        if (cpf.length !== 11) {
            setCpfStatus({ checking: false, message: null, status: null });
            return;
        }

        setCpfStatus({ checking: true, message: 'Verificando CPF...', status: null });

        // Simula uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Lógica mockada: CPFs terminados em 9 têm restrição
        if (cpf.endsWith('9')) {
            setCpfStatus({
                checking: false,
                message: 'Restrição encontrada. Proceder com cautela.',
                status: 'warning',
            });
        } else {
            setCpfStatus({
                checking: false,
                message: 'CPF regularizado e sem restrições.',
                status: 'success',
            });
        }
    };

    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (!response.ok) throw new Error('Falha ao buscar CEP');
            const data = await response.json();

            if (data.erro) {
                setErrorMessage('CEP não encontrado. Por favor, preencha o endereço manualmente.');
                setTimeout(() => setErrorMessage(''), 5000);
                 setFormData(prev => ({ ...prev, responsibleAddress: '' }));
            } else {
                const addressParts = [
                    data.logradouro,
                    data.bairro,
                    data.localidade && data.uf ? `${data.localidade} - ${data.uf}` : data.localidade || data.uf
                ].filter(Boolean);
                const address = addressParts.join(', ');
                setFormData(prev => ({ ...prev, responsibleAddress: address }));
                setErrorMessage(''); // Clear any previous error
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            setErrorMessage('Ocorreu um erro ao buscar o CEP. Por favor, preencha o endereço manualmente.');
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccessMessage('');
        setErrorMessage('');

        if (!selectedSchoolId) {
            setErrorMessage('Por favor, selecione uma escola.');
            setIsSubmitting(false);
            return;
        }

        try {
            await onAddNewLead(formData, selectedSchoolId);
            setSuccessMessage('Lead cadastrado com sucesso! Ele já está disponível no funil abaixo.');
            setFormData({
                studentName: '',
                responsibleName: '',
                responsibleCPF: '',
                responsibleCEP: '',
                responsibleAddress: '',
                responsibleAddressNumber: '',
                responsibleAddressComplement: '',
                responsibleEmail: '',
                responsiblePhone: '',
            });
            setCpfStatus({ checking: false, message: null, status: null });
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (error) {
            console.error("Failed to add lead", error);
            setErrorMessage('Ocorreu um erro ao cadastrar o lead. Tente novamente.');
            setTimeout(() => setErrorMessage(''), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const inputClass = "mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed";
    const labelClass = "block text-sm font-medium text-gray-700";

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Marketing & Captação</h1>
                <p className="text-gray-600 mt-1">Cadastre novos leads e acompanhe-os no funil de matrículas.</p>
            </div>
            
            <div className="max-w-3xl bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md mb-12">
                 <h2 className="text-xl font-semibold text-gray-800 mb-6">Adicionar Novo Interessado</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {user.role === UserRole.SUPER_ADMINISTRADOR ? (
                        <div>
                            <label htmlFor="schoolId" className={labelClass}>Instituição</label>
                            <select id="schoolId" value={selectedSchoolId} onChange={(e) => setSelectedSchoolId(e.target.value)} className={inputClass} required>
                                <option value="" disabled>-- Selecione uma escola --</option>
                                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label className={labelClass}>Instituição</label>
                            <input type="text" value={schools.find(s => s.id === user.schoolId)?.name || ''} className={inputClass} disabled />
                        </div>
                    )}
                    <div>
                        <label htmlFor="studentName" className={labelClass}>Nome do Aluno(a)</label>
                        <input type="text" name="studentName" id="studentName" value={formData.studentName} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="responsibleName" className={labelClass}>Nome do Responsável</label>
                        <input type="text" name="responsibleName" id="responsibleName" value={formData.responsibleName} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="responsibleCPF" className={labelClass}>CPF do Responsável</label>
                        <input type="text" name="responsibleCPF" id="responsibleCPF" value={formData.responsibleCPF} onChange={handleChange} onBlur={handleCpfBlur} className={inputClass} required placeholder="000.000.000-00" />
                         <div className="mt-2 h-5">
                            {cpfStatus.checking && (
                                <div className="flex items-center text-sm text-gray-500">
                                    <SpinnerIcon className="w-4 h-4 mr-2" />
                                    <span>{cpfStatus.message}</span>
                                </div>
                            )}
                            {!cpfStatus.checking && cpfStatus.status === 'success' && (
                                <div className="flex items-center text-sm text-green-600">
                                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                                    <span>{cpfStatus.message}</span>
                                </div>
                            )}
                            {!cpfStatus.checking && cpfStatus.status === 'warning' && (
                                <div className="flex items-center text-sm text-yellow-600">
                                    <AlertIcon className="w-4 h-4 mr-2" />
                                    <span>{cpfStatus.message}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="responsibleCEP" className={labelClass}>CEP</label>
                        <input type="text" name="responsibleCEP" id="responsibleCEP" value={formData.responsibleCEP} onChange={handleChange} onBlur={handleCepBlur} className={inputClass} required placeholder="00000-000" maxLength={9} />
                    </div>
                     <div>
                        <label htmlFor="responsibleAddress" className={labelClass}>Endereço do Responsável</label>
                        <input type="text" name="responsibleAddress" id="responsibleAddress" value={formData.responsibleAddress} onChange={handleChange} className={inputClass} required placeholder="Preenchido automaticamente pelo CEP" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label htmlFor="responsibleAddressNumber" className={labelClass}>Número</label>
                            <input type="text" name="responsibleAddressNumber" id="responsibleAddressNumber" value={formData.responsibleAddressNumber} onChange={handleChange} className={inputClass} required placeholder="Ex: 123" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="responsibleAddressComplement" className={labelClass}>Complemento</label>
                            <input type="text" name="responsibleAddressComplement" id="responsibleAddressComplement" value={formData.responsibleAddressComplement} onChange={handleChange} className={inputClass} placeholder="Apto, Bloco, etc."/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="responsibleEmail" className={labelClass}>E-mail do Responsável</label>
                        <input type="email" name="responsibleEmail" id="responsibleEmail" value={formData.responsibleEmail} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="responsiblePhone" className={labelClass}>Telefone/WhatsApp do Responsável</label>
                        <input type="tel" name="responsiblePhone" id="responsiblePhone" value={formData.responsiblePhone} onChange={handleChange} className={inputClass} required placeholder="+55 11 98765-4321" />
                    </div>
                    
                    {successMessage && (
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md" role="alert">
                            <p>{successMessage}</p>
                        </div>
                    )}
                     {errorMessage && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                            <p>{errorMessage}</p>
                        </div>
                    )}
                    
                    <div className="pt-2 text-right">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Cadastrando...' : 'Cadastrar Lead'}
                        </Button>
                    </div>
                </form>
            </div>


            <hr className="my-12 border-gray-200" />
            
            <div>
                 <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Funil de Matrículas</h2>
                    <p className="text-gray-600 mt-1">Acompanhe os interessados no processo de matrícula.</p>
                </div>
                <LeadDashboard 
                    leads={leads} 
                    onSendInvitation={onSendInvitation}
                    onLinkOpened={onLinkOpened}
                    onEnrollmentCompleted={onEnrollmentCompleted}
                />
            </div>
        </div>
    );
};