'use client';

import { useState } from 'react';
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

const monthlyData = [
  { month: '1月', revenue: 15000, orders: 120 },
  { month: '2月', revenue: 18000, orders: 145 },
  { month: '3月', revenue: 16500, orders: 130 },
  { month: '4月', revenue: 21000, orders: 160 },
  { month: '5月', revenue: 24500, orders: 180 },
  { month: '6月', revenue: 24567, orders: 185 },
];

const productData = [
  { name: '主钥匙A', sales: 120 },
  { name: '主钥匙B', sales: 98 },
  { name: '主钥匙C', sales: 86 },
  { name: '主钥匙D', sales: 75 },
  { name: '主钥匙E', sales: 65 },
];

export default function Dashboard() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('6m');
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 font-[family-name:var(--font-geist-sans)]'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            云端管理系统
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
                  ¥24,567
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
                    1,234
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
                  567
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
                  23
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
                <BarChart data={productData}>
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
                {[1, 2, 3].map((order) => (
                  <div
                    key={order}
                    className='flex items-center justify-between'
                    onClick={() => router.push(`/orders/${order}23456`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div>
                      <p className='font-medium text-gray-900 dark:text-white'>
                        订单 #{order}23456
                      </p>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        客户名称 {order}
                      </p>
                    </div>
                    <span className='px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
                      已完成
                    </span>
                  </div>
                ))}
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
                {[1, 2, 3].map((item) => (
                  <div key={item} className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium text-gray-900 dark:text-white'>
                        主钥匙类型 {item}
                      </p>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        仅剩 {item} 件
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
        products={[]} // Pass your products data here
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
