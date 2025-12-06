import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Lead, LeadStatus, PaymentStatus, DiscountConfig, User, SchoolClass, FinancialRecord } from '../types';
import { PAYMENT_STATUS_COLORS } from '../constants';
import { Button } from './ui/Button';
import { CashIcon } from './icons/CashIcon';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { DocumentArrowUpIcon } from './icons/DocumentArrowUpIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { ArrowUturnLeftIcon } from './icons/ArrowUturnLeftIcon';
import { DotsVerticalIcon } from './icons/DotsVerticalIcon';
import { UsersIcon } from './icons/UsersIcon';
import { AcademicCapIcon } from './icons/AcademicCapIcon';
import { Modal } from './ui/Modal';
import { PencilIcon } from './icons/PencilIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { RectangleGroupIcon } from './icons/RectangleGroupIcon';

interface FinancialPageProps {
  leads: Lead[];
  onUpdatePaymentStatus: (leadId: string, newStatus: PaymentStatus) => void;
  onUpdateDiscountConfig: (newConfig: Partial<DiscountConfig>) => void;
  onUpdateFinancials: (leadId: string, financials: { enrollmentFee: number, monthlyFee: number, discountPercentage: number }) => Promise<void>;
  onImportPayments: (file: File) => Promise<{ updated: number, total: number }>;
  classes?: SchoolClass[];
}

interface FinancialStatCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
}

const FinancialStatCard: React.FC<FinancialStatCardProps> = ({ title, value, icon: Icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className="bg-teal-100 rounded-full p-3 mr-4">
            <Icon className="w-7 h-7 text-teal-600" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const PaymentStatusSummaryCard: React.FC<{ title: string; count: number; color: string; icon: React.ElementType }> = ({ title, count, color, icon: Icon }) => (
    <div className="bg-white p-4 rounded-lg shadow flex items-start">
        <div className={`rounded-full p-2 mr-4 ${color.replace('text-', 'bg-').replace('800', '100')}`}>
            <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
            <p className="text-xl font-bold text-gray-800">{count}</p>
            <p className="text-sm font-medium text-gray-500">{title}</p>
        </div>
    </div>
);

const IntelligenceCard: React.FC<{ title: string; value: string; subtitle?: string; color: string }> = ({ title, value, subtitle, color }) => (
    <div className={`p-4 rounded-lg shadow border-l-4 ${color.replace('text-', 'border-').replace('800', '500')} bg-white`}>
        <p className="text-xs font-semibold uppercase text-gray-500">{title}</p>
        <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
);

const ClassRoomMap: React.FC<{ 
    schoolClass: SchoolClass; 
    students: (Lead & { currentStatus: PaymentStatus; currentRevenue: number })[];
}> = ({ schoolClass, students }) => {
    const capacity = schoolClass.capacity || 20;
    const totalRevenue = students.reduce((sum, s) => sum + s.currentRevenue, 0);
    const occupancyRate = (students.length / capacity) * 100;

    const slots = Array.from({ length: capacity }, (_, i) => {
        return students[i] || null;
    });

    const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 flex flex-col h-full">
            <div className="flex justify-between items-start mb-3 border-b pb-2">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">{schoolClass.name}</h3>
                    <p className="text-xs text-gray-500">{schoolClass.period} • {schoolClass.level}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-teal-700">{formatCurrency(totalRevenue)}</p>
                    <p className="text-[10px] text-gray-400 uppercase">Receita da Turma</p>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Ocupação: {students.length}/{capacity}</span>
                    <span>{occupancyRate.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className={`h-2 rounded-full ${occupancyRate >= 100 ? 'bg-red-500' : 'bg-teal-500'}`} 
                        style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    ></div>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-2 flex-grow content-start">
                {slots.map((student, index) => {
                    if (student) {
                        let bgColor = 'bg-gray-200';
                        if (student.currentStatus === PaymentStatus.PAID) bgColor = 'bg-green-500';
                        else if (student.currentStatus === PaymentStatus.OVERDUE) bgColor = 'bg-red-500';
                        else if (student.currentStatus === PaymentStatus.PENDING) bgColor = 'bg-yellow-400';

                        return (
                            <div key={student.id} className="relative group flex justify-center">
                                <div 
                                    className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-help transition-transform hover:scale-110`}
                                >
                                    {index + 1}
                                </div>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-[150px] bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none text-center shadow-lg">
                                    <p className="font-semibold">{student.studentName}</p>
                                    <p className="opacity-80">Status: {student.currentStatus}</p>
                                    <p className="opacity-80 font-mono">{formatCurrency(student.currentRevenue)}</p>
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <div key={`empty-${index}`} className="flex justify-center">
                                <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-300 text-xs">
                                    {index + 1}
                                </div>
                            </div>
                        );
                    }
                })}
            </div>
            
            <div className="mt-4 pt-2 border-t border-gray-100 flex justify-center gap-3 text-[10px] text-gray-500">
                <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span> Pago</div>
                <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-yellow-400 mr-1"></span> Pendente</div>
                <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span> Atrasado</div>
                <div className="flex items-center"><span className="w-2 h-2 rounded-full border border-dashed border-gray-300 mr-1"></span> Livre</div>
            </div>
        </div>
    );
};

const EditFinancialsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    student: Lead;
    onSave: (leadId: string, financials: { enrollmentFee: number, monthlyFee: number, discountPercentage: number }) => Promise<void>;
}> = ({ isOpen, onClose, student, onSave }) => {
    const [formData, setFormData] = useState({
        enrollmentFee: '',
        monthlyFee: '',
        discountPercentage: ''
    });
    const [finalFee, setFinalFee] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && student) {
            setFormData({
                enrollmentFee: student.enrollmentFee?.toString() || '',
                monthlyFee: student.monthlyFee?.toString() || '',
                discountPercentage: student.discountPercentage?.toString() || ''
            });
        }
    }, [isOpen, student]);

    useEffect(() => {
        const monthly = parseFloat(formData.monthlyFee) || 0;
        const discount = parseFloat(formData.discountPercentage) || 0;
        setFinalFee(monthly * (1 - discount / 100));
    }, [formData.monthlyFee, formData.discountPercentage]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Allow numbers and one dot
        const numericValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        setFormData(prev => ({ ...prev, [name]: numericValue }));
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            await onSave(student.id, {
                enrollmentFee: parseFloat(formData.enrollmentFee) || 0,
                monthlyFee: parseFloat(formData.monthlyFee) || 0,
                discountPercentage: parseFloat(formData.discountPercentage) || 0
            });
            onClose();
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar alterações.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Editar Condições Financeiras - ${student.studentName}`}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Valor da Matrícula (R$)</label>
                    <input name="enrollmentFee" value={formData.enrollmentFee} onChange={handleChange} className={inputClass} placeholder="0.00" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Valor da Mensalidade (R$)</label>
                    <input name="monthlyFee" value={formData.monthlyFee} onChange={handleChange} className={inputClass} placeholder="0.00" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Desconto (%)</label>
                    <input name="discountPercentage" value={formData.discountPercentage} onChange={handleChange} className={inputClass} placeholder="0" />
                </div>
                <div className="pt-2">
                    <div className="bg-gray-50 p-3 rounded border">
                        <p className="text-xs text-gray-500 uppercase">Valor Final Mensalidade</p>
                        <p className="text-xl font-bold text-teal-700">{formatCurrency(finalFee)}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export const FinancialPage: React.FC<FinancialPageProps> = ({ leads, onUpdatePaymentStatus, onUpdateDiscountConfig, onUpdateFinancials, onImportPayments, classes = [] }) => {
  const [activeFilter, setActiveFilter] = useState<PaymentStatus | 'all'>('all');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [editingFinancialStudent, setEditingFinancialStudent] = useState<Lead | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isImportingPayments, setIsImportingPayments] = useState(false);
  const paymentImportInputRef = useRef<HTMLInputElement>(null);
  const [paymentImportMessage, setPaymentImportMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  const allocatedStudents = leads.filter(lead => lead.status === LeadStatus.ALLOCATED);

  const availablePeriods = useMemo(() => {
      const periods = new Set<string>();
      allocatedStudents.forEach(s => {
          if (Array.isArray(s.financialHistory)) {
              s.financialHistory.forEach(h => periods.add(h.period));
          } else if (s.financialHistory && (s.financialHistory as any).period) {
              periods.add((s.financialHistory as any).period);
          }
      });
      return Array.from(periods).sort((a, b) => b.localeCompare(a));
  }, [allocatedStudents]);

  useEffect(() => {
      if (availablePeriods.length > 0 && !selectedPeriod) {
          setSelectedPeriod(availablePeriods[0]);
      } else if (!selectedPeriod) {
          const now = new Date();
          const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          setSelectedPeriod(current);
      }
  }, [availablePeriods, selectedPeriod]);

  const getPreviousPeriod = (current: string) => {
      const [year, month] = current.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      date.setMonth(date.getMonth() - 1);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const calculateFinalFee = (student: Lead) => {
    if (student.monthlyFee === undefined || student.discountPercentage === undefined) return student.monthlyFee || 0;
    return student.monthlyFee * (1 - student.discountPercentage / 100);
  };

  const calculateMetricsForPeriod = (period: string) => {
      let totalNetRevenue = 0;
      let totalEducbankFees = 0;
      let overdueCount = 0;
      let totalDaysOverdue = 0;
      let paidCount = 0;
      let pendingCount = 0;
      
      const classStats: Record<string, { total: number, overdue: number, revenue: number }> = {};

      const studentsInPeriod = allocatedStudents.map(s => {
          let record: FinancialRecord | undefined;
          if (Array.isArray(s.financialHistory)) {
              record = s.financialHistory.find(h => h.period === period);
          }
          
          const status = record ? record.status : PaymentStatus.PENDING;
          const className = s.className || 'Sem Turma';
          
          // Calculate effective revenue for this period (Record Net Value OR Contract Value)
          const currentRevenue = record?.netValue ?? calculateFinalFee(s);

          if (!classStats[className]) classStats[className] = { total: 0, overdue: 0, revenue: 0 };
          classStats[className].total++;

          if (record) {
              totalNetRevenue += record.netValue || 0;
              totalEducbankFees += record.educbankFee || 0;
              classStats[className].revenue += record.netValue || 0;

              if (status === PaymentStatus.PAID) paidCount++;
              if (status === PaymentStatus.PENDING) pendingCount++;
              if (status === PaymentStatus.OVERDUE) {
                  overdueCount++;
                  classStats[className].overdue++;
                  if (record.dueDate) {
                      const today = new Date();
                      const dueDate = new Date(record.dueDate);
                      const diffTime = Math.abs(today.getTime() - dueDate.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                      totalDaysOverdue += diffDays;
                  }
              }
          } else {
              pendingCount++; 
              // If no record, we assume contract revenue for potential revenue context in class map
              classStats[className].revenue += currentRevenue;
          }

          return { ...s, currentPeriodRecord: record, currentStatus: status, currentRevenue };
      });

      const avgDaysOverdue = overdueCount > 0 ? Math.round(totalDaysOverdue / overdueCount) : 0;

      let maxDelinquencyClass = { name: 'N/A', rate: 0 };
      let minDelinquencyClass = { name: 'N/A', rate: 100 };

      Object.entries(classStats).forEach(([className, stats]) => {
        if (stats.total === 0) return;
        const rate = (stats.overdue / stats.total) * 100;
        
        if (rate > maxDelinquencyClass.rate) maxDelinquencyClass = { name: className, rate };
        if (rate < minDelinquencyClass.rate) minDelinquencyClass = { name: className, rate };
        if (minDelinquencyClass.name === 'N/A') minDelinquencyClass = { name: className, rate };
      });
      
      if (Object.keys(classStats).length > 0 && minDelinquencyClass.name === 'N/A') {
         const perfectClass = Object.entries(classStats).find(([_, stats]) => stats.overdue === 0);
         if (perfectClass) minDelinquencyClass = { name: perfectClass[0], rate: 0 };
      }

      return {
          totalNetRevenue,
          totalEducbankFees,
          overdueCount,
          avgDaysOverdue,
          paidCount,
          pendingCount,
          maxDelinquencyClass,
          minDelinquencyClass,
          studentsWithPeriodData: studentsInPeriod,
          classStats
      };
  };

  const currentMetrics = useMemo(() => calculateMetricsForPeriod(selectedPeriod), [allocatedStudents, selectedPeriod]);
  const previousMetrics = useMemo(() => calculateMetricsForPeriod(getPreviousPeriod(selectedPeriod)), [allocatedStudents, selectedPeriod]);

  const generalMetrics = useMemo(() => {
    const totalMonthlyRevenue = allocatedStudents.reduce((acc, student) => {
        return acc + calculateFinalFee(student);
      }, 0);
  
      const totalEnrollmentFees = allocatedStudents.reduce((acc, student) => acc + (student.enrollmentFee || 0), 0);
      const studentsWithDiscount = allocatedStudents.filter(s => (s.discountPercentage || 0) > 0).length;
      const totalDiscountPercentage = allocatedStudents.reduce((acc, student) => acc + (student.discountPercentage || 0), 0);
      const averageDiscount = studentsWithDiscount > 0 ? totalDiscountPercentage / allocatedStudents.length : 0;

      return { totalMonthlyRevenue, totalEnrollmentFees, studentsWithDiscount, averageDiscount };
  }, [allocatedStudents]);

  const filteredStudents = useMemo(() => {
    const list = currentMetrics.studentsWithPeriodData;
    if (activeFilter === 'all') return list;
    return list.filter(student => student.currentStatus === activeFilter);
  }, [currentMetrics, activeFilter]);

  const formatCurrency = (value?: number) => {
    if (value === undefined) return '-';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handlePaymentImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsImportingPayments(true);
      setPaymentImportMessage(null);

      try {
          const result = await onImportPayments(file);
          setPaymentImportMessage({ type: 'success', text: `Sucesso! Status atualizado para ${result.updated} alunos.` });
          if(paymentImportInputRef.current) paymentImportInputRef.current.value = '';
          setTimeout(() => setPaymentImportMessage(null), 5000);
      } catch (error) {
          console.error(error);
          setPaymentImportMessage({ type: 'error', text: (error as Error).message });
      } finally {
          setIsImportingPayments(false);
      }
  };

  const handleUpdateStatus = (leadId: string, newStatus: PaymentStatus) => {
    onUpdatePaymentStatus(leadId, newStatus);
    setOpenDropdownId(null);
  };

  const handleEditClick = (student: Lead) => {
      setEditingFinancialStudent(student);
      setOpenDropdownId(null);
  };

  const getFilterButtonClass = (status: PaymentStatus | 'all') => {
    const base = "px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors";
    const active = "bg-teal-600 text-white shadow";
    const inactive = "bg-white text-gray-600 hover:bg-gray-100 border";
    return `${base} ${activeFilter === status ? active : inactive}`;
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
        <p className="text-gray-600 mt-1">Acompanhe a saúde financeira da escola e gerencie os pagamentos.</p>
      </div>

      <div className="mb-8 flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
          <CalendarDaysIcon className="w-6 h-6 text-teal-600" />
          <div>
              <label htmlFor="period-select" className="block text-xs font-semibold text-gray-500 uppercase">Período de Análise</label>
              <select
                id="period-select"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="mt-1 block w-48 rounded-md border-gray-300 py-1.5 text-base focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
              >
                  {availablePeriods.map(p => (
                      <option key={p} value={p}>{new Date(p + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</option>
                  ))}
                  {availablePeriods.length === 0 && <option>{selectedPeriod}</option>}
              </select>
          </div>
          <div className="text-xs text-gray-400 ml-auto">
              Visualizando dados de competência: {selectedPeriod}
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <FinancialStatCard title="Receita Contratada" value={formatCurrency(generalMetrics.totalMonthlyRevenue)} icon={CurrencyDollarIcon} />
        <FinancialStatCard title="Total em Matrículas" value={formatCurrency(generalMetrics.totalEnrollmentFees)} icon={CashIcon} />
        <FinancialStatCard title="Alunos com Desconto" value={generalMetrics.studentsWithDiscount.toString()} icon={UsersIcon} />
        <FinancialStatCard title="Média de Desconto" value={`${generalMetrics.averageDiscount.toFixed(1)}%`} icon={ChartBarIcon} />
      </div>

      {/* Financial Intelligence Dashboard */}
      <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-teal-600" />
              Painel de Inteligência Financeira ({selectedPeriod})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <IntelligenceCard 
                  title="Repasse Líquido" 
                  value={formatCurrency(currentMetrics.totalNetRevenue)} 
                  subtitle={`Taxas: ${formatCurrency(currentMetrics.totalEducbankFees)}`}
                  color="text-green-800" 
              />
              <IntelligenceCard 
                  title="Alunos em Atraso" 
                  value={currentMetrics.overdueCount.toString()} 
                  subtitle={`Média: ${currentMetrics.avgDaysOverdue} dias de atraso`}
                  color="text-red-800" 
              />
              <IntelligenceCard 
                  title="Maior Inadimplência" 
                  value={currentMetrics.maxDelinquencyClass.rate.toFixed(1) + '%'}
                  subtitle={`Turma: ${currentMetrics.maxDelinquencyClass.name}`}
                  color="text-orange-800" 
              />
              <IntelligenceCard 
                  title="Menor Inadimplência" 
                  value={currentMetrics.minDelinquencyClass.rate.toFixed(1) + '%'}
                  subtitle={`Turma: ${currentMetrics.minDelinquencyClass.name}`}
                  color="text-blue-800" 
              />
          </div>
      </div>

      {/* Class Map Visualization */}
      <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <RectangleGroupIcon className="w-5 h-5 mr-2 text-teal-600" />
              Mapa de Turmas ({selectedPeriod})
          </h2>
          {classes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {classes.map(schoolClass => {
                      const studentsInClass = currentMetrics.studentsWithPeriodData.filter(
                          s => s.className === schoolClass.name && s.schoolId === schoolClass.schoolId
                      );
                      
                      return (
                          <ClassRoomMap 
                              key={schoolClass.id} 
                              schoolClass={schoolClass} 
                              students={studentsInClass}
                          />
                      );
                  })}
              </div>
          ) : (
              <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
                  Nenhuma turma cadastrada. Crie turmas no menu "Turmas" para visualizar o mapa.
              </div>
          )}
      </div>

      {/* Comparison Analysis */}
      <div className="mb-12 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-md font-semibold text-gray-800">Análise Comparativa de Turmas (Mês Anterior vs Atual)</h3>
          </div>
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                      <tr>
                          <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Turma</th>
                          <th className="px-6 py-3 text-center font-medium text-gray-500 uppercase">Inadimplência ({getPreviousPeriod(selectedPeriod)})</th>
                          <th className="px-6 py-3 text-center font-medium text-gray-500 uppercase">Inadimplência ({selectedPeriod})</th>
                          <th className="px-6 py-3 text-center font-medium text-gray-500 uppercase">Variação</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {Object.keys(currentMetrics.classStats).sort().map(className => {
                          const current = currentMetrics.classStats[className];
                          const previous = previousMetrics.classStats[className] || { total: 0, overdue: 0 };
                          
                          const currentRate = current.total > 0 ? (current.overdue / current.total) * 100 : 0;
                          const previousRate = previous.total > 0 ? (previous.overdue / previous.total) * 100 : 0;
                          const variation = currentRate - previousRate;
                          
                          return (
                              <tr key={className} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 font-medium text-gray-900">{className}</td>
                                  <td className="px-6 py-4 text-center text-gray-600">{previousRate.toFixed(1)}%</td>
                                  <td className="px-6 py-4 text-center font-semibold text-gray-800">{currentRate.toFixed(1)}%</td>
                                  <td className="px-6 py-4 text-center">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                          variation > 0 ? 'bg-red-100 text-red-800' : variation < 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                      }`}>
                                          {variation > 0 ? '▲' : variation < 0 ? '▼' : '-'} {Math.abs(variation).toFixed(1)}%
                                      </span>
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      </div>

      <div className="mt-12">
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Controle de Mensalidades ({selectedPeriod})</h2>
            <div className="flex items-center gap-2">
                <input 
                    type="file" 
                    ref={paymentImportInputRef} 
                    className="hidden" 
                    accept=".csv" 
                    onChange={handlePaymentImport} 
                />
                <Button onClick={() => paymentImportInputRef.current?.click()} variant="secondary" disabled={isImportingPayments}>
                    {isImportingPayments ? <SpinnerIcon className="w-4 h-4 mr-2" /> : <DocumentArrowUpIcon className="w-4 h-4 mr-2" />}
                    {isImportingPayments ? 'Importando...' : 'Reconciliar Pagamentos (CSV)'}
                </Button>
            </div>
        </div>
        {paymentImportMessage && (
            <div className={`mb-6 p-4 rounded-md text-sm ${paymentImportMessage.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {paymentImportMessage.text}
            </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <PaymentStatusSummaryCard title="Total de Alunos" count={allocatedStudents.length} color="text-gray-800" icon={AcademicCapIcon} />
            <PaymentStatusSummaryCard title="Pagos" count={currentMetrics.paidCount} color="text-green-800" icon={CheckCircleIcon} />
            <PaymentStatusSummaryCard title="Pendentes" count={currentMetrics.pendingCount} color="text-yellow-800" icon={CashIcon} />
            <PaymentStatusSummaryCard title="Atrasados" count={currentMetrics.overdueCount} color="text-red-800" icon={ExclamationTriangleIcon} />
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                  <button onClick={() => setActiveFilter('all')} className={getFilterButtonClass('all')}>Todos</button>
                  <button onClick={() => setActiveFilter(PaymentStatus.PAID)} className={getFilterButtonClass(PaymentStatus.PAID)}>Pago</button>
                  <button onClick={() => setActiveFilter(PaymentStatus.PENDING)} className={getFilterButtonClass(PaymentStatus.PENDING)}>Pendente</button>
                  <button onClick={() => setActiveFilter(PaymentStatus.OVERDUE)} className={getFilterButtonClass(PaymentStatus.OVERDUE)}>Atrasado</button>
              </div>
          </div>

          <div>
            {allocatedStudents.length > 0 ? (
              <div>
                {/* Desktop Header */}
                <div className="hidden md:grid md:grid-cols-[3fr,2fr,2fr,2fr,2fr,2fr,1fr] md:gap-4 px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div>Aluno</div>
                  <div>Turma</div>
                  <div>Fatura / Pago</div>
                  <div>Detalhes Pagamento</div>
                  <div>Taxas / Líquido</div>
                  <div>Status ({selectedPeriod})</div>
                  <div className="text-right">Ações</div>
                </div>
                {/* Students List */}
                <div className="divide-y md:divide-y-0 divide-gray-200">
                  {filteredStudents.map((student) => {
                    const record = student.currentPeriodRecord;
                    const paymentStatus = student.currentStatus;
                    const statusColors = PAYMENT_STATUS_COLORS[paymentStatus];
                    const fin = (record || {}) as Partial<FinancialRecord>;

                    return (
                      <div key={student.id} className="p-4 md:p-0 md:grid md:grid-cols-[3fr,2fr,2fr,2fr,2fr,2fr,1fr] md:gap-4 md:items-center hover:bg-gray-50 transition-colors">
                        {/* Aluno */}
                        <div className="md:px-6 md:py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 truncate" title={student.studentName}>{student.studentName}</div>
                          <div className="text-xs text-gray-500 truncate">{student.responsibleName}</div>
                        </div>

                        {/* Turma */}
                        <div className="mt-2 pt-2 border-t md:border-t-0 md:pt-0 md:mt-0 md:px-6 md:py-4 whitespace-nowrap">
                          <div className="text-xs font-medium text-gray-500 md:hidden mb-1">Turma</div>
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800">
                            {student.className}
                          </span>
                        </div>

                        {/* Fatura / Pago */}
                        <div className="mt-2 pt-2 border-t md:border-t-0 md:pt-0 md:mt-0 md:px-6 md:py-4 whitespace-nowrap">
                          <div className="text-xs font-medium text-gray-500 md:hidden mb-1">Fatura / Pago</div>
                          <div className="text-xs text-gray-500">Fatura: {fin.invoiceValue ? formatCurrency(fin.invoiceValue) : formatCurrency(calculateFinalFee(student))}</div>
                          {fin.amountPaid ? (
                              <div className="text-sm font-bold text-gray-900 mt-0.5">Pago: {formatCurrency(fin.amountPaid)}</div>
                          ) : (
                              <div className="text-xs text-gray-400 mt-0.5">-</div>
                          )}
                        </div>

                        {/* Detalhes Pagamento (Data/Method) */}
                        <div className="mt-2 pt-2 border-t md:border-t-0 md:pt-0 md:mt-0 md:px-6 md:py-4 whitespace-nowrap">
                           <div className="text-xs font-medium text-gray-500 md:hidden mb-1">Detalhes</div>
                           {fin.paymentDate ? (
                               <>
                                <div className="text-sm text-gray-900">{fin.paymentDate}</div>
                                <div className="text-xs text-gray-500 mt-0.5 capitalize">{fin.paymentMethod || 'N/A'}</div>
                                </>
                           ) : <span className="text-xs text-gray-400">-</span>}
                        </div>

                        {/* Taxas / Líquido */}
                        <div className="mt-2 pt-2 border-t md:border-t-0 md:pt-0 md:mt-0 md:px-6 md:py-4 whitespace-nowrap">
                            <div className="text-xs font-medium text-gray-500 md:hidden mb-1">Taxas</div>
                            {fin.educbankFee ? (
                                <>
                                    <div className="text-xs text-red-600" title="Taxa Educbank (8%)">Taxa: -{formatCurrency(fin.educbankFee)}</div>
                                    <div className="text-sm font-bold text-green-700 mt-0.5" title="Valor Líquido">Líq: {formatCurrency(fin.netValue)}</div>
                                </>
                            ) : <span className="text-xs text-gray-400">-</span>}
                        </div>

                        {/* Status */}
                        <div className="mt-2 pt-2 border-t md:border-t-0 md:pt-0 md:mt-0 md:px-6 md:py-4 whitespace-nowrap">
                          <div className="text-xs font-medium text-gray-500 md:hidden mb-1">Status</div>
                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors.bg} ${statusColors.text}`}>
                              {paymentStatus}
                          </span>
                        </div>
                        
                        {/* Actions */}
                        <div className="mt-4 pt-2 border-t md:border-t-0 md:pt-0 md:mt-0 md:px-6 md:py-4 whitespace-nowrap text-right">
                          <div className="relative inline-block text-left" ref={openDropdownId === student.id ? dropdownRef : null}>
                            <Button variant="secondary" onClick={() => setOpenDropdownId(openDropdownId === student.id ? null : student.id)}>
                              <DotsVerticalIcon className="w-5 h-5" />
                            </Button>
                            {openDropdownId === student.id && (
                              <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                  <button onClick={() => handleEditClick(student)} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <PencilIcon className="w-5 h-5 mr-3 text-teal-600" />
                                    Editar Condições Financeiras
                                  </button>
                                  <button onClick={() => handleUpdateStatus(student.id, PaymentStatus.PAID)} disabled={paymentStatus === PaymentStatus.PAID} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                                    <CheckCircleIcon className="w-5 h-5 mr-3 text-green-500" />
                                    Confirmar Pagamento
                                  </button>
                                  <button onClick={() => handleUpdateStatus(student.id, PaymentStatus.OVERDUE)} disabled={paymentStatus === PaymentStatus.OVERDUE} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                                    <ExclamationTriangleIcon className="w-5 h-5 mr-3 text-red-500" />
                                    Marcar como Atrasado
                                  </button>
                                   <button onClick={() => handleUpdateStatus(student.id, PaymentStatus.PENDING)} disabled={paymentStatus === PaymentStatus.PENDING} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                                    <ArrowUturnLeftIcon className="w-5 h-5 mr-3 text-yellow-500" />
                                    Reverter para Pendente
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                  )})}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-6">
                  <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum Aluno para Gestão Financeira</h3>
                  <p className="mt-1 text-sm text-gray-500">
                      Quando os alunos forem matriculados e alocados em turmas, eles aparecerão aqui.
                  </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {editingFinancialStudent && (
          <EditFinancialsModal 
            isOpen={!!editingFinancialStudent}
            onClose={() => setEditingFinancialStudent(null)}
            student={editingFinancialStudent}
            onSave={onUpdateFinancials}
          />
      )}
    </div>
  );
};