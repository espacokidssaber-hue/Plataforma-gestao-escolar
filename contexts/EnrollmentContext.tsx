import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { 
    Lead, LeadStatus, Applicant, NewEnrollmentStatus, EnrolledStudent, StudentLifecycleStatus, SchoolClass, ClassPeriod, SchoolUnit, ManualEnrollmentData, NewExtemporaneousData, Contact, UploadedActivity, ClassLogEntry, 
// FIX: Import DocumentStatus enum to use its members directly.
DocumentStatus, 
Subject,
SignedContract
} from '../types';
import { MOCK_CLASSES } from '../data/classesData';
import { MOCK_SUBJECTS } from '../data/subjectsData';
import { MOCK_ENROLLED_STUDENTS } from '../data/enrolledStudentsData';

// --- AVATAR UTILS START ---
const getInitials = (name: string): string => { if (!name) return '?'; const words = name.trim().split(' ').filter(Boolean); if (words.length > 1) { return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase(); } if (words.length === 1 && words[0].length > 1) { return words[0].substring(0, 2).toUpperCase(); } if (words.length === 1) { return words[0][0].toUpperCase(); } return '?'; };
const stringToColor = (str: string): string => { let hash = 0; if (!str) return '#cccccc'; for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); hash = hash & hash; } let color = '#'; for (let i = 0; i < 3; i++) { const value = (hash >> (i * 8)) & 0xFF; const adjustedValue = 100 + (value % 156); color += ('00' + adjustedValue.toString(16)).substr(-2); } return color; };
const generateAvatar = (name: string): string => { const initials = getInitials(name); const color = stringToColor(name); const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150" fill="${color}"><rect width="100%" height="100%" fill="currentColor" /><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60" fill="#ffffff">${initials}</text></svg>`; return `data:image/svg+xml;base64,${btoa(svg)}`; };
// --- AVATAR UTILS END ---

// --- MOCK DATA ---
const MOCK_LEADS: Lead[] = [
    { id: 1, name: 'Alice Braga', avatar: generateAvatar('Alice Braga'), status: LeadStatus.NEW, source: 'Instagram', interest: 'Infantil II', lastContact: '2023-11-01', nextAction: 'Ligar para apresentar a escola' },
    { id: 2, name: 'Bento Ribeiro', avatar: generateAvatar('Bento Ribeiro'), status: LeadStatus.CONTACTED, source: 'Indicação', interest: '1º Ano', lastContact: '2023-11-02', nextAction: 'Agendar visita' },
    { id: 3, name: 'Clara Nunes', avatar: generateAvatar('Clara Nunes'), status: LeadStatus.VISIT_SCHEDULED, source: 'Google', interest: '2º Ano', lastContact: '2023-10-30', nextAction: 'Realizar visita em 05/11' },
    { id: 4, name: 'Dante Oliveira', avatar: generateAvatar('Dante Oliveira'), status: LeadStatus.NEGOTIATION, source: 'Fachada', interest: '1º Ano', lastContact: '2023-11-03', nextAction: 'Enviar proposta financeira', discountProgram: 'Irmãos (10%)' },
];

const MOCK_APPLICANTS: Applicant[] = [
    { 
        id: 101, 
        name: 'Elisa Fernandes', 
        avatar: generateAvatar('Elisa Fernandes'), 
        submissionDate: '2023-11-02', 
        status: NewEnrollmentStatus.PENDING_ANALYSIS,
        documents: [
            // FIX: Use DocumentStatus enum members instead of string literals.
            { name: 'Certidão de Nascimento', status: DocumentStatus.ANALYSIS, deliveryMethod: 'Digital', fileUrl: '#' },
            { name: 'Comprovante de Residência', status: DocumentStatus.ANALYSIS, deliveryMethod: 'Digital', fileUrl: '#' },
            { name: 'CPF do Responsável', status: DocumentStatus.PENDING, deliveryMethod: 'Pendente' },
        ],
        guardians: [{ name: 'Mariana Fernandes', cpf: '123.456.789-00', rg: '', phone: '11987654321', email: 'mariana@email.com' }],
        healthInfo: { allergies: 'Nenhuma', medications: 'Nenhum', emergencyContactName: 'Carlos Fernandes', emergencyContactPhone: '11912345678' },
        dataValidated: false,
        guardianDataValidated: false,
        paymentConfirmed: false,
    }
];

const MOCK_CLASS_LOGS: ClassLogEntry[] = [
    { id: 1, classId: 2, date: '2025-02-11', subject: 'Português', content: 'Aula de boas-vindas. Apresentação do plano de aula para o semestre e dinâmicas em grupo para integração da turma.' },
    { id: 2, classId: 2, date: '2025-02-12', subject: 'Matemática', content: 'Revisão das quatro operações básicas. Atividades diagnósticas para avaliar o nível da turma.' },
    { id: 3, classId: 3, date: '2025-02-11', subject: 'Artes', content: 'Desenho livre com o tema "Minhas Férias". Uso de giz de cera e lápis de cor.' },
];


interface EnrollmentContextType {
    leads: Lead[];
    addLead: (lead: Lead) => void;
    updateLead: (updatedLead: Lead) => void;
    convertLeadToApplicant: (leadId: number) => void;
    
    applicants: Applicant[];
    addManualApplicant: (data: ManualEnrollmentData) => void;
    addExtemporaneousApplicant: (data: NewExtemporaneousData) => void;
    updateApplicant: (updatedApplicant: Applicant) => void;
    highlightedApplicantId: number | null;
    setHighlightedApplicantId: (id: number | null) => void;
    submitPublicEnrollment: (data: any) => void;

    enrolledStudents: EnrolledStudent[];
    enrollStudentsFromImport: (students: EnrolledStudent[]) => void;
    updateEnrolledStudent: (student: EnrolledStudent) => void;

    classes: SchoolClass[];
    addSchoolClass: (schoolClass: SchoolClass) => void;
    updateSchoolClass: (updatedSchoolClass: SchoolClass) => void;
    enrollStudentInClass: (student: any, classId: number) => void;
    removeStudentFromClass: (studentId: number, classId: number) => EnrolledStudent | null;

    contacts: Contact[];
    addContacts: (newContacts: Contact[]) => void;
    
    uploadedActivities: Record<number, UploadedActivity[]>;
    addUploadedActivity: (activity: Omit<UploadedActivity, 'id'|'classId'|'uploadDate'>, classId: number) => void;
    
    classLogs: ClassLogEntry[];
    addClassLog: (log: Omit<ClassLogEntry, 'id'>) => void;
    updateClassLog: (log: ClassLogEntry) => void;
    deleteClassLog: (logId: number) => void;
    
    subjects: Subject[];
    addSubject: (subjectName: string) => Subject;
    
    signedContracts: SignedContract[];
    uploadSignedContract: (studentId: number, file: File, fileUrl: string) => void;

    restoreBackup: (backupData: any) => void;
}

const EnrollmentContext = createContext<EnrollmentContextType | undefined>(undefined);

// Helper to get from local storage
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key ${key}:`, error);
        return defaultValue;
    }
};

export const EnrollmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [leads, setLeads] = useState<Lead[]>(() => getFromStorage('enrollment_leads', MOCK_LEADS));
    const [applicants, setApplicants] = useState<Applicant[]>(() => getFromStorage('enrollment_applicants', MOCK_APPLICANTS));
    const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>(() => getFromStorage('enrollment_enrolledStudents', MOCK_ENROLLED_STUDENTS));
    const [classes, setClasses] = useState<SchoolClass[]>(() => getFromStorage('enrollment_classes', MOCK_CLASSES));
    const [highlightedApplicantId, setHighlightedApplicantId] = useState<number | null>(null);
    const [contacts, setContacts] = useState<Contact[]>(() => getFromStorage('enrollment_contacts', []));
    const [uploadedActivities, setUploadedActivities] = useState<Record<number, UploadedActivity[]>>(() => getFromStorage('enrollment_uploadedActivities', {}));
    const [classLogs, setClassLogs] = useState<ClassLogEntry[]>(() => getFromStorage('enrollment_classLogs', MOCK_CLASS_LOGS));
    const [subjects, setSubjects] = useState<Subject[]>(() => getFromStorage('enrollment_subjects', MOCK_SUBJECTS));
    const [signedContracts, setSignedContracts] = useState<SignedContract[]>(() => getFromStorage('enrollment_signedContracts', [
        { studentId: 301, fileUrl: '#', fileName: 'contrato_alice_braga.pdf', uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
    ]));


    // Effects to save to localStorage
    useEffect(() => { localStorage.setItem('enrollment_leads', JSON.stringify(leads)); }, [leads]);
    useEffect(() => { localStorage.setItem('enrollment_applicants', JSON.stringify(applicants)); }, [applicants]);
    useEffect(() => { localStorage.setItem('enrollment_enrolledStudents', JSON.stringify(enrolledStudents)); }, [enrolledStudents]);
    useEffect(() => { localStorage.setItem('enrollment_classes', JSON.stringify(classes)); }, [classes]);
    useEffect(() => { localStorage.setItem('enrollment_contacts', JSON.stringify(contacts)); }, [contacts]);
    useEffect(() => { localStorage.setItem('enrollment_uploadedActivities', JSON.stringify(uploadedActivities)); }, [uploadedActivities]);
    useEffect(() => { localStorage.setItem('enrollment_classLogs', JSON.stringify(classLogs)); }, [classLogs]);
    useEffect(() => { localStorage.setItem('enrollment_subjects', JSON.stringify(subjects)); }, [subjects]);
    useEffect(() => { localStorage.setItem('enrollment_signedContracts', JSON.stringify(signedContracts)); }, [signedContracts]);


    const restoreBackup = (backupData: any) => {
        if (backupData && typeof backupData === 'object') {
            setLeads(backupData.leads || []);
            setApplicants(backupData.applicants || []);
            setEnrolledStudents(backupData.enrolledStudents || []);
            setClasses(backupData.classes || []);
            setContacts(backupData.contacts || []);
            setUploadedActivities(backupData.uploadedActivities || {});
            setClassLogs(backupData.classLogs || []);
            setSubjects(backupData.subjects || MOCK_SUBJECTS);
            setSignedContracts(backupData.signedContracts || []);
            setHighlightedApplicantId(null);
        }
    };


    // --- Leads ---
    const addLead = (lead: Lead) => setLeads(prev => [lead, ...prev]);
    const updateLead = (updatedLead: Lead) => setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    const convertLeadToApplicant = (leadId: number) => {
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;

        const newApplicant: Applicant = {
            id: lead.id,
            name: lead.name,
            avatar: generateAvatar(lead.name),
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

        setLeads(prev => prev.filter(l => l.id !== leadId));
        setApplicants(prev => [newApplicant, ...prev]);
        setHighlightedApplicantId(newApplicant.id);
    };

    // --- Applicants ---
    const updateApplicant = (updatedApplicant: Applicant) => {
        setApplicants(prev => prev.map(a => a.id === updatedApplicant.id ? updatedApplicant : a));
        if (updatedApplicant.status === NewEnrollmentStatus.ENROLLED) {
            // Move to enrolled students list
            const alreadyEnrolled = enrolledStudents.some(s => s.id === updatedApplicant.id);
            if (!alreadyEnrolled) {
                const newEnrolled: EnrolledStudent = {
                    id: updatedApplicant.id,
                    name: updatedApplicant.name,
                    avatar: updatedApplicant.avatar,
                    grade: '', // To be defined by class allocation
                    className: 'A alocar',
                    classId: -1,
                    unit: SchoolUnit.MATRIZ,
                    status: StudentLifecycleStatus.ACTIVE,
                    financialStatus: 'OK',
                    libraryStatus: 'OK',
                    academicDocsStatus: 'OK',
                    guardians: updatedApplicant.guardians,
                    enrollmentFee: updatedApplicant.enrollmentFee,
                    monthlyFee: updatedApplicant.monthlyFee,
                    imageUsagePermission: true, // Default to true
                };
                setEnrolledStudents(prev => [newEnrolled, ...prev]);
            }
        }
    };

    const addManualApplicant = (data: ManualEnrollmentData) => {
         const allDocsApproved = data.documents.every(d => d.status === DocumentStatus.APPROVED);
         const hasRejectedDocs = data.documents.some(d => d.status === DocumentStatus.REJECTED);

         let applicantStatus: NewEnrollmentStatus;

         if (hasRejectedDocs) {
             applicantStatus = NewEnrollmentStatus.INCORRECT_DOCUMENTATION;
         } else if (allDocsApproved && data.paymentConfirmed) {
             applicantStatus = NewEnrollmentStatus.READY_TO_FINALIZE;
         } else if (allDocsApproved && !data.paymentConfirmed) {
             applicantStatus = NewEnrollmentStatus.AWAITING_PAYMENT;
         } else {
             applicantStatus = NewEnrollmentStatus.PENDING_ANALYSIS;
         }

         const newApplicant: Applicant = {
            id: Date.now(),
            name: data.studentName,
            avatar: generateAvatar(data.studentName),
            submissionDate: new Date().toISOString(),
            status: applicantStatus,
            documents: data.documents.map(d => ({
                name: d.name,
                status: d.status,
                deliveryMethod: d.deliveryMethod,
                fileUrl: (d.deliveryMethod === 'Físico' || d.deliveryMethod === 'Digital') ? '#' : undefined,
            })),
            guardians: [data.guardian],
            healthInfo: data.healthInfo,
            dataValidated: true,
            guardianDataValidated: true,
            paymentConfirmed: data.paymentConfirmed,
            paymentMethod: data.paymentMethod,
            discountProgram: data.discountProgram,
            dateOfBirth: data.studentDateOfBirth,
            gender: data.studentGender,
            nationality: data.studentNationality,
            birthCity: data.studentBirthCity,
            birthState: data.studentBirthState,
            address: data.studentAddress,
            enrollmentFee: data.enrollmentFee,
            monthlyFee: data.monthlyFee,
        };
        setApplicants(prev => [newApplicant, ...prev]);
        setHighlightedApplicantId(newApplicant.id);
    };

    const addExtemporaneousApplicant = (data: NewExtemporaneousData) => {
        const newEnrolled: EnrolledStudent = {
            id: Date.now(),
            name: data.studentName,
            avatar: generateAvatar(data.studentName),
            grade: data.grade,
            className: 'A alocar',
            classId: -1,
            unit: SchoolUnit.MATRIZ, // Default
            status: StudentLifecycleStatus.ACTIVE,
            financialStatus: 'OK',
            libraryStatus: 'OK',
            academicDocsStatus: 'OK',
            guardians: [{ name: data.guardianName, cpf: '', rg: '', phone: '', email: '' }],
            imageUsagePermission: true,
        };
        setEnrolledStudents(prev => [newEnrolled, ...prev]);
    };
    
    const submitPublicEnrollment = (data: any) => {
         const newApplicant: Applicant = {
            id: Date.now(),
            name: data.studentName,
            avatar: generateAvatar(data.studentName),
            submissionDate: new Date().toISOString(),
            status: NewEnrollmentStatus.PENDING_ANALYSIS,
            documents: data.documents.map((d: any) => ({ ...d, status: DocumentStatus.ANALYSIS, deliveryMethod: 'Digital' })),
            guardians: [data.guardian],
            healthInfo: data.healthInfo,
            dataValidated: false, guardianDataValidated: false, paymentConfirmed: false
        };
        setApplicants(prev => [newApplicant, ...prev]);
    };

    // --- Enrolled Students & Classes ---
    const enrollStudentsFromImport = (students: EnrolledStudent[]) => {
        const studentsWithPermission = students.map(s => ({...s, imageUsagePermission: s.imageUsagePermission ?? true}));
        setEnrolledStudents(prev => [...studentsWithPermission, ...prev]);
        // Also allocate students to classes based on classId
        setClasses(prevClasses => {
            const newClasses = JSON.parse(JSON.stringify(prevClasses));
            students.forEach(student => {
                if (student.classId !== -1) {
                    const classIndex = newClasses.findIndex((c: SchoolClass) => c.id === student.classId);
                    if (classIndex > -1) {
                        newClasses[classIndex].students.push(student);
                    }
                }
            });
            return newClasses;
        });
    };
    
    const updateEnrolledStudent = (student: EnrolledStudent) => {
        setEnrolledStudents(prev => prev.map(s => s.id === student.id ? student : s));
    };

    const addSchoolClass = (schoolClass: SchoolClass) => setClasses(prev => [schoolClass, ...prev]);
    const updateSchoolClass = (updatedSchoolClass: SchoolClass) => setClasses(prev => prev.map(c => c.id === updatedSchoolClass.id ? updatedSchoolClass : c));
    
    const enrollStudentInClass = (student: EnrolledStudent, classId: number) => {
        setClasses(prev => prev.map(c => {
            if (c.id === classId) {
                return { ...c, students: [...c.students, { ...student, classId, className: c.name }] };
            }
            return c;
        }));
        setEnrolledStudents(prev => prev.map(s => s.id === student.id ? { ...s, classId, className: classes.find(c => c.id === classId)?.name || '' } : s));
        // Remove from applicant list if they were there
        setApplicants(prev => prev.filter(a => a.id !== student.id));
    };

    const removeStudentFromClass = (studentId: number, classId: number): EnrolledStudent | null => {
        let foundStudent: EnrolledStudent | null = null;
        setClasses(prev => prev.map(c => {
            if (c.id === classId) {
                foundStudent = c.students.find(s => s.id === studentId) || null;
                return { ...c, students: c.students.filter(s => s.id !== studentId) };
            }
            return c;
        }));
        return foundStudent;
    };
    
    // -- Communication --
    const addContacts = (newContacts: Contact[]) => {
        const existingPhones = new Set(contacts.map(c => c.phone));
        const uniqueNewContacts = newContacts.filter(c => !existingPhones.has(c.phone));
        if (uniqueNewContacts.length > 0) {
            setContacts(prev => [...prev, ...uniqueNewContacts]);
        }
    };
    
    // -- Academic --
    const addUploadedActivity = (activity: Omit<UploadedActivity, 'id'|'classId'|'uploadDate'>, classId: number) => {
        const newActivity: UploadedActivity = {
            ...activity,
            id: Date.now(),
            classId: classId,
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
    
    const addClassLog = (log: Omit<ClassLogEntry, 'id'>) => {
        const newLog = { ...log, id: Date.now() };
        setClassLogs(prev => [newLog, ...prev]);
    };

    const updateClassLog = (updatedLog: ClassLogEntry) => {
        setClassLogs(prev => prev.map(log => log.id === updatedLog.id ? updatedLog : log));
    };

    const deleteClassLog = (logId: number) => {
        setClassLogs(prev => prev.filter(log => log.id !== logId));
    };

    const addSubject = (subjectName: string): Subject => {
        const newSubject: Subject = {
            id: Date.now(),
            name: subjectName,
            color: stringToColor(subjectName),
            calculationMethod: 'arithmetic',
            assessments: [],
        };
        setSubjects(prev => {
            if (prev.some(s => s.name.toLowerCase() === subjectName.toLowerCase())) {
                const existing = prev.find(s => s.name.toLowerCase() === subjectName.toLowerCase());
                return existing ? prev : [...prev, newSubject];
            }
            return [...prev, newSubject];
        });
        return newSubject;
    };

    // --- Signatures ---
    const uploadSignedContract = (studentId: number, file: File, fileUrl: string) => {
        const newContract: SignedContract = {
            studentId,
            fileUrl,
            fileName: file.name,
            uploadDate: new Date().toISOString()
        };
        setSignedContracts(prev => {
            // Remove old contract for this student if it exists, then add the new one
            const others = prev.filter(c => c.studentId !== studentId);
            return [...others, newContract];
        });
    };


    return (
        <EnrollmentContext.Provider value={{ 
            leads, addLead, updateLead, convertLeadToApplicant,
            applicants, updateApplicant, highlightedApplicantId, setHighlightedApplicantId, addManualApplicant, addExtemporaneousApplicant, submitPublicEnrollment,
            enrolledStudents, enrollStudentsFromImport, updateEnrolledStudent,
            classes, addSchoolClass, updateSchoolClass, enrollStudentInClass, removeStudentFromClass,
            contacts, addContacts,
            uploadedActivities, addUploadedActivity,
            classLogs, addClassLog, updateClassLog, deleteClassLog,
            subjects, addSubject,
            signedContracts, uploadSignedContract,
            restoreBackup
        }}>
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