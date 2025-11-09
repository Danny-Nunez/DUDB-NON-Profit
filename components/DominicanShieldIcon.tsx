
import React from 'react';

export const DominicanShieldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 120"
    {...props}
  >
    <path fill="#002D62" d="M0 0 H100 V60 H0 V0 z" />
    <path fill="#CE1126" d="M0 60 H100 V120 H0 V60 z" />
    <path fill="#FFFFFF" d="M45 0 H55 V120 H45 V0 z" />
    <path fill="#FFFFFF" d="M0 55 H100 V65 H0 V55 z" />
    <g transform="translate(50, 60) scale(0.3)">
      <path fill="#002D62" d="M-15,5 L-25,25 L-5,15 L-20,35 L0,20 L-10,40 L10,25 L-5,45 L15,30 L0,50 L20,30 L5,40 L25,20 L10,35 L30,15 L15,25 L20,5z" />
      <path fill="#CE1126" d="M-20,5 L-30,25 L-10,15 L-25,35 L-5,20 L-15,40 L5,25 L-10,45 L10,30 L-5,50 L15,30 L0,40 L20,20 L5,35 L25,15 L10,25 L15,5z" transform="scale(-1, 1)" />
      <path fill="gold" d="M0 -45 L-5 -30 H5z" />
      <path fill="#333" d="M-10,-20 a15,15 0 0,0 20,0 L10,-5 L-10,-5z" />
      <text x="0" y="10" fill="gold" textAnchor="middle" fontSize="12" fontWeight="bold">DIOS PATRIA LIBERTAD</text>
    </g>
  </svg>
);
