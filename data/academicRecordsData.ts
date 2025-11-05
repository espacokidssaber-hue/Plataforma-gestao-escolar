import { StudentAcademicRecord, AttendanceStatus } from '../types';

// Copied from context to avoid circular dependencies
const getInitials = (name: string): string => { if (!name) return '?'; const words = name.trim().split(' ').filter(Boolean); if (words.length > 1) { return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase(); } if (words.length === 1 && words[0].length > 1) { return words[0].substring(0, 2).toUpperCase(); } if (words.length === 1) { return words[0][0].toUpperCase(); } return '?'; };
const stringToColor = (str: string): string => { let hash = 0; if (!str) return '#cccccc'; for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); hash = hash & hash; } let color = '#'; for (let i = 0; i < 3; i++) { const value = (hash >> (i * 8)) & 0xFF; const adjustedValue = 100 + (value % 156); color += ('00' + adjustedValue.toString(16)).substr(-2); } return color; };
const generateAvatar = (name: string): string => { const initials = getInitials(name); const color = stringToColor(name); const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150" fill="${color}"><rect width="100%" height="100%" fill="currentColor" /><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60" fill="#ffffff">${initials}</text></svg>`; return `data:image/svg+xml;base64,${btoa(svg)}`; };

export const MOCK_STUDENTS_ACADEMIC: Record<number, StudentAcademicRecord[]> = {};
