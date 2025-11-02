import { SchoolClass, ClassPeriod, SchoolUnit } from '../types';

export const MOCK_CLASSES: SchoolClass[] = [
    { id: 1, name: 'Infantil II A', grade: 'Infantil II', period: ClassPeriod.MORNING, unit: SchoolUnit.MATRIZ, room: 'Sala 1', teachers: { matriz: 'Prof. Ana', filial: '', anexo: '' }, capacity: { matriz: 15, filial: 0, anexo: 0 }, students: [] },
    { id: 2, name: '1º Ano A', grade: '1º Ano', period: ClassPeriod.MORNING, unit: SchoolUnit.MATRIZ, room: 'Sala 5', teachers: { matriz: 'Prof. Beatriz', filial: '', anexo: '' }, capacity: { matriz: 25, filial: 0, anexo: 0 }, students: [] },
    { id: 3, name: '2º Ano B', grade: '2º Ano', period: ClassPeriod.AFTERNOON, unit: SchoolUnit.FILIAL, room: 'Sala 12', teachers: { matriz: '', filial: 'Prof. Carlos', anexo: '' }, capacity: { matriz: 0, filial: 20, anexo: 0 }, students: [] },
    { id: 4, name: '4º Ano Tarde', grade: '4º Ano', period: ClassPeriod.AFTERNOON, unit: SchoolUnit.ANEXO, room: 'Sala A1', teachers: { matriz: '', filial: '', anexo: 'Prof. Exemplo' }, capacity: { matriz: 0, filial: 0, anexo: 20 }, students: [] },
];
