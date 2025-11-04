import React, { useState, useMemo } from 'react';
import { DOCUMENT_SECTIONS } from '../../data/schoolRegistryDocument';

// html2pdf is loaded globally from index.html
declare const html2pdf: any;

const HighlightText: React.FC<{ text: string, highlight: string }> = ({ text, highlight }) => {
    if (!highlight.trim()) {
        return <>{text}</>;
    }
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <mark key={i} className="bg-yellow-200 dark:bg-yellow-500/50 rounded-sm px-0.5">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};

const Archive: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSection, setActiveSection] = useState(DOCUMENT_SECTIONS[0].title);
    const [isDownloading, setIsDownloading] = useState(false);

    const filteredSections = useMemo(() => {
        if (!searchTerm.trim()) {
            return DOCUMENT_SECTIONS;
        }
        
        const lowerCaseSearch = searchTerm.toLowerCase();

        // A simple way to render React components to string for searching
        // This is a basic implementation and might not work for complex components
        const renderNodeToString = (node: React.ReactNode): string => {
            if (typeof node === 'string' || typeof node === 'number') {
                return node.toString();
            }
            if (Array.isArray(node)) {
                return node.map(renderNodeToString).join('');
            }
            // FIX: Cast node.props to access children property safely.
            if (React.isValidElement(node)) {
                const props = node.props as { children?: React.ReactNode; [key: string]: any };
                if (props.children) {
                    return renderNodeToString(props.children);
                }
            }
            return '';
        };

        return DOCUMENT_SECTIONS
            .map(section => {
                const contentString = renderNodeToString(section.content).toLowerCase();
                if (contentString.includes(lowerCaseSearch) || section.title.toLowerCase().includes(lowerCaseSearch)) {
                    return section;
                }
                return null;
            })
            .filter(Boolean) as typeof DOCUMENT_SECTIONS;
    }, [searchTerm]);

    const currentSectionData = DOCUMENT_SECTIONS.find(s => s.title === activeSection);
    const isGuideSection = (title: string) => title.startsWith('Guia:');

    const handleDownloadPdf = () => {
        if (!currentSectionData) return;

        const element = document.getElementById('guide-content-wrapper');
        if (!element) {
            alert('Erro ao encontrar conteúdo para download.');
            return;
        }

        setIsDownloading(true);

        const safeFilename = currentSectionData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        // Clone the element to avoid modifying the current view
        const clonedElement = element.cloneNode(true) as HTMLElement;
        
        // Apply special class for PDF rendering to make it more compact
        clonedElement.classList.add('pdf-guide-styles');
        
        // The title for printing/PDF is hidden, we need to make it visible in the clone
        const titleElement = clonedElement.querySelector('.print-only-title');
        if (titleElement) {
            titleElement.classList.remove('hidden');
            titleElement.classList.add('block');
        }

        html2pdf().from(clonedElement).set({
            margin: 20,
            filename: `${safeFilename}.pdf`,
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).save().then(() => {
            setIsDownloading(false);
        }).catch((err: any) => {
            console.error("html2pdf error:", err);
            alert("Ocorreu um erro ao gerar o PDF.");
            setIsDownloading(false);
        });
    };

    return (
        <div className="flex h-[calc(100vh-100px)]">
             {/* Left Sidebar for Navigation */}
            <aside className="w-1/4 bg-white dark:bg-gray-800/30 rounded-l-lg border-r border-gray-200 dark:border-gray-700/50 flex flex-col no-print">
                <header className="p-4 border-b border-gray-200 dark:border-gray-700/50">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Seções</h2>
                </header>
                <nav className="flex-grow overflow-y-auto">
                    {DOCUMENT_SECTIONS.map(section => (
                        <button 
                            key={section.title}
                            onClick={() => setActiveSection(section.title)}
                            className={`w-full text-left p-3 text-sm transition-colors ${
                                activeSection === section.title 
                                    ? 'bg-teal-100 dark:bg-teal-800/50 text-teal-700 dark:text-white font-semibold border-l-4 border-teal-500'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/30'
                            }`}
                        >
                            {section.title}
                        </button>
                    ))}
                </nav>
            </aside>
            
            {/* Main Content Area */}
            <main className="w-3/4 bg-white dark:bg-gray-800/50 rounded-r-lg flex flex-col">
                <header className="p-4 border-b border-gray-200 dark:border-gray-700/50 flex-shrink-0 no-print">
                    <input 
                        type="search"
                        placeholder="Buscar no documento..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500"
                    />
                </header>
                <div className="flex-grow overflow-y-auto p-6 prose prose-slate dark:prose-invert max-w-none">
                    {searchTerm.trim() ? (
                        filteredSections.length > 0 ? (
                             filteredSections.map(section => (
                                <section key={section.title} className={`${isGuideSection(section.title) ? 'print-container' : ''} mb-8`}>
                                    <div className="flex justify-between items-center no-print border-b border-gray-300 dark:border-gray-600 pb-2">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white !mb-0">
                                            <HighlightText text={section.title} highlight={searchTerm} />
                                        </h2>
                                        {isGuideSection(section.title) && (
                                            <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 flex items-center space-x-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" /></svg>
                                                <span>Baixar PDF</span>
                                            </button>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white hidden print:block !mt-0">{section.title}</h2>
                                    <div className="mt-4 text-gray-700 dark:text-gray-300">
                                         {/* FIX: Cast element to let cloneElement know about the 'highlight' prop. */}
                                         {React.cloneElement(section.content as React.ReactElement<{ highlight?: string }>, { highlight: searchTerm })}
                                    </div>
                                </section>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">Nenhum resultado encontrado para "{searchTerm}".</p>
                        )
                    ) : (
                        currentSectionData && (
                            <section>
                                <div className="flex justify-between items-center no-print">
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{currentSectionData.title}</h2>
                                    {isGuideSection(currentSectionData.title) && (
                                        <button onClick={handleDownloadPdf} disabled={isDownloading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 flex items-center space-x-2 disabled:bg-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" /></svg>
                                            <span>{isDownloading ? 'Baixando...' : 'Baixar PDF'}</span>
                                        </button>
                                    )}
                                </div>
                                <div id="guide-content-wrapper">
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white hidden print-only-title">{currentSectionData.title}</h2>
                                    <div className="mt-4">{currentSectionData.content}</div>
                                </div>
                            </section>
                        )
                    )}
                </div>
            </main>
        </div>
    );
};

export default Archive;