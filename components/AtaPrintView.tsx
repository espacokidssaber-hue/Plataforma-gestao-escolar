
import React, { Fragment } from 'react';
import { type AtaPrintData } from '../types';

interface AtaPrintViewProps {
  data: AtaPrintData;
}

export const AtaPrintView: React.FC<AtaPrintViewProps> = ({ data }) => {
  const { content, educatorTerm } = data;
  
  const renderFormattedContent = (text: string) => {
    if (!text) return null;

    // Trim leading/trailing whitespace
    const trimmedText = text.trim();

    // Manually handle bold markdown (**text**)
    const parts = trimmedText.split(/(\*\*.*?\*\*)/g).map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
        }
        return <Fragment key={partIndex}>{part}</Fragment>;
      });

    return <div className="whitespace-pre-wrap">{parts}</div>;
  };

  const signatureLabels = [
    'Secretário(a)',
    'Diretor(a)',
    ...Array(6).fill(educatorTerm || 'Educador(a)') // Reduced default empty slots for cleaner look, usually variable
  ];

  return (
      <div className="font-serif text-sm leading-relaxed text-justify w-full h-full flex flex-col">
          <div className="flex-grow">
            {renderFormattedContent(content)}
          </div>
          
          <div className="mt-12 pt-8">
            <div className="grid grid-cols-2 gap-x-12 gap-y-12 text-center break-inside-avoid">
              {signatureLabels.map((label, index) => (
                 <div key={index} className="flex flex-col items-center">
                   <div className="border-t border-black w-3/4 pt-1"></div>
                   <p className="m-0 text-[10pt] font-serif">{label}</p>
                 </div>
              ))}
            </div>
          </div>
        </div>
  );
};
