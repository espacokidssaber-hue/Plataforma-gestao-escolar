import React, { useState, useMemo } from 'react';
import { ReEnrollingStudent, ReEnrollmentStatus, DocumentStatus, SchoolUnit } from '../types';
import { streamMessage } from '../services/geminiService';
import ReEnrollmentPortal from './ReEnrollmentPortal';
import IndividualInviteModal from './IndividualInviteModal';
import BulkInviteConfirmModal from './BulkInviteConfirmModal'; // Importado
import { useEnrollment } from '../contexts/EnrollmentContext';


const StatusBadge: React.FC<{ status: ReEnrollmentStatus }> = ({ status }) => {
    const statusClasses = {
        [ReEnrollmentStatus.PENDING_INVITE]: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
        [ReEnrollmentStatus.INVITED]: 'bg-gray-200 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300',
        [ReEnrollmentStatus.DATA_VALIDATED]: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
        [ReEnrollmentStatus.CONTRACT_ACCEPTED]: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
        [ReEnrollmentStatus.PAYMENT_PENDING]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
        [ReEnrollmentStatus.COMPLETED]: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
        [ReEnrollmentStatus.DECLINED]: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`}>
            {status}
        </span>
    );
};

const KPICard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
    <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50 text-center">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{title}</h3>
    </div>
);

const ReEnrollmentCampaign: React.FC = () => {
    const { enrolledStudents } = useEnrollment();
    const [isCampaignActive, setIsCampaignActive] = useState(false);
    
    // Transform EnrolledStudent to ReEnrollingStudent for this component's logic
    const [students, setStudents] = useState<ReEnrollingStudent[]>(() => 
        enrolledStudents.map(s => ({
            id: s.id,
            name: s.name,
            avatar: s.avatar,
            currentGrade: s.className,
            nextGrade: `Próxima: ${s.grade}`, // Placeholder logic
            status: ReEnrollmentStatus.PENDING_INVITE, // Initial status for campaign
            guardianName: s.guardians?.[0]?.name || 'N/A',
            lastActionDate: new Date().toISOString().split('T')[0],
            paymentStatus: 'Pendente',
            contractSignature: 'Pendente',
            documents: [],
            reenrollmentFee: 0,
            unit: s.unit
        }))
    );
    
    const [filter, setFilter] = useState<ReEnrollmentStatus | 'all'>('all');
    const [campaignText, setCampaignText] = useState("Prezados pais e responsáveis,\n\nÉ com grande alegria que anunciamos o início da nossa campanha de Pré-Matrícula para o ano letivo de 2025! Convidamos vocês a garantirem a vaga dos nossos queridos alunos para mais um ano de aprendizado e crescimento.\n\nAcesse o portal exclusivo através do link abaixo para validar os dados, anexar documentos e efetuar o pagamento da taxa de pré-matrícula de forma rápida e segura.\n\nContamos com vocês!");
    const [defaultFee, setDefaultFee] = useState(500);
    const [isGeneratingText, setIsGeneratingText] = useState(false);
    const [studentForPortal, setStudentForPortal] = useState<ReEnrollingStudent | null>(null);
    const [studentToInvite, setStudentToInvite] = useState<ReEnrollingStudent | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);


    const handleGenerateText = async () => {
        setIsGeneratingText(true);
        setCampaignText('');
        const prompt = "Escreva um texto caloroso e profissional para os pais sobre o início da campanha de pré-matrícula da escola. Mencione que o processo é online, incluindo validação de dados, envio de documentos e pagamento.";
        try {
            const reader = await streamMessage(prompt);
            const decoder = new TextDecoder();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                const chunkText = decoder.decode(value);
                setCampaignText(prev => prev + chunkText);
            }
        } catch (error) {
            console.error(error);
            alert(`Erro ao gerar texto com IA: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsGeneratingText(false);
        }
    };


    const handleLaunchCampaign = (e: React.FormEvent) => {
        e.preventDefault();
        setIsConfirmModalOpen(true);
    };

    const handleConfirmBulkInvite = () => {
        // Collective invite: send to all pending students with the default fee
        setStudents(prev => prev.map(s => s.status === ReEnrollmentStatus.PENDING_INVITE 
            ? { ...s, status: ReEnrollmentStatus.INVITED, reenrollmentFee: defaultFee } 
            : s
        ));
        setIsConfirmModalOpen(false);
        setIsCampaignActive(true);
        alert('Campanha disparada com sucesso!');
    };


    const handleConfirmIndividualInvite = (student: ReEnrollingStudent, fee: number) => {
        setStudents(prev => prev.map(s => s.id === student.id 
            ? { ...s, status: ReEnrollmentStatus.INVITED, reenrollmentFee: fee }
            : s
        ));
        setStudentToInvite(null);
    };
    
    const handlePortalSave = (updatedStudent: ReEnrollingStudent) => {
        setStudents(prev => prev.map(s => s.id === updatedStudent.id ? { ...updatedStudent, status: ReEnrollmentStatus.COMPLETED, lastActionDate: new Date().toISOString().split('T')[0] } : s));
        setStudentForPortal(null);
    }

    const kpis = useMemo(() => {
        const total = students.length;
        const completed = students.filter(s => s.status === ReEnrollmentStatus.COMPLETED).length;
        const pending = total - completed - students.filter(s => s.status === ReEnrollmentStatus.DECLINED).length;
        const declined = students.filter(s => s.status === ReEnrollmentStatus.DECLINED).length;
        return { total, completed, pending, declined };
    }, [students]);

    const filteredStudents = useMemo(() => {
        if (filter === 'all') return students;
        return students.filter(s => s.status === filter);
    }, [students, filter]);
    
    const studentsPendingInvite = useMemo(() => {
        return students.filter(s => s.status === ReEnrollmentStatus.PENDING_INVITE).length;
    }, [students]);

    if (!isCampaignActive && students.length > 0) {
        return (
            <>
                <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800/50 p-8 rounded-xl border border-gray-200 dark:border-gray-700/50">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Configurar Campanha de Pré-Matrícula</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Defina os parâmetros para o próximo ciclo de renovação. Ao disparar, os convites serão enviados aos responsáveis.</p>
                    <form onSubmit={handleLaunchCampaign} className="space-y-4">
                        <div>
                            <label htmlFor="campaign-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Texto do Comunicado</label>
                            <textarea id="campaign-text" value={campaignText} onChange={(e) => setCampaignText(e.target.value)} rows={6} className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"></textarea>
                            <button type="button" onClick={handleGenerateText} disabled={isGeneratingText} className="mt-2 px-3 py-1.5 bg-teal-100 dark:bg-teal-600/50 text-teal-700 dark:text-teal-200 text-xs font-semibold rounded-md hover:bg-teal-200 dark:hover:bg-teal-600 hover:text-teal-800 dark:hover:text-white flex items-center disabled:bg-gray-300 dark:disabled:bg-gray-600">
                                {isGeneratingText && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                {isGeneratingText ? 'Gerando...' : 'Gerar com IA'}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Início</label>
                                <input type="date" id="start-date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                            </div>
                            <div>
                                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Fim</label>
                                <input type="date" id="end-date" className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="fee-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor da Taxa de Pré-Matrícula Padrão (R$)</label>
                            <input type="number" id="fee-value" placeholder="Ex: 500,00" value={defaultFee} onChange={e => setDefaultFee(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                        <div>
                            <button type="submit" className="w-full mt-4 px-6 py-3 bg-teal-600 hover:bg-teal-500 rounded-lg font-semibold text-white transition-colors">
                                Disparar Campanha para Todos ({studentsPendingInvite} alunos)
                            </button>
                        </div>
                    </form>
                </div>
                {isConfirmModalOpen && (
                    <BulkInviteConfirmModal
                        studentCount={studentsPendingInvite}
                        defaultFee={defaultFee}
                        campaignText={campaignText}
                        onClose={() => setIsConfirmModalOpen(false)}
                        onConfirm={handleConfirmBulkInvite}
                    />
                )}
            </>
        );
    }
    
    if (students.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                <p>Nenhum aluno ativo encontrado para iniciar uma campanha de rematrícula.</p>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800/30 rounded-lg mt-6">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
                <KPICard title="Total de Alunos" value={kpis.total} />
                <KPICard title="Pré-Matriculados" value={`${kpis.completed} (${Math.round((kpis.completed/kpis.total)*100)}%)`} />
                <KPICard title="Pendentes" value={kpis.pending} />
                <KPICard title="Recusaram" value={kpis.declined} />
            </div>
            
            <div className="px-6 pb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                <th className="p-3">Aluno</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-center">Taxa (R$)</th>
                                <th className="p-3 text-center">Pagamento</th>
                                <th className="p-3 text-center">Contrato</th>
                                <th className="p-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => (
                                <tr key={student.id} className="border-b border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                    <td className="p-3">
                                        <div className="flex items-center space-x-3">
                                            <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full" />
                                            <div>
                                                <span className="font-semibold text-gray-900 dark:text-white">{student.name}</span>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{student.guardianName}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3"><StatusBadge status={student.status} /></td>
                                    <td className="p-3 text-center font-mono text-gray-900 dark:text-white">
                                        {student.reenrollmentFee > 0 ? student.reenrollmentFee.toFixed(2) : '-'}
                                    </td>
                                    <td className="p-3 text-center">
                                         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${student.paymentStatus === 'Pago' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300'}`}>{student.paymentStatus}</span>
                                    </td>
                                     <td className="p-3 text-center">
                                         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${student.contractSignature !== 'Pendente' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300'}`}>{student.contractSignature}</span>
                                    </td>
                                    <td className="p-3 text-right">
                                        {student.status === ReEnrollmentStatus.PENDING_INVITE && (
                                            <button onClick={() => setStudentToInvite(student)} className="px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white dark:bg-teal-600/50 dark:text-teal-200 text-sm font-semibold rounded-md dark:hover:bg-teal-600 dark:hover:text-white transition-colors">
                                                Enviar Convite Individual
                                            </button>
                                        )}
                                        {student.status !== ReEnrollmentStatus.PENDING_INVITE && student.status !== ReEnrollmentStatus.DECLINED && student.status !== ReEnrollmentStatus.COMPLETED && (
                                             <button onClick={() => setStudentForPortal(student)} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600/50 dark:text-blue-200 text-sm font-semibold rounded-md dark:hover:bg-blue-600 dark:hover:text-white transition-colors">
                                                Acessar Portal (Sim.)
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {studentForPortal && (
                <ReEnrollmentPortal
                    student={studentForPortal}
                    onClose={() => setStudentForPortal(null)}
                    onSave={handlePortalSave}
                />
            )}
            {studentToInvite && (
                <IndividualInviteModal
                    student={studentToInvite}
                    defaultFee={defaultFee}
                    onClose={() => setStudentToInvite(null)}
                    onConfirm={handleConfirmIndividualInvite}
                />
            )}
        </div>
    );
};

export default ReEnrollmentCampaign;