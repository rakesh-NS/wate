
import React from 'react';

const GlassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.25 2.25c-.24-.811-.994-1.355-1.844-1.355H11.59c-.85 0-1.604.544-1.844 1.355L8.25 9.75h7.5l-1.5-7.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 9.75h4.5v10.5h-4.5V9.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 21h7.5" />
  </svg>
);

export default GlassIcon;
