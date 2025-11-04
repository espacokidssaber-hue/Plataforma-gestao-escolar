import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import {
    SchoolInfo,
    EnrolledStudent,
    SchoolClass,
    Lead,
    Applicant,
    ManualEnrollmentData,
    NewExtemporaneousData,
    Contact,
    ClassLogEntry,
    Subject,
    UploadedActivity,
    SignedContract,
    LeadStatus,
    NewEnrollmentStatus,
    StudentLifecycleStatus,
    DocumentStatus,
    SchoolUnit
} from '../types';
import { MOCK_ENROLLED_STUDENTS } from '../data/enrolledStudentsData';
import { MOCK_CLASSES } from '../data/classesData';
import { MOCK_SUBJECTS } from '../data/subjectsData';
import { MOCK_CLASS_LOGS } from '../data/classLogsData'; // Assuming this mock file exists or creating it virtually

// --- AVATAR UTILS START ---
const getInitials = (name: string): string => { if (!name) return '?'; const words = name.trim().split(' ').filter(Boolean); if (words.length > 1) { return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase(); } if (words.length === 1 && words[0].length > 1) { return words[0].substring(0, 2).toUpperCase(); } if (words.length === 1) { return words[0][0].toUpperCase(); } return '?'; };
const stringToColor = (str: string): string => { let hash = 0; if (!str) return '#cccccc'; for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); hash = hash & hash; } let color = '#'; for (let i = 0; i < 3; i++) { const value = (hash >> (i * 8)) & 0xFF; const adjustedValue = 100 + (value % 156); color += ('00' + adjustedValue.toString(16)).substr(-2); } return color; };
const generateAvatar = (name: string): string => { const initials = getInitials(name); const color = stringToColor(name); const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150" fill="${color}"><rect width="100%" height="100%" fill="currentColor" /><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60" fill="#ffffff">${initials}</text></svg>`; return `data:image/svg+xml;base64,${btoa(svg)}`; };
// --- AVATAR UTILS END ---

const MOCK_LEADS: Lead[] = [
    { id: 1, name: 'João Silva (Filho)', avatar: generateAvatar('João Silva'), status: LeadStatus.NEW, source: 'Indicação', interest: '1º Ano', lastContact: '2023-10-25', nextAction: 'Ligar para apresentar a escola' },
    { id: 2, name: 'Maria Eduarda (Filha)', avatar: generateAvatar('Maria Eduarda'), status: LeadStatus.CONTACTED, source: 'Google', interest: 'Infantil III', lastContact: '2023-10-26', nextAction: 'Agendar visita' },
];

const MOCK_APPLICANTS: Applicant[] = [
    { id: 101, name: 'Laura Mendes', avatar: generateAvatar('Laura Mendes'), submissionDate: '2023-10-20', status: NewEnrollmentStatus.PENDING_ANALYSIS, documents: [], guardians: [], healthInfo: { allergies: '', medications: '', emergencyContactName: '', emergencyContactPhone: '' }, dataValidated: false, guardianDataValidated: false, paymentConfirmed: false },
    { id: 102, name: 'Pedro Alves', avatar: generateAvatar('Pedro Alves'), submissionDate: '2023-10-18', status: NewEnrollmentStatus.AWAITING_PAYMENT, documents: [], guardians: [], healthInfo: { allergies: '', medications: '', emergencyContactName: '', emergencyContactPhone: '' }, dataValidated: true, guardianDataValidated: true, paymentConfirmed: false },
];

interface EnrollmentContextType {
    schoolInfo: SchoolInfo;
    matrizInfo: SchoolInfo | null;
    enrolledStudents: EnrolledStudent[];
    updateEnrolledStudent: (student: EnrolledStudent) => void;
    enrollStudentsFromImport: (students: EnrolledStudent[]) => void;
    classes: SchoolClass[];
    addSchoolClass: (schoolClass: Omit<SchoolClass, 'id'|'students'>) => void;
    updateSchoolClass: (schoolClass: SchoolClass) => void;
    leads: Lead[];
    addLead: (lead: Lead) => void;
    updateLead: (lead: Lead) => void;
    convertLeadToApplicant: (leadId: number) => void;
    applicants: Applicant[];
    addManualApplicant: (data: ManualEnrollmentData) => void;
    submitPublicEnrollment: (data: any) => void;
    updateApplicant: (applicant: Applicant) => void;
    finalizeEnrollment: (applicant: Applicant) => void;
    highlightedApplicantId: number | null;
    setHighlightedApplicantId: (id: number | null) => void;
    addExtemporaneousApplicant: (data: NewExtemporaneousData) => void;
    contacts: Contact[];
    addContacts: (newContacts: Contact[]) => void;
    classLogs: ClassLogEntry[];
    addClassLog: (log: Omit<ClassLogEntry, 'id'>) => void;
    updateClassLog: (log: ClassLogEntry) => void;
    deleteClassLog: (logId: number) => void;
    subjects: Subject[];
    addSubject: (subjectName: string) => Subject;
    uploadedActivities: Record<number, UploadedActivity[]>;
    addUploadedActivity: (activity: Omit<UploadedActivity, 'id' | 'classId' | 'uploadDate'>, classId: number) => void;
    signedContracts: SignedContract[];
    uploadSignedContract: (studentId: number, file: File, fileUrl: string) => void;
}

const EnrollmentContext = createContext<EnrollmentContextType | undefined>(undefined);

export const EnrollmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // A simple function to get data from localStorage or return a default
    const getInitialState = <T,>(key: string, defaultValue: T): T => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : defaultValue;
        } catch {
            return defaultValue;
        }
    };

    const [schoolInfo] = useState<SchoolInfo>(() => getInitialState<SchoolInfo>('schoolInfo', { name: 'Escola Modelo', cnpj: '00.000.000/0001-00', address: 'Rua Exemplo, 123', phone: '(00) 0000-0000', email: 'contato@escola.com', directorName: 'Diretor(a) Exemplo', secretaryName: 'Secretário(a) Exemplo' }));
    const [matrizInfo] = useState<SchoolInfo | null>(() => getInitialState<SchoolInfo | null>('matrizInfo', null));
    
    const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>(() => getInitialState('enrolledStudents', MOCK_ENROLLED_STUDENTS));
    const [classes, setClasses] = useState<SchoolClass[]>(() => getInitialState('classes', MOCK_CLASSES));
    const [leads, setLeads] = useState<Lead[]>(() => getInitialState('leads', MOCK_LEADS));
    const [applicants, setApplicants] = useState<Applicant[]>(() => getInitialState('applicants', MOCK_APPLICANTS));
    const [contacts, setContacts] = useState<Contact[]>(() => getInitialState('contacts', []));
    const [classLogs, setClassLogs] = useState<ClassLogEntry[]>(() => getInitialState('classLogs', MOCK_CLASS_LOGS));
    const [subjects, setSubjects] = useState<Subject[]>(() => getInitialState('subjects', MOCK_SUBJECTS));
    const [uploadedActivities, setUploadedActivities] = useState<Record<number, UploadedActivity[]>>(() => getInitialState('uploadedActivities', {}));
    const [signedContracts, setSignedContracts] = useState<SignedContract[]>(() => getInitialState('signedContracts', []));
    const [highlightedApplicantId, setHighlightedApplicantId] = useState<number | null>(null);

    // Save state to localStorage on change
    useEffect(() => { localStorage.setItem('enrolledStudents', JSON.stringify(enrolledStudents)); }, [enrolledStudents]);
    useEffect(() => { localStorage.setItem('classes', JSON.stringify(classes)); }, [classes]);
    useEffect(() => { localStorage.setItem('leads', JSON.stringify(leads)); }, [leads]);
    useEffect(() => { localStorage.setItem('applicants', JSON.stringify(applicants)); }, [applicants]);
    useEffect(() => { localStorage.setItem('contacts', JSON.stringify(contacts)); }, [contacts]);
    useEffect(() => { localStorage.setItem('classLogs', JSON.stringify(classLogs)); }, [classLogs]);
    useEffect(() => { localStorage.setItem('subjects', JSON.stringify(subjects)); }, [subjects]);
    useEffect(() => { localStorage.setItem('uploadedActivities', JSON.stringify(uploadedActivities)); }, [uploadedActivities]);
    useEffect(() => { localStorage.setItem('signedContracts', JSON.stringify(signedContracts)); }, [signedContracts]);

    const updateEnrolledStudent = (student: EnrolledStudent) => setEnrolledStudents(prev => prev.map(s => s.id === student.id ? student : s));
    const enrollStudentsFromImport = (newStudents: EnrolledStudent[]) => setEnrolledStudents(prev => [...prev, ...newStudents]);
    
    const addSchoolClass = (data: Omit<SchoolClass, 'id'|'students'>) => setClasses(prev => [...prev, { ...data, id: Date.now(), students: [] }]);
    const updateSchoolClass = (schoolClass: SchoolClass) => setClasses(prev => prev.map(c => c.id === schoolClass.id ? schoolClass : c));

    const addLead = (lead: Lead) => setLeads(prev => [lead, ...prev]);
    const updateLead = (lead: Lead) => setLeads(prev => prev.map(l => l.id === lead.id ? lead : l));
    const convertLeadToApplicant = (leadId: number) => {
        const lead = leads.find(l => l.id === leadId);
        if (lead) {
            const newApplicant: Applicant = {
                id: Date.now(),
                name: lead.name,
                avatar: lead.avatar,
                submissionDate: new Date().toISOString(),
                status: NewEnrollmentStatus.PENDING_ANALYSIS,
                documents: [],
                guardians: [],
                healthInfo: { allergies: '', medications: '', emergencyContactName: '', emergencyContactPhone: '' },
                dataValidated: false,
                guardianDataValidated: false,
                paymentConfirmed: false,
                discountProgram: lead.discountProgram
            };
            setApplicants(prev => [newApplicant, ...prev]);
            setLeads(prev => prev.filter(l => l.id !== leadId));
            setHighlightedApplicantId(newApplicant.id);
        }
    };
    
    const updateApplicant = (applicant: Applicant) => setApplicants(prev => prev.map(a => a.id === applicant.id ? applicant : a));
    
    const addManualApplicant = (data: ManualEnrollmentData) => {
        const newApplicant: Applicant = {
            id: Date.now(),
            name: data.studentName,
            avatar: generateAvatar(data.studentName),
            submissionDate: new Date().toISOString(),
            status: NewEnrollmentStatus.READY_TO_FINALIZE,
            documents: data.documents.map(d => ({...d, deliveryMethod: d.deliveryMethod, status: d.status})),
            guardians: [data.guardian],
            healthInfo: data.healthInfo,
            dataValidated: true,
            guardianDataValidated: true,
            paymentConfirmed: data.paymentConfirmed,
            paymentMethod: data.paymentMethod,
            discountProgram: data.discountProgram,
            dateOfBirth: data.studentDateOfBirth,
            address: data.studentAddress,
            enrollmentFee: data.enrollmentFee,
            monthlyFee: data.monthlyFee,
        };
        setApplicants(prev => [newApplicant, ...prev]);
    };
    
    const submitPublicEnrollment = (data: any) => {
        const newApplicant: Applicant = {
            id: Date.now(),
            name: data.studentName,
            avatar: generateAvatar(data.studentName),
            submissionDate: new Date().toISOString(),
            status: NewEnrollmentStatus.PENDING_ANALYSIS,
            documents: data.documents.map((d: any) => ({ name: d.name, fileUrl: d.fileUrl, status: DocumentStatus.ANALYSIS, deliveryMethod: 'Digital' })),
            guardians: [data.guardian],
            healthInfo: data.healthInfo,
            dataValidated: false,
            guardianDataValidated: false,
            paymentConfirmed: false
        };
        setApplicants(prev => [newApplicant, ...prev]);
    };

    const finalizeEnrollment = (applicant: Applicant) => {
        const newStudent: EnrolledStudent = {
            id: Date.now(),
            name: applicant.name,
            avatar: applicant.avatar,
            grade: 'A definir', // Requires class selection
            className: 'A alocar',
            classId: -1,
            unit: SchoolUnit.MATRIZ, // Default
            status: StudentLifecycleStatus.ACTIVE,
            financialStatus: 'OK',
            libraryStatus: 'OK',
            academicDocsStatus: 'OK',
            dateOfBirth: applicant.dateOfBirth,
            guardians: applicant.guardians,
            address: applicant.address,
            enrollmentFee: applicant.enrollmentFee,
            monthlyFee: applicant.monthlyFee,
        };
        setEnrolledStudents(prev => [newStudent, ...prev]);
        setApplicants(prev => prev.map(a => a.id === applicant.id ? { ...a, status: NewEnrollmentStatus.ENROLLED } : a));
    };

    const addExtemporaneousApplicant = (data: NewExtemporaneousData) => {
        const newStudent: EnrolledStudent = {
            id: Date.now(),
            name: data.studentName,
            avatar: generateAvatar(data.studentName),
            grade: data.grade,
            className: 'A alocar',
            classId: -1,
            unit: SchoolUnit.MATRIZ,
            status: StudentLifecycleStatus.ACTIVE,
            financialStatus: 'OK',
            libraryStatus: 'OK',
            academicDocsStatus: 'Pendente',
            guardians: [{ name: data.guardianName, cpf: '', rg: '', phone: '', email: '' }],
        };
        setEnrolledStudents(prev => [newStudent, ...prev]);
    };

    const addContacts = (newContacts: Contact[]) => {
        setContacts(prev => {
            const existingPhones = new Set(prev.map(c => c.phone));
            const uniqueNewContacts = newContacts.filter(c => c.phone && !existingPhones.has(c.phone));
            return [...prev, ...uniqueNewContacts];
        });
    };
    
    const addClassLog = (log: Omit<ClassLogEntry, 'id'>) => setClassLogs(prev => [{ ...log, id: Date.now() }, ...prev]);
    const updateClassLog = (log: ClassLogEntry) => setClassLogs(prev => prev.map(l => l.id === log.id ? log : l));
    const deleteClassLog = (logId: number) => setClassLogs(prev => prev.filter(l => l.id !== logId));

    const addSubject = (subjectName: string): Subject => {
        const newSubject: Subject = {
            id: Date.now(),
            name: subjectName,
            color: stringToColor(subjectName),
            calculationMethod: 'arithmetic',
            assessments: [],
        };
        setSubjects(prev => [...prev, newSubject]);
        return newSubject;
    };
    
    const addUploadedActivity = (activity: Omit<UploadedActivity, 'id' | 'classId' | 'uploadDate'>, classId: number) => {
        const newActivity: UploadedActivity = {
            ...activity,
            id: Date.now(),
            classId,
            uploadDate: new Date().toISOString(),
        };
        setUploadedActivities(prev => {
            const newActivities = { ...prev };
            if (!newActivities[classId]) {
                newActivities[classId] = [];
            }
            newActivities[classId].push(newActivity);
            return newActivities;
        });
    };

    const uploadSignedContract = (studentId: number, file: File, fileUrl: string) => {
        const newContract: SignedContract = {
            studentId,
            fileUrl,
            fileName: file.name,
            uploadDate: new Date().toISOString(),
        };
        setSignedContracts(prev => [...prev.filter(c => c.studentId !== studentId), newContract]);
    };

    const value = {
        schoolInfo,
        matrizInfo,
        enrolledStudents,
        updateEnrolledStudent,
        enrollStudentsFromImport,
        classes,
        addSchoolClass,
        updateSchoolClass,
        leads,
        addLead,
        updateLead,
        convertLeadToApplicant,
        applicants,
        addManualApplicant,
        submitPublicEnrollment,
        updateApplicant,
        finalizeEnrollment,
        highlightedApplicantId,
        setHighlightedApplicantId,
        addExtemporaneousApplicant,
        contacts,
        addContacts,
        classLogs,
        addClassLog,
        updateClassLog,
        deleteClassLog,
        subjects,
        addSubject,
        uploadedActivities,
        addUploadedActivity,
        signedContracts,
        uploadSignedContract
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

// A separate hook for just schoolInfo to avoid re-rendering components that only need that.
export const useSchoolInfo = () => {
    const context = useContext(EnrollmentContext);
    if (!context) {
        throw new Error('useSchoolInfo must be used within an EnrollmentProvider');
    }
    return { schoolInfo: context.schoolInfo, matrizInfo: context.matrizInfo };
};
