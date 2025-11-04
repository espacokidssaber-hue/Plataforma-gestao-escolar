import React, { useState, useEffect, useRef } from 'react';
import { DailyTask } from '../../types';

const DailyChecklist: React.FC = () => {
    const [tasks, setTasks] = useState<DailyTask[]>([]);
    const [newTaskText, setNewTaskText] = useState('');
    const [editingTask, setEditingTask] = useState<{ id: number; text: string } | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const editInputRef = useRef<HTMLInputElement>(null);

    const storageKey = `daily_tasks_${selectedDate.toISOString().split('T')[0]}`;

    // Load tasks from localStorage when the selected date changes
    useEffect(() => {
        const savedTasks = localStorage.getItem(storageKey);
        if (savedTasks) {
            setTasks(JSON.parse(savedTasks));
        } else {
            setTasks([]);
        }
    }, [storageKey]);

    // // Save tasks to localStorage whenever they change - DISABLED FOR DEMO MODE
    // useEffect(() => {
    //     localStorage.setItem(storageKey, JSON.stringify(tasks));
    // }, [tasks, storageKey]);
    
    // Focus input when editing
    useEffect(() => {
        if (editingTask && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingTask]);

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskText.trim()) {
            const newTask: DailyTask = {
                id: Date.now(),
                text: newTaskText.trim(),
                completed: false,
            };
            setTasks(prev => [...prev, newTask]);
            setNewTaskText('');
        }
    };

    const handleToggleTask = (id: number) => {
        setTasks(prev => prev.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const handleDeleteTask = (id: number) => {
        setTasks(prev => prev.filter(task => task.id !== id));
    };

    const handleStartEditing = (task: DailyTask) => {
        setEditingTask({ id: task.id, text: task.text });
    };

    const handleSaveEdit = () => {
        if (editingTask) {
            setTasks(prev => prev.map(task =>
                task.id === editingTask.id ? { ...task, text: editingTask.text } : task
            ));
            setEditingTask(null);
        }
    };
    
    const handleDateChange = (offset: number) => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + offset);
            return newDate;
        });
    };

    const handleGoToToday = () => {
        setSelectedDate(new Date());
    };

    const isToday = selectedDate.toDateString() === new Date().toDateString();

    const completedCount = tasks.filter(t => t.completed).length;
    const totalCount = tasks.length;
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg h-full flex flex-col">
            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                <h4 className="font-bold text-gray-900 dark:text-white">Minha Lista de Tarefas</h4>
                 <div className="flex items-center space-x-2">
                    <button onClick={() => handleDateChange(-1)} className="p-1 bg-gray-200 dark:bg-gray-700/60 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700">&lt;</button>
                    <span className="font-semibold text-gray-800 dark:text-white text-sm">{selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</span>
                    <button onClick={() => handleDateChange(1)} className="p-1 bg-gray-200 dark:bg-gray-700/60 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700">&gt;</button>
                    {!isToday && (
                        <button onClick={handleGoToToday} className="text-xs text-teal-600 dark:text-teal-400 hover:underline ml-2">Hoje</button>
                    )}
                 </div>
            </div>
            <div className="mt-2">
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Progresso</span>
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
                         {editingTask?.id === task.id ? (
                            <input
                                ref={editInputRef}
                                type="text"
                                value={editingTask.text}
                                onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                                onBlur={handleSaveEdit}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                                className="flex-grow mx-2 bg-transparent text-gray-800 dark:text-white focus:outline-none"
                            />
                        ) : (
                            <span className={`flex-grow mx-2 text-sm ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-white'}`}>
                                {task.text}
                            </span>
                        )}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                             <button onClick={() => handleStartEditing(task)} className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>
                            </button>
                            <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    </div>
                ))}
                 {tasks.length === 0 && (
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">
                        Nenhuma tarefa para este dia.
                    </p>
                )}
            </div>
            <form onSubmit={handleAddTask} className="mt-4 flex items-center space-x-2">
                <input 
                    type="text" 
                    value={newTaskText}
                    onChange={e => setNewTaskText(e.target.value)}
                    placeholder="Adicionar nova tarefa..."
                    className="flex-grow bg-white dark:bg-gray-800/50 p-2 rounded-md text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500"
                />
                <button type="submit" className="p-2 bg-teal-600 text-white rounded-md hover:bg-teal-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default DailyChecklist;