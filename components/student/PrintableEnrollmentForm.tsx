import React from 'react';
import { EnrolledStudent, SchoolInfo } from '../../types';

interface PrintableEnrollmentFormProps {
  student: EnrolledStudent;
  schoolInfo: SchoolInfo;
}

const Field: React.FC<{ label: string; value?: string | number | null; colSpan?: number, minHeight?: string }> = ({ label, value, colSpan = 1, minHeight = '1.2em' }) => (
    <td colSpan={colSpan}>
        <div className="field-label">{label}</div>
        <div className="field-value" style={{ minHeight }}>{value || ''}</div>
    </td>
);

const PrintableEnrollmentForm: React.FC<PrintableEnrollmentFormProps> = ({ student, schoolInfo }) => {
    const guardian = student.guardians?.[0];

    return (
        <div className="printable-enrollment-form bg-white">
            <table className="no-border print-avoid-break"><tbody><tr>
                <td className="w-24 no-border align-middle">{schoolInfo.logo ? <img src={schoolInfo.logo} alt="Logo" className="w-24 h-24 object-contain"/> : <div className="w-24 h-24 bg-gray-200"></div>}</td>
                <td className="text-center no-border align-middle"><h1 className="text-lg font-bold uppercase">{schoolInfo.name}</h1><p className="text-xs">{schoolInfo.address}</p><p className="text-xs">CNPJ: {schoolInfo.cnpj} | Telefone: {schoolInfo.phone}</p></td>
                <td className="w-24 no-border align-middle"><div className="photo-box">Foto 3x4</div></td>
            </tr></tbody></table>

            <h2 className="text-center font-bold text-lg my-2 print-avoid-break">FICHA DE MATRÍCULA - {new Date().getFullYear()}</h2>
            
            <table className="print-avoid-break"><thead><tr className="section-title"><td colSpan={6}>DADOS DO ALUNO</td></tr></thead><tbody>
                <tr><Field label="Nome Completo" value={student.name} colSpan={6} /></tr>
                <tr>
                    <Field label="Data de Nascimento" value={student.dateOfBirth ? new Date(student.dateOfBirth + 'T00:00:00').toLocaleDateString('pt-BR') : ''} colSpan={2} />
                    <Field label="Cidade Natal" value={student.cityOfBirth} colSpan={2} />
                    <Field label="UF" value={student.stateOfBirth} />
                    <Field label="Matrícula" value={student.id} />
                </tr>
            </tbody></table>
            
            <table className="print-avoid-break"><thead><tr className="section-title"><td colSpan={4}>FILIAÇÃO</td></tr></thead><tbody>
                <tr><Field label="Nome da Mãe" value={student.motherName} colSpan={4} /></tr>
                <tr><Field label="Nome do Pai" value={student.fatherName} colSpan={4} /></tr>
            </tbody></table>
            
            <table className="print-avoid-break"><thead><tr className="section-title"><td colSpan={6}>ENDEREÇO</td></tr></thead><tbody>
                 <tr>
                    <Field label="Logradouro" value={student.address?.street} colSpan={5} />
                    <Field label="Nº" value={student.address?.number} colSpan={1} />
                </tr>
                <tr>
                    <Field label="Complemento" value={student.address?.complement} colSpan={2} />
                    <Field label="Bairro" value={student.address?.neighborhood} colSpan={2} />
                    <Field label="Cidade" value={student.address?.city} colSpan={2} />
                </tr>
                 <tr>
                    <Field label="UF" value={student.address?.state} colSpan={1} />
                    <Field label="CEP" value={student.address?.zip} colSpan={2} />
                    <Field label="Ponto de Referência" value="" colSpan={3} />
                </tr>
            </tbody></table>
            
            <table className="print-avoid-break"><thead><tr className="section-title"><td colSpan={4}>RESPONSÁVEL FINANCEIRO</td></tr></thead><tbody>
                <tr><Field label="Nome" value={guardian?.name} colSpan={4} /></tr>
                <tr>
                    <Field label="CPF" value={guardian?.cpf} colSpan={2} />
                    <Field label="RG" value={guardian?.rg} colSpan={2} />
                </tr>
                <tr>
                    <Field label="Telefone" value={guardian?.phone} colSpan={2} />
                    <Field label="E-mail" value={guardian?.email} colSpan={2} />
                </tr>
            </tbody></table>

            <table className="print-avoid-break"><thead><tr className="section-title"><td colSpan={2}>INFORMAÇÕES DE SAÚDE</td></tr></thead><tbody>
                <tr><Field label="Alergias / Restrições Alimentares" value={student.healthInfo?.allergies} colSpan={2} minHeight="2.5em" /></tr>
                <tr><Field label="Uso de medicação contínua (Qual?)" value={student.healthInfo?.medications} colSpan={2} minHeight="2.5em" /></tr>
                <tr><Field label="Contato de Emergência (Nome)" value={student.healthInfo?.emergencyContactName} /><Field label="Telefone" value={student.healthInfo?.emergencyContactPhone} /></tr>
            </tbody></table>

            <table className="print-avoid-break"><thead><tr className="section-title"><td colSpan={3}>PESSOAS AUTORIZADAS A RETIRAR O ALUNO</td></tr></thead><tbody>
                <tr><td className="font-bold w-2/4">Nome</td><td className="font-bold w-1/4">Parentesco</td><td className="font-bold w-1/4">Telefone</td></tr>
                <tr><td className="h-6">{guardian?.name}</td><td>Responsável</td><td>{guardian?.phone}</td></tr>
                <tr><td className="h-6"></td><td></td><td></td></tr>
                <tr><td className="h-6"></td><td></td><td></td></tr>
            </tbody></table>

            <div className="text-xs p-2 mt-4 text-justify print-avoid-break">
                <p>
                    Declaro, para os devidos fins, que as informações prestadas neste formulário são verdadeiras e completas. Autorizo a escola a tomar as medidas necessárias em caso de emergência médica, conforme as informações de saúde fornecidas. Comprometo-me a manter os dados cadastrais, especialmente telefones e endereços, sempre atualizados junto à secretaria escolar.
                </p>
            </div>
            
            <div className="text-center mt-8 print-avoid-break">
                <div className="mt-12 flex justify-around">
                    <div className="w-72 border-t border-black pt-1">
                        <p className="text-xs">{guardian?.name}</p>
                        <p className="text-xs font-bold">Assinatura do Responsável</p>
                    </div>
                    <div className="w-72 border-t border-black pt-1">
                         <p className="text-xs">{schoolInfo.secretaryName}</p>
                        <p className="text-xs font-bold">Secretaria Escolar</p>
                    </div>
                </div>
                <p className="text-xs mt-4">Data: _____ / _____ / ________</p>
            </div>

        </div>
    );
};

export default PrintableEnrollmentForm;