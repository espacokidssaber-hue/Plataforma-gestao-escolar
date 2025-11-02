import React from 'react';

const KPICard: React.FC<{ title: string; value: string; change?: string; changeType?: 'increase' | 'decrease' }> = ({ title, value, change, changeType }) => {
    const changeColor = changeType === 'increase' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    return (
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700/50">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
            {change && (
                <p className={`text-sm mt-2 flex items-center ${changeColor}`}>
                    {changeType === 'increase' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                    )}
                    {change}
                </p>
            )}
        </div>
    );
};


const FinancialOverview: React.FC = () => {
    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Faturamento Previsto (Mês)" value="R$ 194.800" change="+1.2% vs. mês passado" changeType="increase" />
                <KPICard title="Despesas Lançadas (Mês)" value="R$ 121.300" change="+3.5% vs. mês passado" changeType="increase" />
                <KPICard title="Resultado Líquido (Mês)" value="R$ 73.500" change="-2.1% vs. mês passado" changeType="decrease" />
                <KPICard title="Inadimplência Geral" value="3.4%" change="-0.5% vs. mês passado" changeType="decrease" />
            </div>

             <div className="mt-8 bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700/50">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Próximos Vencimentos</h3>
                 <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700/40 rounded-lg">
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-white">Folha de Pagamento</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Referente a Outubro/2023</p>
                        </div>
                        <div className="text-right">
                             <p className="font-bold text-red-600 dark:text-red-400">R$ 85.000,00</p>
                             <p className="text-xs text-gray-500 dark:text-gray-400">Vence em 2 dias</p>
                        </div>
                    </div>
                     <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700/40 rounded-lg">
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-white">Aluguel do Prédio</p>
                             <p className="text-sm text-gray-500 dark:text-gray-400">Competência Novembro/2023</p>
                        </div>
                        <div className="text-right">
                             <p className="font-bold text-red-600 dark:text-red-400">R$ 15.000,00</p>
                             <p className="text-xs text-gray-500 dark:text-gray-400">Vence em 5 dias</p>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default FinancialOverview;