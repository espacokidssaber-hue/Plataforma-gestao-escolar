
import React from 'react';

export const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
    className={`animate-spin ${props.className || ''}`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 4.75V6.25m0 11.5v1.5m-5.303-1.447l1.06 1.06M17.25 6.75l1.061 1.061M4.75 12H6.25m11.5 0h1.5m-1.447 5.303l1.06-1.06M6.75 6.75l1.061-1.061"
    />
  </svg>
);