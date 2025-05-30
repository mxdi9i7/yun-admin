'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product, products } from '@/lib/supabase-utils';
import LoadingButton from '@/components/LoadingButton';
import Spinner from '@/components/Spinner';
import InventoryFormModal from '@/components/InventoryFormModal';
import Link from 'next/link';

interface InventoryRecord {
  id: number;
  product: number;
  quantity: number;
  price: number;
  created_at: string;
  notes: string | null;
}

interface Order {
  id: number;
  customer_id: number;
  customer_name: string;
  created_at: string;
  quantity: number;
  total: number;
}

export default function ProductDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<(Product & { stock: number }) | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [inventoryHistory, setInventoryHistory] = useState<InventoryRecord[]>(
    []
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch product details
      const { data: product, error: productError } =
        await products.getProductById(parseInt(id));

      if (productError) throw productError;
      if (!product) throw new Error('产品不存在');

      setProduct(product);

      // Fetch inventory history
      const { data: inventoryData } = await products.getInventoryHistory(
        parseInt(id)
      );
      setInventoryHistory(inventoryData || []);

      // Fetch orders
      const { data: ordersData } = await products.getProductOrders(
        parseInt(id)
      );
      setOrders(ordersData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据时发生错误');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleInventorySubmit = async (data: {
    productId: number;
    type: 'add';
    quantity: number;
    notes?: string;
    price: number;
  }) => {
    setIsSubmitting(true);
    try {
      const { error } = await products.updateInventory(data);
      if (error) throw error;
      await fetchData();
      setIsInventoryModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
      console.error('Error updating inventory:', err);
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

  if (error || !product) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8'>
        <div className='max-w-3xl mx-auto'>
          <div className='bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded'>
            <p className='text-red-700 dark:text-red-200'>
              {error || '产品不存在'}
            </p>
          </div>
          <div className='mt-4'>
            <LoadingButton
              onClick={() => router.push('/products')}
              variant='secondary'
            >
              返回产品列表
            </LoadingButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden'>
          <div className='px-4 py-5 sm:p-6'>
            <div className='flex justify-between items-start'>
              <div>
                <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {product.title}
                </h1>
                <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                  {product.type === 'keys'
                    ? '钥匙'
                    : product.type === 'tools'
                    ? '工具'
                    : '配件'}
                </p>
              </div>
              <LoadingButton
                onClick={() => router.push('/products')}
                variant='secondary'
              >
                返回列表
              </LoadingButton>
            </div>

            <div className='mt-6 border-t border-gray-200 dark:border-gray-700 pt-6'>
              <dl className='grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2'>
                <div>
                  <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                    价格
                  </dt>
                  <dd className='mt-1 text-lg font-semibold text-gray-900 dark:text-white'>
                    <div className='flex items-center space-x-2'>
                      <span className='text-gray-600 dark:text-gray-400'>
                        价格:
                      </span>
                      <span className='font-semibold'>
                        ¥{product?.price?.toFixed(2) || '未设置'}
                      </span>
                    </div>
                  </dd>
                </div>
                <div>
                  <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                    当前库存
                  </dt>
                  <dd className='mt-1 text-lg font-semibold text-gray-900 dark:text-white'>
                    {product.stock} 件
                  </dd>
                </div>
                <div className='sm:col-span-2'>
                  <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                    创建时间
                  </dt>
                  <dd className='mt-1 text-sm text-gray-900 dark:text-white'>
                    {new Date(product.created_at).toLocaleString()}
                  </dd>
                </div>
                <div className='sm:col-span-2'>
                  <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                    最后更新
                  </dt>
                  <dd className='mt-1 text-sm text-gray-900 dark:text-white'>
                    {new Date(product.updated_at).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>

            <div className='mt-6 border-t border-gray-200 dark:border-gray-700 pt-6'>
              <h2 className='text-lg font-medium text-gray-900 dark:text-white'>
                库存管理
              </h2>
              <div className='mt-4'>
                <LoadingButton
                  onClick={() => setIsInventoryModalOpen(true)}
                  variant='primary'
                >
                  调整库存
                </LoadingButton>
              </div>
            </div>

            {/* Inventory History */}
            <div className='mt-8'>
              <h2 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
                库存记录
              </h2>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                  <thead className='bg-gray-50 dark:bg-gray-900'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                        时间
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                        变动数量
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                        单价
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                        备注
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                    {inventoryHistory.map((record) => (
                      <tr key={record.id}>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                          {new Date(record.created_at).toLocaleString()}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                          <span
                            className={
                              record.quantity > 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }
                          >
                            {record.quantity > 0 ? '+' : ''}
                            {record.quantity}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                          ¥{record.price.toFixed(2)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                          {record.notes || '-'}
                        </td>
                      </tr>
                    ))}
                    {inventoryHistory.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className='px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400'
                        >
                          暂无记录
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Orders */}
            <div className='mt-8'>
              <h2 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
                相关订单
              </h2>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                  <thead className='bg-gray-50 dark:bg-gray-900'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                        订单时间
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                        客户
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                        数量
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                        总价
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
                          {new Date(order.created_at).toLocaleString()}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                          <Link
                            href={`/customers/${order.customer_id}`}
                            className='text-blue-600 dark:text-blue-400 hover:underline'
                          >
                            {order.customer_name}
                          </Link>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                          {order.quantity}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                          ¥{order.total.toFixed(2)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                          <Link
                            href={`/orders/${order.id}`}
                            className='text-blue-600 dark:text-blue-400 hover:underline'
                          >
                            查看详情
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className='px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400'
                        >
                          暂无订单
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <InventoryFormModal
          isOpen={isInventoryModalOpen}
          onClose={() => setIsInventoryModalOpen(false)}
          onSubmit={handleInventorySubmit}
          products={[product]}
          selectedProduct={product}
        />
      </div>
    </div>
  );
}
