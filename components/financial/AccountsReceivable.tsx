import React, { useState, useMemo } from 'react';
import { Invoice, InvoiceStatus, EnrolledStudent, StudentLifecycleStatus, SchoolUnit } from '../../types';
import PaymentConfirmationModal from './PaymentConfirmationModal';
import GenerateInvoicesModal from './GenerateInvoicesModal';

const MOCK_INVOICES: Invoice[] = [
    { id: 1001, studentId: 301, studentName: 'Alice Braga', description: 'Mensalidade Nov/23', amount: 1200.00, dueDate: '2023-11-05', status: InvoiceStatus.PAID, paymentMethod: 'PIX' },
    { id: 1002, studentId: 302, studentName: 'Bento Ribeiro', description: 'Mensalidade Nov/23', amount: 1200.00, dueDate: '2023-11-05', status: InvoiceStatus.OVERDUE },
    { id: 1003, studentId: 303, studentName: 'Clara Nunes', description: 'Mensalidade Nov/23', amount: 1140.00, dueDate: '2023-11-05', status: InvoiceStatus.PENDING },
    { id: 1004, studentId: 304, studentName: 'Dante Oliveira', description: 'Mensalidade Nov/23', amount: 1200.00, dueDate: '2023-11-05', status: InvoiceStatus.PENDING },
    { id: 1005, studentId: 302, studentName: 'Bento Ribeiro', description: 'Mensalidade Out/23', amount: 1200.00, dueDate: '2023-10-05', status: InvoiceStatus.PAID, paymentMethod: 'Comprovante', paymentReceiptUrl: 'data:application/pdf;base64,JVB...' },
];

// Mock list of students to generate invoices for
// FIX: Add missing 'unit' property to MOCK_STUDENTS_FOR_INVOICING items to conform to the EnrolledStudent type.
const MOCK_STUDENTS_FOR_INVOICING: EnrolledStudent[] = [
    { id: 301, name: 'Alice Braga', grade: 'Infantil II', className: 'Infantil II A', classId: 1, unit: SchoolUnit.MATRIZ, status: StudentLifecycleStatus.ACTIVE, financialStatus: 'OK', libraryStatus: 'OK', academicDocsStatus: 'OK', avatar:'' },
    { id: 302, name: 'Bento Ribeiro', grade: '1º Ano', className: '1º Ano A', classId: 2, unit: SchoolUnit.MATRIZ, status: StudentLifecycleStatus.ACTIVE, financialStatus: 'OK', libraryStatus: 'OK', academicDocsStatus: 'OK', avatar:'' },
    { id: 303, name: 'Clara Nunes', grade: '2º Ano', className: '2º Ano B', classId: 3, unit: SchoolUnit.FILIAL, status: StudentLifecycleStatus.ACTIVE, financialStatus: 'OK', libraryStatus: 'OK', academicDocsStatus: 'OK', avatar:'' },
    { id: 304, name: 'Dante Oliveira', grade: '1º Ano', className: '1º Ano A', classId: 2, unit: SchoolUnit.MATRIZ, status: StudentLifecycleStatus.ACTIVE, financialStatus: 'OK', libraryStatus: 'OK', academicDocsStatus: 'OK', avatar:'' },
];


const StatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
    const statusClasses = {
        [InvoiceStatus.PAID]: 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300',
        [InvoiceStatus.PENDING]: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300',
        [InvoiceStatus.OVERDUE]: 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`}>
            {status}
        </span>
    );
};


const AccountsReceivable: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
    const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all');
    const [invoiceToConfirm, setInvoiceToConfirm] = useState<Invoice | null>(null);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

    const handleConfirmPayment = (updatedInvoice: Invoice) => {
        setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
        setInvoiceToConfirm(null);
        alert(`Pagamento da fatura #${updatedInvoice.id} registrado com sucesso!`);
    };

    const handleBulkGenerate = (config: { month: string, year: string, dueDate: string, baseAmount: number, description: string, applyDiscount: boolean, level: string }) => {
        const referencePeriod = `${config.month.slice(0, 3)}/${config.year.slice(2)}`;
        
        let studentsToInvoice = MOCK_STUDENTS_FOR_INVOICING;

        if (config.level !== 'all') {
             studentsToInvoice = MOCK_STUDENTS_FOR_INVOICING.filter(student => {
                if (config.level === 'infantil' && student.grade.toLowerCase().includes('infantil')) return true;
                if (config.level === 'fundamental1' && ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano'].includes(student.grade)) return true;
                // Add more levels if needed
                return false;
            });
        }

        let generatedCount = 0;
        let skippedCount = 0;
        const newInvoices: Invoice[] = [];

        studentsToInvoice.forEach(student => {
            // Check if an invoice for this student and period already exists
            const alreadyExists = invoices.some(inv => 
                inv.studentId === student.id && inv.description.includes(referencePeriod)
            );

            if (alreadyExists) {
                skippedCount++;
                return;
            }
            
            generatedCount++;
            const newInvoice: Invoice = {
                id: Date.now() + student.id,
                studentId: student.id,
                studentName: student.name,
                description: config.description.replace('{mes}', config.month).replace('{ano}', config.year),
                amount: config.applyDiscount ? config.baseAmount * 0.95 : config.baseAmount, // 5% discount simulation
                dueDate: config.dueDate,
                status: new Date(config.dueDate) < new Date() ? InvoiceStatus.OVERDUE : InvoiceStatus.PENDING,
            };
            newInvoices.push(newInvoice);
        });
        
        setInvoices(prev => [...newInvoices, ...prev].sort((a, b) => b.id - a.id));
        setIsGenerateModalOpen(false);
        alert(`${generatedCount} mensalidades geradas com sucesso.\n${skippedCount} alunos foram ignorados pois já possuíam fatura para este período.`);
    };


    const filteredInvoices = useMemo(() => {
        if(filter === 'all') return invoices;
        return invoices.filter(inv => inv.status === filter);
    }, [invoices, filter]);

    return (
         <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contas a Receber (Mensalidades)</h2>
                <button
                    onClick={() => setIsGenerateModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors flex items-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13 7H7v6h6V7z" /><path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 1a1 1 0 011-1h8a1 1 0 011 1v1a1 1 0 01-1 1H7a1 1 0 01-1-1V6z" clipRule="evenodd" /></svg>
                    <span>Gerar Mensalidades em Lote</span>
                </button>
            </div>
            <div className="flex items-center space-x-2 mb-4">
                <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm rounded-md ${filter === 'all' ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>Todos</button>
                <button onClick={() => setFilter(InvoiceStatus.PENDING)} className={`px-3 py-1 text-sm rounded-md ${filter === InvoiceStatus.PENDING ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>Pendentes</button>
                <button onClick={() => setFilter(InvoiceStatus.OVERDUE)} className={`px-3 py-1 text-sm rounded-md ${filter === InvoiceStatus.OVERDUE ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>Atrasados</button>
                <button onClick={() => setFilter(InvoiceStatus.PAID)} className={`px-3 py-1 text-sm rounded-md ${filter === InvoiceStatus.PAID ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>Pagos</button>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                            <th className="p-3">Fatura #</th>
                            <th className="p-3">Aluno</th>
                            <th className="p-3">Descrição</th>
                            <th className="p-3">Vencimento</th>
                            <th className="p-3">Valor</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map(inv => (
                            <tr key={inv.id} className="border-b border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                <td className="p-3 text-gray-500 dark:text-gray-400">{inv.id}</td>
                                <td className="p-3 font-semibold text-gray-800 dark:text-white">{inv.studentName}</td>
                                <td className="p-3 text-gray-600 dark:text-gray-300">{inv.description}</td>
                                <td className="p-3 text-gray-600 dark:text-gray-300">{new Date(inv.dueDate + 'T00:00:00-03:00').toLocaleDateString('pt-BR')}</td>
                                <td className="p-3 font-semibold text-gray-800 dark:text-white">R$ {inv.amount.toFixed(2)}</td>
                                <td className="p-3"><StatusBadge status={inv.status} /></td>
                                <td className="p-3 text-right">
                                    {inv.status === InvoiceStatus.PAID ? (
                                        inv.paymentMethod === 'Comprovante' && inv.paymentReceiptUrl ? (
                                            <a href={inv.paymentReceiptUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-blue-100 dark:bg-blue-600/50 text-blue-700 dark:text-blue-200 text-sm font-semibold rounded-md hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors">
                                                Ver Comprovante
                                            </a>
                                        ) : (
                                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{inv.paymentMethod || 'Confirmado'}</span>
                                        )
                                    ) : (
                                        <button onClick={() => setInvoiceToConfirm(inv)} className="px-3 py-1 bg-green-100 dark:bg-green-600/50 text-green-700 dark:text-green-200 text-sm font-semibold rounded-md hover:bg-green-200 dark:hover:bg-green-600 transition-colors">
                                            Registrar Pagamento
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredInvoices.find(inv => inv.id === 1002 && inv.status === InvoiceStatus.OVERDUE) && (
                     <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-500/50 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
                         <p><span className="font-bold">Sugestão do Assistente Gemini:</span> A família de Bento Ribeiro tem um histórico de atrasos de 5-7 dias, mas sempre quita o valor integral. Sugerimos aguardar mais 2 dias antes de enviar um lembrete de cobrança automático para evitar desgaste no relacionamento.</p>
                     </div>
                 )}
            </div>
            {invoiceToConfirm && (
                <PaymentConfirmationModal
                    invoice={invoiceToConfirm}
                    onClose={() => setInvoiceToConfirm(null)}
                    onConfirm={handleConfirmPayment}
                />
            )}
            {isGenerateModalOpen && (
                <GenerateInvoicesModal
                    onClose={() => setIsGenerateModalOpen(false)}
                    onGenerate={handleBulkGenerate}
                />
            )}
        </div>
    )
};

export default AccountsReceivable;