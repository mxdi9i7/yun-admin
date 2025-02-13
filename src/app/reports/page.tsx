'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const monthlyRevenue = [
  { month: '1月', revenue: 15000, orders: 120 },
  { month: '2月', revenue: 18000, orders: 145 },
  { month: '3月', revenue: 16500, orders: 130 },
  { month: '4月', revenue: 21000, orders: 160 },
  { month: '5月', revenue: 24500, orders: 180 },
  { month: '6月', revenue: 24567, orders: 185 },
];

const productPerformance = [
  { name: '主钥匙A', sales: 120, revenue: 12000 },
  { name: '主钥匙B', sales: 98, revenue: 9800 },
  { name: '主钥匙C', sales: 86, revenue: 8600 },
  { name: '主钥匙D', sales: 75, revenue: 7500 },
  { name: '主钥匙E', sales: 65, revenue: 6500 },
];

const customerSegmentation = [
  { name: '个人客户', value: 400 },
  { name: '小型企业', value: 300 },
  { name: '大型企业', value: 200 },
  { name: '政府机构', value: 100 },
];

export default function Reports() {
  const [timeRange, setTimeRange] = useState('6m');

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            销售报告
          </h1>
          <div className='mt-4 flex gap-4'>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className='px-4 py-2 rounded-md border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700'
            >
              <option value='1m'>最近1个月</option>
              <option value='3m'>最近3个月</option>
              <option value='6m'>最近6个月</option>
              <option value='1y'>最近1年</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm'>
            <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
              总收入
            </h3>
            <p className='text-2xl font-bold text-gray-900 dark:text-white'>
              ¥119,567
            </p>
            <span className='text-green-500 text-sm'>↑ 12.5%</span>
          </div>
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm'>
            <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
              订单数
            </h3>
            <p className='text-2xl font-bold text-gray-900 dark:text-white'>
              920
            </p>
            <span className='text-green-500 text-sm'>↑ 8.2%</span>
          </div>
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm'>
            <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
              平均订单金额
            </h3>
            <p className='text-2xl font-bold text-gray-900 dark:text-white'>
              ¥130
            </p>
            <span className='text-green-500 text-sm'>↑ 3.7%</span>
          </div>
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm'>
            <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
              活跃客户数
            </h3>
            <p className='text-2xl font-bold text-gray-900 dark:text-white'>
              450
            </p>
            <span className='text-green-500 text-sm'>↑ 5.3%</span>
          </div>
        </div>

        {/* Charts */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* Revenue Trend */}
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              收入趋势
            </h2>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='revenue'
                    stroke='#6366F1'
                    name='收入'
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Performance */}
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              产品销售表现
            </h2>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={productPerformance}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' />
                  <YAxis yAxisId='left' orientation='left' stroke='#6366F1' />
                  <YAxis yAxisId='right' orientation='right' stroke='#34D399' />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId='left'
                    dataKey='sales'
                    fill='#6366F1'
                    name='销量'
                  />
                  <Bar
                    yAxisId='right'
                    dataKey='revenue'
                    fill='#34D399'
                    name='收入'
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Segmentation */}
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              客户细分
            </h2>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={customerSegmentation}
                    cx='50%'
                    cy='50%'
                    outerRadius={100}
                    fill='#6366F1'
                    dataKey='value'
                    label
                  />
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders Trend */}
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              订单趋势
            </h2>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='orders'
                    stroke='#6366F1'
                    name='订单数'
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
