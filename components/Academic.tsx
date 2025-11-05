import React, { useState, useMemo } from 'react';
import { AcademicSubView, View } from '../types';
import TeacherDashboard from './academic/TeacherDashboard';
import GradesAndAttendance from './academic/GradesAndAttendance';
import ReportCard from './academic/ReportCard';
import AcademicCalendar from './academic/AcademicCalendar';
import ActivitiesForPrinting from './academic/ActivitiesForPrinting';
import Educators from './academic/Educators';
import Schedules from './academic/Schedules';
import Subjects from './academic/Subjects';
import ClassDiary from './academic/ClassDiary';
import { useAuth } from '../contexts/AuthContext';

const SubNavButton: React.FC<{
    label: string;
    active: boolean;
    onClick: () => void;
}> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 whitespace-nowrap ${
            active
                ? 'bg-teal-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'
        }`}
    >
        {label}
    </button>
);

interface AcademicProps {
    setActiveView: (view: View) => void;
}

const Academic: React.FC<AcademicProps> = ({ setActiveView }) => {
    const { user } = useAuth();
    const [activeSubView, setActiveSubView] = useState<AcademicSubView>(AcademicSubView.TEACHER_DASHBOARD);
    const [selectedClass, setSelectedClass] = useState<{ id: number; name: string } | null>(null);

    const availableSubViews = useMemo(() => {
        if (user?.role === 'educator') {
            return [
                AcademicSubView.TEACHER_DASHBOARD,
                AcademicSubView.GRADES_ATTENDANCE,
                AcademicSubView.CLASS_DIARY
            ];
        }
        return Object.values(AcademicSubView);
    }, [user]);

    const handleSelectClass = (classInfo: { id: number; name: string }, targetView: AcademicSubView = AcademicSubView.GRADES_ATTENDANCE) => {
        setSelectedClass(classInfo);
        setActiveSubView(targetView);
    };

    const renderSubView = () => {
        switch (activeSubView) {
            case AcademicSubView.TEACHER_DASHBOARD:
                return <TeacherDashboard onSelectClass={handleSelectClass} setActiveView={setActiveView} />;
            case AcademicSubView.GRADES_ATTENDANCE:
                return <GradesAndAttendance selectedClass={selectedClass} />;
            case AcademicSubView.REPORT_CARD:
                return <ReportCard />;
            case AcademicSubView.CALENDAR:
                return <AcademicCalendar />;
            case AcademicSubView.ACTIVITIES_FOR_PRINTING:
                return <ActivitiesForPrinting />;
            case AcademicSubView.CLASS_DIARY:
                 // Pass selectedClass to ClassDiary so it knows which class to show logs for
                return <ClassDiary selectedClass={selectedClass} />;
            case AcademicSubView.EDUCATORS:
                return <Educators />;
            case AcademicSubView.SCHEDULES:
                return <Schedules />;
            case AcademicSubView.SUBJECTS:
                return <Subjects />;
            default:
                return (
                    <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">
                            A visualização para "{activeSubView}" ainda não está pronta.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div>
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Acadêmico</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie notas, frequência, boletins e o calendário letivo.</p>
            </header>
            
            <nav className="flex items-center space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-3 overflow-x-auto">
                {availableSubViews.map(view => (
                    <SubNavButton
                        key={view}
                        label={view}
                        active={activeSubView === view}
                        onClick={() => setActiveSubView(view)}
                    />
                ))}
            </nav>

            {renderSubView()}
        </div>
    );
};

export default Academic;
