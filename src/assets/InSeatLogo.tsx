import React from 'react';

const InSeatLogo = ({ width = 200, height = 200, ...props }) => (<svg 
  width={width} 
  height={height} 
  viewBox="0 0 200 200" 
  xmlns="http://www.w3.org/2000/svg"
  {...props}
>
  <defs>
    <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#4CAF50" stopOpacity="1" />
      <stop offset="100%" stopColor="#45A049" stopOpacity="1" />
    </linearGradient>
  </defs>
  <rect 
    width="180" 
    height="180" 
    x="10" 
    y="10" 
    rx="40" 
    ry="40" 
    fill="url(#brandGradient)"
  />
  <text 
    x="100" 
    y="120" 
    textAnchor="middle" 
    fontFamily="Arial, sans-serif" 
    fontSize="80" 
    fontWeight="bold" 
    fill="white"
  >
    IS
  </text>
  <path 
    d="M 50 160 Q 100 190, 150 160" 
    fill="none" 
    stroke="white" 
    strokeWidth="6" 
    strokeLinecap="round"
  />
</svg>);

export default InSeatLogo;
