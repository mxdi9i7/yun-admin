'use client';

import { useState } from 'react';
import OrderFormModal from '@/components/OrderFormModal';
import { useRouter } from 'next/navigation';
import { OrderItem } from '@/types/order';

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();

  // Mock data - replace with real API call
  const orders = [
    {
      id: 1,
      customer: '张三',
      date: '2024-01-15',
      total: '¥1,299.00',
      status: 'pending',
      items: ['商品A', '商品B'],
    },
    {
      id: 2,
      customer: '李四',
      date: '2024-01-14',
      total: '¥899.00',
      status: 'completed',
      items: ['商品C'],
    },
  ];

  const handleCreateOrder = (order: {
    customer: string;
    items: Array<{
      productName: string;
      quantity: number;
      price: number;
      productId: number;
    }>;
  }) => {
    // Handle order creation logic here
    console.log('Creating order:', order);
    setIsCreateModalOpen(false);
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 font-[family-name:var(--font-geist-sans)]'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8 flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
              订单管理
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              查看和管理所有订单
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
            新建订单
          </button>
        </div>

        {/* Create Order Modal */}
        <OrderFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={(order: { customer: string; items: OrderItem[] }) => {
            handleCreateOrder({
              customer: order.customer,
              items: order.items.map((item) => ({
                productName: item.productName || '',
                quantity: item.quantity,
                price: item.price,
                productId: item.productId,
              })),
            });
          }}
        />

        {/* Search and Filter Section */}
        <div className='mb-6 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1 relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <svg
                  className='h-5 w-5 text-gray-400'
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
                placeholder='搜索订单...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  dark:bg-gray-700 dark:text-white'
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className='px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                dark:bg-gray-700 dark:text-white'
            >
              <option value='all'>所有状态</option>
              <option value='pending'>待处理</option>
              <option value='completed'>已完成</option>
              <option value='cancelled'>已取消</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden'>
          <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
            <thead className='bg-gray-50 dark:bg-gray-900'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                  订单编号
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                  客户
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                  日期
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                  金额
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                  状态
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                  操作
                </th>
              </tr>
            </thead>
            <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                    #{order.id}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                    {order.customer}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                    {order.date}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                    {order.total}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {order.status === 'completed'
                        ? '已完成'
                        : order.status === 'pending'
                        ? '待处理'
                        : '已取消'}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <button
                      onClick={() => {
                        router.push(`/orders/${order.id}`);
                      }}
                      className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4'
                    >
                      查看详情
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
                <span className='font-medium'>50</span> 条结果
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
