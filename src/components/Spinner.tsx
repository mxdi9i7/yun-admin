'use client';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div role='status' className={className}>
      <div
        className={`animate-spin rounded-full border-2 border-gray-200 dark:border-gray-600 border-t-blue-600 ${sizeClasses[size]}`}
      ></div>
      <span className='sr-only'>加载中...</span>
    </div>
  );
}
