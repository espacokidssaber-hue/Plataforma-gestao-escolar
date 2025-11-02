import React, { useLayoutEffect } from 'react';
import { StudentAcademicRecord, Subject as SubjectType, SchoolInfo } from '../../types';

interface PrintableAnnualReportProps {
  student: StudentAcademicRecord;
  subjects: SubjectType[];
  schoolInfo: SchoolInfo;
  observation?: string;
  onRendered: () => void;
  isPreview?: boolean;
}

const PrintableAnnualReport: React.FC<PrintableAnnualReportProps> = ({ student, subjects, schoolInfo, observation, onRendered, isPreview }) => {
    
    useLayoutEffect(() => {
        if (!isPreview) {
            const animationFrameId = requestAnimationFrame(() => {
                onRendered();
            });
            return () => cancelAnimationFrame(animationFrameId);
        }
    }, [onRendered, isPreview]);
    
    const calculateFinalGrade = (subjectName: string): string => {
        const subjectConfig = subjects.find(s => s.name === subjectName);
        const grades = student.grades[subjectName];
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
        } else {
            const sum = gradeValues.reduce((acc, grade) => acc + grade, 0);
            return (sum / gradeValues.length).toFixed(1);
        }
    };

    const subjectsWithGrades = subjects.filter(s => student.grades[s.name] && Object.keys(student.grades[s.name]).length > 0);
    // FIX: Explicitly type the 'ass' parameter in the map function to 'string' to resolve a type inference issue.
    const allAssessments = [...new Set(subjectsWithGrades.flatMap(s => Object.keys(student.grades[s.name] || {}).map((ass: string) => ass)))];


    return (
        <div id="printable-annual-report" className="printable-annual-report print-landscape bg-white text-black font-sans">
            <header className="text-center mb-6 border-b border-gray-300 pb-4">
                <h1 className="text-2xl font-bold">{schoolInfo.name}</h1>
                <p className="text-xs">{schoolInfo.address}</p>
                <h2 className="text-lg font-semibold mt-4">Boletim de Desempenho Anual - {new Date().getFullYear()}</h2>
            </header>
            
            <section className="mb-4">
                <p><strong>Aluno(a):</strong> {student.studentName}</p>
                {/* Add more student info if needed */}
            </section>

            <table className="w-full border-collapse">
                <thead>
                    <tr className="font-bold">
                        <th className="w-1/4">Disciplina</th>
                        {allAssessments.map(ass => <th key={ass}>{ass}</th>)}
                        <th>Média Final</th>
                    </tr>
                </thead>
                <tbody>
                    {subjectsWithGrades.map(subject => {
                        const subjectGrades = student.grades[subject.name] || {};
                        return (
                            <tr key={subject.id}>
                                <td className="font-semibold">{subject.name}</td>
                                {/* FIX: Explicitly type 'ass' as a string to resolve TypeScript error where it was inferred as 'unknown', preventing its use as an index type. */}
                                {allAssessments.map((ass: string) => (
                                    <td key={ass} className="text-center">
                                        {(subjectGrades[ass] as number)?.toFixed(1) ?? '-'}
                                    </td>
                                ))}
                                <td className="text-center font-bold">
                                    {calculateFinalGrade(subject.name)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            
            {observation && (
                <section className="mt-6">
                    <h3 className="font-bold text-base mb-2">Observações Pedagógicas</h3>
                    <p className="text-sm italic p-3 bg-gray-50 border border-gray-200 rounded-md whitespace-pre-wrap">{observation}</p>
                </section>
            )}

            <footer className="mt-16 text-center text-xs">
                <div className="inline-block mx-auto">
                    <div className="border-t border-gray-400 w-64 pt-1">
                        <p>{schoolInfo.secretaryName}</p>
                        <p>Secretaria</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PrintableAnnualReport;