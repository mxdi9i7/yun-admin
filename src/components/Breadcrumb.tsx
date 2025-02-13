'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbProps {
  className?: string;
}

export default function Breadcrumb({ className = '' }: BreadcrumbProps) {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(Boolean);

  const getLabel = (path: string, index: number) => {
    const labels: { [key: string]: string } = {
      orders: '订单',
      products: '商品',
      customers: '客户',
      settings: '设置',
      users: '用户',
      roles: '角色',
      permissions: '权限',
      dashboard: '仪表盘',
      reports: '报表',
    };

    // If path is a number and previous path is 'customers', try to get customer name
    if (!isNaN(Number(path)) && paths[index - 1] === 'customers') {
      // In a real app, you would fetch customer data here
      // For now just show "客户详情"
      return '客户详情';
    }

    // If the path is a number (like order ID), return it as is
    if (!isNaN(Number(path))) {
      return path;
    }

    return labels[path] || path;
  };

  return (
    <nav className={`flex ${className}`} aria-label='Breadcrumb'>
      <ol className='inline-flex items-center space-x-1 md:space-x-3'>
        <li className='inline-flex items-center'>
          <Link
            href='/'
            className='inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white'
          >
            <svg
              className='w-3 h-3 mr-2.5'
              aria-hidden='true'
              xmlns='http://www.w3.org/2000/svg'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path d='m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z' />
            </svg>
            首页
          </Link>
        </li>
        {paths.map((path, index) => {
          const href = `/${paths.slice(0, index + 1).join('/')}`;
          const isLast = index === paths.length - 1;
          const label = getLabel(path, index);

          return (
            <li key={path}>
              <div className='flex items-center'>
                <svg
                  className='w-3 h-3 text-gray-400 mx-1'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 6 10'
                >
                  <path
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='m1 9 4-4-4-4'
                  />
                </svg>
                {isLast ? (
                  <span className='ml-1 text-sm font-medium text-gray-500 dark:text-gray-400'>
                    {label}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className='ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white'
                  >
                    {label}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
