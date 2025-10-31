'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { orders } from '@/lib/supabase-utils';
import type { Database } from '@/types/supabase';
import ConfirmationModal from '@/components/ConfirmationModal';
import Spinner from '@/components/Spinner';

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

type OrderStatus = 'pending' | 'fulfilled' | 'canceled';

const statusLabels: Record<OrderStatus, string> = {
  pending: '待处理',
  fulfilled: '已完成',
  canceled: '已取消',
};

const statusColors: Record<OrderStatus, string> = {
  pending:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  fulfilled:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  canceled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(
    null,
  );

  const fetchOrder = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await orders.getOrderById(parseInt(id));
      if (error) throw error;
      setOrder(data);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err instanceof Error ? err.message : '获取订单详情失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (status: OrderStatus) => {
    setIsSubmitting(true);
    try {
      await orders.updateOrder(parseInt(id), { status });
      await fetchOrder();
      setIsStatusModalOpen(false);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err instanceof Error ? err.message : '更新订单状态失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await orders.deleteOrder(parseInt(id));
      router.push('/orders');
    } catch (err) {
      console.error('Error deleting order:', err);
      setError(err instanceof Error ? err.message : '删除订单失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8'>
        <div className='flex justify-center items-center py-8'>
          <Spinner size='lg' />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8'>
        <div className='max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
          <div className='text-center'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
              {error || '订单不存在'}
            </h2>
            <button
              onClick={() => router.push('/orders')}
              className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
            >
              返回订单列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  const orderTotal = order.order_items.reduce(
    (total, item) => total + (item.price_overwrite || 0) * item.quantity,
    0,
  );

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex justify-between items-start'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
              订单详情
            </h1>
            <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
              查看和管理订单信息
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => router.push('/orders')}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
            >
              返回列表
            </button>
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50'
            >
              修改状态
            </button>
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={isSubmitting}
              className='px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50'
            >
              删除订单
            </button>
          </div>
        </div>

        {/* Order Info Card */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-4'>
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                订单 #{order.id}
              </h2>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  statusColors[order.status as OrderStatus]
                }`}
              >
                {statusLabels[order.status as OrderStatus]}
              </span>
            </div>
            <div className='text-right'>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                创建时间
              </p>
              <p className='text-gray-900 dark:text-white'>
                {new Date(order.created_at).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
                客户信息
              </h3>
              <div className='bg-gray-50 dark:bg-gray-900 rounded-lg p-4'>
                <p className='text-gray-900 dark:text-white font-medium'>
                  {order.customer.name}
                </p>
                <button
                  onClick={() => router.push(`/customers/${order.customer.id}`)}
                  className='text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:underline focus:outline-none mt-1'
                >
                  查看客户详情
                </button>
              </div>
            </div>

            <div>
              <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
                订单总额
              </h3>
              <div className='bg-gray-50 dark:bg-gray-900 rounded-lg p-4'>
                <p className='text-2xl font-semibold text-gray-900 dark:text-white'>
                  ¥{orderTotal.toFixed(2)}
                </p>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  共 {order.order_items.length} 件商品
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden'>
          <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
              订单商品
            </h2>
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
              <thead className='bg-gray-50 dark:bg-gray-900'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    商品
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    数量
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    单价
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    小计
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                {order.order_items.map((item) => (
                  <tr key={item.id}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      {item.products.title}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      {item.quantity}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      ¥{item.price_overwrite?.toFixed(2)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      ¥
                      {((item.price_overwrite || 0) * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className='bg-gray-50 dark:bg-gray-900'>
                <tr>
                  <td
                    colSpan={3}
                    className='px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-white'
                  >
                    总计
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                    ¥{orderTotal.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
              备注
            </h2>
            <p className='text-gray-600 dark:text-gray-400'>{order.notes}</p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleDelete}
          title='删除订单'
          message='确定要删除这个订单吗？此操作无法撤销。'
          confirmText='删除'
          cancelText='取消'
          isLoading={isSubmitting}
        />

        {/* Status Change Modal */}
        <ConfirmationModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          onConfirm={() => selectedStatus && handleStatusChange(selectedStatus)}
          title='修改订单状态'
          message={
            <div className='space-y-4'>
              <p>选择新的订单状态：</p>
              <div className='flex flex-col gap-3'>
                {Object.entries(statusLabels).map(([status, label]) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status as OrderStatus)}
                    className={`px-4 py-2 rounded-lg border ${
                      selectedStatus === status
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                        : 'border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          }
          confirmText='确认'
          cancelText='取消'
          confirmDisabled={!selectedStatus}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
