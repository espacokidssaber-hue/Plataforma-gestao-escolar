import React, { useState } from 'react';
import { StudentDocument, DocumentStatus } from '../types';

interface DocumentRowProps {
  document: StudentDocument;
  onStatusChange: (newStatus: DocumentStatus, rejectionReason?: string) => void;
}

const StatusBadge: React.FC<{ status: DocumentStatus }> = ({ status }) => {
    const statusClasses = {
        [DocumentStatus.PENDING]: 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200',
        [DocumentStatus.APPROVED]: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
        [DocumentStatus.REJECTED]: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
        [DocumentStatus.ANALYSIS]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
    };
    return (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusClasses[status]}`}>
            {status}
        </span>
    );
};

const DocumentRow: React.FC<DocumentRowProps> = ({ document, onStatusChange }) => {
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState(document.rejectionReason || '');

    const handleReject = () => {
        if (rejectionReason.trim()) {
            onStatusChange(DocumentStatus.REJECTED, rejectionReason.trim());
            setIsRejecting(false);
        }
    };
    
    return (
        <div className="py-3 border-b border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{document.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Entrega: {document.deliveryMethod}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <StatusBadge status={document.status} />
                    {document.fileUrl && (
                        <a href={document.fileUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-600/50 dark:text-blue-200 rounded-md hover:bg-blue-200">
                            Ver
                        </a>
                    )}
                    <button onClick={() => onStatusChange(DocumentStatus.APPROVED)} className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-600/50 dark:text-green-200 rounded-md hover:bg-green-200 disabled:opacity-50" disabled={document.status === DocumentStatus.APPROVED}>
                        Aprovar
                    </button>
                    <button onClick={() => setIsRejecting(true)} className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-600/50 dark:text-red-200 rounded-md hover:bg-red-200 disabled:opacity-50" disabled={document.status === DocumentStatus.REJECTED}>
                        Reprovar
                    </button>
                </div>
            </div>
            {isRejecting && (
                <div className="mt-2 flex items-center space-x-2">
                    <input 
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Motivo da reprovação..."
                        className="flex-grow bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600"
                    />
                    <button onClick={handleReject} className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm">OK</button>
                    <button onClick={() => setIsRejecting(false)} className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg text-sm">X</button>
                </div>
            )}
            {document.status === DocumentStatus.REJECTED && document.rejectionReason && (
                 <p className="mt-1 text-xs text-red-500 dark:text-red-400">Motivo: {document.rejectionReason}</p>
            )}
        </div>
    );
};

interface EnrollmentChecklistProps {
  documents: StudentDocument[];
  onDocumentsUpdate: (updatedDocuments: StudentDocument[]) => void;
}

const EnrollmentChecklist: React.FC<EnrollmentChecklistProps> = ({ documents, onDocumentsUpdate }) => {
    
    const handleDocumentStatusChange = (docIndex: number, newStatus: DocumentStatus, rejectionReason?: string) => {
        const updatedDocs = [...documents];
        updatedDocs[docIndex] = { ...updatedDocs[docIndex], status: newStatus, rejectionReason: rejectionReason || undefined };
        if (newStatus === DocumentStatus.APPROVED) {
            delete updatedDocs[docIndex].rejectionReason;
        }
        onDocumentsUpdate(updatedDocs);
    };

    return (
        <div>
            {documents.map((doc, index) => (
                <DocumentRow
                    key={doc.name}
                    document={doc}
                    onStatusChange={(newStatus, reason) => handleDocumentStatusChange(index, newStatus, reason)}
                />
            ))}
        </div>
    );
};

export default EnrollmentChecklist;
