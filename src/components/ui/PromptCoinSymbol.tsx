'use client';

import React from 'react';

interface PromptCoinSymbolProps {
  className?: string;
  variant?: 'default' | 'gradient' | 'simple';
}

export function PromptCoinSymbol({ 
  className = '', 
  variant = 'default' 
}: PromptCoinSymbolProps) {
  
  if (variant === 'simple') {
    // Simple text-based symbol
    return (
      <span className={`font-bold ${className}`}>₱C</span>
    );
  }

  if (variant === 'gradient') {
    // SVG with gradient for larger displays
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="PromptCoin"
      >
        <defs>
          <linearGradient id="pcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="url(#pcGradient)" 
          strokeWidth="2"
          fill="none"
        />
        <circle 
          cx="12" 
          cy="12" 
          r="8" 
          fill="url(#pcGradient)" 
          opacity="0.2"
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="currentColor"
          fontSize="10"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          PC
        </text>
      </svg>
    );
  }

  // Default clean design
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="PromptCoin"
    >
      {/* Outer circle */}
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="2"
        fill="none"
      />
      {/* Inner circle for depth */}
      <circle 
        cx="12" 
        cy="12" 
        r="8" 
        fill="currentColor" 
        opacity="0.1"
      />
      {/* PC monogram */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="currentColor"
        fontSize="10"
        fontWeight="bold"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        PC
      </text>
    </svg>
  );
}

// Alternative character-based symbol component
export function PromptCoinCharSymbol({ 
  className = '' 
}: { 
  className?: string 
}) {
  return (
    <span className={`font-mono ${className}`}>Ᵽ</span>
  );
}

export default PromptCoinSymbol;