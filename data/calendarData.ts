import { AllCalendarEvents } from '../types';

export const MOCK_CALENDAR_EVENTS: AllCalendarEvents = {
    '2024-5': { // June
        5: [{ type: 'exam', label: 'Início Provas Bimestrais' }],
        13: [{ type: 'holiday', label: 'Feriado Municipal' }],
        19: [{ type: 'exam', label: 'Fim Provas Bimestrais' }],
        22: [{ type: 'event', label: 'Festa Junina' }],
        30: [{ type: 'other', label: 'Conselho de Classe' }],
    },
    '2024-6': { // July
        1: [{ type: 'other', label: 'Início do Recesso' }],
        15: [{ type: 'other', label: 'Fim do Recesso' }],
        16: [{ type: 'other', label: 'Retorno às aulas' }],
        25: [{ type: 'other', label: 'Reunião de Pais - 1º Ano' }],
    },
    '2024-10': { // November
        11: [{ type: 'event', label: 'Início Semana de Arte' }],
        15: [{ type: 'event', label: 'Fim Semana de Arte' }],
        20: [{ type: 'holiday', label: 'Dia da Consciência Negra' }],
        29: [{ type: 'other', label: 'Reunião Pedagógica' }],
    },
    '2024-11': { // December
        23: [{ type: 'other', label: 'Início Recesso de Fim de Ano' }],
        25: [{ type: 'holiday', label: 'Natal' }],
    },
    '2025-0': { // January 2025
        1: [{ type: 'holiday', label: 'Confraternização Universal' }],
        28: [{ type: 'other', label: 'Volta às aulas 2025' }],
    }
};
