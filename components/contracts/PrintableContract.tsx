import React, { useLayoutEffect } from 'react';

interface PrintableContractProps {
    text: string;
    onRendered: () => void;
}

const PrintableContract: React.FC<PrintableContractProps> = ({ text, onRendered }) => {
    // This effect calls the onRendered function (which triggers the PDF download)
    // only after the component has been fully rendered in the DOM.
    useLayoutEffect(() => {
        onRendered();
    }, [onRendered]);

    // The 'printable-enrollment-form' class provides basic font styling for printing.
    // The <pre> tag is crucial to maintain all whitespace and line breaks from the AI's output.
    return (
        <div id="printable-contract-content" className="printable-enrollment-form bg-white text-black p-4">
            <pre style={{ fontFamily: 'Arial, sans-serif', fontSize: '10pt', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                {text}
            </pre>
        </div>
    );
};

export default PrintableContract;