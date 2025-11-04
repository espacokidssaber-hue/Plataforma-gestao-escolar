import React, { useState, useEffect, useMemo } from 'react';
import { ManualEnrollmentData, Guardian, HealthInfo, DocumentDeliveryMethod, StudentAddress, DocumentStatus } from '../types';
import { BRAZILIAN_STATES } from '../data/brazilianLocations';

interface ManualEnrollmentModalProps {
  onClose: () => void;
  onSave: (data: ManualEnrollmentData) => void;
}

const ALL_DOCUMENTS = ['Foto', 'Registro de Nascimento', 'RG do Aluno', 'Cartão de Vacina', 'Cartão do SUS', 'CPF do Responsável', 'Comprovante de Residência', 'Declaração da Escola', 'Declaração de Adimplência'];

const ManualEnrollmentModal: React.FC<ManualEnrollmentModalProps> = ({ onClose, onSave }) => {
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

  const [student, setStudent] = useState({
      name: '',
      dateOfBirth: '',
      gender: 'Não informado',
      nationality: 'Brasileiro(a)',
      birthCity: '',
      birthState: '',
  });
  const [address, setAddress] = useState<Partial<StudentAddress>>({});
  const [guardian, setGuardian] = useState<Partial<Guardian>>({});
  const [healthInfo, setHealthInfo] = useState<HealthInfo>({ allergies: '', medications: '', emergencyContactName: '', emergencyContactPhone: '' });
  const [documents, setDocuments] = useState<Record<string, { deliveryMethod: DocumentDeliveryMethod; status: DocumentStatus }>>({});
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'Dinheiro' | 'Cartão'>('PIX');
  const [discountProgram, setDiscountProgram] = useState('Nenhum');
  const [enrollmentFee, setEnrollmentFee] = useState('');
  const [monthlyFee, setMonthlyFee] = useState('');
  const [grade, setGrade] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  const totalAnnualValue = useMemo(() => {
    const fee = Number(enrollmentFee) || 0;
    const monthly = Number(monthlyFee) || 0;
    return fee + (monthly * 11);
  }, [enrollmentFee, monthlyFee]);

  useEffect(() => {
    if (student.birthState) {
        const stateData = BRAZILIAN_STATES.find(s => s.sigla === student.birthState);
        setCities(stateData ? stateData.cidades : []);
    } else {
        setCities([]);
    }
  }, [student.birthState]);

  const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudent(prev => {
        const newState = { ...prev, [name]: value };
        if (name === 'birthState') {
            newState.birthCity = ''; // Reseta a cidade quando o estado muda
        }
        return newState;
    });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    if (name === 'zip') {
        value = value
            .replace(/\D/g, '') // Remove all non-digits
            .replace(/^(\d{5})(\d)/, '$1-$2') // Add hyphen after 5 digits
            .slice(0, 9); // Limit to 9 characters (XXXXX-XXX)
    }
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardianChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGuardian(prev => ({ ...prev, [name]: value }));
  };

  const handleHealthInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHealthInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleDocumentChange = (docName: string, field: 'deliveryMethod' | 'status', value: string) => {
    setDocuments(prev => {
        const currentDoc = prev[docName] || { deliveryMethod: 'Pendente', status: DocumentStatus.PENDING };
        return {
            ...prev,
            [docName]: {
                ...currentDoc,
                [field]: value
            }
        };
    });
  };
  
  const fetchCep = async () => {
      if (!address.zip || address.zip.length < 9) return;
      setIsFetchingCep(true);
      try {
          const response = await fetch(`https://viacep.com.br/ws/${address.zip.replace('-', '')}/json/`);
          if (!response.ok) throw new Error('CEP não encontrado');
          const data = await response.json();
          if (data.erro) throw new Error('CEP inválido');

          setAddress(prev => ({
              ...prev,
              street: data.logradouro,
              neighborhood: data.bairro,
              city: data.localidade,
              state: data.uf,
          }));
      } catch (error) {
          alert(error instanceof Error ? error.message : 'Erro ao buscar CEP.');
      } finally {
          setIsFetchingCep(false);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDocs = ALL_DOCUMENTS.map(docName => {
        const docInfo = documents[docName] || { deliveryMethod: 'Pendente', status: DocumentStatus.PENDING };
        return {
            name: docName,
            deliveryMethod: docInfo.deliveryMethod,
            status: docInfo.status
        };
    });

    const data: ManualEnrollmentData = {
        studentName: student.name,
        studentDateOfBirth: student.dateOfBirth,
        studentGender: student.gender,
        studentNationality: student.nationality,
        studentBirthCity: student.birthCity,
        studentBirthState: student.birthState,
        studentAddress: address as StudentAddress,
        guardian: guardian as Guardian,
        healthInfo: healthInfo,
        documents: formattedDocs,
        paymentConfirmed: paymentConfirmed,
        paymentMethod: paymentMethod,
        discountProgram: discountProgram,
        enrollmentFee: Number(enrollmentFee),
        monthlyFee: Number(monthlyFee),
        grade: grade,
    };
    onSave(data);
  };

  const isFormValid = student.name.trim() !== '' && student.dateOfBirth.trim() !== '' && grade.trim() !== '';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Adicionar Matrícula Manualmente</h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        
        <main className="flex-grow p-6 space-y-6 overflow-y-auto">
            {/* Student Data */}
            <section className="p-4 border border-gray-200 dark:border-gray-700/50 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Dados do Aluno</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-sm">Nome Completo *</label>
                        <input type="text" name="name" value={student.name} onChange={handleStudentChange} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                    </div>
                    <div>
                        <label className="text-sm">Data de Nasc. *</label>
                        <input type="date" name="dateOfBirth" value={student.dateOfBirth} onChange={handleStudentChange} required className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                    </div>
                    <div className="md:col-span-3">
                        <label className="text-sm">Série de Interesse *</label>
                        <input type="text" name="grade" value={grade} onChange={e => setGrade(e.target.value)} required placeholder="Ex: 1º Ano, Infantil III..." className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                    </div>
                    <div>
                        <label className="text-sm">Gênero</label>
                        <select name="gender" value={student.gender} onChange={handleStudentChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg"><option>Não informado</option><option>Masculino</option><option>Feminino</option></select>
                    </div>
                    <div>
                        <label className="text-sm">Nacionalidade</label>
                        <input type="text" name="nationality" value={student.nationality} onChange={handleStudentChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                    </div>
                     <div>
                        <label className="text-sm">Estado de Nasc.</label>
                        <select name="birthState" value={student.birthState} onChange={handleStudentChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg"><option value="">Selecione...</option>{BRAZILIAN_STATES.map(s => <option key={s.sigla} value={s.sigla}>{s.nome}</option>)}</select>
                    </div>
                    <div>
                        <label className="text-sm">Cidade de Nasc.</label>
                        <select name="birthCity" value={student.birthCity} onChange={handleStudentChange} disabled={cities.length === 0} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg"><option value="">Selecione...</option>{cities.map(c => <option key={c} value={c}>{c}</option>)}</select>
                    </div>
                 </div>
            </section>
            
             {/* Address Data */}
            <section className="p-4 border border-gray-200 dark:border-gray-700/50 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Endereço</h3>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <div className="md:col-span-1">
                        <label className="text-sm">CEP</label>
                        <div className="flex">
                            <input type="text" name="zip" value={address.zip || ''} onChange={handleAddressChange} onBlur={fetchCep} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-l-lg" />
                            <button type="button" onClick={fetchCep} disabled={isFetchingCep} className="p-2 bg-gray-200 dark:bg-gray-600 rounded-r-lg w-20 text-center">
                                {isFetchingCep ? (
                                    <svg className="animate-spin h-5 w-5 text-gray-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : 'Buscar'}
                            </button>
                        </div>
                    </div>
                     <div className="md:col-span-3">
                        <label className="text-sm">Logradouro</label>
                        <input type="text" name="street" value={address.street || ''} onChange={handleAddressChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                    </div>
                      <div>
                        <label className="text-sm">Número</label>
                        <input type="text" name="number" value={address.number || ''} onChange={handleAddressChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                    </div>
                    <div>
                        <label className="text-sm">Complemento</label>
                        <input type="text" name="complement" value={address.complement || ''} onChange={handleAddressChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm">Bairro</label>
                        <input type="text" name="neighborhood" value={address.neighborhood || ''} onChange={handleAddressChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                    </div>
                     <div>
                        <label className="text-sm">Cidade</label>
                        <input type="text" name="city" value={address.city || ''} onChange={handleAddressChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                    </div>
                    <div>
                        <label className="text-sm">Estado</label>
                        <input type="text" name="state" value={address.state || ''} onChange={handleAddressChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                    </div>
                 </div>
            </section>

             {/* Guardian Data */}
            <section className="p-4 border border-gray-200 dark:border-gray-700/50 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Dados do Responsável</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-sm">Nome Completo</label>
                        <input type="text" name="name" value={guardian.name || ''} onChange={handleGuardianChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                    </div>
                     <div>
                        <label className="text-sm">CPF</label>
                        <input type="text" name="cpf" value={guardian.cpf || ''} onChange={handleGuardianChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                    </div>
                     <div>
                        <label className="text-sm">RG</label>
                        <input type="text" name="rg" value={guardian.rg || ''} onChange={handleGuardianChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                    </div>
                    <div>
                        <label className="text-sm">Telefone</label>
                        <input type="tel" name="phone" value={guardian.phone || ''} onChange={handleGuardianChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                    </div>
                     <div>
                        <label className="text-sm">E-mail</label>
                        <input type="email" name="email" value={guardian.email || ''} onChange={handleGuardianChange} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                    </div>
                 </div>
            </section>
            
            {/* Financial Data */}
            <section className="p-4 border border-gray-200 dark:border-gray-700/50 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Dados Financeiros</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                     <div>
                        <label className="text-sm">Taxa de Matrícula (R$)</label>
                        <input type="number" step="0.01" value={enrollmentFee} onChange={e => setEnrollmentFee(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                    </div>
                    <div>
                        <label className="text-sm">Mensalidade (R$)</label>
                        <input type="number" step="0.01" value={monthlyFee} onChange={e => setMonthlyFee(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg" />
                    </div>
                     <div>
                        <label className="text-sm">Programa de Desconto</label>
                        <select value={discountProgram} onChange={e => setDiscountProgram(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg">
                            {DISCOUNT_PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-3 text-right">
                        <p className="text-sm">Valor total do contrato (anual): <span className="font-bold text-lg text-teal-600 dark:text-teal-300">R$ {totalAnnualValue.toFixed(2)}</span></p>
                    </div>
                     <div className="md:col-span-3">
                         <label className="flex items-center"><input type="checkbox" checked={paymentConfirmed} onChange={e => setPaymentConfirmed(e.target.checked)} className="h-4 w-4 rounded text-teal-500" /><span className="ml-2 text-sm">Pagamento da taxa de matrícula confirmado?</span></label>
                        {paymentConfirmed && (
                            <div className="mt-2 pl-6">
                                <label className="text-sm">Método de Pagamento</label>
                                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} className="w-full md:w-1/2 bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg"><option>PIX</option><option>Dinheiro</option><option>Cartão</option></select>
                            </div>
                        )}
                    </div>
                </div>
            </section>

             {/* Documents */}
            <section className="p-4 border border-gray-200 dark:border-gray-700/50 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Documentos</h3>
                <div className="grid grid-cols-1 gap-y-2">
                    {ALL_DOCUMENTS.map(docName => {
                        const docInfo = documents[docName] || { deliveryMethod: 'Pendente', status: DocumentStatus.PENDING };
                        return (
                            <div key={docName} className="grid grid-cols-3 gap-2 items-center">
                                <label className="text-sm col-span-1">{docName}</label>
                                <div className="col-span-2 flex space-x-2">
                                    <select value={docInfo.deliveryMethod} onChange={e => handleDocumentChange(docName, 'deliveryMethod', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-xs">
                                        <option>Pendente</option>
                                        <option>Digital</option>
                                        <option>Físico</option>
                                    </select>
                                    <select value={docInfo.status} onChange={e => handleDocumentChange(docName, 'status', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-xs">
                                        {Object.values(DocumentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </main>
        
        <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
          <button type="submit" disabled={!isFormValid} className="px-4 py-2 bg-teal-600 rounded-lg text-white font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-teal-500">Salvar Matrícula</button>
        </footer>
        
        <style>{`
            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in { animation: fade-in 0.2s ease-out; }
            label { display: block; margin-bottom: 0.25rem; }
        `}</style>
      </form>
    </div>
  );
};

export default ManualEnrollmentModal;