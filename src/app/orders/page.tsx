'use client';

import { useState, useEffect } from 'react';
import OrderFormModal from '@/components/OrderFormModal';
import { useRouter } from 'next/navigation';
import { orders } from '@/lib/supabase-utils';
import type { Database } from '@/types/supabase';

type Order = Database['public']['Tables']['orders']['Row'] & {
  customer: { id: number; name: string };
  order_items: Array<{
    id: number;
    product: number;
    quantity: number;
    price_overwrite: number | null;
    products: { title: string };
  }>;
};

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'fulfilled' | 'canceled'
  >('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const router = useRouter();

  const pageSize = 10;

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const {
        data,
        error,
        count,
        totalPages: pages,
      } = await orders.getOrders({
        page: currentPage,
        pageSize,
        searchTerm,
        status: filterStatus,
      });

      if (error) throw error;

      setOrderList(data || []);
      setTotalPages(pages);
      setTotalOrders(count || 0);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : '获取订单列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm, filterStatus]);

  const handleCreateOrder = async (orderData: {
    customerId: number;
    items: Array<{
      productId: number;
      quantity: number;
      price: number;
    }>;
    notes?: string;
  }) => {
    try {
      await orders.createOrder(orderData);
      setIsCreateModalOpen(false);
      fetchOrders();
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err instanceof Error ? err.message : '创建订单失败');
    }
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
          onSubmit={handleCreateOrder}
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
              onChange={(e) =>
                setFilterStatus(e.target.value as typeof filterStatus)
              }
              className='px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                dark:bg-gray-700 dark:text-white'
            >
              <option value='all'>所有状态</option>
              <option value='pending'>待处理</option>
              <option value='fulfilled'>已完成</option>
              <option value='canceled'>已取消</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className='mb-6 bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded'>
            <p className='text-red-700 dark:text-red-200'>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className='flex justify-center items-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && orderList.length === 0 && (
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center'>
            <div className='inline-flex justify-center items-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4'>
              <svg
                className='w-8 h-8 text-blue-600 dark:text-blue-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                />
              </svg>
            </div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
              {searchTerm || filterStatus !== 'all'
                ? '未找到符合条件的订单'
                : '还没有任何订单'}
            </h3>
            <p className='text-gray-600 dark:text-gray-400 mb-6'>
              {searchTerm || filterStatus !== 'all'
                ? '尝试调整搜索条件或筛选条件'
                : '点击下方按钮创建第一个订单'}
            </p>
            {searchTerm || filterStatus !== 'all' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className='inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                <svg
                  className='w-5 h-5 mr-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                  />
                </svg>
                重置筛选条件
              </button>
            ) : (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                <svg
                  className='w-5 h-5 mr-2'
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
                创建订单
              </button>
            )}
          </div>
        )}

        {/* Orders Table */}
        {!isLoading && orderList.length > 0 && (
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
                {orderList.map((order) => (
                  <tr key={order.id}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      #{order.id}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      <button
                        onClick={() =>
                          router.push(`/customers/${order.customer.id}`)
                        }
                        className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:underline focus:outline-none'
                      >
                        {order.customer.name}
                      </button>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                      {new Date(order.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      ¥
                      {order.order_items
                        .reduce(
                          (total, item) =>
                            total + (item.price_overwrite || 0) * item.quantity,
                          0
                        )
                        .toFixed(2)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${
                          order.status === 'fulfilled'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {order.status === 'fulfilled'
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
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 0 && (
          <div className='mt-4 flex items-center justify-between'>
            <div className='flex-1 flex justify-between sm:hidden'>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className='px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'
              >
                上一页
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className='ml-3 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'
              >
                下一页
              </button>
            </div>
            <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
              <div>
                <p className='text-sm text-gray-700 dark:text-gray-400'>
                  显示第{' '}
                  <span className='font-medium'>
                    {(currentPage - 1) * pageSize + 1}
                  </span>{' '}
                  到{' '}
                  <span className='font-medium'>
                    {Math.min(currentPage * pageSize, totalOrders)}
                  </span>{' '}
                  条， 共 <span className='font-medium'>{totalOrders}</span>{' '}
                  条结果
                </p>
              </div>
              <div>
                <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50'
                  >
                    上一页
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          page === currentPage
                            ? 'bg-blue-50 text-blue-600 border-blue-500'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50'
                  >
                    下一页
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
