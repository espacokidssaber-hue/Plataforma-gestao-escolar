

export enum LeadStatus {
  NEGOTIATION = "Negociação",
  AWAITING_ENROLLMENT = "Aguardando Preenchimento dos Pais",
  ENROLLMENT_STARTED = "Matrícula Iniciada",
  COMPLETED = "Matrícula Concluída",
  ALLOCATED = "Alocado em Turma",
}

export enum PaymentStatus {
  PENDING = "Pendente",
  PAID = "Pago",
  OVERDUE = "Atrasado",
}

export enum UserRole {
  SUPER_ADMINISTRADOR = 'Super Administrador',
  ADMINISTRADOR = 'Administrador',
  SECRETARIA = 'Secretária',
  EDUCADORA = 'Educadora',
}

export enum PrintActivityStatus {
  PENDING = "Pendente",
  PRINTED = "Impresso",
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  schoolId?: string;
}

export enum GradeCalculationMethod {
  ARITMETICA = "Aritmética",
  PONDERADA = "Ponderada",
}

export interface Activity {
  id: string;
  name: string;
  weight: number; 
}

export interface GradeConfig {
  id: string; 
  schoolId: string;
  subject: string;
  method: GradeCalculationMethod;
  activities: Activity[];
}

export interface FinancialRecord {
  period: string; // Format: "YYYY-MM" (e.g., "2025-11") derived from "Competência"
  invoiceValue: number;
  amountPaid: number;
  paymentDate?: string;
  dueDate?: string;
  paymentMethod?: string;
  educbankFee: number;
  netValue: number;
  status: PaymentStatus;
}

export interface Lead {
  id: string;
  studentName: string;
  studentBirthDate?: string; // Added field
  responsibleName: string;
  responsibleCPF: string;
  responsibleCEP: string;
  responsibleAddress: string;
  responsibleAddressNumber: string;
  responsibleAddressComplement?: string;
  responsibleDistrict?: string; // Added field (Bairro)
  responsibleCity?: string; // Added field
  responsibleState?: string; // Added field
  responsibleEmail: string;
  responsiblePhone: string;
  status: LeadStatus;
  schoolId: string;
  schoolYear?: number; // Added for School Year management
  studentPhotoUrl?: string;
  invitationSentAt?: string;
  linkViewedAt?: string;
  className?: string;
  enrollmentFee?: number;
  monthlyFee?: number;
  discountPercentage?: number;
  // paymentStatus is now a computed property based on the latest/current period in UI, 
  // but kept here for legacy compatibility or global status cache if needed.
  paymentStatus?: PaymentStatus; 
  financialHistory?: FinancialRecord[]; // Changed from single object to Array
  contractSigned?: boolean;
  contractUrl?: string;
  documents?: {
    url: string;
    name: string;
    uploadedAt: string;
  }[];
  foodRestrictions?: string;
  medicationInfo?: string;
  pickupTime?: string;
  authorizedPickups?: {
    name: string;
    kinship: string;
  }[];
  grades?: { [subject: string]: { [activityId: string]: number } };
}

export interface DiscountConfig {
  suggestionEnabled: boolean;
  basePercentage: number;
  highValueThreshold: number;
}

export interface Staff {
  id: string;
  fullName: string;
  cpf: string;
  rg: string;
  birthDate: string;
  gender: 'Masculino' | 'Feminino' | 'Outro';
  email: string;
  phone: string;
  cep: string;
  address: string;
  addressNumber: string;
  addressComplement?: string;
  role: string;
  className?: string;
  startDate: string;
  salary: number;
  bankName: string;
  bankAgency: string;
  bankAccount: string;
  schoolId: string;
  photoUrl?: string;
  medicalCertificates?: {
    url: string;
    name: string;
    uploadedAt: string;
  }[];
}

export interface Observation {
  id: string;
  studentId: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  schoolId: string;
}

export interface EventCostItem {
  id: string;
  description: string;
  amount: number;
  type: 'fixed' | 'per_student'; // fixed = total cost, per_student = cost per participant
}

export interface EventAttendanceItem {
  classId: string;
  className: string;
  count: number;
}

export interface EventParticipation {
  studentId: string;
  studentName: string;
  className: string;
  status: 'confirmed' | 'absent';
  paymentStatus: 'paid' | 'pending' | 'exempt';
  amountPaid: number;
}

export interface CalendarEvent {
  id: string;
  schoolId: string;
  schoolYear?: number; // Added for School Year management
  date: string; // YYYY-MM-DD format
  title: string;
  type: 'holiday' | 'event' | 'reminder';
  description?: string;
  createdBy: string;
  // New statistical fields
  financials?: EventCostItem[];
  attendance?: EventAttendanceItem[];
  studentParticipations?: EventParticipation[];
  profitMargin?: number; // Desired profit percentage
}

export interface ClassDiaryEntry {
  id: string;
  schoolId: string;
  schoolYear?: number; // Added for School Year management
  authorId: string;
  authorName: string;
  classDate: string; // YYYY-MM-DD
  className: string;
  subject: string; // Disciplina
  topic: string; // Assunto da aula
  objective: string;
  methodology: string;
  resources: string;
  evaluation: string;
  createdAt: string; // ISO timestamp
}

export interface LessonPlan {
  id: string;
  schoolId: string;
  schoolYear?: number;
  teacherId: string;
  teacherName: string;
  className: string;
  subject: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  topic: string; // Tema Central
  objectives: string;
  methodology: string;
  resources: string;
  assessment: string; // Como será avaliado
  status: 'draft' | 'submitted' | 'approved';
  createdAt: string;
}

export interface CurriculumItem {
  week: number;
  month: string;
  bimester: string;
  content: string;
  objectives: string;
}

export interface CurriculumMap {
  id: string;
  schoolId: string;
  schoolYear: number;
  className: string;
  subject: string;
  createdAt: string;
  items: CurriculumItem[];
}

export interface PrintActivity {
  id: string;
  schoolId: string;
  uploaderId: string;
  uploaderName: string;
  title: string;
  className: string;
  copies: number;
  observations?: string;
  fileUrl: string;
  fileName: string;
  uploadedAt: string; // ISO timestamp
  status: PrintActivityStatus;
  printedAt?: string; // ISO timestamp
  printedBy?: string; // Secretary's username
}

export interface ScheduleTimeSlot {
    id: string;
    startTime: string; // "HH:mm"
    endTime: string; // "HH:mm"
    activity: string;
}

export interface Schedule {
    id: string;
    schoolId: string;
    type: 'class' | 'educator';
    name: string; // Nome da turma ou do educador
    schedule: {
        monday: ScheduleTimeSlot[];
        tuesday: ScheduleTimeSlot[];
        wednesday: ScheduleTimeSlot[];
        thursday: ScheduleTimeSlot[];
        friday: ScheduleTimeSlot[];
    };
}

export interface School {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  email: string;
  phone: string;
  logoUrl?: string;
}

export interface SchoolClass {
  id: string;
  schoolId: string;
  schoolYear?: number; // Added for School Year management
  name: string;
  period: 'Manhã' | 'Tarde' | 'Integral';
  level: 'Maternal' | 'Jardim' | 'Pré-escola' | 'Fundamental';
  baseMonthlyFee: number;
  capacity: number; // Total number of slots available
}

export interface Discipline {
  id: string;
  schoolId: string;
  name: string; // ex: 'Matemática'
  teacherId: string;
  classNames: string[]; // ex: ['Maternal I - Manhã', 'Maternal II - Manhã']
}

export interface Communication {
  id: string;
  schoolId: string;
  senderId: string;
  senderName: string;
  subject: string;
  message: string;
  channels: ('system' | 'email' | 'whatsapp')[];
  recipients: {
    groups: string[];
    individuals: { id: string; name: string; type: 'parent' | 'staff' }[];
  };
  recipientSummary: string;
  sentAt: string; // ISO timestamp
}

export interface DeclarationTemplate {
  id: string;
  schoolId: string;
  name: string;
  content: string; // The template with placeholders like {{studentName}}
}

export interface LivroEscrituracao {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'auto-matricula' | 'manual' | 'ponto' | 'inspecao';
}

export interface DocumentoExigido {
  id: number;
  nome: string;
  exigido: 'sim' | 'nao' | 'nao_se_aplica';
}

export interface TermoInspecao {
  data: string;
  horaInicio: string;
  horaTermino: string;
  nomeAgente: string;
  matricula: string;
  cargo: string;
  documentosExigidos: DocumentoExigido[];
  outrosDocumentos: string;
  prazosConcedidos: string;
  irregularidades: string;
  autosInfracao: string;
  orientacao: string;
  numEmpregadosMaiores: string;
  numEmpregadosMenores: string;
  numEmpregadasMulheres: string;
}

export interface InspecaoRecord {
  id: string;
  schoolId: string;
  termo: TermoInspecao;
  fileUrl?: string;
  fileName?: string;
  archivedAt?: string;
}

export interface PontoRecord {
  id: string;
  staffId: string;
  schoolId: string;
  year: number;
  month: number; // 1-12
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  schoolId: string;
  className: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'justified';
  schoolYear: number;
}

export interface DiarioPrintData {
  school?: School;
  classInfo: SchoolClass;
  disciplines: Discipline[];
  type: 'filled' | 'blank';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD for range, same as startDate for single day
  entries: ClassDiaryEntry[];
}

export interface AtaPrintData {
  content: string;
  educatorTerm: string;
}

export interface StockItem {
  id: string;
  schoolId: string;
  schoolYear: number;
  name: string; // e.g., "Resma de Papel A4"
  category: string; // e.g., "Papelaria", "Artes", "Limpeza"
  unit: string; // e.g., "un", "cx", "pct"
  quantityInitial: number; // Total gathered from parents at start of year
  quantityCurrent: number; // Current stock
  minThreshold: number; // Warning level
}

export interface StockMovement {
  id: string;
  itemId: string;
  schoolId: string;
  schoolYear: number;
  type: 'entry' | 'exit';
  quantity: number;
  date: string;
  reason: string; // e.g., "Aula de Artes 3A", "Reposição"
  userId: string; // Who authorized/took it
  userName: string;
}