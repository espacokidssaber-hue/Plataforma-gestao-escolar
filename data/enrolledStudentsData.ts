import { EnrolledStudent, StudentLifecycleStatus, SchoolUnit } from '../types';

// --- AVATAR UTILS START ---
const getInitials = (name: string): string => { if (!name) return '?'; const words = name.trim().split(' ').filter(Boolean); if (words.length > 1) { return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase(); } if (words.length === 1 && words[0].length > 1) { return words[0].substring(0, 2).toUpperCase(); } if (words.length === 1) { return words[0][0].toUpperCase(); } return '?'; };
const stringToColor = (str: string): string => { let hash = 0; if (!str) return '#cccccc'; for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); hash = hash & hash; } let color = '#'; for (let i = 0; i < 3; i++) { const value = (hash >> (i * 8)) & 0xFF; const adjustedValue = 100 + (value % 156); color += ('00' + adjustedValue.toString(16)).substr(-2); } return color; };
const generateAvatar = (name: string): string => { const initials = getInitials(name); const color = stringToColor(name); const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150" fill="${color}"><rect width="100%" height="100%" fill="currentColor" /><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60" fill="#ffffff">${initials}</text></svg>`; return `data:image/svg+xml;base64,${btoa(svg)}`; };
// --- AVATAR UTILS END ---

export const MOCK_ENROLLED_STUDENTS: EnrolledStudent[] = [
    { 
        id: 301, 
        name: 'Alice Braga', 
        avatar: generateAvatar('Alice Braga'), 
        grade: 'Infantil II', 
        className: 'Infantil II A', 
        classId: 1, 
        unit: SchoolUnit.MATRIZ, 
        status: StudentLifecycleStatus.ACTIVE, 
        financialStatus: 'OK', 
        libraryStatus: 'OK', 
        academicDocsStatus: 'OK',
        imageUsagePermission: true,
        dateOfBirth: '2020-05-10',
        guardians: [{ name: 'Fernanda Braga', cpf: '111.222.333-44', rg: '', phone: '', email: '' }],
        address: { street: 'Rua das Flores', number: '123', neighborhood: 'Centro', city: 'João Pessoa', state: 'PB', zip: '58000-000' }
    },
    { 
        id: 302, 
        name: 'Bento Ribeiro', 
        avatar: generateAvatar('Bento Ribeiro'), 
        grade: '1º Ano', 
        className: '1º Ano A', 
        classId: 2, 
        unit: SchoolUnit.MATRIZ, 
        status: StudentLifecycleStatus.ACTIVE, 
        financialStatus: 'Pendente', 
        libraryStatus: 'OK', 
        academicDocsStatus: 'OK',
        imageUsagePermission: false,
        dateOfBirth: '2019-03-15',
        guardians: [{ name: 'Ricardo Ribeiro', cpf: '222.333.444-55', rg: '', phone: '', email: '' }],
        address: { street: 'Avenida das Árvores', number: '456', neighborhood: 'Bessa', city: 'João Pessoa', state: 'PB', zip: '58111-000' }
    },
    { 
        id: 303, 
        name: 'Clara Nunes', 
        avatar: generateAvatar('Clara Nunes'), 
        grade: '2º Ano', 
        className: '2º Ano B', 
        classId: 3, 
        unit: SchoolUnit.FILIAL, 
        status: StudentLifecycleStatus.ACTIVE, 
        financialStatus: 'OK', 
        libraryStatus: 'Pendente', 
        academicDocsStatus: 'OK',
        imageUsagePermission: true,
        dateOfBirth: '2018-08-20',
        guardians: [{ name: 'Mariana Nunes', cpf: '333.444.555-66', rg: '', phone: '', email: '' }],
        address: { street: 'Travessa dos Pássaros', number: '789', neighborhood: 'Manaíra', city: 'João Pessoa', state: 'PB', zip: '58222-000' }
    },
    { 
        id: 304, 
        name: 'Dante Oliveira', 
        avatar: generateAvatar('Dante Oliveira'), 
        grade: '1º Ano', 
        className: '1º Ano A', 
        classId: 2, 
        unit: SchoolUnit.MATRIZ, 
        status: StudentLifecycleStatus.ACTIVE, 
        financialStatus: 'OK', 
        libraryStatus: 'OK', 
        academicDocsStatus: 'OK',
        imageUsagePermission: false,
        dateOfBirth: '2019-01-05',
        guardians: [{ name: 'Carlos Oliveira', cpf: '444.555.666-77', rg: '', phone: '', email: '' }],
        address: { street: 'Rua dos Coqueiros', number: '101', neighborhood: 'Bancários', city: 'João Pessoa', state: 'PB', zip: '58333-000' }
    },
];