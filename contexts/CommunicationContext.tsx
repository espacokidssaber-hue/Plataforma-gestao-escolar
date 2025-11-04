import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo } from 'react';
import { InternalConversation, InternalMessage } from '../types';
import { useAuth } from './AuthContext';

interface CommunicationContextType {
    conversations: InternalConversation[];
    unreadCount: number;
    sendMessage: (recipientId: number, text: string) => void;
    markConversationAsRead: (conversationId: number) => void;
}

const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

export const CommunicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user: currentUser, users } = useAuth();
    
    const [conversations, setConversations] = useState<InternalConversation[]>(() => {
        try {
            const saved = localStorage.getItem('internal_communications');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error("Failed to parse internal_communications from localStorage", error);
            return [];
        }
    });

    // useEffect(() => {
    //     localStorage.setItem('internal_communications', JSON.stringify(conversations));
    // }, [conversations]);

    const filteredConversations = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === 'admin') return conversations;
        return conversations.filter(c => c.participantIds.includes(currentUser.id));
    }, [conversations, currentUser]);
    
    const unreadCount = useMemo(() => {
        if (!currentUser) return 0;
        return filteredConversations.reduce((count, conv) => {
            const hasUnread = conv.messages.some(msg => !msg.isRead && msg.senderId !== currentUser.id);
            return count + (hasUnread ? 1 : 0);
        }, 0);
    }, [filteredConversations, currentUser]);


    const sendMessage = (recipientId: number, text: string) => {
        if (!currentUser) return;

        const participantIds = [currentUser.id, recipientId].sort((a,b) => a - b);
        let conversation = conversations.find(c => 
            c.participantIds.length === 2 && 
            c.participantIds[0] === participantIds[0] && 
            c.participantIds[1] === participantIds[1]
        );
        
        const newMessage: InternalMessage = {
            id: Date.now(),
            senderId: currentUser.id,
            text,
            timestamp: new Date().toISOString(),
            isRead: false,
        };
        
        if (conversation) {
            // Add message to existing conversation
            const updatedConversation = {
                ...conversation,
                messages: [...conversation.messages, newMessage]
            };
            setConversations(prev => prev.map(c => c.id === conversation!.id ? updatedConversation : c));
        } else {
            // Create new conversation
            const newConversation: InternalConversation = {
                id: Date.now(),
                participantIds: participantIds,
                messages: [newMessage],
            };
            setConversations(prev => [...prev, newConversation]);
        }
    };
    
    const markConversationAsRead = (conversationId: number) => {
        if (!currentUser) return;

        setConversations(prev => prev.map(conv => {
            if (conv.id === conversationId) {
                return {
                    ...conv,
                    messages: conv.messages.map(msg => 
                        msg.senderId !== currentUser.id ? { ...msg, isRead: true } : msg
                    )
                };
            }
            return conv;
        }));
    };
    
    const value = {
        conversations: filteredConversations,
        unreadCount,
        sendMessage,
        markConversationAsRead,
    };

    return (
        <CommunicationContext.Provider value={value}>
            {children}
        </CommunicationContext.Provider>
    );
};

export const useCommunication = (): CommunicationContextType => {
    const context = useContext(CommunicationContext);
    if (!context) {
        throw new Error('useCommunication must be used within a CommunicationProvider');
    }
    return context;
};