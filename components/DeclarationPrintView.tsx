import React from 'react';

interface DeclarationPrintViewProps {
  content: string;
}

export const DeclarationPrintView: React.FC<DeclarationPrintViewProps> = ({ content }) => {
  return (
    <div className="font-serif">
        <pre className="whitespace-pre-wrap text-base font-sans">{content}</pre>
    </div>
  );
};