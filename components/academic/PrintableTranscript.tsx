import React from 'react';
import { StudentTranscriptData } from '../../types';

const SchoolLogo: React.FC<{ logoUrl?: string; className?: string }> = ({ logoUrl, className }) => (
    logoUrl ?
        <img src={logoUrl} alt="Logo da Escola" className={className} /> :
        <div className={className + " flex items-center justify-center bg-gray-200 text-gray-500"}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9-5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-9.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-9.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20M1 12l11 6 11-6M1 12v6a2 2 0 002 2h18a2 2 0 002-2v-6" /></svg>
        </div>
);

const PrintableTranscript: React.FC<StudentTranscriptData> = ({ student, schoolInfo, academicHistory, observations }) => {
    const city = (schoolInfo.address || '').split(',').slice(-2, -1)[0]?.trim() || 'Sua Cidade';
    const formattedDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const cepPart = (schoolInfo.address || '').split('CEP: ')[1];
    const cep = cepPart ? cepPart.split(' ')[0] : '';

    const disciplines = ['ARTES', 'CIÊNCIAS', 'GEOGRAFIA', 'HISTÓRIA', 'INGLÊS', 'MATEMÁTICA', 'PORTUGUÊS', 'SOCIOEMOCIONAL'];
    const gradeLevels1 = ['1º', '2º', '3º', '4º', '5º'];
    const gradeLevels2 = ['6º', '7º', '8º', '9º'];

    const GradesTable: React.FC<{ levels: string[]; title: string; }> = ({ levels, title }) => (
        <table className="mt-1 print-avoid-break">
            <thead>
                <tr className="section-title">
                    <td rowSpan={2} style={{ width: '20%' }}>DISCIPLINAS</td>
                    <td colSpan={levels.length * 2}>{title}</td>
                </tr>
                <tr className="section-title">
                    {levels.map(level => (
                        <React.Fragment key={level}>
                            <td style={{ fontSize: '7pt' }}>{level}º</td>
                            <td style={{ fontSize: '7pt' }}>CH</td>
                        </React.Fragment>
                    ))}
                </tr>
                <tr className="section-title">
                    <td>NÚCLEO COMUM</td>
                    <td colSpan={levels.length * 2}></td>
                </tr>
            </thead>
            <tbody>
                {disciplines.map(disc => (
                    <tr key={disc}>
                        <td className="text-left">{disc}</td>
                        {levels.map(level => {
                            const historyEntry = academicHistory.find(h => h.gradeLevel.startsWith(level));
                            const grade = historyEntry?.grades?.[disc];
                            const workload = historyEntry?.workload?.[disc];
                            return (
                                <React.Fragment key={level}>
                                    <td>{grade ? grade.toFixed(1) : '-'}</td>
                                    <td>{workload || '-'}</td>
                                </React.Fragment>
                            );
                        })}
                    </tr>
                ))}
                <tr><td className="text-right font-bold">Frequência(%)</td>{levels.map(level => {
                    const historyEntry = academicHistory.find(h => h.gradeLevel.startsWith(level));
                    return <React.Fragment key={level}><td colSpan={2} className="font-bold">{historyEntry?.attendance != null ? historyEntry.attendance.toFixed(2) : '-'}</td></React.Fragment>
                })}</tr>
                <tr><td className="text-right font-bold">Total de dias letivos</td>{levels.map(level => {
                    const historyEntry = academicHistory.find(h => h.gradeLevel.startsWith(level));
                    return <React.Fragment key={level}><td colSpan={2} className="font-bold">{historyEntry?.totalSchoolDays ?? '-'}</td></React.Fragment>
                })}</tr>
                <tr><td className="text-right font-bold">Carga Horária Anual</td>{levels.map(level => {
                    const historyEntry = academicHistory.find(h => h.gradeLevel.startsWith(level));
                    // FIX: Explicitly type the accumulator in the reduce function to prevent `sum` from being inferred as `unknown`.
                    const totalWorkload = historyEntry ? Object.values(historyEntry.workload).reduce((sum: number, val) => sum + Number(val || 0), 0) : null;
                    return <React.Fragment key={level}><td colSpan={2} className="font-bold">{totalWorkload || '-'}</td></React.Fragment>
                })}</tr>
                <tr><td className="text-right font-bold">Situação</td>{levels.map(level => {
                    const historyEntry = academicHistory.find(h => h.gradeLevel.startsWith(level));
                    return <React.Fragment key={level}><td colSpan={2} className="font-bold">{historyEntry?.status ?? '-'}</td></React.Fragment>
                })}</tr>
            </tbody>
        </table>
    );

    return (
        <div className="printable-transcript bg-white">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <SchoolLogo logoUrl={schoolInfo.logo} className="w-20 h-20 object-contain mr-4" />
                <div className="text-center flex-grow">
                    <h1 className="text-xl font-bold uppercase">{schoolInfo.name}</h1>
                    <p className="header-info">{schoolInfo.address}</p>
                    <p className="header-info">CNPJ: {schoolInfo.cnpj} | CEP: {cep} | Fone: {schoolInfo.phone} | E-mail: {schoolInfo.email}</p>
                </div>
            </div>

            <h2 className="text-center font-bold text-lg my-1" style={{letterSpacing: '2px'}}>HISTÓRICO ESCOLAR</h2>

            {/* Student Info */}
            <table className="print-avoid-break">
                <tbody>
                    <tr className="section-title"><td colSpan={4}>IDENTIFICAÇÃO DO ALUNO</td></tr>
                    <tr>
                        <td className="text-left p-1" colSpan={3}>Nome: <span className="font-bold">{student.name}</span></td>
                        <td className="text-left p-1">Matrícula: <span className="font-bold">{student.enrollmentId}</span></td>
                    </tr>
                     <tr>
                        <td className="text-left p-1">Data de Nascimento: <span className="font-bold">{new Date(student.dateOfBirth + 'T00:00:00').toLocaleDateString('pt-BR')}</span></td>
                        <td className="text-left p-1" colSpan={2}>Cidade Nascimento: <span className="font-bold">{student.cityOfBirth}</span></td>
                        <td className="text-left p-1">Estado Nascimento: <span className="font-bold">{student.stateOfBirth}</span></td>
                    </tr>
                    <tr className="section-title"><td colSpan={4}>FILIAÇÃO</td></tr>
                    <tr>
                        <td className="text-left p-1 h-8" colSpan={4}>Pai: <span className="font-bold">{student.fatherName}</span></td>
                    </tr>
                     <tr>
                        <td className="text-left p-1 h-8" colSpan={4}>Mãe: <span className="font-bold">{student.motherName}</span></td>
                    </tr>
                </tbody>
            </table>

            {/* Grades Tables */}
            <GradesTable levels={gradeLevels1} title="ENSINO FUNDAMENTAL - ANOS INICIAIS" />
            <div className="html2pdf__page-break"></div>
            <GradesTable levels={gradeLevels2} title="ENSINO FUNDAMENTAL - ANOS FINAIS" />
            
            {/* Previous Schools */}
            <table className="mt-1 print-avoid-break">
                 <thead>
                    <tr className="section-title">
                        <td colSpan={4}>ESTABELECIMENTOS DE ENSINO FREQUENTADOS PELO ALUNO</td>
                    </tr>
                    <tr>
                        <td className="font-bold">Ano</td>
                        <td className="font-bold">Estabelecimento</td>
                        <td className="font-bold">Localidade</td>
                        <td className="font-bold">Ano Letivo</td>
                    </tr>
                </thead>
                <tbody>
                    {academicHistory.map(entry => (
                         <tr key={entry.year}>
                            <td>{entry.gradeLevel}</td>
                            <td>{entry.schoolName}</td>
                            <td>{entry.schoolLocation}</td>
                            <td>{entry.year}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Observations */}
            <table className="mt-1 print-avoid-break">
                <tbody>
                    <tr className="section-title"><td colSpan={1}>Observações:</td></tr>
                    <tr><td className="min-h-[64px] text-left align-top">{observations}</td></tr>
                </tbody>
            </table>

            {/* Footer */}
            <p className="text-center my-2">{city}, {formattedDate}.</p>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '2rem' }}>
                <div className="text-center w-64">
                    <p className="border-t border-black pt-1">Assinatura do(a) Secretário(a)</p>
                </div>
                <div className="text-center w-64">
                    <p className="border-t border-black pt-1">Assinatura do(a) Diretor(a)</p>
                </div>
            </div>
        </div>
    );
};

export default PrintableTranscript;