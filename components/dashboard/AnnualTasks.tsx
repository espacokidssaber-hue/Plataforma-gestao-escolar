import React, { useState, useEffect } from 'react';
import { MonthlyTask } from '../../types';

const ANNUAL_TASKS: Record<string, string[]> = {
    janeiro: [
        'Encerrar Fichas Individuais',
        'Escriturar Históricos Escolares dos concluintes e dos alunos que solicitem transferência',
        'Matricular novos alunos',
        'Concluir organização das classes',
        'Encaminhar à Inspetoria Técnica de Ensino, a Ata de Resultados Finais',
    ],
    fevereiro: [
        'Verificar se ainda existe matrícula com declaração provisória. Caso positivo, comunicar ao interessado que o prazo está esgotado',
        'Organizar horário de aulas',
        'Arquivar prontuário de concluintes, transferidos e desistentes',
        'Abrir prontuário de alunos novos',
        'Escriturar nomes dos alunos nos diários de classe',
        'Analisar históricos escolares de alunos transferidos para encaminhar à equipe técnica os casos dependentes de adaptação de currículo',
    ],
    março: [
        'Verificar se os diários de classe estão com os devidos registros',
        'Expedir Diplomas e Certificados de Habilitação Profissional. Esta tarefa deve ser contínua enquanto houver Diplomas ou Certificados a expedir',
        'Verificar, diàriamente, o livro de pontos de professores, funcionários.',
    ],
    abril: [
        'Preencher Fichas Individuais, em consonância com os diários de classe',
        'Escriturar Atas de Rendimento Escolar',
        'Verificar os diários de classe e elaborar calendário de reposição de aulas para os professores faltosos',
        'Verificar o livro de ponto',
    ],
    maio: [
        'Escriturar notas nas Fichas Individuais. Esta tarefa será repetida no final de cada bimestre.',
    ],
    junho: ['Atividades de rotina'],
    julho: ['Atividades de rotina'],
    agosto: ['Atividades de rotina'],
    setembro: ['Atividades de rotina'],
    outubro: ['Atividades de rotina'],
    novembro: [
        'Publicar, em local visível, relação nominal de alunos que dependem de Estudos de Recuperação. Esta tarefa deve ser cumprida bimestralmente.',
    ],
    dezembro: [
        'Publicar relação nominal dos alunos aprovados e reprovados após recuperação.',
        'Planejar a matrícula do ano seguinte.',
    ],
};

const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];


const AnnualTasks: React.FC = () => {
    const [tasks, setTasks] = useState<MonthlyTask[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const year = selectedDate.getFullYear();
    const monthIndex = selectedDate.getMonth();
    const storageKey = `annual_tasks_completed_${year}-${monthIndex}`;
    const selectedMonthName = selectedDate.toLocaleString('pt-BR', { month: 'long' });

    useEffect(() => {
        const monthNameKey = selectedDate.toLocaleString('pt-BR', { month: 'long' }).toLowerCase();
        const masterTasks = ANNUAL_TASKS[monthNameKey] || [];
        const savedCompleted = JSON.parse(localStorage.getItem(storageKey) || '{}');

        const monthTasks: MonthlyTask[] = masterTasks.map((text, index) => {
            const id = `${monthNameKey}-${index}`;
            return {
                id,
                text,
                completed: savedCompleted[id] || false,
            };
        });
        setTasks(monthTasks);

    }, [storageKey, selectedDate]);


    const handleToggleTask = (id: string) => {
        const updatedTasks = tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        setTasks(updatedTasks);
        
        const completedStatus = updatedTasks.reduce((acc, task) => {
            if (task.completed) {
                acc[task.id] = true;
            }
            return acc;
        }, {} as Record<string, boolean>);

        localStorage.setItem(storageKey, JSON.stringify(completedStatus));
    };
    
    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMonthIndex = parseInt(e.target.value, 10);
        setSelectedDate(new Date(year, newMonthIndex, 1));
    };

    const handlePrevMonth = () => {
        setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };
    
    const handleNextMonth = () => {
        setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const handleGoToCurrentMonth = () => {
        setSelectedDate(new Date());
    };

    const handleResetYear = () => {
        const currentYear = selectedDate.getFullYear();
        if (window.confirm(`Tem certeza de que deseja reiniciar o progresso de todas as tarefas do ano de ${currentYear}? Esta ação limpará todas as marcações de conclusão para o ano inteiro e não pode ser desfeita.`)) {
            // Iterate through all 12 months of the year
            for (let i = 0; i < 12; i++) {
                const key = `annual_tasks_completed_${currentYear}-${i}`;
                localStorage.removeItem(key);
            }

            // Force a re-render of the current month's tasks to show they are now incomplete
            const monthNameKey = selectedDate.toLocaleString('pt-BR', { month: 'long' }).toLowerCase();
            const masterTasks = ANNUAL_TASKS[monthNameKey] || [];
            const monthTasks: MonthlyTask[] = masterTasks.map((text, index) => {
                const id = `${monthNameKey}-${index}`;
                return { id, text, completed: false };
            });
            setTasks(monthTasks);
            
            alert(`O cronograma de tarefas para ${currentYear} foi reiniciado com sucesso.`);
        }
    };


    const isCurrentMonth = new Date().getMonth() === monthIndex && new Date().getFullYear() === year;

    const completedCount = tasks.filter(t => t.completed).length;
    const totalCount = tasks.length;
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    return (
        <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg h-full flex flex-col">
            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                 <h4 className="font-bold text-gray-900 dark:text-white capitalize">Cronograma de Tarefas</h4>
                 <div className="flex items-center space-x-2">
                    <button onClick={handlePrevMonth} className="p-1 bg-gray-200 dark:bg-gray-700/60 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700">&lt;</button>
                    <select value={monthIndex} onChange={handleMonthChange} className="bg-transparent text-gray-800 dark:text-white font-semibold focus:outline-none">
                        {MONTH_NAMES.map((name, index) => <option key={name} value={index}>{name}</option>)}
                    </select>
                     <button onClick={handleNextMonth} className="p-1 bg-gray-200 dark:bg-gray-700/60 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700">&gt;</button>
                    {!isCurrentMonth && (
                        <button onClick={handleGoToCurrentMonth} className="text-xs text-teal-600 dark:text-teal-400 hover:underline ml-2">Mês Atual</button>
                    )}
                    <button 
                        onClick={handleResetYear} 
                        title={`Reiniciar progresso de ${year}`} 
                        className="p-1.5 bg-red-100 dark:bg-red-800/50 rounded-md text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.182-3.182m0-4.992v4.992m0 0h-4.992m4.992 0l-3.182-3.182a8.25 8.25 0 00-11.667 0L2.985 19.644z" />
                        </svg>
                    </button>
                 </div>
            </div>
             <div className="mt-2">
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Progresso de {selectedMonthName}</span>
                    <span>{completedCount} / {totalCount}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>
            <div className="mt-4 space-y-2 flex-grow overflow-y-auto pr-2">
                {tasks.map(task => (
                    <div key={task.id} className="group flex items-center bg-white dark:bg-gray-800/50 p-2 rounded-md">
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleTask(task.id)}
                            className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-teal-500 focus:ring-teal-500 cursor-pointer"
                        />
                        <span className={`flex-grow mx-2 text-sm ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-white'}`}>
                            {task.text}
                        </span>
                    </div>
                ))}
                 {tasks.length === 0 && (
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">
                        Nenhuma tarefa específica para este mês no cronograma.
                    </p>
                )}
            </div>
        </div>
    );
};

export default AnnualTasks;