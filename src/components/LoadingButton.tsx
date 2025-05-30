'use client';

import Spinner from './Spinner';

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loadingText?: string;
}

export default function LoadingButton({
  children,
  isLoading = false,
  variant = 'primary',
  size = 'md',
  className = '',
  loadingText,
  disabled,
  ...props
}: LoadingButtonProps) {
  const baseStyles =
    'rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary:
      'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      <div className='flex items-center justify-center space-x-2'>
        {isLoading && <Spinner size='sm' className='text-current' />}
        <span>{isLoading ? loadingText || children : children}</span>
      </div>
    </button>
  );
}
