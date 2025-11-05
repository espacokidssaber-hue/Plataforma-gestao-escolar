// types.ts
// FIX: Import React to provide React.ReactNode type.
import React from 'react';

export enum View {
    DASHBOARD = 'Dashboard',
    ENROLLMENTS = 'Matrículas',
    STUDENTS = 'Alunos',
    ACADEMIC = 'Acadêmico',
    FINANCIAL = 'Financeiro',
    COMMUNICATION = 'Comunicação',
    REPORTS = 'Relatórios',
    DECLARATIONS = 'Declarações',
    ATAS = 'Atas',
    SIGNATURES = 'Assinaturas e Contratos',
    SETTINGS = 'Configurações',
    ARCHIVE = 'Arquivos',
}

export enum EnrollmentSubView {
    CRM = 'CRM (Funil)',
    NEW_ENROLLMENTS = 'Novas Matrículas',
    REENROLLMENTS = 'Rematrículas',
    CLASS_MANAGEMENT = 'Gestão de Turmas',
    TRANSFERS = 'Movimentação',
    REPORTS = 'Relatórios de Matrícula',
    SETTINGS = 'Configurações de Matrícula',
}

export enum AcademicSubView {
    TEACHER_DASHBOARD = 'Painel do Educador',
    GRADES_ATTENDANCE = 'Notas e Frequência',
    CLASS_DIARY = 'Diário de Classe',
    REPORT_CARD = 'Boletim e Histórico',
    CALENDAR = 'Calendário Letivo',
    ACTIVITIES_FOR_PRINTING = 'Atividades para Impressão',
    EDUCATORS = 'Educadoras',
    SCHEDULES = 'Horários',
    SUBJECTS = 'Disciplinas',
}

export enum FinancialSubView {
    OVERVIEW = 'Visão Geral',
    ACCOUNTS_RECEIVABLE = 'Contas a Receber',
    ACCOUNTS_PAYABLE = 'Contas a Pagar',
    CASH_FLOW = 'Fluxo de Caixa',
}

export enum CommunicationSubView {
    NOTICE_BOARD = 'Mural de Avisos',
    DIRECT_MESSAGES = 'Mensagens Diretas',
    INTERNAL_MESSAGES = 'Mensagens Internas',
    BULK_MESSAGING = 'Disparos em Massa',
    MEETING_SCHEDULING = 'Agendamento de Reuniões',
}

export enum MessageRole {
    USER = 'user',
    MODEL = 'model',
}

export interface ChatMessage {
    role: MessageRole;
    content: string;
}

export interface EventData {
    day: number;
    label: string;
    type: 'exam' | 'holiday' | 'event' | 'other';
}

export interface AllCalendarEvents {
    [yearMonth: string]: {
        [day: number]: { type: string; label: string }[];
    };
}

export type UserRole = 'admin' | 'secretary' | 'educator';

export enum SchoolUnit {
    MATRIZ = 'Matriz',
    FILIAL = 'Filial',
    ANEXO = 'Anexo',
}

export interface SchoolInfo {
    name: string;
    cnpj: string;
    address?: string;
    phone?: string;
    email?: string;
    directorName?: string;
    secretaryName?: string;
    logo?: string;
    authorizationNumber?: string;
}

export interface StudentAddress {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
}

export interface Guardian {
    name: string;
    cpf: string;
    rg: string;
    phone: string;
    email: string;
    occupation?: string;
}

export type ClearanceStatus = 'OK' | 'Pendente';

export enum StudentLifecycleStatus {
    ACTIVE = 'Ativo',
    INACTIVE = 'Inativo',
    TRANSFERRED_OUT = 'Transferido',
    CANCELLED = 'Cancelado',
}

export interface EnrolledStudent {
    id: number;
    name: string;
    avatar: string;
    grade: string;
    className: string;
    classId: number;
    unit: SchoolUnit;
    status: StudentLifecycleStatus;
    financialStatus: ClearanceStatus;
    libraryStatus: ClearanceStatus;
    academicDocsStatus: ClearanceStatus;
    dateOfBirth?: string;
    cityOfBirth?: string;
    stateOfBirth?: string;
    motherName?: string;
    fatherName?: string;
    guardians?: Guardian[];
    address?: StudentAddress;
    healthInfo?: HealthInfo;
    imageUsagePermission?: boolean;
    enrollmentFee?: number;
    monthlyFee?: number;
    discountProgram?: string;
    // For import purposes
    originClassName?: string;
    originClassTurma?: string;
}

// For transcript printing
export interface EnrichedEnrolledStudent extends EnrolledStudent {
    enrollmentId: string;
    cityOfBirth: string;
    stateOfBirth: string;
}

export enum LeadStatus {
    NEW = 'Novo Lead',
    CONTACTED = 'Contactado',
    VISIT_SCHEDULED = 'Visita Agendada',
    NEGOTIATION = 'Negociação',
    ENROLLMENT_INVITED = 'Convite Enviado',
    WON = 'Convertido',
    LOST = 'Perdido',
}

export interface Lead {
    id: number;
    name: string;
    avatar: string;
    status: LeadStatus;
    source: string;
    interest: string;
    lastContact: string;
    nextAction: string;
    discountProgram?: string;
    invitationSent?: string;
}

export interface Contact {
    name: string;
    email?: string;
    phone?: string;
}

export enum ClassPeriod {
    MORNING = 'Manhã',
    AFTERNOON = 'Tarde',
}

export interface ClassCapacity {
    matriz: number;
    filial: number;
    anexo: number;
}

export interface SchoolClass {
    id: number;
    name: string;
    grade: string;
    period: ClassPeriod;
    unit: SchoolUnit;
    room: string;
    teachers: {
        matriz: number | null;
        filial: number | null;
        anexo: number | null;
    };
    capacity: ClassCapacity;
    students: EnrolledStudent[];
}

export enum NotificationType {
    ENROLLMENT = 'enrollment',
    FINANCIAL = 'financial',
    ACADEMIC = 'academic',
    COMMUNICATION = 'communication',
}

export interface AppNotification {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
}

export interface DailyTask {
    id: number;
    text: string;
    completed: boolean;
}

export interface SystemTask {
    id: string;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    isCompleted: boolean;
}

export interface MonthlyTask {
    id: string;
    text: string;
    completed: boolean;
}

export enum DocumentStatus {
    PENDING = 'Pendente',
    ANALYSIS = 'Em Análise',
    APPROVED = 'Aprovado',
    REJECTED = 'Reprovado',
}

export type DocumentDeliveryMethod = 'Digital' | 'Físico' | 'Pendente';

export interface StudentDocument {
    name: string;
    status: DocumentStatus;
    deliveryMethod: DocumentDeliveryMethod;
    fileUrl?: string; // Base64 or actual URL
    rejectionReason?: string;
}

export interface HealthInfo {
    allergies: string;
    medications: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
}

export enum NewEnrollmentStatus {
    PENDING_ANALYSIS = 'Aguardando Análise',
    AWAITING_PAYMENT = 'Aguardando Pagamento',
    INCORRECT_DOCUMENTATION = 'Documentação Incorreta',
    READY_TO_FINALIZE = 'Pronto para Efetivar',
    ENROLLED = 'Matriculado',
}

export interface Applicant {
    id: number;
    name: string;
    avatar: string;
    status: NewEnrollmentStatus;
    submissionDate: string;
    interest?: string;
    guardians: Guardian[];
    address?: StudentAddress;
    dateOfBirth?: string;
    documents: StudentDocument[];
    // FIX: Add missing healthInfo property to match usage in EnrollmentContext
    healthInfo?: HealthInfo;
    // validation flags
    dataValidated: boolean;
    guardianDataValidated: boolean;
    paymentConfirmed: boolean;
    paymentMethod?: 'PIX' | 'Dinheiro' | 'Cartão' | 'Comprovante';
    paymentReceiptUrl?: string;
    // financial
    enrollmentFee?: number;
    monthlyFee?: number;
    discountProgram?: string;
}

export interface ManualEnrollmentData {
    studentName: string;
    studentDateOfBirth: string;
    studentGender: string;
    studentNationality: string;
    studentBirthCity: string;
    studentBirthState: string;
    studentAddress: StudentAddress;
    guardian: Guardian;
    healthInfo: HealthInfo;
    documents: { name: string; deliveryMethod: DocumentDeliveryMethod; status: DocumentStatus }[];
    paymentConfirmed: boolean;
    discountProgram: string;
    enrollmentFee: number;
    monthlyFee: number;
    grade: string;
}

export interface NewExtemporaneousData {
    studentName: string;
    guardianName: string;
    grade: string;
}

export enum ReEnrollmentStatus {
    PENDING_INVITE = 'Pendente de Convite',
    INVITED = 'Convidado',
    DATA_VALIDATED = 'Dados Validados',
    CONTRACT_ACCEPTED = 'Contrato Aceito',
    PAYMENT_PENDING = 'Pagamento Pendente',
    COMPLETED = 'Concluído',
    DECLINED = 'Recusou',
}

export interface ReEnrollingStudent {
    id: number;
    name: string;
    avatar: string;
    currentGrade: string;
    nextGrade: string;
    status: ReEnrollmentStatus;
    guardianName: string;
    lastActionDate: string;
    paymentStatus: 'Pendente' | 'Pago';
    contractSignature: 'Pendente' | 'Digital' | 'Presencial';
    documents: StudentDocument[];
    reenrollmentFee: number;
    unit: SchoolUnit;
}

export enum InvoiceStatus {
    PAID = 'Pago',
    PENDING = 'Pendente',
    OVERDUE = 'Atrasado',
}

export interface Invoice {
    id: number;
    studentId: number;
    studentName: string;
    description: string;
    amount: number;
    dueDate: string;
    status: InvoiceStatus;
    paymentMethod?: string;
    paymentReceiptUrl?: string;
}

export enum ExpenseStatus {
    PAID = 'Pago',
    PENDING = 'Pendente',
    OVERDUE = 'Atrasado',
}

export interface Expense {
    id: number;
    supplier: string;
    category: string;
    description: string;
    amount: number;
    dueDate: string;
    status: ExpenseStatus;
    paymentDate?: string;
}

export interface InternalMessage {
    id: number;
    senderId: number;
    text: string;
    timestamp: string;
    isRead: boolean;
}

export interface InternalConversation {
    id: number;
    participantIds: number[];
    messages: InternalMessage[];
}

// FIX: Add missing Conversation interface for DirectMessages component
export interface Conversation {
    id: number;
    contactName: string;
    contactAvatar: string;
    lastMessage: string;
    unreadCount: number;
    phone?: string;
    email?: string;
    messages: any[];
}

export interface WhatsAppGroup {
    id: number;
    name: string;
    link: string;
}

export interface Announcement {
    id: number;
    title: string;
    content: string;
    author: string;
    authorId: number;
    authorRole: UserRole;
    date: string;
    recipientRole: UserRole | 'all';
    channels: {
        board: boolean;
        email: boolean;
        whatsapp: boolean;
        app: boolean;
    };
}

export interface SchoolDocument {
    title: string;
    content: React.ReactNode;
}

export type Grade = number | null;
export type AttendanceStatus = 'Presente' | 'Falta' | 'Justificado';

export interface StudentAcademicRecord {
    studentId: number;
    studentName: string;
    avatar: string;
    grades: Record<string, Record<string, Grade>>; // { 'Matemática': { 'Prova 1': 8.5, 'Trabalho': 9.0 }, ... }
    attendance: Record<string, AttendanceStatus>; // { '2024-03-01': 'Presente', ... }
    observations: { date: string, author: string, text: string }[];
}

export type CalculationMethod = 'arithmetic' | 'weighted';

export interface SubjectAssessment {
    name: string;
    weight: number;
}

export interface Subject {
    id: number;
    name: string;
    color: string;
    calculationMethod: CalculationMethod;
    assessments: SubjectAssessment[];
}

export interface PrintDiaryConfig {
    teacherName: string;
    year: number;
    month: number;
    includeAttendance: boolean;
    includeGrades: boolean;
    includeLessonLog: boolean;
    includeCalendar: boolean;
}

export interface PrintDiaryData {
    schoolInfo: SchoolInfo;
    classInfo: { id: number; name: string };
    students: { id: number; name: string }[];
    config: PrintDiaryConfig;
    calendarEvents: AllCalendarEvents;
    classLogs: ClassLogEntry[];
    subjects: Subject[];
    academicRecords: StudentAcademicRecord[];
}

export interface AcademicHistoryEntry {
    year: number;
    gradeLevel: string;
    schoolName: string;
    schoolLocation: string;
    grades: Record<string, number | null>;
    workload: Record<string, number | null>;
    attendance: number;
    totalSchoolDays: number;
    status: 'Aprovado' | 'Reprovado' | 'Cursando';
}

export interface StudentTranscriptData {
    student: EnrichedEnrolledStudent;
    schoolInfo: SchoolInfo;
    academicHistory: AcademicHistoryEntry[];
    observations: string;
}

export interface ClassLogEntry {
    id: number;
    classId: number;
    date: string;
    subject: string;
    content: string;
    authorId: number;
    authorName: string;
    lastEditedBy?: string;
}

export enum EducatorStatus {
    ACTIVE = 'Ativo',
    INACTIVE = 'Inativo',
}

export interface Educator {
    id: number;
    name: string;
    avatar: string;
    role: string;
    subjects: string[];
    status: EducatorStatus;
    hireDate: string;
}

// Manter sincronizado com o Schedule
export const MORNING_TIME_SLOTS = [
    { start: '07:30', end: '08:20' },
    { start: '08:20', end: '09:10' },
    { start: '09:10', end: '10:00' },
    { start: '10:00', end: '10:20', isBreak: true, label: 'Intervalo' },
    { start: '10:20', end: '11:10' },
    { start: '11:10', end: '12:00' },
];

export const AFTERNOON_TIME_SLOTS = [
    { start: '13:00', end: '13:50' },
    { start: '13:50', end: '14:40' },
    { start: '14:40', end: '15:30' },
    { start: '15:30', end: '15:50', isBreak: true, label: 'Intervalo' },
    { start: '15:50', end: '16:40' },
    { start: '16:40', end: '17:30' },
];


export const DAYS_OF_WEEK = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

export type DailySchedule = {
    [time: string]: ScheduleItem;
};

export type WeeklySchedule = {
    [day: string]: DailySchedule;
};

export type AllSchedules = {
    [classId: number]: WeeklySchedule;
};

export interface ScheduleItem {
    subject: string;
    educatorId: number;
}

export interface PrintData {
    type: 'class' | 'educator' | 'general';
    title: string;
    schedules: AllSchedules | Record<number, WeeklySchedule>;
    educators: Educator[];
    classes: SchoolClass[];
    timeSlots: { start: string; end: string; isBreak?: boolean; label?: string }[];
    allTimeSlots?: { start: string; end: string; isBreak?: boolean; label?: string }[];
}

export interface Meeting {
    id: number;
    title: string;
    attendeeName: string;
    date: string;
    status: 'Agendada' | 'Concluída' | 'Cancelada';
}

export interface DeclarationTemplate {
  id: number;
  name: string;
  content: string;
}