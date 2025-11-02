import { AllSchedules } from '../types';

export const MOCK_SCHEDULES_INITIAL_STATE: AllSchedules = {
    1: { // Infantil II A
        'Segunda': { '07:30': { subject: 'Psicomotricidade', educatorId: 1 }, '08:20': { subject: 'Artes', educatorId: 1 } },
        'Terça': { '07:30': { subject: 'Contação de Histórias', educatorId: 1 }, '10:20': { subject: 'Música', educatorId: 1 } },
        'Quarta': { '08:20': { subject: 'Artes', educatorId: 1 } },
    },
    2: { // 1º Ano A
        'Segunda': { '07:30': { subject: 'Português', educatorId: 3 }, '08:20': { subject: 'Português', educatorId: 3 }, '10:20': { subject: 'Matemática', educatorId: 2 } },
        'Terça': { '07:30': { subject: 'Matemática', educatorId: 2 }, '08:20': { subject: 'Ciências', educatorId: 2 }, '11:10': { subject: 'História', educatorId: 3 } },
        'Quarta': { '07:30': { subject: 'Matemática', educatorId: 2 }, '09:10': { subject: 'Português', educatorId: 3 } },
        'Quinta': { '10:20': { subject: 'Ciências', educatorId: 2 }, '11:10': { subject: 'História', educatorId: 3 } },
        'Sexta': { '07:30': { subject: 'Português', educatorId: 3 }, '08:20': { subject: 'Matemática', educatorId: 2 } },
    },
    3: { // 2º Ano B (Tarde)
        'Segunda': { '13:00': { subject: 'Português', educatorId: 3 }, '13:50': { subject: 'Matemática', educatorId: 2 } },
        'Terça': { '14:40': { subject: 'Ciências', educatorId: 2 }, '15:50': { subject: 'Português', educatorId: 3 } },
    },
    4: { // 4º Ano Tarde
         'Segunda': { '13:00': { subject: 'Geografia', educatorId: 4 }, '13:50': { subject: 'História', educatorId: 3 } },
         'Quarta': { '14:40': { subject: 'Geografia', educatorId: 4 }, '15:50': { subject: 'Artes', educatorId: 1 } },
    }
};
