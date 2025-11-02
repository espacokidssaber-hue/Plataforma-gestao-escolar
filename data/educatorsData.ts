import { Educator, EducatorStatus } from '../types';

// --- AVATAR UTILS START ---
const getInitials = (name: string): string => { if (!name) return '?'; const words = name.trim().split(' ').filter(Boolean); if (words.length > 1) { return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase(); } if (words.length === 1 && words[0].length > 1) { return words[0].substring(0, 2).toUpperCase(); } if (words.length === 1) { return words[0][0].toUpperCase(); } return '?'; };
const stringToColor = (str: string): string => { let hash = 0; if (!str) return '#cccccc'; for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); hash = hash & hash; } let color = '#'; for (let i = 0; i < 3; i++) { const value = (hash >> (i * 8)) & 0xFF; const adjustedValue = 100 + (value % 156); color += ('00' + adjustedValue.toString(16)).substr(-2); } return color; };
const generateAvatar = (name: string): string => { const initials = getInitials(name); const color = stringToColor(name); const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150" fill="${color}"><rect width="100%" height="100%" fill="currentColor" /><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60" fill="#ffffff">${initials}</text></svg>`; return `data:image/svg+xml;base64,${btoa(svg)}`; };
// --- AVATAR UTILS END ---

export const MOCK_EDUCATORS: Educator[] = [
    { id: 1, name: 'Prof. Ana Silva', avatar: generateAvatar('Ana Silva'), role: 'Professora - Infantil', subjects: ['Artes', 'Psicomotricidade'], status: EducatorStatus.ACTIVE, hireDate: '2020-02-10' },
    { id: 2, name: 'Prof. Carlos Souza', avatar: generateAvatar('Carlos Souza'), role: 'Professor - Fundamental I', subjects: ['Matemática', 'Ciências'], status: EducatorStatus.ACTIVE, hireDate: '2018-03-15' },
    { id: 3, name: 'Prof. Beatriz Lima', avatar: generateAvatar('Beatriz Lima'), role: 'Professora - Fundamental I', subjects: ['Português', 'História'], status: EducatorStatus.ACTIVE, hireDate: '2021-08-01' },
    { id: 4, name: 'Mariana Costa', avatar: generateAvatar('Mariana Costa'), role: 'Coordenadora Pedagógica', subjects: [], status: EducatorStatus.ACTIVE, hireDate: '2015-01-20' },
    { id: 5, name: 'Ricardo Pereira', avatar: generateAvatar('Ricardo Pereira'), role: 'Professor - Ed. Física', subjects: ['Educação Física'], status: EducatorStatus.INACTIVE, hireDate: '2019-05-01' },
];