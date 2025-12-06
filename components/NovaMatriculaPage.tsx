
import React, { useState, useRef } from 'react';
import { type Lead, DiscountConfig, User, UserRole, School, SchoolClass } from '../types';
import { Button } from './ui/Button';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { AlertIcon } from './icons/AlertIcon';
import { UserIcon } from './icons/UserIcon';
import { PaperClipIcon } from './icons/PaperClipIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface NovaMatriculaPageProps {
  user: User;
  schools: School[];
  onDirectEnrollment: (
    newLeadData: Omit<Lead, 'id' | 'status' | 'invitationSentAt' | 'linkViewedAt' | 'className' | 'paymentStatus' | 'studentPhotoUrl' | 'schoolId' | 'documents' | 'grades'>,
    photoFile: File | null,
    documentFiles: File[],
    schoolId?: string,
  ) => Promise<void>;
  superAdminSchoolFilter: string;
}

const initialFormData = {
    studentName: '',
    responsibleName: '',
    responsibleCPF: '',
    responsibleCEP: '',
    responsibleAddress: '',
    responsibleAddressNumber: '',
    responsibleAddressComplement: '',
    responsibleEmail: '',
    responsiblePhone: '',
    foodRestrictions: '',
    medicationInfo: '',
    pickupTime: '',
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


export const NovaMatriculaPage: React.FC<NovaMatriculaPageProps> = ({ user, schools, onDirectEnrollment, superAdminSchoolFilter }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [authorizedPickups, setAuthorizedPickups] = useState<{ name: string; kinship: string; }[]>([]);
  const [studentPhotoFile, setStudentPhotoFile] = useState<File | null>(null);
  const [studentPhotoPreview, setStudentPhotoPreview] = useState<string | null>(null);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [cpfStatus, setCpfStatus] = useState<{
      checking: boolean;
      message: string | null;
      status: 'success' | 'warning' | null;
  }>({ checking: false, message: null, status: null });
  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentsInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    const formatters: { [key: string]: (val: string) => string } = {
        responsibleCPF: formatCPF,
        responsibleCEP: formatCEP,
    };

    const formattedValue = formatters[name] ? formatters[name](value) : value;

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleAuthorizedPickupChange = (index: number, field: 'name' | 'kinship', value: string) => {
    const updated = [...authorizedPickups];
    updated[index][field] = value;
    setAuthorizedPickups(updated);
  };

  const handleAddAuthorizedPickup = () => {
    setAuthorizedPickups([...authorizedPickups, { name: '', kinship: '' }]);
  };

  const handleRemoveAuthorizedPickup = (index: number) => {
    setAuthorizedPickups(authorizedPickups.filter((_, i) => i !== index));
  };
  
   const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setStudentPhotoFile(file);
        setStudentPhotoPreview(URL.createObjectURL(file));
      }
    };
    
   const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setDocumentFiles(prev => [...prev, ...Array.from(e.target.files!)]);
      }
    };
    
   const handleRemoveDocument = (fileName: string) => {
        setDocumentFiles(prev => prev.filter(file => file.name !== fileName));
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
              setErrorMessage('');
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

    const targetSchoolId = user.role === UserRole.SUPER_ADMINISTRADOR ? superAdminSchoolFilter : user.schoolId;

    if (!targetSchoolId || targetSchoolId === 'all') {
        setErrorMessage('Por favor, selecione uma escola no filtro da barra lateral para continuar.');
        setIsSubmitting(false);
        return;
    }

    const payload = { ...formData, authorizedPickups };

    try {
        await onDirectEnrollment(payload, studentPhotoFile, documentFiles, targetSchoolId);
        setSuccessMessage('Aluno matriculado com sucesso! Ele já está disponível na página de Gestão de Matrículas, aguardando alocação.');
        setFormData(initialFormData);
        setAuthorizedPickups([]);
        setStudentPhotoFile(null);
        setStudentPhotoPreview(null);
        setDocumentFiles([]);
        setCpfStatus({ checking: false, message: null, status: null });
        setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
        console.error("Failed to enroll student", error);
        setErrorMessage('Ocorreu um erro ao matricular o aluno. Tente novamente.');
        setTimeout(() => setErrorMessage(''), 5000);
    } finally {
        setIsSubmitting(false);
    }
  };

  const inputClass = "mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Nova Matrícula</h1>
          <p className="text-gray-600 mt-1">Preencha o formulário para matricular um novo aluno diretamente no sistema.</p>
        </div>

        <div className="max-w-3xl bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Formulário de Matrícula Direta</h2>
            
            {user.role === UserRole.SUPER_ADMINISTRADOR && superAdminSchoolFilter === 'all' ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertIcon className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                Para realizar uma nova matrícula, por favor, selecione uma escola específica no filtro da barra lateral.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
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

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Dados do Aluno e Responsável</h3>
                     <div>
                          <label className={labelClass}>Foto 3x4 do Aluno</label>
                          <div className="mt-2 flex items-center gap-x-4">
                              {studentPhotoPreview ? (
                                  <img src={studentPhotoPreview} alt="Preview" className="h-24 w-24 rounded-full object-cover" />
                              ) : (
                                  <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
                                      <UserIcon className="h-12 w-12 text-gray-400" />
                                  </div>
                              )}
                              <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                              <Button type="button" variant="secondary" onClick={() => photoInputRef.current?.click()}>
                                  Selecionar Foto
                              </Button>
                          </div>
                      </div>
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
                  </div>

                   <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações Adicionais (Matrícula)</h3>
                       <div className="space-y-4">
                          <div>
                              <label htmlFor="foodRestrictions" className={labelClass}>Restrições Alimentares</label>
                              <textarea name="foodRestrictions" id="foodRestrictions" value={formData.foodRestrictions} onChange={handleChange} className={inputClass} rows={3} placeholder="Alergias, intolerâncias, etc." />
                          </div>
                          <div>
                              <label htmlFor="medicationInfo" className={labelClass}>Informações sobre Medicamentos</label>
                              <textarea name="medicationInfo" id="medicationInfo" value={formData.medicationInfo} onChange={handleChange} className={inputClass} rows={3} placeholder="Uso de medicamentos contínuos, antitérmicos autorizados, etc." />
                          </div>
                           <div>
                              <label htmlFor="pickupTime" className={labelClass}>Horário de Retirada Padrão</label>
                              <input type="time" name="pickupTime" id="pickupTime" value={formData.pickupTime} onChange={handleChange} className={inputClass} />
                          </div>
                          <div>
                              <h4 className={labelClass}>Pessoas Autorizadas a Retirar</h4>
                              <div className="space-y-3 mt-2">
                                  {authorizedPickups.map((person, index) => (
                                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                                          <input
                                              type="text"
                                              placeholder="Nome Completo"
                                              value={person.name}
                                              onChange={(e) => handleAuthorizedPickupChange(index, 'name', e.target.value)}
                                              className="block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                              required
                                          />
                                          <input
                                              type="text"
                                              placeholder="Parentesco"
                                              value={person.kinship}
                                              onChange={(e) => handleAuthorizedPickupChange(index, 'kinship', e.target.value)}
                                              className="block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                              required
                                          />
                                          <Button type="button" variant="secondary" onClick={() => handleRemoveAuthorizedPickup(index)} className="!p-2">
                                              <TrashIcon className="w-4 h-4 text-red-500"/>
                                          </Button>
                                      </div>
                                  ))}
                              </div>
                              <Button type="button" variant="secondary" onClick={handleAddAuthorizedPickup} className="mt-2">
                                 <PlusIcon className="w-4 h-4 mr-2"/> Adicionar Pessoa Autorizada
                              </Button>
                          </div>
                      </div>
                  </div>


                  {/* Document Upload Section */}
                  <div>
                      <label className={labelClass}>Documentos do Aluno</label>
                      <p className="text-xs text-gray-500 mb-2">Anexe RG, CPF, comprovante de residência, etc.</p>
                      <div className="mt-2 flex items-center gap-x-4">
                          <input ref={documentsInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocumentChange} className="hidden" multiple />
                          <Button type="button" variant="secondary" onClick={() => documentsInputRef.current?.click()}>
                              Anexar Documentos
                          </Button>
                      </div>
                       {documentFiles.length > 0 && (
                          <div className="mt-4 border-t pt-4">
                              <ul className="divide-y divide-gray-200 rounded-md border">
                                  {documentFiles.map((file, index) => (
                                      <li key={index} className="flex items-center justify-between py-2 pl-3 pr-4 text-sm">
                                          <div className="flex w-0 flex-1 items-center">
                                              <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                              <span className="ml-2 w-0 flex-1 truncate">{file.name}</span>
                                          </div>
                                          <div className="ml-4 flex-shrink-0">
                                              <button type="button" onClick={() => handleRemoveDocument(file.name)} className="font-medium text-red-600 hover:text-red-500">
                                                  Remover
                                              </button>
                                          </div>
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      )}
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
                          {isSubmitting ? 'Matriculando...' : 'Efetivar Matrícula'}
                      </Button>
                  </div>
              </form>
            )}
        </div>
      </div>
    </>
  );
};
