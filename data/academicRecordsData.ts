import { StudentAcademicRecord, AttendanceStatus } from '../types';

// Copied from context to avoid circular dependencies
const getInitials = (name: string): string => { if (!name) return '?'; const words = name.trim().split(' ').filter(Boolean); if (words.length > 1) { return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase(); } if (words.length === 1 && words[0].length > 1) { return words[0].substring(0, 2).toUpperCase(); } if (words.length === 1) { return words[0][0].toUpperCase(); } return '?'; };
const stringToColor = (str: string): string => { let hash = 0; if (!str) return '#cccccc'; for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); hash = hash & hash; } let color = '#'; for (let i = 0; i < 3; i++) { const value = (hash >> (i * 8)) & 0xFF; const adjustedValue = 100 + (value % 156); color += ('00' + adjustedValue.toString(16)).substr(-2); } return color; };
const generateAvatar = (name: string): string => { const initials = getInitials(name); const color = stringToColor(name); const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150" fill="${color}"><rect width="100%" height="100%" fill="currentColor" /><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60" fill="#ffffff">${initials}</text></svg>`; return `data:image/svg+xml;base64,${btoa(svg)}`; };

export const MOCK_STUDENTS_ACADEMIC: Record<number, StudentAcademicRecord[]> = {
    1: [ // Infantil II A
        {
            studentId: 301,
            studentName: 'Alice Braga',
            avatar: generateAvatar('Alice Braga'),
            grades: {
                'Psicomotricidade': { 'Circuito 1': 9.0, 'Atividades Ritmo': 9.5, 'Coordenação Fina': 8.5 },
                'Artes': { 'Pintura Livre': 10.0, 'Modelagem': 9.0 },
                'Contação de Histórias': { 'Participação': 10.0, 'Interpretação': 9.0 },
            },
            attendance: {
                '2025-03-10': 'Presente',
                '2025-03-11': 'Presente',
                '2025-03-12': 'Falta',
                '2025-03-13': 'Presente',
            }
        },
    ],
    2: [ // 1º Ano A
        {
            studentId: 302,
            studentName: 'Bento Ribeiro',
            avatar: generateAvatar('Bento Ribeiro'),
            grades: {
                'Português': { 'Prova 1': 8.5, 'Redação': 7.5, 'Trabalho em Grupo': 9.0 },
                'Matemática': { 'Prova 1': 7.0, 'Exercícios': 8.0, 'Desafio Lógico': 7.5 },
                'Ciências': { 'Experimento': 9.5, 'Relatório': 8.5, 'Prova 1': 9.0 },
                'História': { 'Apresentação': 8.0, 'Prova 1': 7.0 },
            },
            attendance: {
                '2025-03-10': 'Presente',
                '2025-03-11': 'Presente',
                '2025-03-12': 'Presente',
                '2025-03-13': 'Presente',
            }
        },
    ],
    3: [ // 2º Ano B
        {
            studentId: 303,
            studentName: 'Clara Nunes',
            avatar: generateAvatar('Clara Nunes'),
            grades: {
                'Português': { 'Prova 1': 9.0, 'Ditado': 9.5, 'Leitura': 10.0 },
                'Matemática': { 'Prova 1': 8.0, 'Cálculo Mental': 8.5, 'Resolução de Problemas': 7.5 },
                'Ciências': { 'Projeto Horta': 10.0, 'Prova 1': 8.5 },
            },
            attendance: {
                '2025-03-10': 'Presente',
                '2025-03-11': 'Falta',
                '2025-03-12': 'Justificado',
                '2025-03-13': 'Presente',
            }
        }
    ]
};
