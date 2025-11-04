import { ClassLogEntry } from '../types';

export const MOCK_CLASS_LOGS: ClassLogEntry[] = [
    {
        id: 1,
        classId: 2, // 1º Ano A
        date: '2024-05-13',
        subject: 'Português',
        content: 'Leitura e interpretação da fábula "A Cigarra e a Formiga". Atividade de desenho sobre a moral da história.',
        // FIX: Added authorId and authorName to satisfy ClassLogEntry type
        authorId: 3,
        authorName: 'Prof. Beatriz Lima',
    },
    {
        id: 2,
        classId: 2, // 1º Ano A
        date: '2024-05-13',
        subject: 'Matemática',
        content: 'Introdução aos conceitos de adição. Atividades práticas com material dourado.',
        // FIX: Added authorId and authorName to satisfy ClassLogEntry type
        authorId: 2,
        authorName: 'Prof. Carlos Souza',
    },
    {
        id: 3,
        classId: 3, // 2º Ano B
        date: '2024-05-13',
        subject: 'Ciências',
        content: 'Estudo das partes de uma planta (raiz, caule, folhas). Observação de plantas no pátio da escola.',
        // FIX: Added authorId and authorName to satisfy ClassLogEntry type
        authorId: 2,
        authorName: 'Prof. Carlos Souza',
    },
    {
        id: 4,
        classId: 2, // 1º Ano A
        date: '2024-05-10',
        subject: 'Português',
        content: 'Exercícios de caligrafia com a letra C. Formação de palavras simples.',
        // FIX: Added authorId and authorName to satisfy ClassLogEntry type
        authorId: 3,
        authorName: 'Prof. Beatriz Lima',
    },
];
