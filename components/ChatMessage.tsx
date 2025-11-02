import React from 'react';
import { ChatMessage, MessageRole } from '../types';

interface ChatMessageProps {
  message: ChatMessage;
}

const UserIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const BotIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-500 dark:text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === MessageRole.USER;
  const alignment = isUser ? 'justify-end' : 'justify-start';
  const bgColor = isUser ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-200 dark:bg-gray-800/70';
  const textColor = isUser ? 'text-blue-900 dark:text-gray-200' : 'text-gray-800 dark:text-gray-200';
  
  return (
    <div className={`flex items-start gap-3 my-4 ${alignment}`}>
      {!isUser && <div className="flex-shrink-0"><BotIcon /></div>}
      <div className={`max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl ${bgColor}`}>
        <p className={`${textColor} leading-relaxed whitespace-pre-wrap`}>{message.content}</p>
      </div>
       {isUser && <div className="flex-shrink-0"><UserIcon /></div>}
    </div>
  );
};

export default ChatMessageComponent;