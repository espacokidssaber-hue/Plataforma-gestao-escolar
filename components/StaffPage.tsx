

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { type Staff, User, UserRole, School, SchoolClass } from '../types';
import { AVAILABLE_ROLES } from '../constants';
import { Button } from './ui/Button';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { AlertIcon } from './icons/AlertIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { UserIcon } from './icons/UserIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { DocumentPlusIcon } from './icons/DocumentPlusIcon';
import { StaffDocumentsModal } from './StaffDocumentsModal';

interface StaffPageProps {
    user: User;
    schools: School[];
    staff: Staff[];
    classes: SchoolClass[];
    onAddNewStaff: (
        newStaffData: Omit<Staff, 'id' | 'photoUrl' | 'medicalCertificates' | 'schoolId'>,
        photoFile: File | null,
        medicalCertificateFiles: File[],
        schoolId?: string
    ) => Promise<void>;
    onUpdateStaffDocuments: (staffId: string, newCertificateFiles: File[]) => Promise<void>;
    superAdminSchoolFilter: string;
}

const initialFormData = {
    fullName: '',
    cpf: '',
    rg: '',
    birthDate: '',
    gender: 'Masculino' as 'Masculino' | 'Feminino' | 'Outro',
    email: '',
    phone: '',
    cep: '',
    address: '',
    addressNumber: '',
    addressComplement: '',
    role: AVAILABLE_ROLES[0],
    className: '',
    startDate: '',
    salary: '',
    bankName: '',
    bankAgency: '',
    bankAccount: '',
};

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

const formatPhone = (v: string): string => {
  v = v.replace(/\D/g, "");
  v = v.substring(0, 11);
  v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
  v = v.replace(/(\d)(\d{4})$/, "$1-$2");
  return v;
};

const formatCurrency = (value: string): string => {
  if (!value) return "";
  const digitsOnly = value.replace(/\D/g, "");
  if (digitsOnly === "") return "";
  const number = Number(digitsOnly) / 100;
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(number);
};

const parseCurrency = (value: string): number => {
  if (!value) return 0;
  const numberString = value.replace(/\./g, "").replace(",", ".");
  return parseFloat(numberString) || 0;
};


export const StaffPage: React.FC<StaffPageProps> = ({ user, schools, staff, classes, onAddNewStaff, onUpdateStaffDocuments, superAdminSchoolFilter }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [medicalCertificateFiles, setMedicalCertificateFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [cpfStatus, setCpfStatus] = useState<{
        checking: boolean;
        message: string | null;
        status: 'success' | 'warning' | null;
    }>({ checking: false, message: null, status: null });
    const [selectedStaffForDocs, setSelectedStaffForDocs] = useState<Staff | null>(null);

    const photoInputRef = useRef<HTMLInputElement>(null);
    const medicalCertsInputRef = useRef<HTMLInputElement>(null);
    
    const selectedSchoolId = useMemo(() => {
        return user.role === UserRole.SUPER_ADMINISTRADOR ? superAdminSchoolFilter : user.schoolId;
    }, [user.role, superAdminSchoolFilter, user.schoolId]);

    const availableClassesForSchool = useMemo(() => {
        if (!selectedSchoolId || selectedSchoolId === 'all') return [];
        return classes.filter(c => c.schoolId === selectedSchoolId);
    }, [classes, selectedSchoolId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        const formatters: { [key: string]: (val: string) => string } = {
            cpf: formatCPF,
            cep: formatCEP,
            phone: formatPhone,
            salary: formatCurrency,
        };

        const formattedValue = formatters[name] ? formatters[name](value) : value;
        
        setFormData(prev => ({ ...prev, [name]: formattedValue }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
      }
    };
    
    const handleMedicalCertificatesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setMedicalCertificateFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };
    
    const handleRemoveMedicalCertificate = (fileName: string) => {
        setMedicalCertificateFiles(prev => prev.filter(file => file.name !== fileName));
    };

    const handleCpfBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cpf = e.target.value.replace(/\D/g, '');
        if (cpf.length !== 11) {
            setCpfStatus({ checking: false, message: null, status: null });
            return;
        }
        setCpfStatus({ checking: true, message: 'Verificando CPF...', status: null });
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
        setCpfStatus({ checking: false, message: 'CPF válido.', status: 'success' });
    };

    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (!response.ok) throw new Error('Falha ao buscar CEP');
            const data = await response.json();

            if (data.erro) {
                setFormData(prev => ({ ...prev, address: '' }));
            } else {
                const addressParts = [
                    data.logradouro,
                    data.bairro,
                    data.localidade && data.uf ? `${data.localidade} - ${data.uf}` : data.localidade || data.uf
                ].filter(Boolean);
                const address = addressParts.join(', ');
                setFormData(prev => ({ ...prev, address }));
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccessMessage('');
        setErrorMessage('');
        
        const schoolIdToSubmit = user.role === UserRole.SUPER_ADMINISTRADOR ? superAdminSchoolFilter : user.schoolId;

        if (!schoolIdToSubmit || schoolIdToSubmit === 'all') {
            setErrorMessage('Por favor, selecione uma escola no filtro da barra lateral para continuar.');
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
                ...formData,
                salary: parseCurrency(formData.salary),
            };
            await onAddNewStaff(payload, photoFile, medicalCertificateFiles, schoolIdToSubmit);
            setSuccessMessage('Funcionário cadastrado com sucesso! Ele já está disponível na lista abaixo.');
            setFormData(initialFormData);
            setPhotoFile(null);
            setPhotoPreview(null);
            setMedicalCertificateFiles([]);
            setCpfStatus({ checking: false, message: null, status: null });
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (error) {
            console.error("Failed to add staff", error);
            setErrorMessage('Ocorreu um erro ao cadastrar o funcionário. Tente novamente.');
            setTimeout(() => setErrorMessage(''), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDocsModal = (staffMember: Staff) => {
        setSelectedStaffForDocs(staffMember);
    };

    const handleCloseDocsModal = () => {
        setSelectedStaffForDocs(null);
    };

    const inputClass = "mt-1 block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed";
    const labelClass = "block text-sm font-medium text-gray-700";

    const FormSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
        <div className="border-t border-gray-200 pt-4">
            <h3 className="text-base font-semibold leading-6 text-gray-900">{title}</h3>
            <div className="mt-3 grid grid-cols-1 gap-y-3 gap-x-4 sm:grid-cols-6">
                {children}
            </div>
        </div>
    );

    return (
        <>
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Gestão de Funcionários</h1>
                <p className="text-gray-600 mt-1">Cadastre novos funcionários e gerencie a equipe da escola.</p>
            </div>

            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md mb-12">
                <h2 className="text-lg font-semibold text-gray-800 mb-5">Cadastrar Novo Funcionário</h2>

                {user.role === UserRole.SUPER_ADMINISTRADOR && superAdminSchoolFilter === 'all' ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertIcon className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Para cadastrar um novo funcionário, por favor, selecione uma escola específica no filtro da barra lateral.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="sm:col-span-6">
                            <div>
                                <label className={labelClass}>Instituição</label>
                                <input
                                    type="text"
                                    value={
                                        user.role === UserRole.SUPER_ADMINISTRADOR
                                        ? schools.find(s => s.id === superAdminSchoolFilter)?.name || ''
                                        : schools.find(s => s.id === user.schoolId)?.name || ''
                                    }
                                    className={inputClass}
                                    disabled
                                />
                            </div>
                        </div>
                        <FormSection title="Dados Pessoais">
                             <div className="sm:col-span-6">
                                <label className={labelClass}>Foto do Funcionário</label>
                                <div className="mt-2 flex items-center gap-x-4">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" className="h-20 w-20 rounded-full object-cover" />
                                    ) : (
                                        <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
                                            <UserIcon className="h-12 w-12 text-gray-400" />
                                        </div>
                                    )}
                                    <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                    <Button type="button" variant="secondary" onClick={() => photoInputRef.current?.click()}>
                                        Selecionar Foto
                                    </Button>
                                </div>
                            </div>
                            <div className="sm:col-span-4">
                                <label htmlFor="fullName" className={labelClass}>Nome Completo</label>
                                <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="cpf" className={labelClass}>CPF</label>
                                <input type="text" name="cpf" id="cpf" value={formData.cpf} onChange={handleChange} onBlur={handleCpfBlur} className={inputClass} required placeholder="000.000.000-00" />
                                 <div className="mt-1 h-4 text-xs">
                                    {cpfStatus.checking && <div className="flex items-center text-gray-500"><SpinnerIcon className="w-3 h-3 mr-1" />{cpfStatus.message}</div>}
                                    {!cpfStatus.checking && cpfStatus.status && <div className={`flex items-center ${cpfStatus.status === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>{cpfStatus.status === 'success' ? <CheckCircleIcon className="w-3 h-3 mr-1"/> : <AlertIcon className="w-3 h-3 mr-1"/>}{cpfStatus.message}</div>}
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="rg" className={labelClass}>RG</label>
                                <input type="text" name="rg" id="rg" value={formData.rg} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="birthDate" className={labelClass}>Data de Nascimento</label>
                                <input type="date" name="birthDate" id="birthDate" value={formData.birthDate} onChange={handleChange} className={inputClass} required />
                            </div>
                             <div className="sm:col-span-2">
                                <label htmlFor="gender" className={labelClass}>Gênero</label>
                                <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                                    <option>Masculino</option>
                                    <option>Feminino</option>
                                    <option>Outro</option>
                                </select>
                            </div>
                        </FormSection>
                        
                        <FormSection title="Contato e Endereço">
                            <div className="sm:col-span-3">
                                <label htmlFor="email" className={labelClass}>E-mail</label>
                                <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="phone" className={labelClass}>Telefone / WhatsApp</label>
                                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className={inputClass} required placeholder="(00) 90000-0000" />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="cep" className={labelClass}>CEP</label>
                                <input type="text" name="cep" id="cep" value={formData.cep} onChange={handleChange} onBlur={handleCepBlur} className={inputClass} required placeholder="00000-000" />
                            </div>
                            <div className="sm:col-span-4">
                                <label htmlFor="address" className={labelClass}>Endereço</label>
                                <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className={inputClass} required placeholder="Preenchido pelo CEP" />
                            </div>
                             <div className="sm:col-span-2">
                                <label htmlFor="addressNumber" className={labelClass}>Número</label>
                                <input type="text" name="addressNumber" id="addressNumber" value={formData.addressNumber} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div className="sm:col-span-4">
                                <label htmlFor="addressComplement" className={labelClass}>Complemento</label>
                                <input type="text" name="addressComplement" id="addressComplement" value={formData.addressComplement} onChange={handleChange} className={inputClass} placeholder="Apto, Bloco, etc." />
                            </div>
                        </FormSection>

                         <FormSection title="Informações Profissionais e Bancárias">
                            <div className="sm:col-span-3">
                                <label htmlFor="role" className={labelClass}>Função</label>
                                <select id="role" name="role" value={formData.role} onChange={handleChange} className={inputClass}>
                                    {AVAILABLE_ROLES.map(role => <option key={role}>{role}</option>)}
                                </select>
                            </div>
                            {formData.role === 'Professor(a)' && (
                                <div className="sm:col-span-3">
                                    <label htmlFor="className" className={labelClass}>Turma Associada</label>
                                    <select
                                        id="className"
                                        name="className"
                                        value={formData.className}
                                        onChange={handleChange}
                                        className={inputClass}
                                    >
                                        <option value="">Nenhuma</option>
                                        {availableClassesForSchool.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                            )}
                             <div className="sm:col-span-3">
                                <label htmlFor="startDate" className={labelClass}>Data de Início</label>
                                <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="salary" className={labelClass}>Salário (R$)</label>
                                <input type="text" name="salary" id="salary" value={formData.salary} onChange={handleChange} className={inputClass} required placeholder="0,00" />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="bankName" className={labelClass}>Nome do Banco</label>
                                <input type="text" name="bankName" id="bankName" value={formData.bankName} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="bankAgency" className={labelClass}>Agência</label>
                                <input type="text" name="bankAgency" id="bankAgency" value={formData.bankAgency} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="bankAccount" className={labelClass}>Conta Corrente</label>
                                <input type="text" name="bankAccount" id="bankAccount" value={formData.bankAccount} onChange={handleChange} className={inputClass} required />
                            </div>
                        </FormSection>

                        <FormSection title="Documentos">
                             <div className="sm:col-span-6">
                                <label className={labelClass}>Atestados Médicos</label>
                                 <div className="mt-2 flex items-center gap-x-4">
                                    <input ref={medicalCertsInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleMedicalCertificatesChange} className="hidden" multiple />
                                    <Button type="button" variant="secondary" onClick={() => medicalCertsInputRef.current?.click()}>
                                        Anexar Atestados
                                    </Button>
                                </div>
                                 {medicalCertificateFiles.length > 0 && (
                                    <div className="mt-4 border-t pt-4">
                                        <ul className="divide-y divide-gray-200 rounded-md border">
                                            {medicalCertificateFiles.map((file, index) => (
                                                <li key={index} className="flex items-center justify-between py-2 pl-3 pr-4 text-sm">
                                                    <div className="flex w-0 flex-1 items-center">
                                                        <DocumentTextIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                                        <span className="ml-2 w-0 flex-1 truncate">{file.name}</span>
                                                    </div>
                                                    <div className="ml-4 flex-shrink-0">
                                                        <button type="button" onClick={() => handleRemoveMedicalCertificate(file.name)} className="font-medium text-red-600 hover:text-red-500">
                                                            Remover
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </FormSection>
                        
                        {successMessage && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded-md text-sm">{successMessage}</div>}
                        {errorMessage && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm">{errorMessage}</div>}
                        
                        <div className="pt-2 text-right">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Cadastrando...' : 'Cadastrar Funcionário'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>

            <hr className="my-12 border-gray-200" />

            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Equipe da Escola</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {staff.length > 0 ? staff.map(member => (
                        <div key={member.id} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-teal-500">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-14 w-14">
                                    {member.photoUrl ? (
                                        <img className="h-14 w-14 rounded-full object-cover" src={member.photoUrl} alt={member.fullName} />
                                    ) : (
                                        <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center">
                                            <UserIcon className="h-8 w-8 text-gray-500" />
                                        </div>
                                    )}
                                </div>
                                <div className="ml-4">
                                    <p className="text-base font-bold text-gray-900">{member.fullName}</p>
                                    <p className="text-sm text-gray-600">{member.role}</p>
                                    {member.className && <p className="text-xs text-teal-700 font-semibold">{member.className}</p>}
                                </div>
                            </div>
                            <div className="mt-4 border-t pt-3 flex justify-end">
                                <Button variant="secondary" onClick={() => handleOpenDocsModal(member)}>
                                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                                    Atestados ({member.medicalCertificates?.length || 0})
                                </Button>
                            </div>
                        </div>
                    )) : (
                        <div className="md:col-span-2 lg:col-span-3 text-center py-12 px-6">
                            <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum Funcionário Cadastrado</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Use o formulário acima para adicionar o primeiro funcionário.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {selectedStaffForDocs && (
            <StaffDocumentsModal 
                isOpen={!!selectedStaffForDocs}
                onClose={handleCloseDocsModal}
                staff={selectedStaffForDocs}
                onUpdateDocuments={onUpdateStaffDocuments}
            />
        )}
        </>
    );
};