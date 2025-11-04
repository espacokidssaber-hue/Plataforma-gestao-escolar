import React, { useState, useMemo } from 'react';
import { ManualEnrollmentData, DocumentStatus, DocumentDeliveryMethod, Guardian } from '../types';
import { BRAZILIAN_STATES } from '../data/brazilianLocations';
import { useEnrollment } from '../contexts/EnrollmentContext';

interface ManualEnrollmentModalProps {
    onClose: () => void;
    onSave: (data: ManualEnrollmentData) => void;
}

const initialFormData: ManualEnrollmentData = {
    studentName: '', studentDateOfBirth: '', studentGender: 'Não informado', studentNationality: 'Brasileira', studentBirthCity: '', studentBirthState: '',
    studentAddress: { street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zip: '' },
    guardian: { name: '', cpf: '', rg: '', phone: '', email: '' },
    healthInfo: { allergies: '', medications: '', emergencyContactName: '', emergencyContactPhone: '' },
    documents: [
        { name: 'Certidão de Nascimento', deliveryMethod: 'Pendente', status: DocumentStatus.PENDING },
        { name: 'RG do Aluno', deliveryMethod: 'Pendente', status: DocumentStatus.PENDING },
        { name: 'Cartão de Vacina', deliveryMethod: 'Pendente', status: DocumentStatus.PENDING },
        { name: 'Comprovante de Residência', deliveryMethod: 'Pendente', status: DocumentStatus.PENDING },
        { name: 'RG/CPF do Responsável', deliveryMethod: 'Pendente', status: DocumentStatus.PENDING },
    ],
    paymentConfirmed: false,
    discountProgram: 'Nenhum',
    enrollmentFee: 0,
    monthlyFee: 0,
    grade: '',
};

// --- Helper Functions for Input Masking ---
const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, '') // Remove all non-digits
    .replace(/(\d{3})(\d)/, '$1.$2') // Add dot after 3rd digit
    .replace(/(\d{3})(\d)/, '$1.$2') // Add dot after 6th digit
    .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Add hyphen after 9th digit
    .slice(0, 14); // Max length 14
};

const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4,5})(\d{4})/, '$1-$2')
    .slice(0, 15);
};
// --- End Helper Functions ---


const LabeledInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input {...props} className="w-full p-2 bg-white dark:bg-gray-700/80 rounded border border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500" />
    </div>
);

const LabeledSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, ...props }) => (
    <div>
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <select {...props} className="w-full p-2 bg-white dark:bg-gray-700/80 rounded border border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500">
            {children}
        </select>
    </div>
);


const ManualEnrollmentModal: React.FC<ManualEnrollmentModalProps> = ({ onClose, onSave }) => {
    const { classes, crmOptions } = useEnrollment();
    const [formData, setFormData] = useState<ManualEnrollmentData>(initialFormData);
    const [isFetchingCep, setIsFetchingCep] = useState(false);
    
    const availableGrades = useMemo(() => {
        const gradeSet = new Set<string>();
        classes.forEach(c => gradeSet.add(c.grade));
        return Array.from(gradeSet).sort();
    }, [classes]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGuardianChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;
        if (name === 'cpf') {
            formattedValue = formatCPF(value);
        } else if (name === 'phone') {
            formattedValue = formatPhone(value);
        }
        setFormData(prev => ({ ...prev, guardian: { ...prev.guardian, [name]: formattedValue } }));
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;
        if (name === 'zip') {
             formattedValue = value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9);
        }
        setFormData(prev => ({
            ...prev,
            studentAddress: { ...prev.studentAddress, [name]: formattedValue }
        }));
    };
    
    const fetchCep = async (cep: string) => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) return;

        setIsFetchingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    studentAddress: {
                        ...prev.studentAddress,
                        street: data.logradouro,
                        neighborhood: data.bairro,
                        city: data.localidade,
                        state: data.uf,
                    }
                }));
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        } finally {
            setIsFetchingCep(false);
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const annualValue = useMemo(() => {
        const enrollment = Number(formData.enrollmentFee) || 0;
        const monthly = Number(formData.monthlyFee) || 0;
        return enrollment + (monthly * 11);
    }, [formData.enrollmentFee, formData.monthlyFee]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Adicionar Matrícula Manualmente</h2>
                </header>
                <main className="flex-grow p-6 space-y-6 overflow-y-auto">
                    {/* Student Info */}
                    <section className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/30">
                        <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Dados do Aluno</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                           <div className="md:col-span-3"><LabeledInput label="Nome Completo do Aluno *" name="studentName" value={formData.studentName} onChange={handleChange} required /></div>
                           <LabeledInput label="Data de Nascimento *" name="studentDateOfBirth" type="date" value={formData.studentDateOfBirth} onChange={handleChange} required />
                           <LabeledSelect label="Gênero" name="studentGender" value={formData.studentGender} onChange={handleChange}><option>Não informado</option><option>Masculino</option><option>Feminino</option></LabeledSelect>
                           <LabeledInput label="Nacionalidade" name="studentNationality" value={formData.studentNationality} onChange={handleChange} />
                           <LabeledInput label="Cidade Natal" name="studentBirthCity" value={formData.studentBirthCity} onChange={handleChange} />
                           <LabeledSelect label="UF Natal" name="studentBirthState" value={formData.studentBirthState} onChange={handleChange}><option value="">Selecione...</option>{BRAZILIAN_STATES.map(s => <option key={s.sigla} value={s.sigla}>{s.sigla}</option>)}</LabeledSelect>
                        </div>
                    </section>

                     {/* Address Info */}
                    <section className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/30">
                        <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Endereço do Aluno</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div className="relative md:col-span-1">
                               <LabeledInput label="CEP" name="zip" value={formData.studentAddress.zip} onChange={handleAddressChange} onBlur={(e) => fetchCep(e.target.value)} maxLength={9} />
                               {isFetchingCep && <div className="absolute right-2 top-8 animate-spin rounded-full h-5 w-5 border-b-2 border-teal-500"></div>}
                            </div>
                           <div className="md:col-span-3"><LabeledInput label="Logradouro" name="street" value={formData.studentAddress.street} onChange={handleAddressChange} /></div>
                           <LabeledInput label="Número" name="number" value={formData.studentAddress.number} onChange={handleAddressChange} />
                           <LabeledInput label="Complemento" name="complement" value={formData.studentAddress.complement || ''} onChange={handleAddressChange} />
                           <div className="md:col-span-2"><LabeledInput label="Bairro" name="neighborhood" value={formData.studentAddress.neighborhood} onChange={handleAddressChange} /></div>
                           <LabeledInput label="Cidade" name="city" value={formData.studentAddress.city} onChange={handleAddressChange} />
                           <LabeledSelect label="Estado" name="state" value={formData.studentAddress.state} onChange={handleAddressChange}><option value="">Selecione...</option>{BRAZILIAN_STATES.map(s => <option key={s.sigla} value={s.sigla}>{s.sigla}</option>)}</LabeledSelect>
                        </div>
                    </section>

                    {/* Guardian Info */}
                    <section className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/30">
                        <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Dados do Responsável Financeiro</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                           <div className="md:col-span-2"><LabeledInput label="Nome Completo *" name="name" value={formData.guardian.name} onChange={handleGuardianChange} required /></div>
                           <LabeledInput label="CPF *" name="cpf" value={formData.guardian.cpf} onChange={handleGuardianChange} maxLength={14} required />
                           <LabeledInput label="Telefone *" name="phone" value={formData.guardian.phone} onChange={handleGuardianChange} maxLength={15} required />
                           <div className="md:col-span-2"><LabeledInput label="E-mail *" name="email" type="email" value={formData.guardian.email} onChange={handleGuardianChange} required /></div>
                        </div>
                    </section>

                     {/* Financial Info */}
                    <section className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/30">
                        <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Dados da Matrícula e Financeiro</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <LabeledSelect label="Série de Interesse *" name="grade" value={formData.grade} onChange={handleChange} required>
                                <option value="">Selecione a série...</option>
                                {availableGrades.map(gradeName => (
                                    <option key={gradeName} value={gradeName}>{gradeName}</option>
                                ))}
                            </LabeledSelect>
                            <LabeledSelect label="Programa de Desconto" name="discountProgram" value={formData.discountProgram} onChange={handleChange}>
                                {crmOptions.discountPrograms.map(program => (
                                    <option key={program} value={program}>{program}</option>
                                ))}
                            </LabeledSelect>
                            <LabeledInput label="Taxa de Matrícula (R$) *" name="enrollmentFee" type="number" step="0.01" value={formData.enrollmentFee} onChange={handleChange} required />
                            <LabeledInput label="Valor da Mensalidade (R$) *" name="monthlyFee" type="number" step="0.01" value={formData.monthlyFee} onChange={handleChange} required />
                            <LabeledInput label="Número de Parcelas" name="installments" value="1 + 11 parcelas" readOnly disabled className="bg-gray-200 dark:bg-gray-800 cursor-not-allowed"/>
                            <LabeledInput label="Valor Total Anual (R$)" name="annualValue" value={annualValue.toFixed(2)} readOnly disabled className="bg-gray-200 dark:bg-gray-800 cursor-not-allowed font-bold" />
                        </div>
                        <div className="mt-4">
                             <label className="flex items-center"><input type="checkbox" name="paymentConfirmed" checked={formData.paymentConfirmed} onChange={e => setFormData(p => ({...p, paymentConfirmed: e.target.checked}))} className="h-4 w-4 rounded text-teal-500 focus:ring-teal-500 border-gray-300 dark:border-gray-600" /><span className="ml-2 text-sm">Pagamento da taxa de matrícula já foi efetuado.</span></label>
                        </div>
                    </section>
                </main>
                <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500">
                        Cancelar
                    </button>
                    <button type="submit" className="px-6 py-2 bg-teal-600 rounded-lg text-white font-semibold hover:bg-teal-500">
                        Salvar e Adicionar à Fila
                    </button>
                </footer>
            </form>
        </div>
    );
};

export default ManualEnrollmentModal;
