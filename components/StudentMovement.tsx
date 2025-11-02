import React, { useState, useMemo, useRef, useEffect } from 'react';
import { EnrolledStudent, StudentLifecycleStatus, SchoolClass, NewExtemporaneousData, SchoolUnit } from '../types';
import { useEnrollment } from '../contexts/EnrollmentContext';
import ExtemporaneousEnrollmentModal from './ExtemporaneousEnrollmentModal';

interface StudentMovementProps {
    highlightedClassId: number | null;
    setHighlightedClassId: (id: number | null) => void;
}

const getCapacityForClass = (targetClass: SchoolClass): number => {
    if (!targetClass || !targetClass.capacity) return 0;
    const capacityKey = targetClass.unit.toLowerCase() as keyof typeof targetClass.capacity;
    return targetClass.capacity[capacityKey] || 0;
};


// --- Card e Coluna para a nova UI Kanban ---

const StudentCard: React.FC<{
    student: EnrolledStudent;
    isSelected: boolean;
    onToggleSelection: () => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
}> = ({ student, isSelected, onToggleSelection, onDragStart }) => (
    <div
        draggable
        onDragStart={onDragStart}
        className={`p-2 bg-white dark:bg-gray-800 rounded-lg border flex items-center space-x-2 cursor-grab active:cursor-grabbing transition-all ${isSelected ? 'border-teal-500 ring-2 ring-teal-500/50' : 'border-gray-200 dark:border-gray-700'}`}
    >
        {student.classId === -1 && (
            <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelection}
                className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-teal-500 focus:ring-teal-500 cursor-pointer flex-shrink-0"
                onClick={(e) => e.stopPropagation()} // Evita que o drag comece ao clicar no checkbox
            />
        )}
        <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="flex-grow overflow-hidden">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{student.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Origem: {student.originClassName || student.grade} {student.originClassTurma || ''}
            </p>
        </div>
    </div>
);

const AllocationColumn: React.FC<{
    title: string;
    students: EnrolledStudent[];
    classData?: SchoolClass;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    isOver: boolean;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: () => void;
    children: React.ReactNode;
    isHighlighted: boolean;
    columnRef: (el: HTMLDivElement | null) => void;
}> = ({ title, students, classData, onDrop, isOver, onDragOver, onDragLeave, children, isHighlighted, columnRef }) => {
    const totalCapacity = classData ? getCapacityForClass(classData) : undefined;
    
    return (
        <div
            ref={columnRef}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`flex-shrink-0 w-72 bg-gray-100 dark:bg-gray-900/50 p-3 rounded-lg transition-all duration-300 ${isOver ? 'bg-teal-100 dark:bg-teal-900/40' : ''} ${isHighlighted ? 'ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-gray-900' : ''}`}
        >
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 px-1">
                {title} ({students.length}{totalCapacity !== undefined ? ` / ${totalCapacity}`: ''})
            </h3>
            <div className="space-y-2 h-[60vh] overflow-y-auto pr-1">
                {children}
            </div>
        </div>
    );
}

// --- Barra de Alocação ---
const AllocationBar: React.FC<{
  selectedCount: number;
  classes: SchoolClass[];
  onAllocate: (targetClassId: number) => void;
  onClearSelection: () => void;
}> = ({ selectedCount, classes, onAllocate, onClearSelection }) => {
  const [targetClassId, setTargetClassId] = useState<string>('');

  const handleAllocateClick = () => {
    if (targetClassId) {
      onAllocate(Number(targetClassId));
    } else {
      alert('Por favor, selecione uma turma de destino.');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg-top z-20 flex justify-center items-center animate-slide-up">
      <div className="flex items-center space-x-4">
        <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedCount} aluno(s) selecionado(s)</span>
        <select
          value={targetClassId}
          onChange={(e) => setTargetClassId(e.target.value)}
          className="bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-gray-900 dark:text-white"
        >
          <option value="">Selecione a turma...</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button
          onClick={handleAllocateClick}
          disabled={!targetClassId}
          className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 disabled:bg-gray-400"
        >
          Alocar na Turma
        </button>
        <button
          onClick={onClearSelection}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          title="Limpar seleção"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
       <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        .shadow-lg-top {
            box-shadow: 0 -4px 6px -1px rgb(0 0 0 / 0.1), 0 -2px 4px -2px rgb(0 0 0 / 0.1);
        }
      `}</style>
    </div>
  );
};


const StudentMovement: React.FC<StudentMovementProps> = ({ highlightedClassId, setHighlightedClassId }) => {
    const { enrolledStudents, updateEnrolledStudent, addExtemporaneousApplicant, classes } = useEnrollment();
    const [searchTerm, setSearchTerm] = useState('');
    const [isExtemporaneousModalOpen, setIsExtemporaneousModalOpen] = useState(false);
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
    const [dragOverColumnId, setDragOverColumnId] = useState<number | 'unassigned' | null>(null);
    const columnRefs = useRef<Map<number, HTMLDivElement>>(new Map());

     useEffect(() => {
        if (highlightedClassId) {
            const node = columnRefs.current.get(highlightedClassId);
            if (node) {
                node.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
            // Clear the highlight after a delay
            const timer = setTimeout(() => {
                setHighlightedClassId(null);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [highlightedClassId, setHighlightedClassId]);


    const studentsToDisplay = useMemo(() => 
        enrolledStudents
            .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => a.classId === -1 ? -1 : 1), // Prioriza alunos "A alocar"
    [enrolledStudents, searchTerm]);
    
    const unallocatedStudents = useMemo(() => studentsToDisplay.filter(s => s.classId === -1), [studentsToDisplay]);

    const findClassForStudent = (pdfSerie: string | undefined, pdfTurma: string | undefined, unit: SchoolUnit, allClasses: SchoolClass[]): SchoolClass | undefined => {
        if (!pdfSerie) return undefined;
        const normalizedSerie = pdfSerie.toLowerCase().trim();
        const normalizedTurma = pdfTurma?.toUpperCase().trim() || '';
        const gradeMatch = normalizedSerie.match(/(\d+)\s*º?\s*ano|infantil\s*(\d+)|inf\s*(\d+)/);
        if (!gradeMatch) {
            const combinedName = `${normalizedSerie} ${normalizedTurma}`.replace(/[\s-ºª.:]/g, '').trim();
            return allClasses.find(c => {
               const normalizedClassName = c.name.toLowerCase().replace(/[\s-ºª.:]/g, '');
               return normalizedClassName === combinedName && c.unit === unit;
            });
        }
        let targetGrade: string;
        if (gradeMatch[1]) {
            targetGrade = `${gradeMatch[1]}º Ano`;
        } else {
            targetGrade = `Infantil ${gradeMatch[2] || gradeMatch[3]}`;
        }
        if (!normalizedTurma) return undefined;
        const perfectMatch = allClasses.find(c => 
            c.grade === targetGrade &&
            c.name.toUpperCase().endsWith(` ${normalizedTurma}`) && // Check if name ends with ' A', ' B' etc.
            c.unit === unit
        );
        if (perfectMatch) return perfectMatch;
        const fallbackMatch = allClasses.find(c => 
            c.grade === targetGrade &&
            c.name.toUpperCase().endsWith(` ${normalizedTurma}`)
        );
        return fallbackMatch;
    };

    const missingClasses = useMemo(() => {
        const missing = new Set<string>();
        unallocatedStudents.forEach(student => {
            if (student.originClassName) {
                const foundClass = findClassForStudent(student.originClassName!, student.originClassTurma, student.unit, classes);
                if (!foundClass) {
                    missing.add(`${student.originClassName} ${student.originClassTurma}`.trim());
                }
            }
        });
        return Array.from(missing);
    }, [unallocatedStudents, classes]);

    const handleToggleSelection = (student: EnrolledStudent) => {
        if (student.classId !== -1 || !student.originClassName) {
            setSelectedStudentIds(prev => {
                const newSet = new Set(prev);
                if (newSet.has(student.id)) newSet.delete(student.id);
                else newSet.add(student.id);
                return newSet;
            });
            return;
        }
    
        const studentsInSameOriginClass = unallocatedStudents.filter(s =>
            s.originClassName === student.originClassName && s.originClassTurma === student.originClassTurma
        );
    
        const idsToToggle = studentsInSameOriginClass.map(s => s.id);
    
        setSelectedStudentIds(prev => {
            const newSet = new Set(prev);
            const shouldSelect = !prev.has(student.id);
            if (shouldSelect) idsToToggle.forEach(id => newSet.add(id));
            else idsToToggle.forEach(id => newSet.delete(id));
            return newSet;
        });
    };

    const handleSaveExtemporaneous = (data: NewExtemporaneousData) => {
        addExtemporaneousApplicant(data);
        setIsExtemporaneousModalOpen(false);
        alert(`Aluno ${data.studentName} adicionado com sucesso! Ele está na coluna "A alocar".`);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, student: EnrolledStudent) => {
        e.dataTransfer.setData('studentId', student.id.toString());
        e.dataTransfer.setData('sourceClassId', (student.classId ?? -1).toString());
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetClass: SchoolClass | null) => {
        e.preventDefault();
        setDragOverColumnId(null);
        
        const draggedStudentId = parseInt(e.dataTransfer.getData('studentId'), 10);
        const sourceClassId = parseInt(e.dataTransfer.getData('sourceClassId'), 10);
        const targetClassId = targetClass ? targetClass.id : -1;

        if (sourceClassId === targetClassId) return;

        const studentsToMoveIds = selectedStudentIds.has(draggedStudentId) ? Array.from(selectedStudentIds) : [draggedStudentId];
        const studentsToMove = studentsToMoveIds.map(id => enrolledStudents.find(s => s.id === id)).filter((s): s is EnrolledStudent => !!s);
        
        if (targetClass) {
            const capacity = getCapacityForClass(targetClass);
            const currentEnrollment = enrolledStudents.filter(s => s.classId === targetClass.id).length;
            if (currentEnrollment + studentsToMove.length > capacity) {
                alert(`Ação bloqueada: A turma "${targetClass.name}" (${targetClass.unit}) não tem capacidade suficiente para ${studentsToMove.length} novo(s) aluno(s).\nVagas disponíveis: ${capacity - currentEnrollment}`);
                return;
            }
        }
        
        let movedCount = 0;
        studentsToMove.forEach(student => {
            updateEnrolledStudent({
                ...student,
                classId: targetClassId,
                className: targetClass ? targetClass.name : 'A alocar',
                unit: targetClass ? targetClass.unit : student.unit,
            });
            movedCount++;
        });

        if (movedCount > 0) {
            setSelectedStudentIds(new Set());
        }
    };
    
    const handleAllocate = (targetClassId: number) => {
        const targetClass = classes.find(c => c.id === targetClassId);
        if (!targetClass) return;
    
        const studentsToMove = Array.from(selectedStudentIds)
            .map(id => enrolledStudents.find(s => s.id === id))
            .filter((s): s is EnrolledStudent => !!s);
            
        if (studentsToMove.length === 0) return;
    
        const capacity = getCapacityForClass(targetClass);
        const currentEnrollment = enrolledStudents.filter(s => s.classId === targetClass.id).length;
        
        if (currentEnrollment + studentsToMove.length > capacity) {
            alert(`Ação bloqueada: A turma "${targetClass.name}" (${targetClass.unit}) não tem capacidade suficiente para ${studentsToMove.length} novo(s) aluno(s).\nVagas disponíveis: ${capacity - currentEnrollment}`);
            return;
        }
        
        studentsToMove.forEach(student => {
            updateEnrolledStudent({
                ...student,
                classId: targetClass.id,
                className: targetClass.name,
                unit: targetClass.unit,
            });
        });
    
        setSelectedStudentIds(new Set());
    };

    return (
        <div className="mt-4">
            <header className="flex justify-between items-center mb-4 flex-wrap gap-4">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Movimentação e Enturmação</h2>
                 <button onClick={() => setIsExtemporaneousModalOpen(true)} className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-500">
                    + Nova Matrícula
                </button>
            </header>

            {missingClasses.length > 0 && (
                <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-200">
                    <p className="font-bold">Atenção: Turmas não encontradas!</p>
                    <p className="text-sm">As seguintes turmas lidas do PDF não existem no sistema: <strong>{missingClasses.join(', ')}</strong>. Por favor, crie-as em "Matrículas {'>'} Gestão de Turmas" para poder alocar os alunos.</p>
                </div>
            )}

             <div className="mb-4">
                <input 
                    type="search"
                    placeholder="Buscar aluno por nome..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm bg-white dark:bg-gray-800/50 p-2 rounded-lg border border-gray-300 dark:border-gray-600"
                />
            </div>
            
            <div className="grid grid-flow-col auto-cols-max gap-4 overflow-x-auto pb-4">
                <AllocationColumn
                    title="A alocar"
                    students={unallocatedStudents}
                    onDrop={(e) => handleDrop(e, null)}
                    isOver={dragOverColumnId === 'unassigned'}
                    onDragOver={(e) => { e.preventDefault(); setDragOverColumnId('unassigned'); }}
                    onDragLeave={() => setDragOverColumnId(null)}
                    isHighlighted={false}
                    columnRef={() => {}}
                >
                    {unallocatedStudents.map(student => (
                        <StudentCard
                            key={student.id}
                            student={student}
                            isSelected={selectedStudentIds.has(student.id)}
                            onToggleSelection={() => handleToggleSelection(student)}
                            onDragStart={(e) => handleDragStart(e, student)}
                        />
                    ))}
                </AllocationColumn>
                
                {classes.map(c => (
                     <AllocationColumn
                        key={c.id}
                        title={c.name}
                        students={enrolledStudents.filter(s => s.classId === c.id)}
                        classData={c}
                        onDrop={(e) => handleDrop(e, c)}
                        isOver={dragOverColumnId === c.id}
                        onDragOver={(e) => { e.preventDefault(); setDragOverColumnId(c.id); }}
                        onDragLeave={() => setDragOverColumnId(null)}
                        isHighlighted={highlightedClassId === c.id}
                        columnRef={(el) => {
                             if (el) {
                                columnRefs.current.set(c.id, el);
                            } else {
                                columnRefs.current.delete(c.id);
                            }
                        }}
                     >
                        {enrolledStudents.filter(s => s.classId === c.id).map(student => (
                             <StudentCard
                                key={student.id}
                                student={student}
                                isSelected={selectedStudentIds.has(student.id)}
                                onToggleSelection={() => handleToggleSelection(student)}
                                onDragStart={(e) => handleDragStart(e, student)}
                            />
                        ))}
                     </AllocationColumn>
                ))}
            </div>

            {selectedStudentIds.size > 0 && (
                <AllocationBar
                    selectedCount={selectedStudentIds.size}
                    classes={classes}
                    onAllocate={handleAllocate}
                    onClearSelection={() => setSelectedStudentIds(new Set())}
                />
            )}

            {isExtemporaneousModalOpen && <ExtemporaneousEnrollmentModal onClose={() => setIsExtemporaneousModalOpen(false)} onSave={handleSaveExtemporaneous} />}
        </div>
    );
};

export default StudentMovement;