'use client';

import { useState } from 'react';
import CustomerFormModal from '@/components/CustomerFormModal';

interface PageProps {
  params: { id: string };
}
export default function CustomerDetail() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - replace with real API call
  const customer = {
    id: 1,
    name: '张三',
    email: 'zhang@example.com',
    phone: '13800000000',
    lastOrder: '2023-12-01',
    address: '北京市朝阳区',
    notes: '重要客户',
    createdAt: '2023-01-15',
    totalOrders: 12,
    totalSpent: '¥15,680',
  };

  // Mock orders data - replace with real API call
  const orders = [
    {
      id: 1,
      date: '2023-12-01',
      amount: '¥1,280',
      status: 'completed',
      items: 3,
      paymentMethod: '微信支付',
    },
    {
      id: 2,
      date: '2023-11-15',
      amount: '¥2,450',
      status: 'processing',
      items: 5,
      paymentMethod: '支付宝',
    },
    // Add more mock orders...
  ];

  const handleEditCustomer = (customerData: {
    name: string;
    phone: string;
  }) => {
    // Handle customer edit logic here
    console.log('Editing customer:', customerData);
    setIsEditModalOpen(false);
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 font-[family-name:var(--font-geist-sans)]'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8 flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
              客户详情
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              查看和管理客户信息
            </p>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm hover:shadow-md'
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
                d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
              />
            </svg>
            编辑客户
          </button>
        </div>

        {/* Customer Information Card */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
                基本信息
              </h2>
              <div className='space-y-3'>
                <div>
                  <label className='text-sm text-gray-500 dark:text-gray-400'>
                    姓名
                  </label>
                  <p className='text-gray-900 dark:text-white'>
                    {customer.name}
                  </p>
                </div>
                <div>
                  <label className='text-sm text-gray-500 dark:text-gray-400'>
                    邮箱
                  </label>
                  <p className='text-gray-900 dark:text-white'>
                    {customer.email}
                  </p>
                </div>
                <div>
                  <label className='text-sm text-gray-500 dark:text-gray-400'>
                    电话
                  </label>
                  <p className='text-gray-900 dark:text-white'>
                    {customer.phone}
                  </p>
                </div>
                <div>
                  <label className='text-sm text-gray-500 dark:text-gray-400'>
                    地址
                  </label>
                  <p className='text-gray-900 dark:text-white'>
                    {customer.address}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
                订单信息
              </h2>
              <div className='space-y-3'>
                <div>
                  <label className='text-sm text-gray-500 dark:text-gray-400'>
                    最近订单
                  </label>
                  <p className='text-gray-900 dark:text-white'>
                    {customer.lastOrder}
                  </p>
                </div>
                <div>
                  <label className='text-sm text-gray-500 dark:text-gray-400'>
                    总订单数
                  </label>
                  <p className='text-gray-900 dark:text-white'>
                    {customer.totalOrders}
                  </p>
                </div>
                <div>
                  <label className='text-sm text-gray-500 dark:text-gray-400'>
                    消费总额
                  </label>
                  <p className='text-gray-900 dark:text-white'>
                    {customer.totalSpent}
                  </p>
                </div>
                <div>
                  <label className='text-sm text-gray-500 dark:text-gray-400'>
                    创建时间
                  </label>
                  <p className='text-gray-900 dark:text-white'>
                    {customer.createdAt}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='mt-6'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              备注
            </h2>
            <p className='text-gray-700 dark:text-gray-300'>{customer.notes}</p>
          </div>
        </div>

        {/* Orders Section */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-6'>
            订单历史
          </h2>

          {/* Search and Filter Controls */}
          <div className='flex flex-col sm:flex-row gap-4 mb-6'>
            <div className='flex-1 relative'>
              <input
                type='text'
                placeholder='搜索订单...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600'
              />
              <svg
                className='w-5 h-5 absolute left-3 top-2.5 text-gray-400'
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
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className='px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600'
            >
              <option value='all'>所有状态</option>
              <option value='completed'>已完成</option>
              <option value='processing'>处理中</option>
              <option value='cancelled'>已取消</option>
            </select>
          </div>

          {/* Orders Table */}
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
              <thead className='bg-gray-50 dark:bg-gray-900'>
                <tr>
                  <th
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer'
                    onClick={() => setSortColumn('date')}
                  >
                    日期
                    {sortColumn === 'date' && (
                      <span className='ml-1'>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    订单金额
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    状态
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    商品数量
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    支付方式
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      {order.date}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      {order.amount}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.status === 'completed'
                          ? '已完成'
                          : order.status === 'processing'
                          ? '处理中'
                          : '已取消'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      {order.items}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      {order.paymentMethod}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className='mt-6 flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-700 dark:text-gray-400'>
                显示第 <span className='font-medium'>1</span> 到{' '}
                <span className='font-medium'>10</span> 条，共{' '}
                <span className='font-medium'>{customer.totalOrders}</span>{' '}
                条结果
              </p>
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className='px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700'
              >
                上一页
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className='px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700'
              >
                下一页
              </button>
            </div>
          </div>
        </div>

        {/* Edit Customer Modal */}
        <CustomerFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditCustomer}
          mode='edit'
          initialCustomer={{
            name: customer.name,
            phone: customer.phone,
          }}
        />
      </div>
    </div>
  );
}
