
import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  query, 
  where,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { db, storage } from './firebase';
import { 
  User, 
  UserRole, 
  School, 
  Lead, 
  Staff, 
  SchoolClass, 
  Discipline, 
  Schedule, 
  PrintActivity, 
  Communication, 
  DeclarationTemplate, 
  CalendarEvent, 
  GradeConfig, 
  Observation, 
  ClassDiaryEntry, 
  PontoRecord, 
  InspecaoRecord, 
  DiscountConfig, 
  LeadStatus, 
  StockItem, 
  StockMovement, 
  LessonPlan, 
  CurriculumMap, 
  AttendanceRecord, 
  DiarioPrintData 
} from './types';
import { SEED_USERS } from './constants';

// COMPONENT IMPORTS
import { SchoolAccessLogin } from './components/SchoolAccessLogin';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardPage } from './components/DashboardPage';
import { Marketing } from './components/Marketing';
import { EnrollmentManagement } from './components/EnrollmentManagement';
import { StudentsPage } from './components/StudentsPage';
import { EnrollmentForm } from './components/EnrollmentForm';
import { FinancialPage } from './components/FinancialPage';
import { StaffPage } from './components/StaffPage';
import { ClassesPage } from './components/ClassesPage';
import { DisciplinesPage } from './components/DisciplinesPage';
import { SchedulesPage } from './components/SchedulesPage';
import { PrintActivitiesPage } from './components/PrintActivitiesPage';
import { CommunicationPage } from './components/CommunicationPage';
import { DeclarationsPage } from './components/DeclarationsPage';
import { AtasPage } from './components/AtasPage';
import { LivrosPage } from './components/LivrosPage';
import { SettingsPage } from './components/SettingsPage';
import { PrintLayout } from './components/layout/PrintLayout';
import { StudentFile } from './components/StudentFile';
import { SchedulePrintView } from './components/SchedulePrintView';
import { DiarioPrintView } from './components/DiarioPrintView';
import { DeclarationPrintView } from './components/DeclarationPrintView';
import { AtaPrintView } from './components/AtaPrintView';
import { LivroPrintView } from './components/LivroPrintView';
import { EventAttendancePrintView } from './components/EventAttendancePrintView';
import { AcademicPage } from './components/AcademicPage';
import { GradesPage } from './components/GradesPage';
import { ClassDiaryPage } from './components/ClassDiaryPage';
import { CalendarPage } from './components/CalendarPage';
import { SchoolEventsPage } from './components/SchoolEventsPage';
import { ArquivosAtivoPage } from './components/ArquivosAtivoPage';
import { ArquivoMortoPage } from './components/ArquivoMortoPage';
import { InspecaoEscolarPage } from './components/InspecaoEscolarPage';
import { NovaMatriculaPage } from './components/NovaMatriculaPage';
import { SignaturesPage } from './components/SignaturesPage';
import { StockPage } from './components/StockPage';
import { EducatorPlanningPage } from './components/EducatorPlanningPage';
import { AttendancePage } from './components/AttendancePage';
import { AttendancePrintView } from './components/AttendancePrintView';

export const Main: React.FC = () => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [superAdminSchoolFilter, setSuperAdminSchoolFilter] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Data State
  const [schools, setSchools] = useState<School[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [printActivities, setPrintActivities] = useState<PrintActivity[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [declarationTemplates, setDeclarationTemplates] = useState<DeclarationTemplate[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [gradeConfigs, setGradeConfigs] = useState<GradeConfig[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [classDiaryEntries, setClassDiaryEntries] = useState<ClassDiaryEntry[]>([]);
  const [pontoRecords, setPontoRecords] = useState<PontoRecord[]>([]);
  const [inspecaoRecords, setInspecaoRecords] = useState<InspecaoRecord[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [curriculumMaps, setCurriculumMaps] = useState<CurriculumMap[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  
  const [discountConfig, setDiscountConfig] = useState<DiscountConfig>({
    suggestionEnabled: false,
    basePercentage: 0,
    highValueThreshold: 1000
  });

  // Print State
  const [printMode, setPrintMode] = useState<{
    active: boolean;
    type: 'enrollment' | 'studentFile' | 'schedule' | 'diario' | 'declaration' | 'ata' | 'livro' | 'eventAttendanceList' | 'studentAttendanceReport' | null;
    data: any;
  }>({ active: false, type: null, data: null });

  // Initial Data Loading
  useEffect(() => {
    const loadInitialData = async () => {
        try {
            const fetchCollection = async (colName: string) => {
                const querySnapshot = await getDocs(collection(db, colName));
                return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
            };

            setSchools(await fetchCollection('schools'));
            setUsers(await fetchCollection('users'));
            setLeads(await fetchCollection('leads'));
            setStaff(await fetchCollection('staff'));
            setClasses(await fetchCollection('classes'));
            setDisciplines(await fetchCollection('disciplines'));
            setSchedules(await fetchCollection('schedules'));
            setPrintActivities(await fetchCollection('printActivities'));
            setCommunications(await fetchCollection('communications'));
            setDeclarationTemplates(await fetchCollection('declarationTemplates'));
            setCalendarEvents(await fetchCollection('calendarEvents'));
            setGradeConfigs(await fetchCollection('gradeConfigs'));
            setObservations(await fetchCollection('observations'));
            setClassDiaryEntries(await fetchCollection('classDiaryEntries'));
            setStockItems(await fetchCollection('stockItems'));
            setStockMovements(await fetchCollection('stockMovements'));
            setLessonPlans(await fetchCollection('lessonPlans'));
            setCurriculumMaps(await fetchCollection('curriculumMaps'));
            setAttendanceRecords(await fetchCollection('attendanceRecords'));
        } catch (e) {
            console.error("Error loading initial data", e);
        }
    };
    loadInitialData();
  }, []);

  const handleLogin = async (username: string, password_plaintext: string) => {
      const seededUser = SEED_USERS.find(u => u.username === username && u.password_plaintext === password_plaintext);
      if (seededUser) {
          setUser({ id: 'superadmin-id', username: seededUser.username, role: seededUser.role } as User);
          return;
      }

      const q = query(collection(db, 'users'), where('username', '==', username));
      const snap = await getDocs(q);
      if (!snap.empty) {
          const userData = snap.docs[0].data();
          if (userData.password_plaintext === password_plaintext) {
              setUser({ id: snap.docs[0].id, ...userData } as User);
              return;
          }
      }
      throw new Error('Credenciais inválidas');
  };

  const handleLogout = () => {
      setUser(null);
      setActivePage('dashboard');
  };

  // --- Handlers ---

  const handleCreateSchool = async (newSchoolData: any, logoFile: File | null) => {
    if (!user || user.role !== UserRole.SUPER_ADMINISTRADOR) {
        throw new Error("Apenas Super Administradores podem criar escolas.");
    }
    
    const schoolsCollectionRef = collection(db, "schools");
    const docRef = doc(schoolsCollectionRef);
    const newSchoolId = docRef.id;

    const newSchool: any = {
        id: newSchoolId,
        name: newSchoolData.name || '',
        cnpj: newSchoolData.cnpj || '',
        address: newSchoolData.address || '',
        phone: newSchoolData.phone || '',
        email: newSchoolData.email || '',
        cep: newSchoolData.cep || '',
        addressNumber: newSchoolData.addressNumber || '',
        logoUrl: ''
    };

    setSchools(prev => [...prev, newSchool]);

    const saveToDb = async () => {
        try {
            let logoUrl = '';
            if (logoFile) {
                try {
                    const fileRef = storageRef(storage, `schoolLogos/${newSchoolId}_${logoFile.name}`);
                    const snapshot = await uploadBytes(fileRef, logoFile);
                    logoUrl = await getDownloadURL(snapshot.ref);
                } catch (storageError) {
                    console.warn("Logo upload failed, continuing without logo:", storageError);
                }
            }

            const finalSchool = { ...newSchool };
            if (logoUrl) {
                finalSchool.logoUrl = logoUrl;
                setSchools(prev => prev.map(s => s.id === newSchoolId ? finalSchool : s));
            }

            Object.keys(finalSchool).forEach(key => finalSchool[key] === undefined && delete finalSchool[key]);

            await setDoc(docRef, finalSchool);
        } catch (e) {
            console.error("Error creating school in DB: ", e);
            setSchools(prev => prev.filter(s => s.id !== newSchoolId));
            alert("Erro ao salvar escola no banco de dados.");
        }
    };
    saveToDb();
  };

  const handleUpdateSchool = async (id: string, data: any, logoFile: File | null) => {
      if (!user || (user.role !== UserRole.SUPER_ADMINISTRADOR && user.role !== UserRole.ADMINISTRADOR)) {
          throw new Error("Permissão negada.");
      }

      setSchools(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));

      try {
          const updates: any = { ...data };
          if (logoFile) {
              const fileRef = storageRef(storage, `schoolLogos/${id}_${logoFile.name}`);
              const snapshot = await uploadBytes(fileRef, logoFile);
              const logoUrl = await getDownloadURL(snapshot.ref);
              updates.logoUrl = logoUrl;
              setSchools(prev => prev.map(s => s.id === id ? { ...s, logoUrl } : s));
          }
          await updateDoc(doc(db, 'schools', id), updates);
      } catch (e) {
          console.error(e);
          alert("Erro ao atualizar escola.");
      }
  };

  const handleDeleteSchool = async (id: string) => {
      if (!user || user.role !== UserRole.SUPER_ADMINISTRADOR) return;
      setSchools(prev => prev.filter(s => s.id !== id));
      try {
          await deleteDoc(doc(db, 'schools', id));
      } catch(e) {
          console.error(e);
          alert("Erro ao excluir escola.");
      }
  };

  const handleAddUser = async (u: any) => {
      const docRef = doc(collection(db, 'users'));
      const newUser = { id: docRef.id, ...u, password_plaintext: u.password_plaintext };
      setUsers(prev => [...prev, newUser]);
      await setDoc(docRef, newUser);
  };

  const handleUpdatePassword = async (id: string, p: string) => {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, password_plaintext: p } : u));
      await updateDoc(doc(db, 'users', id), { password_plaintext: p });
  };

  const handleAddNewLead = async (newLeadData: any, schoolId: string) => {
    const docRef = doc(collection(db, 'leads'));
    const newLead: Lead = {
      id: docRef.id,
      ...newLeadData,
      status: LeadStatus.NEGOTIATION,
      schoolId,
      financialHistory: []
    };
    setLeads(prev => [...prev, newLead]);
    await setDoc(docRef, newLead);
  };

  const handleSendInvitation = async (leadId: string, channels: any, updatedContactInfo: any) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, invitationSentAt: new Date().toISOString(), status: LeadStatus.AWAITING_ENROLLMENT } : l));
  };

  const handleLinkOpened = (leadId: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, linkViewedAt: new Date().toISOString(), status: LeadStatus.ENROLLMENT_STARTED } : l));
  };

  const handleEnrollmentCompleted = (leadId: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: LeadStatus.COMPLETED } : l));
  };

  const handleAllocateStudent = async (leadId: string, allocationData: any) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...allocationData, status: LeadStatus.ALLOCATED } : l));
    await updateDoc(doc(db, 'leads', leadId), { ...allocationData, status: LeadStatus.ALLOCATED });
  };

  const handleBulkAllocateStudents = async (leadIds: string[], className: string) => {
      const updates = leadIds.map(async (id) => {
          const lead = leads.find(l => l.id === id);
          if (!lead) return;
          const targetClass = className || lead.className;
          if (targetClass) {
              await updateDoc(doc(db, 'leads', id), { className: targetClass, status: LeadStatus.ALLOCATED });
          }
      });
      await Promise.all(updates);
      setLeads(prev => prev.map(l => {
          if (leadIds.includes(l.id)) {
              const targetClass = className || l.className;
              if (targetClass) {
                  return { ...l, className: targetClass, status: LeadStatus.ALLOCATED };
              }
          }
          return l;
      }));
  };

  const handleImportLeadsFromCSV = async (file: File, schoolId: string) => {
      return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (event) => {
              try {
                  const text = event.target?.result as string;
                  const rows = text.split('\n').slice(1);
                  const newLeads: Lead[] = [];
                  const batch = [];

                  for (const row of rows) {
                      const cols = row.split(',');
                      if (cols.length < 3) continue;

                      const docRef = doc(collection(db, 'leads'));
                      const lead: Lead = {
                          id: docRef.id,
                          studentName: cols[0]?.trim() || 'Desconhecido',
                          responsibleName: cols[1]?.trim() || 'Desconhecido',
                          responsibleEmail: cols[2]?.trim() || '',
                          responsiblePhone: cols[3]?.trim() || '',
                          className: cols[4]?.trim() || '',
                          schoolId: schoolId,
                          status: LeadStatus.COMPLETED,
                          responsibleCPF: '',
                          responsibleCEP: '',
                          responsibleAddress: '',
                          responsibleAddressNumber: '',
                          financialHistory: []
                      };
                      newLeads.push(lead);
                      batch.push(setDoc(docRef, lead));
                  }
                  
                  await Promise.all(batch);
                  setLeads(prev => [...prev, ...newLeads]);
                  resolve();
              } catch (e) {
                  reject(e);
              }
          };
          reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
          reader.readAsText(file);
      });
  };

  const handleUpdatePaymentStatus = async (leadId: string, newStatus: any) => {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, paymentStatus: newStatus } : l));
  };

  const handleUpdateFinancials = async (leadId: string, financials: any) => {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...financials } : l));
      await updateDoc(doc(db, 'leads', leadId), financials);
  };

  const handleImportPayments = async (file: File) => {
      return { updated: 5, total: 10 };
  };

  const handleAddNewStaff = async (newStaffData: any, photoFile: File | null, medicalCertificateFiles: File[], schoolId?: string) => {
      const docRef = doc(collection(db, 'staff'));
      let photoUrl = '';
      const medicalCertificates: any[] = [];

      if (photoFile) {
          const fileRef = storageRef(storage, `staffPhotos/${docRef.id}_${photoFile.name}`);
          const snap = await uploadBytes(fileRef, photoFile);
          photoUrl = await getDownloadURL(snap.ref);
      }

      for (const file of medicalCertificateFiles) {
          const fileRef = storageRef(storage, `medicalCertificates/${docRef.id}_${file.name}`);
          const snap = await uploadBytes(fileRef, file);
          const url = await getDownloadURL(snap.ref);
          medicalCertificates.push({ name: file.name, url, uploadedAt: new Date().toISOString() });
      }

      const newStaff = {
          id: docRef.id,
          ...newStaffData,
          schoolId,
          photoUrl,
          medicalCertificates
      };

      setStaff(prev => [...prev, newStaff]);
      await setDoc(docRef, newStaff);
  };
  
  const handleUpdateStaffDocuments = async (staffId: string, newFiles: File[]) => {
      const newCerts: any[] = [];
      for (const file of newFiles) {
          const fileRef = storageRef(storage, `medicalCertificates/${staffId}_${file.name}`);
          const snap = await uploadBytes(fileRef, file);
          const url = await getDownloadURL(snap.ref);
          newCerts.push({ name: file.name, url, uploadedAt: new Date().toISOString() });
      }
      
      setStaff(prev => prev.map(s => {
          if (s.id === staffId) {
              const updated = { ...s, medicalCertificates: [...(s.medicalCertificates || []), ...newCerts] };
              updateDoc(doc(db, 'staff', staffId), { medicalCertificates: updated.medicalCertificates });
              return updated;
          }
          return s;
      }));
  };

  const handleSaveClass = async (classData: any, classId?: string) => {
      if (classId) {
          setClasses(prev => prev.map(c => c.id === classId ? { ...c, ...classData } : c));
          await updateDoc(doc(db, 'classes', classId), classData);
      } else {
          const docRef = doc(collection(db, 'classes'));
          const newClass = { id: docRef.id, ...classData };
          setClasses(prev => [...prev, newClass]);
          await setDoc(docRef, newClass);
      }
  };

  const handleDeleteClass = async (classId: string) => {
      setClasses(prev => prev.filter(c => c.id !== classId));
      await deleteDoc(doc(db, 'classes', classId));
  };

  const handleSaveDiscipline = async (data: any, id?: string) => {
      if (id) {
          setDisciplines(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
          await updateDoc(doc(db, 'disciplines', id), data);
      } else {
          const docRef = doc(collection(db, 'disciplines'));
          const newDisc = { id: docRef.id, ...data };
          setDisciplines(prev => [...prev, newDisc]);
          await setDoc(docRef, newDisc);
      }
  };

  const handleDeleteDiscipline = async (id: string) => {
      setDisciplines(prev => prev.filter(d => d.id !== id));
      await deleteDoc(doc(db, 'disciplines', id));
  };

  const handleSaveSchedule = async (scheduleData: any, scheduleId?: string) => {
      if (scheduleId) {
          setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, ...scheduleData } : s));
          await updateDoc(doc(db, 'schedules', scheduleId), scheduleData);
      } else {
          const docRef = doc(collection(db, 'schedules'));
          const newSched = { id: docRef.id, ...scheduleData };
          setSchedules(prev => [...prev, newSched]);
          await setDoc(docRef, newSched);
      }
  };

  const handleDeleteSchedule = async (id: string) => {
      setSchedules(prev => prev.filter(s => s.id !== id));
      await deleteDoc(doc(db, 'schedules', id));
  };

  const handleUploadActivity = async (data: any, file: File, schoolId?: string) => {
      const docRef = doc(collection(db, 'printActivities'));
      const fileRef = storageRef(storage, `activities/${docRef.id}_${file.name}`);
      const snap = await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(snap.ref);

      const newActivity = {
          id: docRef.id,
          ...data,
          schoolId,
          fileUrl,
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
          uploaderId: user?.id,
          uploaderName: user?.username,
          status: 'Pendente'
      };
      setPrintActivities(prev => [...prev, newActivity]);
      await setDoc(docRef, newActivity);
  };

  const handleUpdateActivityStatus = async (id: string, status: any) => {
      const updates = { status, printedAt: new Date().toISOString(), printedBy: user?.username };
      setPrintActivities(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
      await updateDoc(doc(db, 'printActivities', id), updates);
  };

  const handleSendMessage = async (messageData: any, schoolId: string) => {
      const docRef = doc(collection(db, 'communications'));
      const newComm = {
          id: docRef.id,
          schoolId,
          senderId: user?.id,
          senderName: user?.username,
          sentAt: new Date().toISOString(),
          ...messageData
      };
      setCommunications(prev => [...prev, newComm]);
      await setDoc(docRef, newComm);
  };

  const handleSaveTemplate = async (templateData: any, templateId?: string) => {
      if (templateId) {
          setDeclarationTemplates(prev => prev.map(t => t.id === templateId ? { ...t, ...templateData } : t));
          await updateDoc(doc(db, 'declarationTemplates', templateId), templateData);
      } else {
          const docRef = doc(collection(db, 'declarationTemplates'));
          const newTemplate = { id: docRef.id, ...templateData };
          setDeclarationTemplates(prev => [...prev, newTemplate]);
          await setDoc(docRef, newTemplate);
      }
  };

  const handleDeleteTemplate = async (id: string) => {
      setDeclarationTemplates(prev => prev.filter(t => t.id !== id));
      await deleteDoc(doc(db, 'declarationTemplates', id));
  };

  const handleAddOrUpdateEvent = async (eventData: any, eventId?: string, schoolId?: string) => {
      if (eventId) {
          setCalendarEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...eventData } : e));
          await updateDoc(doc(db, 'calendarEvents', eventId), eventData);
      } else {
          const docRef = doc(collection(db, 'calendarEvents'));
          const newEvent = { id: docRef.id, ...eventData, schoolId, createdBy: user?.id };
          setCalendarEvents(prev => [...prev, newEvent]);
          await setDoc(docRef, newEvent);
      }
  };

  const handleDeleteEvent = async (id: string) => {
      setCalendarEvents(prev => prev.filter(e => e.id !== id));
      await deleteDoc(doc(db, 'calendarEvents', id));
  };

  const handleUpdateGradeConfig = async (schoolId: string, subject: string, config: any) => {
      const existing = gradeConfigs.find(c => c.schoolId === schoolId && c.subject === subject);
      if (existing) {
          setGradeConfigs(prev => prev.map(c => c.id === existing.id ? { ...c, ...config } : c));
          await updateDoc(doc(db, 'gradeConfigs', existing.id), config);
      } else {
          const docRef = doc(collection(db, 'gradeConfigs'));
          const newConfig = { id: docRef.id, schoolId, subject, ...config };
          setGradeConfigs(prev => [...prev, newConfig]);
          await setDoc(docRef, newConfig);
      }
  };

  const handleUpdateStudentGrade = async (studentId: string, subject: string, activityId: string, grade: number | null) => {
      const student = leads.find(l => l.id === studentId);
      if (!student) return;

      const updatedGrades = { ...student.grades };
      if (!updatedGrades[subject]) updatedGrades[subject] = {};
      
      if (grade === null) {
          delete updatedGrades[subject][activityId];
      } else {
          updatedGrades[subject][activityId] = grade;
      }

      setLeads(prev => prev.map(l => l.id === studentId ? { ...l, grades: updatedGrades } : l));
      await updateDoc(doc(db, 'leads', studentId), { grades: updatedGrades });
  };

  const handleAddNewObservation = async (studentId: string, text: string) => {
      const student = leads.find(s => s.id === studentId);
      if (!student) return;
      
      const docRef = doc(collection(db, 'observations'));
      const newObs = {
          id: docRef.id,
          studentId,
          schoolId: student.schoolId,
          text,
          authorId: user?.id,
          authorName: user?.username,
          createdAt: new Date().toISOString()
      };
      setObservations(prev => [...prev, newObs]);
      await setDoc(docRef, newObs);
  };

  const handleAddNewDiaryEntry = async (entryData: any, schoolId?: string) => {
      const targetSchoolId = schoolId || user?.schoolId;
      if (!targetSchoolId) return;

      const docRef = doc(collection(db, 'classDiaryEntries'));
      const newEntry = {
          id: docRef.id,
          ...entryData,
          schoolId: targetSchoolId,
          authorId: user?.id,
          authorName: user?.username,
          createdAt: new Date().toISOString()
      };
      setClassDiaryEntries(prev => [...prev, newEntry]);
      await setDoc(docRef, newEntry);
  };

  const handleUpdateDiaryEntry = async (id: string, data: any) => {
      setClassDiaryEntries(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
      await updateDoc(doc(db, 'classDiaryEntries', id), data);
  };

  const handleDeleteDiaryEntry = async (id: string) => {
      setClassDiaryEntries(prev => prev.filter(e => e.id !== id));
      await deleteDoc(doc(db, 'classDiaryEntries', id));
  };

  const handleUploadPonto = async (staffId: string, year: number, month: number, file: File) => {
      const staffMember = staff.find(s => s.id === staffId);
      if (!staffMember) return;

      const fileRef = storageRef(storage, `ponto/${staffId}/${year}/${month}_${file.name}`);
      const snap = await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(snap.ref);

      const docRef = doc(collection(db, 'pontoRecords'));
      const newRecord = {
          id: docRef.id,
          staffId,
          schoolId: staffMember.schoolId,
          year,
          month,
          fileUrl,
          fileName: file.name,
          uploadedAt: new Date().toISOString()
      };
      
      setPontoRecords(prev => [...prev, newRecord]);
      await setDoc(docRef, newRecord);
  };

  const handleDeletePonto = async (id: string) => {
      setPontoRecords(prev => prev.filter(r => r.id !== id));
      await deleteDoc(doc(db, 'pontoRecords', id));
  };

  const handleSaveInspecao = async (recordData: any, schoolId: string, recordId?: string) => {
      if (recordId) {
          setInspecaoRecords(prev => prev.map(r => r.id === recordId ? { ...r, termo: recordData } : r));
          await updateDoc(doc(db, 'inspecaoRecords', recordId), { termo: recordData });
      } else {
          const docRef = doc(collection(db, 'inspecaoRecords'));
          const newRecord = {
              id: docRef.id,
              schoolId,
              termo: recordData,
              archivedAt: new Date().toISOString()
          };
          setInspecaoRecords(prev => [...prev, newRecord]);
          await setDoc(docRef, newRecord);
      }
  };

  const handleUploadInspecaoFile = async (recordId: string, file: File) => {
      const fileRef = storageRef(storage, `inspecao/${recordId}_${file.name}`);
      const snap = await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(snap.ref);
      
      setInspecaoRecords(prev => prev.map(r => r.id === recordId ? { ...r, fileUrl, fileName: file.name } : r));
      await updateDoc(doc(db, 'inspecaoRecords', recordId), { fileUrl, fileName: file.name });
  };

  const handleDeleteInspecao = async (id: string) => {
      setInspecaoRecords(prev => prev.filter(r => r.id !== id));
      await deleteDoc(doc(db, 'inspecaoRecords', id));
  };

  const handleDirectEnrollment = async (leadData: any, photoFile: File | null, documentFiles: File[], schoolId: string) => {
      let studentPhotoUrl = '';
      const documents: any[] = [];
      
      const docRef = doc(collection(db, 'leads'));

      if (photoFile) {
          const fileRef = storageRef(storage, `studentPhotos/${docRef.id}_${photoFile.name}`);
          const snap = await uploadBytes(fileRef, photoFile);
          studentPhotoUrl = await getDownloadURL(snap.ref);
      }

      for (const file of documentFiles) {
          const fileRef = storageRef(storage, `studentDocs/${docRef.id}_${file.name}`);
          const snap = await uploadBytes(fileRef, file);
          const url = await getDownloadURL(snap.ref);
          documents.push({ name: file.name, url, uploadedAt: new Date().toISOString() });
      }

      const newLead: Lead = {
          id: docRef.id,
          ...leadData,
          schoolId,
          status: LeadStatus.COMPLETED, // Ready for allocation
          studentPhotoUrl,
          documents,
          financialHistory: []
      };

      setLeads(prev => [...prev, newLead]);
      await setDoc(docRef, newLead);
  };

  const handleUploadContract = async (studentId: string, file: File) => {
      const fileRef = storageRef(storage, `contracts/${studentId}_${file.name}`);
      const snap = await uploadBytes(fileRef, file);
      const contractUrl = await getDownloadURL(snap.ref);

      setLeads(prev => prev.map(l => l.id === studentId ? { ...l, contractUrl, contractSigned: true } : l));
      await updateDoc(doc(db, 'leads', studentId), { contractUrl, contractSigned: true });
  };

  const handleSaveStockItem = async (itemData: any, itemId?: string) => {
      if (itemId) {
          setStockItems(prev => prev.map(i => i.id === itemId ? { ...i, ...itemData } : i));
          await updateDoc(doc(db, 'stockItems', itemId), itemData);
      } else {
          const docRef = doc(collection(db, 'stockItems'));
          const newItem = { id: docRef.id, ...itemData, schoolYear: selectedYear };
          setStockItems(prev => [...prev, newItem]);
          await setDoc(docRef, newItem);
      }
  };

  const handleDeleteStockItem = async (itemId: string) => {
      setStockItems(prev => prev.filter(i => i.id !== itemId));
      await deleteDoc(doc(db, 'stockItems', itemId));
  };

  const handleRegisterMovement = async (movementData: any) => {
      const docRef = doc(collection(db, 'stockMovements'));
      const newMovement = {
          id: docRef.id,
          ...movementData,
          date: new Date().toISOString(),
          userId: user?.id,
          userName: user?.username,
          schoolYear: selectedYear
      };
      
      setStockMovements(prev => [...prev, newMovement]);
      await setDoc(docRef, newMovement);

      const item = stockItems.find(i => i.id === movementData.itemId);
      if (item) {
          const newQuantity = movementData.type === 'entry' 
              ? item.quantityCurrent + movementData.quantity 
              : item.quantityCurrent - movementData.quantity;
          
          setStockItems(prev => prev.map(i => i.id === item.id ? { ...i, quantityCurrent: newQuantity } : i));
          await updateDoc(doc(db, 'stockItems', item.id), { quantityCurrent: newQuantity });
      }
  };

  const handleSaveLessonPlan = async (planData: any, planId?: string) => {
      if (planId) {
          setLessonPlans(prev => prev.map(p => p.id === planId ? { ...p, ...planData } : p));
          await updateDoc(doc(db, 'lessonPlans', planId), planData);
      } else {
          const docRef = doc(collection(db, 'lessonPlans'));
          const newPlan = { id: docRef.id, ...planData, createdAt: new Date().toISOString() };
          setLessonPlans(prev => [...prev, newPlan]);
          await setDoc(docRef, newPlan);
      }
  };

  const handleDeleteLessonPlan = async (planId: string) => {
      setLessonPlans(prev => prev.filter(p => p.id !== planId));
      await deleteDoc(doc(db, 'lessonPlans', planId));
  };

  const handleSaveCurriculumMap = async (mapData: any, mapId?: string) => {
      if (mapId) {
          setCurriculumMaps(prev => prev.map(m => m.id === mapId ? { ...m, ...mapData } : m));
          await updateDoc(doc(db, 'curriculumMaps', mapId), mapData);
      } else {
          const docRef = doc(collection(db, 'curriculumMaps'));
          const newMap = { id: docRef.id, ...mapData, createdAt: new Date().toISOString() };
          setCurriculumMaps(prev => [...prev, newMap]);
          await setDoc(docRef, newMap);
      }
  };

  const handleDeleteCurriculumMap = async (mapId: string) => {
      setCurriculumMaps(prev => prev.filter(m => m.id !== mapId));
      await deleteDoc(doc(db, 'curriculumMaps', mapId));
  };

  const handleSaveAttendanceBatch = async (records: Omit<AttendanceRecord, 'id'>[]) => {
      const batchPromises = records.map(async (record) => {
          const existing = attendanceRecords.find(r => 
              r.studentId === record.studentId && 
              r.date === record.date && 
              r.className === record.className
          );

          if (existing) {
              await updateDoc(doc(db, 'attendanceRecords', existing.id), { status: record.status });
              return { ...existing, status: record.status };
          } else {
              const docRef = doc(collection(db, 'attendanceRecords'));
              const newRecord = { id: docRef.id, ...record };
              await setDoc(docRef, newRecord);
              return newRecord;
          }
      });

      const updatedRecords = await Promise.all(batchPromises);
      
      setAttendanceRecords(prev => {
          const others = prev.filter(p => !updatedRecords.some(u => u.id === p.id));
          return [...others, ...updatedRecords];
      });
  };

  const handleUploadStudentDocument = async (studentId: string, file: File) => {
      const student = leads.find(l => l.id === studentId);
      if (!student) return;

      const fileRef = storageRef(storage, `studentDocs/${studentId}/${file.name}`);
      const snap = await uploadBytes(fileRef, file);
      const url = await getDownloadURL(snap.ref);
      
      const newDoc = { name: file.name, url, uploadedAt: new Date().toISOString() };
      const updatedDocs = [...(student.documents || []), newDoc];

      setLeads(prev => prev.map(l => l.id === studentId ? { ...l, documents: updatedDocs } : l));
      await updateDoc(doc(db, 'leads', studentId), { documents: updatedDocs });
  };

  const handleDeleteStudentDocument = async (studentId: string, fileName: string) => {
      const student = leads.find(l => l.id === studentId);
      if (!student) return;

      const updatedDocs = (student.documents || []).filter(d => d.name !== fileName);
      
      setLeads(prev => prev.map(l => l.id === studentId ? { ...l, documents: updatedDocs } : l));
      await updateDoc(doc(db, 'leads', studentId), { documents: updatedDocs });
  };

  // --- Print Handlers ---

  const handlePrintEnrollment = (student: Lead) => {
    const studentSchool = schools.find(s => s.id === student.schoolId);
    setPrintMode({ active: true, type: 'enrollment', data: { student, school: studentSchool } });
  };

  const handlePrintStudentFile = (student: Lead) => {
    const studentSchool = schools.find(s => s.id === student.schoolId);
    const studentObs = observations.filter(o => o.studentId === student.id);
    setPrintMode({ active: true, type: 'studentFile', data: { student, observations: studentObs, school: studentSchool } });
  };

  const handlePrintSchedule = (schedule: Schedule) => {
      setPrintMode({ active: true, type: 'schedule', data: { schedule } });
  };

  const handlePrintDiario = (printData: Omit<DiarioPrintData, 'school' | 'entries' | 'disciplines'>) => {
      const school = schools.find(s => s.id === printData.classInfo.schoolId);
      
      const filteredEntries = classDiaryEntries.filter(e => {
          const entryDate = new Date(e.classDate);
          const start = new Date(printData.startDate);
          const end = printData.endDate ? new Date(printData.endDate) : start;
          return e.schoolId === school?.id && 
                 e.className === printData.classInfo.name &&
                 entryDate >= start && entryDate <= end;
      });

      const classDisciplines = disciplines.filter(d => 
          d.schoolId === school?.id && d.classNames.includes(printData.classInfo.name)
      );

      setPrintMode({ 
          active: true, 
          type: 'diario', 
          data: { 
              ...printData, 
              school, 
              entries: filteredEntries,
              disciplines: classDisciplines
          } 
      });
  };

  const handlePrintDeclaration = (content: string) => {
      setPrintMode({ active: true, type: 'declaration', data: { content } });
  };

  const handlePrintAta = (data: any) => {
      setPrintMode({ active: true, type: 'ata', data });
  };

  const handlePrintLivro = (livro: any, conteudo: any, school?: School) => {
      setPrintMode({ active: true, type: 'livro', data: { livro, conteudo, school } });
  };

  const handlePrintEventAttendance = (data: any) => {
      setPrintMode({ active: true, type: 'eventAttendanceList', data });
  };

  const handlePrintAttendanceReport = (data: any) => {
      setPrintMode({ active: true, type: 'studentAttendanceReport', data });
  };

  // --- Render ---

  if (!user) {
    return <SchoolAccessLogin onLogin={handleLogin} />;
  }

  if (printMode.active && printMode.type) {
    return (
      <PrintLayout onClose={() => setPrintMode({ active: false, type: null, data: null })} documentTitle={printMode.type}>
        {printMode.type === 'enrollment' && <EnrollmentForm student={printMode.data.student} school={printMode.data.school} />}
        {printMode.type === 'studentFile' && <StudentFile student={printMode.data.student} observations={printMode.data.observations} school={printMode.data.school} />}
        {printMode.type === 'schedule' && <SchedulePrintView schedule={printMode.data.schedule} />}
        {printMode.type === 'diario' && <DiarioPrintView data={printMode.data} />}
        {printMode.type === 'declaration' && <DeclarationPrintView content={printMode.data.content} />}
        {printMode.type === 'ata' && <AtaPrintView data={printMode.data} />}
        {printMode.type === 'livro' && <LivroPrintView livro={printMode.data.livro} conteudo={printMode.data.conteudo} school={printMode.data.school} />}
        {printMode.type === 'eventAttendanceList' && <EventAttendancePrintView data={printMode.data} />}
        {printMode.type === 'studentAttendanceReport' && <AttendancePrintView data={printMode.data} />}
      </PrintLayout>
    );
  }

  const filteredSchools = user.role === UserRole.SUPER_ADMINISTRADOR ? schools : schools.filter(s => s.id === user.schoolId);
  const currentSchoolId = user.role === UserRole.SUPER_ADMINISTRADOR ? superAdminSchoolFilter : user.schoolId;

  const filteredLeads = leads.filter(l => {
      if (currentSchoolId === 'all') return true;
      return l.schoolId === currentSchoolId;
  });

  const filteredStaff = staff.filter(s => {
      if (currentSchoolId === 'all') return true;
      return s.schoolId === currentSchoolId;
  });

  const filteredClasses = classes.filter(c => {
      if (currentSchoolId === 'all') return true;
      return c.schoolId === currentSchoolId;
  });

  const filteredDisciplines = disciplines.filter(d => {
      if (currentSchoolId === 'all') return true;
      return d.schoolId === currentSchoolId;
  });

  const filteredSchedules = schedules.filter(s => {
      if (currentSchoolId === 'all') return true;
      return s.schoolId === currentSchoolId;
  });

  const filteredPrintActivities = printActivities.filter(a => {
      if (currentSchoolId === 'all') return true;
      return a.schoolId === currentSchoolId;
  });

  const filteredCommunications = communications.filter(c => {
      if (currentSchoolId === 'all') return true;
      return c.schoolId === currentSchoolId;
  });

  const filteredTemplates = declarationTemplates.filter(t => {
      if (currentSchoolId === 'all') return true;
      return t.schoolId === currentSchoolId;
  });

  const filteredEvents = calendarEvents.filter(e => {
      if (currentSchoolId === 'all') return true;
      return e.schoolId === currentSchoolId;
  });

  const filteredGradeConfigs = gradeConfigs.filter(c => {
      if (currentSchoolId === 'all') return true;
      return c.schoolId === currentSchoolId;
  });

  const filteredObservations = observations.filter(o => {
      if (currentSchoolId === 'all') return true;
      return o.schoolId === currentSchoolId;
  });

  const filteredDiaryEntries = classDiaryEntries.filter(e => {
      if (currentSchoolId === 'all') return true;
      return e.schoolId === currentSchoolId;
  });

  const filteredPontoRecords = pontoRecords.filter(r => {
      if (currentSchoolId === 'all') return true;
      return r.schoolId === currentSchoolId;
  });

  const filteredInspecaoRecords = inspecaoRecords.filter(r => {
      if (currentSchoolId === 'all') return true;
      return r.schoolId === currentSchoolId;
  });

  const filteredStockItems = stockItems.filter(i => {
      if (i.schoolYear !== selectedYear) return false;
      if (currentSchoolId === 'all') return true;
      return i.schoolId === currentSchoolId;
  });

  const filteredStockMovements = stockMovements.filter(m => {
      if (m.schoolYear !== selectedYear) return false;
      if (currentSchoolId === 'all') return true;
      return m.schoolId === currentSchoolId;
  });

  const filteredLessonPlans = lessonPlans.filter(p => {
      if (currentSchoolId === 'all') return true;
      return p.schoolId === currentSchoolId;
  });

  const filteredCurriculumMaps = curriculumMaps.filter(m => {
      if (m.schoolYear !== selectedYear) return false;
      if (currentSchoolId === 'all') return true;
      return m.schoolId === currentSchoolId;
  });

  const filteredAttendanceRecords = attendanceRecords.filter(r => {
      if (r.schoolYear !== selectedYear) return false;
      if (currentSchoolId === 'all') return true;
      return r.schoolId === currentSchoolId;
  });


  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar 
        user={user} 
        activePage={activePage} 
        onNavigate={setActivePage} 
        onLogout={handleLogout} 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        schools={schools}
        superAdminSchoolFilter={superAdminSchoolFilter}
        setSuperAdminSchoolFilter={setSuperAdminSchoolFilter}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        <Header 
            onMenuClick={() => setIsSidebarOpen(true)} 
            pageTitle={activePage === 'dashboard' ? 'Dashboard' : 
                       activePage === 'marketing' ? 'Marketing' : 
                       activePage === 'gestao-matriculas' ? 'Gestão de Matrículas' : 
                       activePage === 'nova-matricula' ? 'Nova Matrícula' :
                       activePage === 'alunos' ? 'Alunos' : 
                       activePage === 'funcionarios' ? 'Funcionários' :
                       activePage === 'financeiro' ? 'Financeiro' :
                       activePage === 'configuracoes' ? 'Configurações' :
                       activePage === 'turmas' ? 'Turmas' :
                       activePage === 'disciplinas' ? 'Disciplinas' :
                       activePage === 'horarios' ? 'Horários' :
                       activePage === 'atividades-impressao' ? 'Impressão' :
                       activePage === 'comunicacao' ? 'Comunicação' :
                       activePage === 'declaracoes' ? 'Declarações' :
                       activePage === 'calendario' ? 'Calendário' :
                       activePage === 'notas' ? 'Notas' :
                       activePage === 'academico' ? 'Acadêmico' :
                       activePage === 'diario' ? 'Diário' :
                       activePage === 'atas' ? 'Atas' :
                       activePage === 'livros' ? 'Livros' :
                       activePage === 'arquivo-ativo' ? 'Arquivo Ativo' :
                       activePage === 'arquivo-morto' ? 'Arquivo Morto' :
                       activePage === 'inspecao-escolar' ? 'Inspeção' :
                       activePage === 'assinaturas' ? 'Assinaturas' :
                       activePage === 'eventos-escolares' ? 'Eventos' :
                       activePage === 'estoque' ? 'Estoque' :
                       activePage === 'planejamento' ? 'Planejamento' :
                       activePage === 'frequencia' ? 'Frequência' :
                       'Plataforma Escolar'} 
        />

        <main className="flex-1 overflow-y-auto bg-gray-50 focus:outline-none">
          {activePage === 'dashboard' && (
            <DashboardPage leads={filteredLeads} onNavigate={setActivePage} />
          )}
          {activePage === 'marketing' && (
            <Marketing 
                user={user} 
                schools={schools}
                onAddNewLead={handleAddNewLead} 
                leads={filteredLeads} 
                onSendInvitation={handleSendInvitation}
                onLinkOpened={handleLinkOpened}
                onEnrollmentCompleted={handleEnrollmentCompleted}
            />
          )}
          {activePage === 'gestao-matriculas' && (
            <EnrollmentManagement 
              user={user}
              schools={schools}
              leads={filteredLeads} 
              classes={filteredClasses}
              onAllocateStudent={handleAllocateStudent}
              onBulkAllocateStudents={handleBulkAllocateStudents}
              discountConfig={discountConfig}
              onImportLeadsFromCSV={handleImportLeadsFromCSV}
              superAdminSchoolFilter={superAdminSchoolFilter}
              setSuperAdminSchoolFilter={setSuperAdminSchoolFilter}
              onPrintEnrollmentForm={handlePrintEnrollment}
              onPrintStudentFile={handlePrintStudentFile}
            />
          )}
          {activePage === 'nova-matricula' && (
              <NovaMatriculaPage 
                user={user}
                schools={schools}
                onDirectEnrollment={handleDirectEnrollment}
                superAdminSchoolFilter={superAdminSchoolFilter}
              />
          )}
          {activePage === 'alunos' && (
            <StudentsPage 
                user={user} 
                leads={filteredLeads} 
                schools={schools}
                onPrintEnrollmentForm={handlePrintEnrollment}
                onPrintStudentFile={handlePrintStudentFile}
                superAdminSchoolFilter={superAdminSchoolFilter}
            />
          )}
          {activePage === 'funcionarios' && (
              <StaffPage 
                user={user} 
                schools={schools} 
                staff={filteredStaff} 
                classes={filteredClasses}
                onAddNewStaff={handleAddNewStaff}
                onUpdateStaffDocuments={handleUpdateStaffDocuments}
                superAdminSchoolFilter={superAdminSchoolFilter}
              />
          )}
          {activePage === 'financeiro' && (
            <FinancialPage 
              leads={filteredLeads} 
              onUpdatePaymentStatus={handleUpdatePaymentStatus} 
              onUpdateDiscountConfig={(newConfig) => setDiscountConfig(prev => ({ ...prev, ...newConfig }))}
              onUpdateFinancials={handleUpdateFinancials}
              onImportPayments={handleImportPayments}
              classes={filteredClasses}
            />
          )}
          {activePage === 'turmas' && (
              <ClassesPage 
                user={user} 
                classes={filteredClasses} 
                schools={schools} 
                onSaveClass={handleSaveClass} 
                onDeleteClass={handleDeleteClass} 
                superAdminSchoolFilter={superAdminSchoolFilter}
              />
          )}
          {activePage === 'disciplinas' && (
              <DisciplinesPage 
                user={user} 
                disciplines={filteredDisciplines} 
                staff={filteredStaff} 
                classes={filteredClasses} 
                schools={schools} 
                onSaveDiscipline={handleSaveDiscipline} 
                onDeleteDiscipline={handleDeleteDiscipline} 
                superAdminSchoolFilter={superAdminSchoolFilter}
              />
          )}
          {activePage === 'horarios' && (
              <SchedulesPage 
                user={user} 
                schedules={filteredSchedules} 
                staff={filteredStaff} 
                classes={filteredClasses} 
                schools={schools}
                onSaveSchedule={handleSaveSchedule} 
                onDeleteSchedule={handleDeleteSchedule} 
                onPrintSchedule={handlePrintSchedule}
              />
          )}
          {activePage === 'atividades-impressao' && (
              <PrintActivitiesPage 
                user={user} 
                schools={schools}
                classes={filteredClasses}
                printActivities={filteredPrintActivities} 
                onUploadActivity={handleUploadActivity} 
                onUpdateStatus={handleUpdateActivityStatus} 
                superAdminSchoolFilter={superAdminSchoolFilter}
              />
          )}
          {activePage === 'comunicacao' && (
              <CommunicationPage 
                user={user} 
                schools={schools}
                communications={filteredCommunications} 
                students={filteredLeads} 
                staff={filteredStaff} 
                classes={filteredClasses}
                onSendMessage={handleSendMessage} 
              />
          )}
          {activePage === 'declaracoes' && (
              <DeclarationsPage 
                user={user} 
                schools={schools}
                students={filteredLeads} 
                templates={filteredTemplates}
                onSaveTemplate={handleSaveTemplate}
                onDeleteTemplate={handleDeleteTemplate}
                onPrintDeclaration={handlePrintDeclaration}
                superAdminSchoolFilter={superAdminSchoolFilter}
              />
          )}
          {activePage === 'atas' && (
              <AtasPage 
                user={user}
                school={user.role === UserRole.SUPER_ADMINISTRADOR ? undefined : schools.find(s => s.id === user.schoolId)}
                onPrintAta={handlePrintAta}
              />
          )}
          {activePage === 'livros' && (
              <LivrosPage
                students={filteredLeads}
                school={schools.find(s => s.id === currentSchoolId)}
                onPrintLivro={handlePrintLivro}
                staff={filteredStaff}
                pontoRecords={filteredPontoRecords}
                onUploadPontoRecord={handleUploadPonto}
                onDeletePontoRecord={handleDeletePonto}
                inspecaoRecords={filteredInspecaoRecords}
                onSaveInspecaoRecord={handleSaveInspecao}
                onUploadInspecaoFile={handleUploadInspecaoFile}
                onDeleteInspecaoRecord={handleDeleteInspecao}
              />
          )}
          {activePage === 'configuracoes' && (
              <SettingsPage 
                user={user}
                users={users}
                schools={schools}
                onAddUser={handleAddUser}
                onUpdatePassword={handleUpdatePassword}
                onUpdateSchool={handleUpdateSchool}
                onCreateSchool={handleCreateSchool}
                onDeleteSchool={handleDeleteSchool}
              />
          )}
          {activePage === 'academico' && (
              <AcademicPage 
                user={user}
                students={filteredLeads}
                observations={filteredObservations}
                onAddNewObservation={handleAddNewObservation}
              />
          )}
          {activePage === 'notas' && (
              <GradesPage 
                user={user}
                students={filteredLeads}
                gradeConfigs={filteredGradeConfigs}
                onUpdateGradeConfig={handleUpdateGradeConfig}
                onUpdateStudentGrade={handleUpdateStudentGrade}
              />
          )}
          {activePage === 'diario' && (
              <ClassDiaryPage 
                user={user}
                schools={schools}
                classes={filteredClasses}
                disciplines={filteredDisciplines}
                classDiaryEntries={filteredDiaryEntries}
                onAddNewEntry={handleAddNewDiaryEntry}
                onUpdateEntry={handleUpdateDiaryEntry}
                onDeleteEntry={handleDeleteDiaryEntry}
                onPrintDiario={handlePrintDiario}
              />
          )}
          {activePage === 'calendario' && (
              <CalendarPage 
                user={user}
                schools={schools}
                events={filteredEvents}
                onAddOrUpdateEvent={handleAddOrUpdateEvent}
                onDeleteEvent={handleDeleteEvent}
                onImportCalendar={async (file, schoolIdOrAll, year) => {
                    // Mock import logic
                    alert(`Importing calendar for year ${year} to ${schoolIdOrAll}... (Feature pending backend)`);
                }}
              />
          )}
          {activePage === 'eventos-escolares' && (
              <SchoolEventsPage
                user={user}
                events={filteredEvents}
                onAddOrUpdateEvent={handleAddOrUpdateEvent}
                onDeleteEvent={handleDeleteEvent}
                schools={schools}
                classes={filteredClasses}
                students={filteredLeads}
                onPrintEventAttendance={handlePrintEventAttendance}
              />
          )}
          {activePage === 'arquivo-ativo' && (
              <ArquivosAtivoPage 
                students={filteredLeads}
                onUploadDocument={handleUploadStudentDocument}
                onDeleteDocument={handleDeleteStudentDocument}
              />
          )}
          {activePage === 'arquivo-morto' && <ArquivoMortoPage />}
          {activePage === 'inspecao-escolar' && <InspecaoEscolarPage />}
          {activePage === 'assinaturas' && (
              <SignaturesPage 
                user={user}
                students={filteredLeads}
                classes={filteredClasses}
                onUploadContract={handleUploadContract}
                superAdminSchoolFilter={superAdminSchoolFilter}
              />
          )}
          {activePage === 'estoque' && (
              <StockPage 
                user={user}
                schools={schools}
                items={filteredStockItems}
                movements={filteredStockMovements}
                students={filteredLeads}
                onSaveItem={handleSaveStockItem}
                onDeleteItem={handleDeleteStockItem}
                onRegisterMovement={handleRegisterMovement}
                superAdminSchoolFilter={superAdminSchoolFilter}
                selectedYear={selectedYear}
              />
          )}
          {activePage === 'planejamento' && (
              <EducatorPlanningPage 
                user={user}
                lessonPlans={filteredLessonPlans}
                curriculumMaps={filteredCurriculumMaps}
                classes={filteredClasses}
                disciplines={filteredDisciplines}
                staff={filteredStaff}
                schools={schools}
                onSavePlan={handleSaveLessonPlan}
                onDeletePlan={handleDeleteLessonPlan}
                onSaveMap={handleSaveCurriculumMap}
                onDeleteMap={handleDeleteCurriculumMap}
                superAdminSchoolFilter={superAdminSchoolFilter}
                selectedYear={selectedYear}
              />
          )}
          {activePage === 'frequencia' && (
              <AttendancePage 
                user={user}
                students={filteredLeads}
                classes={filteredClasses}
                schools={schools}
                attendanceRecords={filteredAttendanceRecords}
                onSaveAttendanceBatch={handleSaveAttendanceBatch}
                superAdminSchoolFilter={superAdminSchoolFilter}
                onPrintAttendanceReport={handlePrintAttendanceReport}
                selectedYear={selectedYear}
              />
          )}
        </main>
      </div>
    </div>
  );
};
