import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo } from 'react';
// FIX: Import SchoolUnit to resolve reference errors
import { EnrolledStudent, Lead, SchoolClass, Applicant, ReEnrollingStudent, StudentLifecycleStatus, NewEnrollmentStatus, LeadStatus, SchoolInfo, Contact, ManualEnrollmentData, NewExtemporaneousData, ClassLogEntry, Educator, AllSchedules, Subject, DeclarationTemplate, SchoolUnit, Staff, StaffStatus } from '../types';
import { MOCK_ENROLLED_STUDENTS } from '../data/enrolledStudentsData';
// import { MOCK_LEADS } from '../data/leadsData'; // Removed - File not provided
import { MOCK_CLASSES } from '../data/classesData';
// import { MOCK_APPLICANTS } from '../data/applicantsData'; // Removed - File not provided
// import { MOCK_REENROLLING_STUDENTS } from '../data/reEnrollingStudentsData'; // Removed - File not provided
// import { MOCK_SCHOOL_INFO } from '../data/schoolInfo'; // Removed - File not provided
// import { MOCK_CRM_OPTIONS } from '../data/crmOptions'; // Removed - File not provided
import { MOCK_STUDENTS_ACADEMIC } from '../data/academicRecordsData';
import { MOCK_CLASS_LOGS } from '../data/classLogsData';
import { MOCK_EDUCATORS } from '../data/educatorsData';
import { MOCK_SCHEDULES_INITIAL_STATE } from '../data/schedulesData';
import { MOCK_SUBJECTS } from '../data/subjectsData';
import { DECLARATION_TEMPLATES_DATA } from '../data/declarationTemplatesData';
import { MOCK_STAFF } from '../data/staffData';
import { useAuth } from './AuthContext';

// FIX: Moved helper functions before their usage to resolve "used before declaration" error.
// Helper to generate avatars
const getInitials = (name: string): string => { if (!name) return '?'; const words = name.trim().split(' ').filter(Boolean); if (words.length > 1) { return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase(); } if (words.length === 1 && words[0].length > 1) { return words[0].substring(0, 2).toUpperCase(); } if (words.length === 1) { return words[0][0].toUpperCase(); } return '?'; };
const stringToColor = (str: string): string => { let hash = 0; if (!str) return '#cccccc'; for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); hash = hash & hash; } let color = '#'; for (let i = 0; i < 3; i++) { const value = (hash >> (i * 8)) & 0xFF; const adjustedValue = 100 + (value % 156); color += ('00' + adjustedValue.toString(16)).substr(-2); } return color; };
const generateAvatar = (name: string): string => { const initials = getInitials(name); const color = stringToColor(name); const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150" fill="${color}"><rect width="100%" height="100%" fill="currentColor" /><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60" fill="#ffffff">${initials}</text></svg>`; return `data:image/svg+xml;base64,${btoa(svg)}`; };

// --- Default Mock Data for missing files ---
const MOCK_LEADS: Lead[] = [];
const MOCK_APPLICANTS: Applicant[] = [];
const MOCK_REENROLLING_STUDENTS: ReEnrollingStudent[] = [];
const MOCK_SCHOOL_INFO: SchoolInfo = {
    name: 'Escola Modelo Aprender Mais',
    cnpj: '12.345.678/0001-99',
    address: 'Rua do Saber, 123, Bairro Educação, Cidade Exemplo, SP, CEP: 12345-678',
    phone: '(11) 4004-1234',
    email: 'contato@escolamodelo.com',
    directorName: 'Dr. João da Silva',
    secretaryName: 'Maria Antônia de Souza',
    logo: '', // Can be updated in settings
};
const MOCK_CRM_OPTIONS = {
    discountPrograms: ['Nenhum', 'Bolsa Padrão (25%)', 'Convênio Empresa (15%)', 'Irmãos (10%)', 'Indicação (5%)']
};
// --- End Default Mock Data ---

interface EnrollmentContextType {
    enrolledStudents: EnrolledStudent[];
    leads: Lead[];
    classes: SchoolClass[];
    applicants: Applicant[];
    reEnrollingStudents: ReEnrollingStudent[];
    academicRecords: any[]; 
    classLogs: ClassLogEntry[];
    educators: Educator[];
    staff: Staff[];
    schedules: AllSchedules;
    subjects: Subject[];
    contacts: Contact[];
    uploadedActivities: Record<number, any[]>;
    signedContracts: any[];
    
    enrollStudentsFromImport: (newStudents: EnrolledStudent[]) => void;
    updateEnrolledStudent: (updatedStudent: EnrolledStudent) => void;
    
    addLead: (newLead: Lead) => void;
    updateLead: (updatedLead: Lead) => void;
    convertLeadToApplicant: (leadId: number) => void;
    
    addSchoolClass: (newClass: Omit<SchoolClass, 'id' | 'students'>) => void;
    updateSchoolClass: (updatedClass: SchoolClass) => void;
    
    updateApplicant: (updatedApplicant: Applicant) => void;
    addManualApplicant: (data: ManualEnrollmentData) => void;
    addExtemporaneousApplicant: (data: NewExtemporaneousData) => void;
    submitPublicEnrollment: (data: any) => void;
    finalizeEnrollment: (applicant: Applicant) => void;
    
    updateStudentAcademicRecord: (record: any) => void;
    
    addClassLog: (log: Omit<ClassLogEntry, 'id'>) => void;
    updateClassLog: (log: ClassLogEntry, editorName?: string) => void;
    deleteClassLog: (logId: number) => void;

    addEducator: (educator: Omit<Educator, 'id'>) => void;
    updateEducator: (educator: Educator) => void;

    addStaff: (staffMember: Omit<Staff, 'id'>) => void;
    updateStaff: (staffMember: Staff) => void;
    
    updateSchedules: (newSchedules: AllSchedules) => void;
    addSubject: (subjectName: string) => Subject;

    addContacts: (newContacts: Contact[]) => void;
    addUploadedActivity: (activity: any, classId: number) => void;
    uploadSignedContract: (studentId: number, file: File, fileUrl: string) => void;
    
    highlightedApplicantId: number | null;
    setHighlightedApplicantId: (id: number | null) => void;

    // School Info
    schoolInfo: SchoolInfo;
    updateSchoolInfo: (info: SchoolInfo) => void;
    
    // CRM Options
    crmOptions: { discountPrograms: string[] };
    updateCrmOptions: (options: { discountPrograms: string[] }) => void;

    // Declaration Templates
    declarationTemplates: DeclarationTemplate[];
    updateDeclarationTemplates: (templates: DeclarationTemplate[]) => void;
}

const EnrollmentContext = createContext<EnrollmentContextType | undefined>(undefined);

// A single hook for school info
export const useSchoolInfo = () => {
    const context = useContext(EnrollmentContext);
    if (!context) throw new Error("useSchoolInfo must be used within an EnrollmentProvider");
    return { schoolInfo: context.schoolInfo, updateSchoolInfo: context.updateSchoolInfo };
}

export const EnrollmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [reEnrollingStudents, setReEnrollingStudents] = useState<ReEnrollingStudent[]>([]);
    const [highlightedApplicantId, setHighlightedApplicantId] = useState<number | null>(null);
    const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(MOCK_SCHOOL_INFO);
    const [crmOptions, setCrmOptions] = useState(MOCK_CRM_OPTIONS);
    const [academicRecords, setAcademicRecords] = useState(Object.values(MOCK_STUDENTS_ACADEMIC).flat());
    const [classLogs, setClassLogs] = useState<ClassLogEntry[]>([]);
    const [educators, setEducators] = useState<Educator[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [schedules, setSchedules] = useState<AllSchedules>({});
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [uploadedActivities, setUploadedActivities] = useState<Record<number, any[]>>({});
    const [signedContracts, setSignedContracts] = useState<any[]>([]);

    const [declarationTemplates, setDeclarationTemplates] = useState<DeclarationTemplate[]>(() => {
        try {
            const saved = localStorage.getItem('declaration_templates');
            return saved ? JSON.parse(saved) : DECLARATION_TEMPLATES_DATA;
        } catch {
            return DECLARATION_TEMPLATES_DATA;
        }
    });

    const updateDeclarationTemplates = (templates: DeclarationTemplate[]) => {
        setDeclarationTemplates(templates);
        localStorage.setItem('declaration_templates', JSON.stringify(templates));
    };

    // Generic function to load from localStorage
    const loadState = <T,>(key: string, mockData: T): T => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : mockData;
        } catch (error) {
            console.warn(`Error reading localStorage key “${key}”:`, error);
            return mockData;
        }
    };

    // UseEffect to load all data from localStorage on initial render
    useEffect(() => {
        const data = loadState('enrollment_data', {
            enrolledStudents: MOCK_ENROLLED_STUDENTS,
            leads: MOCK_LEADS,
            classes: MOCK_CLASSES,
            applicants: MOCK_APPLICANTS,
            reEnrollingStudents: MOCK_REENROLLING_STUDENTS,
            academicRecords: Object.values(MOCK_STUDENTS_ACADEMIC).flat(),
            classLogs: MOCK_CLASS_LOGS,
            educators: MOCK_EDUCATORS,
            staff: MOCK_STAFF,
            schedules: MOCK_SCHEDULES_INITIAL_STATE,
            subjects: MOCK_SUBJECTS,
            contacts: [],
            uploadedActivities: {},
            signedContracts: [],
        });
        setEnrolledStudents(data.enrolledStudents);
        setLeads(data.leads);
        setClasses(data.classes);
        setApplicants(data.applicants);
        setReEnrollingStudents(data.reEnrollingStudents);
        setAcademicRecords(data.academicRecords);
        setClassLogs(data.classLogs);
        setEducators(data.educators);
        setStaff(data.staff);
        setSchedules(data.schedules);
        setSubjects(data.subjects);
        setContacts(data.contacts);
        setUploadedActivities(data.uploadedActivities);
        setSignedContracts(data.signedContracts);

        setSchoolInfo(loadState('schoolInfo', MOCK_SCHOOL_INFO));
        setCrmOptions(loadState('crmOptions', MOCK_CRM_OPTIONS));
    }, []);

    // Filtered data based on user role and unit
    const filteredClasses = useMemo(() => {
        if (user?.role === 'secretary' && user.unit) {
            return classes.filter(c => c.unit === user.unit);
        }
        return classes;
    }, [classes, user]);

    const filteredEnrolledStudents = useMemo(() => {
        if (user?.role === 'secretary' && user.unit) {
            // Secretary sees students from their unit OR unallocated students
            return enrolledStudents.filter(s => s.unit === user.unit || s.classId === -1);
        }
        return enrolledStudents;
    }, [enrolledStudents, user]);
    
    const filteredReEnrollingStudents = useMemo(() => {
        if (user?.role === 'secretary' && user.unit) {
            return reEnrollingStudents.filter(s => s.unit === user.unit);
        }
        return reEnrollingStudents;
    }, [reEnrollingStudents, user]);
    
    const filteredAcademicRecords = useMemo(() => {
        const studentIds = new Set(filteredEnrolledStudents.map(s => s.id));
        return academicRecords.filter(ar => studentIds.has(ar.studentId));
    }, [academicRecords, filteredEnrolledStudents]);


    const value: EnrollmentContextType = {
        enrolledStudents: filteredEnrolledStudents, 
        leads, 
        classes: filteredClasses, 
        applicants, 
        reEnrollingStudents: filteredReEnrollingStudents, 
        highlightedApplicantId, setHighlightedApplicantId, schoolInfo, crmOptions, 
        academicRecords: filteredAcademicRecords, 
        classLogs, educators, staff, schedules, subjects, contacts, uploadedActivities, signedContracts, declarationTemplates, updateDeclarationTemplates,
        enrollStudentsFromImport: (newStudents) => setEnrolledStudents(prev => [...prev, ...newStudents]),
        updateEnrolledStudent: (updated) => setEnrolledStudents(prev => prev.map(s => s.id === updated.id ? updated : s)),
        addLead: (newLead) => setLeads(prev => [...prev, newLead]),
        updateLead: (updated) => setLeads(prev => prev.map(l => l.id === updated.id ? updated : l)),
        convertLeadToApplicant: (leadId) => {
            const lead = leads.find(l => l.id === leadId);
            if (!lead) return;
            const newApplicant: Applicant = { id: Date.now(), name: lead.name, avatar: lead.avatar, status: NewEnrollmentStatus.PENDING_ANALYSIS, submissionDate: new Date().toISOString(), interest: lead.interest, guardians: [], documents: [], dataValidated: false, guardianDataValidated: false, paymentConfirmed: false };
            setApplicants(prev => [newApplicant, ...prev]);
            setLeads(prev => prev.filter(l => l.id !== leadId));
            setHighlightedApplicantId(newApplicant.id);
        },
        addSchoolClass: (newClass) => setClasses(prev => [...prev, { ...newClass, id: Date.now(), students: [] }]),
        updateSchoolClass: (updated) => setClasses(prev => prev.map(c => c.id === updated.id ? updated : c)),
        updateApplicant: (updated) => setApplicants(prev => prev.map(a => a.id === updated.id ? updated : a)),
        addManualApplicant: (data) => {
            const newApplicant: Applicant = { id: Date.now(), name: data.studentName, avatar: generateAvatar(data.studentName), status: NewEnrollmentStatus.READY_TO_FINALIZE, submissionDate: new Date().toISOString(), interest: data.grade, guardians: [data.guardian], address: data.studentAddress, dateOfBirth: data.studentDateOfBirth, documents: data.documents, dataValidated: true, guardianDataValidated: true, paymentConfirmed: data.paymentConfirmed, enrollmentFee: data.enrollmentFee, monthlyFee: data.monthlyFee, discountProgram: data.discountProgram };
            setApplicants(prev => [newApplicant, ...prev]);
        },
        addExtemporaneousApplicant: (data) => {
            const newStudent: EnrolledStudent = { id: Date.now(), name: data.studentName, avatar: generateAvatar(data.studentName), grade: data.grade, className: 'A alocar', classId: -1, unit: user?.unit || SchoolUnit.MATRIZ, status: StudentLifecycleStatus.ACTIVE, financialStatus: 'OK', libraryStatus: 'OK', academicDocsStatus: 'Pendente', originClassName: data.grade, guardians: [{ name: data.guardianName, cpf: '', rg: '', phone: '', email: '' }] };
            setEnrolledStudents(prev => [newStudent, ...prev]);
        },
        submitPublicEnrollment: (data) => {
            const newApplicant: Applicant = { id: Date.now(), name: data.studentName, avatar: generateAvatar(data.studentName), status: NewEnrollmentStatus.PENDING_ANALYSIS, submissionDate: new Date().toISOString(), interest: 'Não informado', guardians: [data.guardian], documents: data.documents.map((d: any) => ({ ...d, status: 'Em Análise', deliveryMethod: 'Digital' })), dataValidated: false, guardianDataValidated: false, paymentConfirmed: false, dateOfBirth: data.dateOfBirth, healthInfo: data.healthInfo };
            setApplicants(prev => [newApplicant, ...prev]);
        },
        finalizeEnrollment: (applicant) => {
            const newStudent: EnrolledStudent = { id: applicant.id, name: applicant.name, avatar: applicant.avatar, grade: applicant.interest || 'Não informado', className: 'A alocar', classId: -1, unit: user?.unit || SchoolUnit.MATRIZ, status: StudentLifecycleStatus.ACTIVE, financialStatus: 'OK', libraryStatus: 'OK', academicDocsStatus: 'OK', dateOfBirth: applicant.dateOfBirth, guardians: applicant.guardians, address: applicant.address, enrollmentFee: applicant.enrollmentFee, monthlyFee: applicant.monthlyFee, discountProgram: applicant.discountProgram };
            setApplicants(prev => prev.map(a => a.id === applicant.id ? { ...a, status: NewEnrollmentStatus.ENROLLED } : a));
            setEnrolledStudents(prev => [...prev, newStudent]);
        },
        updateSchoolInfo: (info) => setSchoolInfo(info),
        updateCrmOptions: (options) => setCrmOptions(prev => ({...prev, ...options})),
        updateStudentAcademicRecord: (record) => setAcademicRecords(prev => prev.map(r => r.studentId === record.studentId ? record : r)),
        addClassLog: (log) => setClassLogs(prev => [{...log, id: Date.now()}, ...prev]),
        updateClassLog: (log, editorName) => setClassLogs(prev => prev.map(l => l.id === log.id ? {...log, lastEditedBy: editorName} : l)),
        deleteClassLog: (logId) => setClassLogs(prev => prev.filter(l => l.id !== logId)),
        addEducator: (educator) => setEducators(prev => [{...educator, id: Date.now()}, ...prev]),
        updateEducator: (educator) => setEducators(prev => prev.map(e => e.id === educator.id ? educator : e)),
        addStaff: (staffMember) => setStaff(prev => [{ ...staffMember, id: Date.now() }, ...prev]),
        updateStaff: (staffMember) => setStaff(prev => prev.map(s => s.id === staffMember.id ? staffMember : s)),
        updateSchedules: (newSchedules) => setSchedules(newSchedules),
        addSubject: (subjectName) => {
            const newSubject: Subject = { id: Date.now(), name: subjectName, color: '#808080', calculationMethod: 'arithmetic', assessments: [] };
            setSubjects(prev => [...prev, newSubject]);
            return newSubject;
        },
        addContacts: (newContacts) => setContacts(prev => {
            const existingPhones = new Set(prev.map(c => c.phone).filter(Boolean));
            const uniqueNewContacts = newContacts.filter(c => !c.phone || !existingPhones.has(c.phone));
            return [...prev, ...uniqueNewContacts];
        }),
        addUploadedActivity: (activity, classId) => {
            const newActivity = { ...activity, id: Date.now(), uploadDate: new Date().toISOString() };
            setUploadedActivities(prev => ({
                ...prev,
                [classId]: [...(prev[classId] || []), newActivity]
            }));
        },
        uploadSignedContract: (studentId, file, fileUrl) => {
            const newContract = { studentId, fileName: file.name, fileUrl, uploadDate: new Date().toISOString() };
            setSignedContracts(prev => [...prev.filter(c => c.studentId !== studentId), newContract]);
        }
    };

    return (
        <EnrollmentContext.Provider value={value}>
            {children}
        </EnrollmentContext.Provider>
    );
};

export const useEnrollment = (): EnrollmentContextType => {
    const context = useContext(EnrollmentContext);
    if (!context) {
        throw new Error('useEnrollment must be used within an EnrollmentProvider');
    }
    return context;
};