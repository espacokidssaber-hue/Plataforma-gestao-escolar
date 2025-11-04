import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import {
    SchoolInfo, EnrolledStudent, SchoolClass, Lead, Applicant, ManualEnrollmentData,
    NewExtemporaneousData, Contact, ClassLogEntry, Subject, UploadedActivity,
    SignedContract, LeadStatus, NewEnrollmentStatus, StudentLifecycleStatus,
    DocumentStatus, SchoolUnit
} from '../types';
import { MOCK_SUBJECTS } from '../data/subjectsData';
import { MOCK_CLASS_LOGS } from '../data/classLogsData';

// ==================================================================================
// DATA VERSIONING AND MIGRATION
// ==================================================================================

const CURRENT_DATA_VERSION = "1.2.0"; // New version for duplicate prevention logic

interface AppData {
    schoolInfo: SchoolInfo;
    matrizInfo: SchoolInfo | null;
    enrolledStudents: EnrolledStudent[];
    classes: SchoolClass[];
    leads: Lead[];
    applicants: Applicant[];
    contacts: Contact[];
    classLogs: ClassLogEntry[];
    subjects: Subject[];
    uploadedActivities: Record<number, UploadedActivity[]>;
    signedContracts: SignedContract[];
    crmOptions: { discountPrograms: string[] };
    declarationTemplates: any[]; // Assuming type, can be defined
}

// Function to get a unique identifier for a student
const getStudentIdentifier = (student: { name: string, dateOfBirth?: string }): string => {
    const normalizedName = (student.name || '').trim().toLowerCase();
    const dob = student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '';
    return `${normalizedName}|${dob}`;
};


const migrateData = (data: any): AppData => {
    // This is where you would handle migrations from older versions
    console.log(`Data version is ${data.version}. Current version is ${CURRENT_DATA_VERSION}. No migration needed.`);
    return data.data;
};

const getInitialData = (): AppData => {
    const storedDataJSON = localStorage.getItem('enrollment_data');
    if (storedDataJSON) {
        try {
            const storedData = JSON.parse(storedDataJSON);
            if (storedData.version === CURRENT_DATA_VERSION) {
                return storedData.data;
            } else {
                console.warn(`Data version mismatch. Found ${storedData.version}, expected ${CURRENT_DATA_VERSION}.`);
                return migrateData(storedData);
            }
        } catch (e) {
            console.error("Failed to parse enrollment_data from localStorage, resetting to default.", e);
        }
    }

    // Default initial state for a fresh install (NO MOCK DATA)
    return {
        schoolInfo: { name: 'Escola Modelo', cnpj: '00.000.000/0001-00', address: 'Rua Exemplo, 123', phone: '(00) 0000-0000', email: 'contato@escola.com', directorName: 'Diretor(a) Exemplo', secretaryName: 'Secretário(a) Exemplo' },
        matrizInfo: null,
        enrolledStudents: [],
        classes: [],
        leads: [],
        applicants: [],
        contacts: [],
        classLogs: [],
        subjects: MOCK_SUBJECTS, // Keep subjects as a base configuration
        uploadedActivities: {},
        signedContracts: [],
        crmOptions: { discountPrograms: ['Nenhum', 'Bolsa Padrão (25%)', 'Convênio Empresa (15%)', 'Irmãos (10%)', 'Indicação (5%)'] },
        declarationTemplates: [
            { id: 1, name: 'Declaração de Matrícula' },
            { id: 2, name: 'Declaração de Conclusão' },
        ],
    };
};


// --- AVATAR UTILS START ---
const getInitials = (name: string): string => { if (!name) return '?'; const words = name.trim().split(' ').filter(Boolean); if (words.length > 1) { return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase(); } if (words.length === 1 && words[0].length > 1) { return words[0].substring(0, 2).toUpperCase(); } if (words.length === 1) { return words[0][0].toUpperCase(); } return '?'; };
const stringToColor = (str: string): string => { let hash = 0; if (!str) return '#cccccc'; for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); hash = hash & hash; } let color = '#'; for (let i = 0; i < 3; i++) { const value = (hash >> (i * 8)) & 0xFF; const adjustedValue = 100 + (value % 156); color += ('00' + adjustedValue.toString(16)).substr(-2); } return color; };
const generateAvatar = (name: string): string => { const initials = getInitials(name); const color = stringToColor(name); const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150" fill="${color}"><rect width="100%" height="100%" fill="currentColor" /><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60" fill="#ffffff">${initials}</text></svg>`; return `data:image/svg+xml;base64,${btoa(svg)}`; };
// --- AVATAR UTILS END ---


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
    const [appData, setAppData] = useState<AppData>(getInitialData);

    // Save consolidated state to localStorage on any change
    useEffect(() => {
        const versionedData = {
            version: CURRENT_DATA_VERSION,
            data: appData
        };
        localStorage.setItem('enrollment_data', JSON.stringify(versionedData));
    }, [appData]);
    
    const [highlightedApplicantId, setHighlightedApplicantId] = useState<number | null>(null);

    // --- State Update Functions ---
    const updateEnrolledStudent = (student: EnrolledStudent) => setAppData(prev => ({ ...prev, enrolledStudents: prev.enrolledStudents.map(s => s.id === student.id ? student : s) }));
    
    const enrollStudentsFromImport = (newStudents: EnrolledStudent[]) => {
        const existingIdentifiers = new Set(appData.enrolledStudents.map(getStudentIdentifier));
        const uniqueNewStudents = newStudents.filter(s => !existingIdentifiers.has(getStudentIdentifier(s)));
        const skippedCount = newStudents.length - uniqueNewStudents.length;

        setAppData(prev => ({
            ...prev,
            enrolledStudents: [...prev.enrolledStudents, ...uniqueNewStudents]
        }));
        
        if(skippedCount > 0) {
            alert(`${skippedCount} aluno(s) foram ignorados por já estarem cadastrados (mesmo nome e data de nascimento).`);
        }
    };
    
    const addSchoolClass = (data: Omit<SchoolClass, 'id'|'students'>) => setAppData(prev => ({ ...prev, classes: [...prev.classes, { ...data, id: Date.now(), students: [] }] }));
    const updateSchoolClass = (schoolClass: SchoolClass) => setAppData(prev => ({ ...prev, classes: prev.classes.map(c => c.id === schoolClass.id ? schoolClass : c) }));

    const addLead = (lead: Lead) => setAppData(prev => ({ ...prev, leads: [lead, ...prev.leads] }));
    const updateLead = (lead: Lead) => setAppData(prev => ({ ...prev, leads: prev.leads.map(l => l.id === lead.id ? lead : l) }));
    
    const convertLeadToApplicant = (leadId: number) => {
        const lead = appData.leads.find(l => l.id === leadId);
        if (lead) {
            const newApplicant: Applicant = {
                id: Date.now(), name: lead.name, avatar: lead.avatar, submissionDate: new Date().toISOString(),
                status: NewEnrollmentStatus.PENDING_ANALYSIS, documents: [], guardians: [], healthInfo: { allergies: '', medications: '', emergencyContactName: '', emergencyContactPhone: '' },
                dataValidated: false, guardianDataValidated: false, paymentConfirmed: false, discountProgram: lead.discountProgram
            };
            setAppData(prev => ({ ...prev, applicants: [newApplicant, ...prev.applicants], leads: prev.leads.filter(l => l.id !== leadId) }));
            setHighlightedApplicantId(newApplicant.id);
        }
    };
    
    const updateApplicant = (applicant: Applicant) => setAppData(prev => ({ ...prev, applicants: prev.applicants.map(a => a.id === applicant.id ? applicant : a) }));
    
    const addManualApplicant = (data: ManualEnrollmentData) => {
        const newApplicant: Applicant = {
            id: Date.now(), name: data.studentName, avatar: generateAvatar(data.studentName), submissionDate: new Date().toISOString(),
            status: NewEnrollmentStatus.READY_TO_FINALIZE, documents: data.documents.map(d => ({ ...d })), guardians: [data.guardian],
            healthInfo: data.healthInfo, dataValidated: true, guardianDataValidated: true, paymentConfirmed: data.paymentConfirmed,
            paymentMethod: data.paymentMethod, discountProgram: data.discountProgram, dateOfBirth: data.studentDateOfBirth,
            address: data.studentAddress, enrollmentFee: data.enrollmentFee, monthlyFee: data.monthlyFee,
        };
        setAppData(prev => ({ ...prev, applicants: [newApplicant, ...prev.applicants] }));
    };
    
    const submitPublicEnrollment = (data: any) => {
        const existingIdentifiers = new Set(appData.enrolledStudents.map(s => getStudentIdentifier(s)));
        if (existingIdentifiers.has(getStudentIdentifier({ name: data.studentName, dateOfBirth: data.dateOfBirth }))) {
            throw new Error('Já existe um aluno matriculado com este nome e data de nascimento.');
        }

        const newApplicant: Applicant = {
            id: Date.now(), name: data.studentName, avatar: generateAvatar(data.studentName), submissionDate: new Date().toISOString(),
            status: NewEnrollmentStatus.PENDING_ANALYSIS, documents: data.documents.map((d: any) => ({ name: d.name, fileUrl: d.fileUrl, status: DocumentStatus.ANALYSIS, deliveryMethod: 'Digital' })),
            guardians: [data.guardian], healthInfo: data.healthInfo, dataValidated: false, guardianDataValidated: false, paymentConfirmed: false, dateOfBirth: data.dateOfBirth
        };
        setAppData(prev => ({ ...prev, applicants: [newApplicant, ...prev.applicants] }));
    };

    const finalizeEnrollment = (applicant: Applicant) => {
        const existingIdentifiers = new Set(appData.enrolledStudents.map(s => getStudentIdentifier(s)));
        if (existingIdentifiers.has(getStudentIdentifier({ name: applicant.name, dateOfBirth: applicant.dateOfBirth }))) {
             throw new Error('Já existe um aluno matriculado com este nome e data de nascimento.');
        }

        const newStudent: EnrolledStudent = {
            id: Date.now(), name: applicant.name, avatar: applicant.avatar, grade: 'A definir', className: 'A alocar', classId: -1,
            unit: SchoolUnit.MATRIZ, status: StudentLifecycleStatus.ACTIVE, financialStatus: 'OK', libraryStatus: 'OK', academicDocsStatus: 'OK',
            dateOfBirth: applicant.dateOfBirth, guardians: applicant.guardians, address: applicant.address,
            enrollmentFee: applicant.enrollmentFee, monthlyFee: applicant.monthlyFee,
        };
        
        setAppData(prev => ({
            ...prev,
            enrolledStudents: [newStudent, ...prev.enrolledStudents],
            applicants: prev.applicants.map(a => a.id === applicant.id ? { ...a, status: NewEnrollmentStatus.ENROLLED } : a)
        }));
    };

    const addExtemporaneousApplicant = (data: NewExtemporaneousData) => {
        const existingIdentifier = getStudentIdentifier({name: data.studentName});
        const existingStudent = appData.enrolledStudents.find(s => getStudentIdentifier(s) === existingIdentifier);
        if (existingStudent) {
            if (!window.confirm(`Já existe um aluno chamado ${data.studentName}. Deseja criar um novo cadastro mesmo assim?`)) {
                return;
            }
        }
        
        const newStudent: EnrolledStudent = {
            id: Date.now(), name: data.studentName, avatar: generateAvatar(data.studentName), grade: data.grade, className: 'A alocar', classId: -1,
            unit: SchoolUnit.MATRIZ, status: StudentLifecycleStatus.ACTIVE, financialStatus: 'OK', libraryStatus: 'OK', academicDocsStatus: 'Pendente',
            guardians: [{ name: data.guardianName, cpf: '', rg: '', phone: '', email: '' }],
        };
        setAppData(prev => ({ ...prev, enrolledStudents: [newStudent, ...prev.enrolledStudents] }));
    };

    const addContacts = (newContacts: Contact[]) => {
        setAppData(prev => {
            const existingPhones = new Set(prev.contacts.map(c => c.phone));
            const uniqueNewContacts = newContacts.filter(c => c.phone && !existingPhones.has(c.phone));
            return { ...prev, contacts: [...prev.contacts, ...uniqueNewContacts] };
        });
    };
    
    const addClassLog = (log: Omit<ClassLogEntry, 'id'>) => setAppData(prev => ({ ...prev, classLogs: [{ ...log, id: Date.now() }, ...prev.classLogs]}));
    const updateClassLog = (log: ClassLogEntry) => setAppData(prev => ({ ...prev, classLogs: prev.classLogs.map(l => l.id === log.id ? log : l)}));
    const deleteClassLog = (logId: number) => setAppData(prev => ({...prev, classLogs: prev.classLogs.filter(l => l.id !== logId)}));

    const addSubject = (subjectName: string): Subject => {
        const newSubject: Subject = {
            id: Date.now(), name: subjectName, color: stringToColor(subjectName),
            calculationMethod: 'arithmetic', assessments: [],
        };
        setAppData(prev => ({...prev, subjects: [...prev.subjects, newSubject]}));
        return newSubject;
    };
    
    const addUploadedActivity = (activity: Omit<UploadedActivity, 'id' | 'classId' | 'uploadDate'>, classId: number) => {
        const newActivity: UploadedActivity = { ...activity, id: Date.now(), classId, uploadDate: new Date().toISOString() };
        setAppData(prev => {
            const newActivities = { ...prev.uploadedActivities };
            if (!newActivities[classId]) newActivities[classId] = [];
            newActivities[classId].push(newActivity);
            return { ...prev, uploadedActivities: newActivities };
        });
    };

    const uploadSignedContract = (studentId: number, file: File, fileUrl: string) => {
        const newContract: SignedContract = { studentId, fileUrl, fileName: file.name, uploadDate: new Date().toISOString() };
        setAppData(prev => ({ ...prev, signedContracts: [...prev.signedContracts.filter(c => c.studentId !== studentId), newContract]}));
    };

    const value = {
        ...appData,
        updateEnrolledStudent, enrollStudentsFromImport, addSchoolClass, updateSchoolClass, addLead, updateLead,
        convertLeadToApplicant, addManualApplicant, submitPublicEnrollment, updateApplicant, finalizeEnrollment,
        highlightedApplicantId, setHighlightedApplicantId, addExtemporaneousApplicant, addContacts,
        addClassLog, updateClassLog, deleteClassLog, addSubject, addUploadedActivity, uploadSignedContract
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

export const useSchoolInfo = () => {
    const context = useContext(EnrollmentContext);
    if (!context) {
        throw new Error('useSchoolInfo must be used within an EnrollmentProvider');
    }
    return { schoolInfo: context.schoolInfo, matrizInfo: context.matrizInfo };
};