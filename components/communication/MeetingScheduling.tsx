import React, { useState, useEffect } from 'react';
import { useEnrollment } from '../../contexts/EnrollmentContext';
import NewMeetingModal from './NewMeetingModal';
import PostScheduleConfirmationModal from './PostScheduleConfirmationModal';
import { Meeting } from '../../types';

const MeetingScheduling: React.FC = () => {
    const { enrolledStudents, educators } = useEnrollment();
    const [meetings, setMeetings] = useState<Meeting[]>(() => {
        try {
            const saved = localStorage.getItem('school_meetings');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse meetings from localStorage", e);
            return [];
        }
    });
    
    useEffect(() => {
        localStorage.setItem('school_meetings', JSON.stringify(meetings));
    }, [meetings]);

    const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [confirmationDetails, setConfirmationDetails] = useState<any>(null);

    const handleSchedule = (meetingData: any) => {
        if (meetingData.isGroupMeeting) {
            const newMeeting: Meeting = {
                id: Date.now(),
                title: meetingData.title,
                attendeeName: `Grupo: ${meetingData.groupName}`,
                date: meetingData.date,
                status: 'Agendada',
            };
            setMeetings(prev => [newMeeting, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setIsNewMeetingModalOpen(false);
            return;
        }

        const newMeeting: Meeting = {
            id: Date.now(),
            title: meetingData.title,
            attendeeName: meetingData.attendeeName || 'Equipe de Educadoras',
            date: meetingData.date,
            status: 'Agendada',
        };
        setMeetings(prev => [newMeeting, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        
        setConfirmationDetails({
            channels: meetingData.channels,
            isBulk: meetingData.isBulk || false,
        });

        setIsNewMeetingModalOpen(false);
        setIsConfirmationModalOpen(true);
    };

    const handleCancelMeeting = (id: number) => {
        if (window.confirm('Tem certeza que deseja cancelar esta reunião?')) {
            setMeetings(prev => prev.map(m => m.id === id ? { ...m, status: 'Cancelada' } : m));
        }
    };

    const StatusBadge: React.FC<{ status: Meeting['status'] }> = ({ status }) => {
        const classes = {
            'Agendada': 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
            'Concluída': 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
            'Cancelada': 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${classes[status]}`}>{status}</span>;
    };

    return (
        <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6">
            <header className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Agendamento de Reuniões</h2>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setIsNewMeetingModalOpen(true)} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 flex items-center space-x-2">
                        + Nova Reunião
                    </button>
                </div>
            </header>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                            <th className="p-3">Assunto</th>
                            <th className="p-3">Convidado(a)</th>
                            <th className="p-3">Data e Hora</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {meetings.map(meeting => (
                            <tr key={meeting.id} className="border-b border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                <td className="p-3 font-semibold text-gray-800 dark:text-white">{meeting.title}</td>
                                <td className="p-3 text-gray-600 dark:text-gray-300">{meeting.attendeeName}</td>
                                <td className="p-3 text-gray-600 dark:text-gray-300">{new Date(meeting.date).toLocaleString('pt-BR')}</td>
                                <td className="p-3"><StatusBadge status={meeting.status} /></td>
                                <td className="p-3 text-right">
                                    <button onClick={() => handleCancelMeeting(meeting.id)} disabled={meeting.status === 'Cancelada' || meeting.status === 'Concluída'} className="text-sm text-red-500 hover:underline disabled:text-gray-400 disabled:no-underline">
                                        Cancelar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {meetings.length === 0 && (
                     <p className="text-center text-gray-500 dark:text-gray-400 py-10">Nenhuma reunião agendada.</p>
                )}
            </div>
            {isNewMeetingModalOpen && (
                <NewMeetingModal 
                    students={enrolledStudents} 
                    educators={educators}
                    onClose={() => setIsNewMeetingModalOpen(false)} 
                    onSchedule={handleSchedule} 
                />
            )}
            {isConfirmationModalOpen && (
                <PostScheduleConfirmationModal 
                    details={confirmationDetails}
                    onClose={() => {
                        setIsConfirmationModalOpen(false);
                        setConfirmationDetails(null);
                    }}
                />
            )}
        </div>
    );
};

export default MeetingScheduling;