'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomerFormModal from '@/components/CustomerFormModal';

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    name: string;
    phone: string;
  } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();

  // Mock data - replace with real API call
  const customers = [
    {
      id: 1,
      name: '张三',
      email: 'zhang@example.com',
      phone: '13800000000',
      lastOrder: '2023-12-01',
    },
    {
      id: 2,
      name: '李四',
      email: 'li@example.com',
      phone: '13900000000',
      lastOrder: '2023-11-28',
    },
    // Add more mock data as needed
  ];

  const handleCreateCustomer = (customer: { name: string; phone: string }) => {
    // Handle customer creation logic here
    console.log('Creating customer:', customer);
    setIsCreateModalOpen(false);
  };

  const handleEditCustomer = (customer: { name: string; phone: string }) => {
    // Handle customer edit logic here
    console.log('Editing customer:', customer);
    setIsEditModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleEdit = (customer: {
    id: number;
    name: string;
    phone: string;
  }) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 font-[family-name:var(--font-geist-sans)]'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8 flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
              客户管理
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              管理您的客户数据库
            </p>
          </div>
          <button
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm hover:shadow-md'
            onClick={() => setIsCreateModalOpen(true)}
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 4v16m8-8H4'
              />
            </svg>
            添加客户
          </button>
        </div>

        {/* Create Customer Modal */}
        <CustomerFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateCustomer}
          mode='create'
        />

        {/* Edit Customer Modal */}
        <CustomerFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCustomer(null);
          }}
          onSubmit={handleEditCustomer}
          mode='edit'
          initialCustomer={
            selectedCustomer
              ? {
                  name: selectedCustomer.name,
                  phone: selectedCustomer.phone,
                }
              : undefined
          }
        />

        {/* Search and Filter Section */}
        <div className='mb-6 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90'>
          <div className='flex flex-col sm:flex-row gap-4 items-stretch sm:items-center'>
            <div className='flex-1 relative group'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <svg
                  className='h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
              </div>
              <input
                type='text'
                placeholder='搜索客户...'
                className='w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl 
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500
                          dark:bg-gray-700 dark:text-white shadow-sm transition-all duration-200
                          hover:border-gray-300 dark:hover:border-gray-500'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className='px-6 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                        dark:bg-gray-700 dark:text-white shadow-sm 
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500
                        hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200
                        cursor-pointer min-w-[160px] appearance-none'
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundSize: '1.5em 1.5em',
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <option value='all'>所有客户</option>
              <option value='active'>活跃客户</option>
              <option value='inactive'>不活跃客户</option>
            </select>
          </div>
        </div>

        {/* Customer Table */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden'>
          <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
            <thead className='bg-gray-50 dark:bg-gray-900'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                  客户名称
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                  邮箱
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                  电话
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                  最近订单
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                  操作
                </th>
              </tr>
            </thead>
            <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                    {customer.name}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                    {customer.email}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                    {customer.phone}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                    {customer.lastOrder}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <button
                      className='text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mr-4'
                      onClick={() => router.push(`/customers/${customer.id}`)}
                    >
                      查看详情
                    </button>
                    <button
                      className='text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4'
                      onClick={() =>
                        handleEdit({
                          id: customer.id,
                          name: customer.name,
                          phone: customer.phone,
                        })
                      }
                    >
                      编辑
                    </button>
                    <button className='text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'>
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className='mt-4 flex items-center justify-between'>
          <div className='flex-1 flex justify-between sm:hidden'>
            <button className='px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'>
              上一页
            </button>
            <button className='ml-3 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'>
              下一页
            </button>
          </div>
          <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
            <div>
              <p className='text-sm text-gray-700 dark:text-gray-400'>
                显示第 <span className='font-medium'>1</span> 到{' '}
                <span className='font-medium'>10</span> 条， 共{' '}
                <span className='font-medium'>97</span> 条结果
              </p>
            </div>
            <div>
              <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>
                <button className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50'>
                  上一页
                </button>
                <button className='relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700'>
                  1
                </button>
                <button className='relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700'>
                  2
                </button>
                <button className='relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700'>
                  3
                </button>
                <button className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50'>
                  下一页
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
