import React from 'react';

interface IconProps {
    size?: number | string;
    className?: string;
}

const GeminiIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => {
    return (
        <svg 
            height={size} 
            width={size} 
            style={{ flex: 'none', lineHeight: 1 }} 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <title>Gemini</title>
            <defs>
                <linearGradient id="lobe-icons-gemini-fill" x1="0%" x2="68.73%" y1="100%" y2="30.395%">
                    <stop offset="0%" stopColor="#1C7DFF"></stop>
                    <stop offset="52.021%" stopColor="#1C69FF"></stop>
                    <stop offset="100%" stopColor="#F0DCD6"></stop>
                </linearGradient>
            </defs>
            <path 
                d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12" 
                fill="url(#lobe-icons-gemini-fill)" 
                fillRule="nonzero"
            />
        </svg>
    );
};

export default GeminiIcon; 