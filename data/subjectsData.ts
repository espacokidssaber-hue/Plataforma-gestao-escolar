import { Subject } from '../types';

export const MOCK_SUBJECTS: Subject[] = [
    { id: 1, name: 'Matemática', color: '#3b82f6', calculationMethod: 'weighted', assessments: [{ name: 'Prova 1', weight: 2 }, { name: 'Trabalho Geometria', weight: 1 }, { name: 'Prova 2', weight: 2 }] },
    { id: 2, name: 'Português', color: '#22c55e', calculationMethod: 'arithmetic', assessments: [{ name: 'Redação', weight: 1 }, { name: 'Interpretação', weight: 1 }] },
    { id: 3, name: 'Ciências', color: '#eab308', calculationMethod: 'arithmetic', assessments: [] },
    { id: 4, name: 'Artes', color: '#ec4899', calculationMethod: 'arithmetic', assessments: [] },
    { id: 5, name: 'História', color: '#a855f7', calculationMethod: 'arithmetic', assessments: [] },
    { id: 6, name: 'Educação Física', color: '#f97316', calculationMethod: 'arithmetic', assessments: [] },
];
