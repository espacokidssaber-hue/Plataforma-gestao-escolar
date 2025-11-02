import React from 'react';
// This file contains type definitions used throughout the application.

// General & UI
export enum View {
  DASHBOARD = 'Painel',
  ENROLLMENTS = 'Matrículas',
  STUDENTS = 'Alunos',
  ACADEMIC = 'Acadêmico',
  FINANCIAL = 'Financeiro',
  COMMUNICATION = 'Comunicação',
  REPORTS = 'Relatórios',
  DECLARATIONS = 'Declarações',
  ATAS = 'Atas',
  SIGNATURES = 'Assinaturas e Permissões',
  ARCHIVE = 'Arquivo',
}

export type UserRole = 'admin' | 'educator';

// Chat
export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

// Notifications
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

// School & Administration
export interface SchoolInfo {
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  directorName: string;
  secretaryName: string;
  logo?: string;
  authorizationNumber?: string;
}

export enum SchoolUnit {
    MATRIZ = 'Matriz',
    FILIAL = 'Filial',
    ANEXO = 'Anexo',
}

// Enrollments & Admissions
export enum EnrollmentSubView {
  CRM = 'CRM / Funil',
  NEW_ENROLLMENTS = 'Novas Matrículas',
  REENROLLMENTS = 'Rematrículas',
  CLASS_MANAGEMENT = 'Gestão de Turmas',
  TRANSFERS = 'Movimentação',
  REPORTS = 'Relatórios',
  SETTINGS = 'Configurações',
}

export enum LeadStatus {
  NEW = 'Novo',
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
  invitationSent?: string;
  discountProgram?: string;
}

export interface Guardian {
  name: string;
  cpf: string;
  rg: string;
  phone: string;
  email: string;
  relationship?: string;
  occupation?: string;
}

export interface HealthInfo {
    allergies: string;
    medications: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
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
    fileUrl?: string; // base64 URL
    rejectionReason?: string;
}

export enum NewEnrollmentStatus {
  PENDING_ANALYSIS = 'Pendente de Análise',
  AWAITING_PAYMENT = 'Aguardando Pagamento',
  INCORRECT_DOCUMENTATION = 'Documentação Incorreta',
  READY_TO_FINALIZE = 'Pronto para Efetivar',
  ENROLLED = 'Efetivado',
}

export interface Applicant {
    id: number;
    name: string;
    avatar: string;
    submissionDate: string;
    status: NewEnrollmentStatus;
    documents: StudentDocument[];
    guardians: Guardian[];
    healthInfo: HealthInfo;
    dataValidated: boolean;
    guardianDataValidated: boolean;
    paymentConfirmed: boolean;
    paymentMethod?: 'PIX' | 'Dinheiro' | 'Cartão' | 'Comprovante';
    paymentReceiptUrl?: string;
    discountProgram?: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    birthCity?: string;
    birthState?: string;
    address?: StudentAddress;
    enrollmentFee?: number;
    monthlyFee?: number;
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
    documents: { name: string; deliveryMethod: DocumentDeliveryMethod }[];
    paymentConfirmed: boolean;
    paymentMethod?: 'PIX' | 'Dinheiro' | 'Cartão';
    discountProgram: string;
    enrollmentFee: number;
    monthlyFee: number;
}

// Re-enrollment
export enum ReEnrollmentStatus {
  PENDING_INVITE = 'Aguardando Convite',
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
    paymentStatus: 'Pago' | 'Pendente';
    contractSignature: 'Digital' | 'Presencial' | 'Pendente';
    documents: StudentDocument[];
    reenrollmentFee: number;
    unit: SchoolUnit;
}

// Students
export enum StudentLifecycleStatus {
  ACTIVE = 'Ativo',
  INACTIVE = 'Inativo',
  TRANSFERRED_OUT = 'Transferido (Saída)',
  CANCELLED = 'Cancelado',
}

export type ClearanceStatus = 'OK' | 'Pendente';

export interface StudentAddress {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
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
  motherName?: string;
  fatherName?: string;
  guardians?: Guardian[];
  address?: StudentAddress;
  enrollmentFee?: number;
  monthlyFee?: number;
  originClassName?: string;
  originClassTurma?: string;
  imageUsagePermission?: boolean;
  healthInfo?: HealthInfo;
  cityOfBirth?: string;
  stateOfBirth?: string;
}

export interface EnrichedEnrolledStudent extends EnrolledStudent {
    enrollmentId: string;
    cityOfBirth: string;
    stateOfBirth: string;
}

export interface NewExtemporaneousData {
    studentName: string;
    guardianName: string;
    grade: string;
}

// Academic
export enum AcademicSubView {
  TEACHER_DASHBOARD = 'Painel do Professor',
  GRADES_ATTENDANCE = 'Notas e Frequência',
  REPORT_CARD = 'Históricos',
  CLASS_DIARY = 'Registro de Aulas',
  CALENDAR = 'Calendário',
  ACTIVITIES_FOR_PRINTING = 'Atividades para Impressão',
  EDUCATORS = 'Educadoras',
  SUBJECTS = 'Disciplinas',
  SCHEDULES = 'Horários',
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
        matriz: string;
        filial: string;
        anexo: string;
    };
    capacity: ClassCapacity;
    students: EnrolledStudent[];
}

export type Grade = number | null;
export type AttendanceStatus = 'Presente' | 'Falta' | 'Justificado';

export interface SubjectGrades {
    [assessment: string]: Grade;
}

export interface StudentAcademicRecord {
    studentId: number;
    studentName: string;
    avatar: string;
    grades: {
        [subject: string]: SubjectGrades;
    };
    attendance: {
        [date: string]: AttendanceStatus;
    };
}

export interface ReportCard {
    studentId: number;
    studentName: string;
    className: string;
    year: number;
    subjects: {
        name: string;
        grades: { [period: string]: Grade };
        absences: number;
        finalGrade: Grade;
    }[];
    geminiSummary?: string;
}

export interface AcademicHistoryEntry {
    year: number;
    gradeLevel: string;
    schoolName: string;
    schoolLocation: string;
    grades: { [subject: string]: number };
    workload: { [subject: string]: number };
    attendance: number;
    totalSchoolDays: number;
    status: 'Aprovado' | 'Reprovado' | 'Transferido';
}

export interface StudentTranscriptData {
    student: EnrichedEnrolledStudent;
    schoolInfo: SchoolInfo;
    academicHistory: AcademicHistoryEntry[];
    observations: string;
}

export interface EventData {
    day: number;
    label: string;
    type: 'exam' | 'holiday' | 'event' | 'other';
}

export type AllCalendarEvents = Record<string, Record<number, { type: string; label: string }[]>>;

export interface PrintDiaryData {
    schoolInfo: SchoolInfo;
    classInfo: { id: number, name: string };
    students: { id: number, name: string }[];
    config: PrintDiaryConfig;
    calendarEvents: AllCalendarEvents;
    classLogs: ClassLogEntry[];
    subjects: Subject[];
    academicRecords: StudentAcademicRecord[];
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

export interface SubjectAssessment {
    name: string;
    weight: number;
}

export type CalculationMethod = 'arithmetic' | 'weighted';

export interface Subject {
    id: number;
    name: string;
    color: string;
    calculationMethod: CalculationMethod;
    assessments: SubjectAssessment[];
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
    hireDate: string; // YYYY-MM-DD
}

export const DAYS_OF_WEEK = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

export interface ScheduleItem {
    subject: string;
    educatorId: number;
}

export type DailySchedule = Record<string, ScheduleItem>; // Key is start time e.g. "07:30"
export type WeeklySchedule = Record<string, DailySchedule>; // Key is day of week
export type AllSchedules = Record<number, WeeklySchedule>; // Key is classId

export interface TimeSlot {
    start: string;
    end: string;
    isBreak?: boolean;
    label?: string;
}

export const MORNING_TIME_SLOTS: TimeSlot[] = [
    { start: '07:30', end: '08:20' },
    { start: '08:20', end: '09:10' },
    { start: '09:10', end: '10:00' },
    { start: '10:00', end: '10:20', isBreak: true, label: 'Intervalo' },
    { start: '10:20', end: '11:10' },
    { start: '11:10', end: '12:00' },
];

export const AFTERNOON_TIME_SLOTS: TimeSlot[] = [
    { start: '13:00', end: '13:50' },
    { start: '13:50', end: '14:40' },
    { start: '14:40', end: '15:30' },
    { start: '15:30', end: '15:50', isBreak: true, label: 'Intervalo' },
    { start: '15:50', end: '16:40' },
    { start: '16:40', end: '17:30' },
];

export interface PrintData {
    type: 'class' | 'educator' | 'general';
    title: string;
    schedules: AllSchedules | Record<number, any>; // Using any for educator schedule flexibility
    educators: Educator[];
    classes: Partial<SchoolClass>[];
    timeSlots: TimeSlot[];
    allTimeSlots?: TimeSlot[];
}

export interface ClassLogEntry {
    id: number;
    classId: number;
    date: string; // YYYY-MM-DD
    subject: string;
    content: string;
}

export interface UploadedActivity {
    id: number;
    classId: number;
    title: string;
    educatorName: string;
    uploadDate: string; // ISO String
    fileUrl: string; // base64
    fileName: string;
}


// Financial
export enum FinancialSubView {
    OVERVIEW = 'Visão Geral',
    ACCOUNTS_RECEIVABLE = 'Contas a Receber',
    ACCOUNTS_PAYABLE = 'Contas a Pagar',
    CASH_FLOW = 'Fluxo de Caixa',
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
    dueDate: string; // YYYY-MM-DD
    status: InvoiceStatus;
    paymentMethod?: 'PIX' | 'Dinheiro' | 'Cartão' | 'Comprovante';
    paymentReceiptUrl?: string; // base64
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
    dueDate: string; // YYYY-MM-DD
    status: ExpenseStatus;
    paymentDate?: string; // YYYY-MM-DD
}

// Communication
export enum CommunicationSubView {
    NOTICE_BOARD = 'Mural de Avisos',
    DIRECT_MESSAGES = 'Mensagens Diretas',
    BULK_MESSAGING = 'Disparos em Massa',
    MEETING_SCHEDULING = 'Agendamento de Reuniões',
}

export interface Announcement {
    id: number;
    title: string;
    author: string;
    date: string;
    audience: string;
    content: string;
    channels: {
      board: boolean;
      email: boolean;
      whatsapp: boolean;
      app: boolean;
    };
}

export interface Message {
    id: number;
    sender: 'user' | 'contact';
    text: string;
    timestamp: string;
}

export interface Conversation {
    id: number;
    contactName: string;
    contactAvatar: string;
    lastMessage: string;
    unreadCount: number;
    phone?: string;
    email?: string;
    messages: Message[];
}

export interface Contact {
    name: string;
    email: string;
    phone: string;
}

export interface WhatsAppGroup {
  id: number;
  name: string;
  link: string;
}

// Declarations & Atas
export interface DeclarationTemplate {
    id: number;
    name: string;
}

// Signatures & Permissions
export interface SignedContract {
  studentId: number;
  fileUrl: string; // base64
  fileName: string;
  uploadDate: string; // ISO string
}


// Archive (School Registry Document)
export interface SchoolDocument {
    title: string;
    content: React.ReactNode;
}

// Dashboard
export interface SystemTask {
    id: string;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    isCompleted: boolean;
}

export interface DailyTask {
    id: number;
    text: string;
    completed: boolean;
}

export interface MonthlyTask {
    id: string;
    text: string;
    completed: boolean;
}