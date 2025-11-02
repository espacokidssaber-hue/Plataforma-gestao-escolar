import React from 'react';
import { EnrolledStudent, SchoolInfo, StudentAcademicRecord, Subject as SubjectType } from '../../types';

interface PrintableFullRecordProps {
  student: EnrolledStudent;
  academicRecord: StudentAcademicRecord;
  subjects: SubjectType[];
  observations: string;
  schoolInfo: SchoolInfo;
}

const Field: React.FC<{ label: string; value?: string | number; colSpan?: number }> = ({ label, value, colSpan = 1 }) => (
    <td colSpan={colSpan}>
        <div className="field-label">{label}</div>
        <div className="field-value">{value || '-'}</div>
    </td>
);

const PrintableFullRecord: React.FC<PrintableFullRecordProps> = ({ student, academicRecord, subjects, observations, schoolInfo }) => {
    
    const calculateFinalGrade = (subjectName: string): string => {
        const subjectConfig = subjects.find(s => s.name === subjectName);
        const grades = academicRecord.grades[subjectName];
        if (!grades || Object.keys(grades).length === 0) return '-';

        const gradeValues = Object.values(grades).filter(g => typeof g === 'number') as number[];
        if (gradeValues.length === 0) return 'N/L';

        if (subjectConfig?.calculationMethod === 'weighted' && subjectConfig.assessments.length > 0) {
            let totalWeightedGrade = 0;
            let totalWeight = 0;
            subjectConfig.assessments.forEach(ass => {
                if (grades[ass.name] !== null && typeof grades[ass.name] === 'number') {
                    totalWeightedGrade += (grades[ass.name] as number) * ass.weight;
                    totalWeight += ass.weight;
                }
            });
            return totalWeight > 0 ? (totalWeightedGrade / totalWeight).toFixed(1) : 'N/C';
        } else { // Arithmetic
            const sum = gradeValues.reduce((acc, grade) => acc + grade, 0);
            return (sum / gradeValues.length).toFixed(1);
        }
    };
    
    const subjectsWithGrades = subjects.filter(s => academicRecord.grades[s.name] && Object.keys(academicRecord.grades[s.name]).length > 0);

    return (
        <div id="printable-full-record" className="printable-registration-form bg-white">
            <table className="no-border print-avoid-break"><tbody><tr>
                <td className="w-24 no-border align-middle">{schoolInfo.logo ? <img src={schoolInfo.logo} alt="Logo" className="w-24 h-24 object-contain"/> : <div className="w-24 h-24 bg-gray-200"></div>}</td>
                <td className="text-center no-border align-middle"><h1 className="text-lg font-bold uppercase">{schoolInfo.name}</h1><p className="text-xs">{schoolInfo.address}</p><p className="text-xs">CNPJ: {schoolInfo.cnpj} | Telefone: {schoolInfo.phone}</p></td>
                <td className="w-24 no-border align-middle"><div className="photo-box">Foto 3x4</div></td>
            </tr></tbody></table>

            <h2 className="text-center font-bold text-lg my-2 print-avoid-break">FICHA INDIVIDUAL DO ALUNO - {new Date().getFullYear()}</h2>
            
            <table className="print-avoid-break"><thead><tr className="section-title"><td colSpan={4}>DADOS DO ALUNO</td></tr></thead><tbody>
                <tr><Field label="Nome Completo" value={student.name} colSpan={4} /></tr>
                <tr><Field label="Data de Nascimento" value={student.dateOfBirth ? new Date(student.dateOfBirth + 'T00:00:00').toLocaleDateString('pt-BR') : ''} colSpan={2} /><Field label="Matrícula" value={student.id} colSpan={2} /></tr>
            </tbody></table>

            {student.guardians?.map((guardian, index) => (
                <table key={index} className="print-avoid-break"><thead><tr className="section-title"><td colSpan={4}>DADOS DO RESPONSÁVEL {index + 1}</td></tr></thead><tbody>
                    <tr><Field label="Nome" value={guardian.name} colSpan={4} /></tr>
                    <tr><Field label="CPF" value={guardian.cpf} colSpan={2} /><Field label="Telefone" value={guardian.phone} colSpan={2} /></tr>
                </tbody></table>
            ))}
            
            <div className="mt-2">
                <h3 className="section-title text-center font-bold text-lg p-1 border border-black">DESEMPENHO ACADÊMICO</h3>
                 <div className="grid grid-cols-2 gap-x-4">
                    {subjectsWithGrades.map(subject => (
                        <table key={subject.id} className="mt-1 print-avoid-break"><thead>
                            <tr className="section-title"><td colSpan={2}>{subject.name.toUpperCase()}</td></tr>
                            <tr><td className="font-bold w-3/4">Avaliação</td><td className="font-bold text-center">Nota</td></tr>
                        </thead><tbody>
                            {Object.entries(academicRecord.grades[subject.name] || {}).map(([assName, grade]) => (
                                <tr key={assName}><td>{assName}</td><td className="text-center">{typeof grade === 'number' ? grade.toFixed(1) : '-'}</td></tr>
                            ))}
                            <tr className="bg-gray-100"><td className="font-bold text-right pr-2">MÉDIA FINAL</td><td className="font-bold text-center">{calculateFinalGrade(subject.name)}</td></tr>
                        </tbody></table>
                    ))}
                </div>
            </div>

            <table className="print-avoid-break"><thead><tr className="section-title"><td>OBSERVAÇÕES PEDAGÓGICAS</td></tr></thead><tbody>
                <tr><td><p className="text-xs p-2 whitespace-pre-wrap min-h-[100px]">{observations || 'Nenhuma observação inserida.'}</p></td></tr>
            </tbody></table>

            <div className="text-center mt-8 print-avoid-break">
                <p>{(schoolInfo.address || '').split(',').slice(-2, -1)[0]?.trim()}, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>
                <div className="mt-12 flex justify-around">
                    <div className="w-64 border-t border-black pt-1"><p>{schoolInfo.secretaryName}</p><p className="text-xs">Secretaria</p></div>
                    <div className="w-64 border-t border-black pt-1"><p>{schoolInfo.directorName}</p><p className="text-xs">Diretoria</p></div>
                </div>
            </div>
        </div>
    );
};

export default PrintableFullRecord;
