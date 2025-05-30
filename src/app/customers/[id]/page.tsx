'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CustomerFormModal from '@/components/CustomerFormModal';
import { customers, orders } from '@/lib/supabase-utils';
import type { Database } from '@/types/supabase';

type Customer = Database['public']['Tables']['customers']['Row'];
type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items: Array<{
    id: number;
    product: number;
    quantity: number;
    price_overwrite: number | null;
    products: { title: string };
  }>;
};

export default function CustomerDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'fulfilled' | 'canceled'
  >('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  const pageSize = 10;

  const fetchCustomer = async () => {
    try {
      const { data, error } = await customers.getCustomerById(parseInt(id));
      if (error) throw error;
      setCustomer(data);
    } catch (err) {
      console.error('Error fetching customer:', err);
      setError(err instanceof Error ? err.message : '获取客户信息失败');
    }
  };

  const fetchOrders = async () => {
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
        status: filterStatus === 'all' ? undefined : filterStatus,
        customerId: parseInt(id),
      });

      if (error) throw error;

      setCustomerOrders(data || []);
      setTotalPages(pages);
      setTotalOrders(count || 0);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : '获取订单列表失败');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      await Promise.all([fetchCustomer(), fetchOrders()]);
      setIsLoading(false);
    };
    loadData();
  }, [id, currentPage, searchTerm, filterStatus]);

  const handleEditCustomer = async (customerData: {
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    notes: string | null;
  }) => {
    try {
      const { error } = await customers.updateCustomer(
        parseInt(id),
        customerData
      );
      if (error) throw error;
      await fetchCustomer();
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating customer:', err);
      setError(err instanceof Error ? err.message : '更新客户信息失败');
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8'>
        <div className='flex justify-center items-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8'>
        <div className='max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
          <div className='text-center'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
              {error || '客户不存在'}
            </h2>
            <button
              onClick={() => router.push('/customers')}
              className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
            >
              返回客户列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total spent
  const totalSpent = customerOrders.reduce(
    (total, order) =>
      total +
      order.order_items.reduce(
        (itemTotal, item) =>
          itemTotal + (item.price_overwrite || 0) * item.quantity,
        0
      ),
    0
  );

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
                    {customer.email || '-'}
                  </p>
                </div>
                <div>
                  <label className='text-sm text-gray-500 dark:text-gray-400'>
                    电话
                  </label>
                  <p className='text-gray-900 dark:text-white'>
                    {customer.phone || '-'}
                  </p>
                </div>
                <div>
                  <label className='text-sm text-gray-500 dark:text-gray-400'>
                    地址
                  </label>
                  <p className='text-gray-900 dark:text-white'>
                    {customer.address || '-'}
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
                    {customerOrders[0]?.created_at
                      ? new Date(
                          customerOrders[0].created_at
                        ).toLocaleDateString('zh-CN')
                      : '-'}
                  </p>
                </div>
                <div>
                  <label className='text-sm text-gray-500 dark:text-gray-400'>
                    总订单数
                  </label>
                  <p className='text-gray-900 dark:text-white'>{totalOrders}</p>
                </div>
                <div>
                  <label className='text-sm text-gray-500 dark:text-gray-400'>
                    消费总额
                  </label>
                  <p className='text-gray-900 dark:text-white'>
                    ¥{totalSpent.toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className='text-sm text-gray-500 dark:text-gray-400'>
                    创建时间
                  </label>
                  <p className='text-gray-900 dark:text-white'>
                    {new Date(customer.created_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='mt-6'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              备注
            </h2>
            <p className='text-gray-700 dark:text-gray-300'>
              {customer.notes || '-'}
            </p>
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
                className='w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
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
              onChange={(e) =>
                setFilterStatus(e.target.value as typeof filterStatus)
              }
              className='px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
            >
              <option value='all'>所有状态</option>
              <option value='pending'>待处理</option>
              <option value='fulfilled'>已完成</option>
              <option value='canceled'>已取消</option>
            </select>
          </div>

          {/* Empty State */}
          {customerOrders.length === 0 && (
            <div className='text-center py-8'>
              <div className='inline-flex justify-center items-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4'>
                <svg
                  className='w-8 h-8 text-gray-400'
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
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-1'>
                暂无订单记录
              </h3>
              <p className='text-gray-500 dark:text-gray-400'>
                该客户还没有任何订单记录
              </p>
            </div>
          )}

          {/* Orders Table */}
          {customerOrders.length > 0 && (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                <thead className='bg-gray-50 dark:bg-gray-900'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      订单编号
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
                  {customerOrders.map((order) => {
                    const orderTotal = order.order_items.reduce(
                      (total, item) =>
                        total + (item.price_overwrite || 0) * item.quantity,
                      0
                    );

                    return (
                      <tr key={order.id}>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                          #{order.id}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                          {new Date(order.created_at).toLocaleDateString(
                            'zh-CN'
                          )}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                          ¥{orderTotal.toFixed(2)}
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
                            onClick={() => router.push(`/orders/${order.id}`)}
                            className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
                          >
                            查看详情
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='mt-4 flex items-center justify-between'>
              <div className='flex-1 flex justify-between sm:hidden'>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
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

        {/* Edit Customer Modal */}
        <CustomerFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditCustomer}
          initialData={customer}
          mode='edit'
        />
      </div>
    </div>
  );
}
