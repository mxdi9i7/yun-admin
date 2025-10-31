'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import InventoryFormModal from '@/components/InventoryFormModal';
import ProductFormModal from '@/components/ProductFormModal';
import Spinner from '@/components/Spinner';
import {
  orders as ordersApi,
  products as productsApi,
  customers as customersApi,
  type Product,
} from '@/lib/supabase-utils';
import type { Database } from '@/types/supabase';

type MonthlyPoint = { month: string; revenue: number; orders: number };
type TopProductPoint = { name: string; sales: number };

type OrderWithItems = Database['public']['Tables']['orders']['Row'] & {
  customer: { id: number; name: string };
  order_items: Array<{
    id: number;
    product: number;
    quantity: number;
    price_overwrite: number | null;
    products?: { title: string };
  }>;
};

export default function Dashboard() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('6m');
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [monthlyData, setMonthlyData] = useState<MonthlyPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductPoint[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderWithItems[]>([]);
  const [lowStock, setLowStock] = useState<
    Array<{ id: number; title: string; stock: number }>
  >([]);
  const [productsList, setProductsList] = useState<
    Array<{ id: number; title: string; stock: number }>
  >([]);

  const [metrics, setMetrics] = useState({
    monthlyRevenue: 0,
    customersCount: 0,
    productsCount: 0,
    pendingOrders: 0,
  });

  const calcDateRange = (range: string) => {
    const now = new Date();
    const months = range === '1m' ? 1 : range === '3m' ? 3 : 6;
    const start = new Date(now);
    start.setMonth(now.getMonth() - months + 1);
    start.setDate(1);
    const end = now;
    return { start, end };
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [
          { data: ordersData },
          { data: productsData },
          { data: customersData },
        ] = await Promise.all([
          ordersApi.getOrders({ page: 1, pageSize: 1000 }),
          productsApi.getProducts({
            page: 1,
            pageSize: 1000,
            searchTerm: '',
            type: 'all',
          }),
          customersApi.getCustomers({
            page: 1,
            pageSize: 1000,
            searchTerm: '',
          }),
        ]);

        const orders = ordersData || [];
        const productsWithStock = (productsData || []) as Array<{
          id: number;
          title: string;
          stock: number;
        }>;
        setProductsList(productsWithStock);

        const { start, end } = calcDateRange(timeRange);
        const ranged = orders.filter((o) => {
          const d = new Date(o.created_at as unknown as string);
          return d >= start && d <= end;
        });

        const seriesMap: Record<string, MonthlyPoint> = {};
        ranged.forEach((o) => {
          const d = new Date(o.created_at as unknown as string);
          const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
          const label = `${d.getMonth() + 1}月`;
          if (!seriesMap[key])
            seriesMap[key] = { month: label, revenue: 0, orders: 0 };
          const orderTotal = (o.order_items || []).reduce(
            (
              sum: number,
              it: {
                price_overwrite: number | null;
                quantity: number;
              },
            ) => sum + (it.price_overwrite || 0) * it.quantity,
            0,
          );
          seriesMap[key].revenue += orderTotal;
          seriesMap[key].orders += 1;
        });
        const sortedKeys = Object.keys(seriesMap).sort((a, b) => {
          const [ay, am] = a.split('-').map(Number);
          const [by, bm] = b.split('-').map(Number);
          return ay === by ? am - bm : ay - by;
        });
        const series = sortedKeys.map((k) => seriesMap[k]);
        setMonthlyData(series);

        const prodStats: Record<number, { name: string; sales: number }> = {};
        ranged.forEach((o) => {
          (o.order_items || []).forEach(
            (it: {
              product: number;
              quantity: number;
              products?: { title: string };
            }) => {
              const name = it.products?.title || `产品#${it.product}`;
              if (!prodStats[it.product])
                prodStats[it.product] = { name, sales: 0 };
              prodStats[it.product].sales += it.quantity;
            },
          );
        });
        const top = Object.values(prodStats)
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5);
        setTopProducts(top);

        setRecentOrders(orders.slice(0, 3) as OrderWithItems[]);
        setLowStock(
          productsWithStock.filter((p) => p.stock <= 5).slice(0, 5),
        );

        const lastRevenue = series.length
          ? series[series.length - 1].revenue
          : 0;
        const pending = orders.filter((o) => o.status === 'pending').length;
        setMetrics({
          monthlyRevenue: lastRevenue,
          customersCount: customersData?.length || 0,
          productsCount: productsWithStock.length,
          pendingOrders: pending,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : '加载仪表盘数据失败');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [timeRange]);

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 font-[family-name:var(--font-geist-sans)]'>
      <div className='max-w-7xl mx-auto'>
        {isLoading && (
          <div className='flex justify-center items-center py-8'>
            <Spinner size='lg' />
          </div>
        )}
        {error && (
          <div className='mb-6 bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded'>
            <p className='text-red-700 dark:text-red-200'>{error}</p>
          </div>
        )}
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            云氏钥匙
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>v1.0.0</p>
        </div>

        {/* Key Metrics */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          <div
            className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
            onClick={() => router.push('/reports')}
          >
            <div className='flex items-center'>
              <div className='p-2 bg-blue-100 dark:bg-blue-900 rounded-lg'>
                <svg
                  className='w-6 h-6 text-blue-600 dark:text-blue-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  月收入
                </p>
                <p className='text-2xl font-semibold text-gray-900 dark:text-white'>
                  ¥
                  {metrics.monthlyRevenue.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
            </div>
          </div>

          <Link href='/customers' className='block'>
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
              <div className='flex items-center'>
                <div className='p-2 bg-green-100 dark:bg-green-900 rounded-lg'>
                  <svg
                    className='w-6 h-6 text-green-600 dark:text-green-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                    />
                  </svg>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                    客户总数
                  </p>
                  <p className='text-2xl font-semibold text-gray-900 dark:text-white'>
                    {metrics.customersCount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <div
            className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
            onClick={() => router.push('/products')}
          >
            <div className='flex items-center'>
              <div className='p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg'>
                <svg
                  className='w-6 h-6 text-yellow-600 dark:text-yellow-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4'
                  />
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  库存产品
                </p>
                <p className='text-2xl font-semibold text-gray-900 dark:text-white'>
                  {metrics.productsCount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div
            className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
            onClick={() => router.push('/orders?status=pending')}
          >
            <div className='flex items-center'>
              <div className='p-2 bg-red-100 dark:bg-red-900 rounded-lg'>
                <svg
                  className='w-6 h-6 text-red-600 dark:text-red-400'
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
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  待处理订单
                </p>
                <p className='text-2xl font-semibold text-gray-900 dark:text-white'>
                  {metrics.pendingOrders.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* Revenue & Orders Trend */}
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                收入和订单趋势
              </h2>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className='px-3 py-1 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600'
              >
                <option value='1m'>近1月</option>
                <option value='3m'>近3月</option>
                <option value='6m'>近6月</option>
              </select>
            </div>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis yAxisId='left' />
                  <YAxis yAxisId='right' orientation='right' />
                  <Tooltip />
                  <Line
                    yAxisId='left'
                    type='monotone'
                    dataKey='revenue'
                    stroke='#4F46E5'
                    name='收入 (¥)'
                  />
                  <Line
                    yAxisId='right'
                    type='monotone'
                    dataKey='orders'
                    stroke='#10B981'
                    name='订单数'
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products */}
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-6'>
              热销产品
            </h2>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='sales' fill='#6366F1' name='销量' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* Recent Orders */}
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm'>
            <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                最近订单
              </h2>
            </div>
            <div className='p-6'>
              <div className='space-y-4'>
                {recentOrders.map((o) => (
                  <div
                    key={o.id}
                    className='flex items-center justify-between'
                    onClick={() => router.push(`/orders/${o.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div>
                      <p className='font-medium text-gray-900 dark:text-white'>
                        订单 #{o.id}
                      </p>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        {o.customer?.name}
                      </p>
                    </div>
                    <span className='px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'>
                      {o.status === 'fulfilled'
                        ? '已完成'
                        : o.status === 'pending'
                        ? '待处理'
                        : '已取消'}
                    </span>
                  </div>
                ))}
                {recentOrders.length === 0 && (
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    暂无订单
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm'>
            <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                库存不足警告
              </h2>
            </div>
            <div className='p-6'>
              <div className='space-y-4'>
                {lowStock.map((p) => (
                  <div key={p.id} className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium text-gray-900 dark:text-white'>
                        {p.title}
                      </p>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        仅剩 {p.stock} 件
                      </p>
                    </div>
                    <button
                      onClick={() => setIsInventoryModalOpen(true)}
                      className='px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    >
                      重新订购
                    </button>
                  </div>
                ))}
                {lowStock.length === 0 && (
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    暂无库存告警
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <button
            onClick={() => setIsInventoryModalOpen(true)}
            className='p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow'
          >
            <h3 className='font-semibold text-gray-900 dark:text-white'>
              管理库存
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              更新库存和价格
            </p>
          </button>
          <button
            onClick={() => router.push('/customers')}
            className='p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow'
          >
            <h3 className='font-semibold text-gray-900 dark:text-white'>
              客户数据库
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              查看客户详情
            </p>
          </button>
          <button
            onClick={() => router.push('/reports')}
            className='p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow'
          >
            <h3 className='font-semibold text-gray-900 dark:text-white'>
              销售报告
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              查看详细分析
            </p>
          </button>
          <button
            onClick={() => setIsProductModalOpen(true)}
            className='p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow'
          >
            <h3 className='font-semibold text-gray-900 dark:text-white'>
              新品上架
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              添加新产品到库存
            </p>
          </button>
        </div>
      </div>

      <InventoryFormModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        products={productsList as unknown as Array<Product & { stock: number }>}
        onSubmit={(data) => {
          console.log('Updating inventory:', data);
          setIsInventoryModalOpen(false);
        }}
      />

      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={(data) => {
          // Handle product submission
          console.log('Submitting product:', data);
          setIsProductModalOpen(false);
        }}
      />
    </div>
  );
}
