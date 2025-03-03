// src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger'; // Optional variants
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, isLoading = false, ...props }) => {
  const baseClasses = `
    px-6 py-3 rounded-md text-white font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses = 'bg-E17295 hover:bg-E9ADBC focus:ring-E17295 focus:ring-offset-E2D7E3';
      break;
    case 'secondary':
      variantClasses = 'bg-BCAFBD hover:bg-E2D7E3 focus:ring-BCAFBD focus:ring-offset-E2D7E3 text-black'; // Adjusted for readability
      break;
    case 'danger':
      variantClasses = 'bg-red-600 hover:bg-red-700 focus:ring-red-500 focus:ring-offset-E2D7E3';
      break;
    default:
      variantClasses = 'bg-E17295 hover:bg-E9ADBC focus:ring-E17295 focus:ring-offset-E2D7E3';
  }

  return (
    <button
      {...props}
      className={`${baseClasses} ${variantClasses} ${className || ''}`}
      disabled={isLoading || props.disabled}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};

export default Button;