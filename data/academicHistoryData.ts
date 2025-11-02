import { AcademicHistoryEntry } from '../types';

export const MOCK_ACADEMIC_HISTORY: { [studentId: number]: AcademicHistoryEntry[] } = {
    302: [ // Bento Ribeiro
        {
            year: 2020, gradeLevel: '1º Ano Fundamental', schoolName: 'Escola Primeiros Passos', schoolLocation: 'João Pessoa - PB',
            grades: {}, workload: {}, attendance: 98, totalSchoolDays: 200, status: 'Aprovado'
        },
        {
            year: 2021, gradeLevel: '2º Ano Fundamental', schoolName: 'Escola Primeiros Passos', schoolLocation: 'João Pessoa - PB',
            grades: {}, workload: {}, attendance: 99, totalSchoolDays: 200, status: 'Aprovado'
        },
        {
            year: 2022, gradeLevel: '3º Ano Fundamental', schoolName: 'Espaço Kids do Saber', schoolLocation: 'João Pessoa - PB',
            grades: {}, workload: {}, attendance: 97, totalSchoolDays: 200, status: 'Aprovado'
        },
        {
            year: 2023, gradeLevel: '4º Ano Fundamental', schoolName: 'Espaço Kids do Saber', schoolLocation: 'João Pessoa - PB',
            grades: {}, workload: {}, attendance: 100, totalSchoolDays: 200, status: 'Aprovado'
        },
        {
            year: 2024, gradeLevel: '5º Ano Fundamental', schoolName: 'Espaço Kids do Saber', schoolLocation: 'João Pessoa - PB',
            grades: {
                'ARTES': 9.0, 'CIÊNCIAS': 8.7, 'GEOGRAFIA': 8.8, 'HISTÓRIA': 8.6, 'INGLÊS': 8.8,
                'MATEMÁTICA': 8.8, 'PORTUGUÊS': 8.6, 'SOCIOEMOCIONAL': 9.1
            },
            workload: {
                'ARTES': 40, 'CIÊNCIAS': 80, 'GEOGRAFIA': 80, 'HISTÓRIA': 80, 'INGLÊS': 40,
                'MATEMÁTICA': 120, 'PORTUGUÊS': 120, 'SOCIOEMOCIONAL': 40
            },
            attendance: 100.00,
            totalSchoolDays: 204,
            status: 'Aprovado'
        }
    ],
    304: [ // Dante Oliveira
        // Add history for other students if needed
    ]
};
