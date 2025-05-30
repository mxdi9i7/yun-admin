'use client';

import { useState, useEffect } from 'react';
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
import { orders, products, customers } from '@/lib/supabase-utils';
import type { Database } from '@/types/supabase';

type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items: Array<{
    id: number;
    product: number;
    quantity: number;
    price_overwrite: number | null;
    products: { title: string };
  }>;
};

type TimeRange = '1m' | '3m' | '6m' | '1y';

interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}

interface ProductPerformance {
  name: string;
  sales: number;
  revenue: number;
}

interface CustomerSegment {
  name: string;
  value: number;
}

interface SummaryStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  activeCustomers: number;
  revenueGrowth: number;
  ordersGrowth: number;
  aovGrowth: number;
  customersGrowth: number;
}

export default function Reports() {
  const [timeRange, setTimeRange] = useState<TimeRange>('6m');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [productData, setProductData] = useState<ProductPerformance[]>([]);
  const [customerData, setCustomerData] = useState<CustomerSegment[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    activeCustomers: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    aovGrowth: 0,
    customersGrowth: 0,
  });

  const calculateDateRange = (range: TimeRange) => {
    const now = new Date();
    const months = {
      '1m': 1,
      '3m': 3,
      '6m': 6,
      '1y': 12,
    }[range];
    const start = new Date(now);
    start.setMonth(now.getMonth() - months);
    return { start, end: now };
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { start, end } = calculateDateRange(timeRange);

      // Fetch all orders within the time range
      const { data: ordersData } = await orders.getOrders({
        page: 1,
        pageSize: 1000,
      });

      if (!ordersData) throw new Error('Failed to fetch orders');

      // Filter orders by date range
      const filteredOrders = ordersData.filter((order) => {
        const orderDate = new Date(order.created_at);
        return orderDate >= start && orderDate <= end;
      });

      // Calculate monthly revenue and orders
      const monthlyData: Record<string, RevenueData> = {};
      filteredOrders.forEach((order) => {
        const date = new Date(order.created_at);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        const monthLabel = `${date.getMonth() + 1}月`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthLabel,
            revenue: 0,
            orders: 0,
          };
        }

        const orderTotal = order.order_items.reduce(
          (total, item) => total + (item.price_overwrite || 0) * item.quantity,
          0
        );

        monthlyData[monthKey].revenue += orderTotal;
        monthlyData[monthKey].orders += 1;
      });

      // Calculate product performance
      const productStats: Record<number, ProductPerformance> = {};
      filteredOrders.forEach((order) => {
        order.order_items.forEach((item) => {
          if (!productStats[item.product]) {
            productStats[item.product] = {
              name: item.products.title,
              sales: 0,
              revenue: 0,
            };
          }
          productStats[item.product].sales += item.quantity;
          productStats[item.product].revenue +=
            (item.price_overwrite || 0) * item.quantity;
        });
      });

      // Calculate customer segments
      const customerTypes = filteredOrders.reduce((acc, order) => {
        const total = order.order_items.reduce(
          (sum, item) => sum + (item.price_overwrite || 0) * item.quantity,
          0
        );

        if (total < 1000) acc.small = (acc.small || 0) + 1;
        else if (total < 5000) acc.medium = (acc.medium || 0) + 1;
        else acc.large = (acc.large || 0) + 1;

        return acc;
      }, {} as Record<string, number>);

      // Calculate summary statistics
      const totalRevenue = Object.values(monthlyData).reduce(
        (sum, data) => sum + data.revenue,
        0
      );
      const totalOrders = Object.values(monthlyData).reduce(
        (sum, data) => sum + data.orders,
        0
      );
      const activeCustomers = new Set(
        filteredOrders.map((order) => order.customer.id)
      ).size;

      // Set state
      setRevenueData(Object.values(monthlyData));
      setProductData(
        Object.values(productStats)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)
      );
      setCustomerData([
        { name: '小额客户 (<¥1000)', value: customerTypes.small || 0 },
        { name: '中额客户 (¥1000-¥5000)', value: customerTypes.medium || 0 },
        { name: '大额客户 (>¥5000)', value: customerTypes.large || 0 },
      ]);
      setSummaryStats({
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
        activeCustomers,
        revenueGrowth: 0, // Would need historical data to calculate growth
        ordersGrowth: 0,
        aovGrowth: 0,
        customersGrowth: 0,
      });
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err instanceof Error ? err.message : '获取报告数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm'>
            <h2 className='text-xl font-semibold text-red-600 dark:text-red-400'>
              {error}
            </h2>
          </div>
        </div>
      </div>
    );
  }

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
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
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
              ¥{summaryStats.totalRevenue.toLocaleString()}
            </p>
            <span
              className={`${
                summaryStats.revenueGrowth >= 0
                  ? 'text-green-500'
                  : 'text-red-500'
              } text-sm`}
            >
              {summaryStats.revenueGrowth >= 0 ? '↑' : '↓'}{' '}
              {Math.abs(summaryStats.revenueGrowth).toFixed(1)}%
            </span>
          </div>
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm'>
            <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
              订单数
            </h3>
            <p className='text-2xl font-bold text-gray-900 dark:text-white'>
              {summaryStats.totalOrders.toLocaleString()}
            </p>
            <span
              className={`${
                summaryStats.ordersGrowth >= 0
                  ? 'text-green-500'
                  : 'text-red-500'
              } text-sm`}
            >
              {summaryStats.ordersGrowth >= 0 ? '↑' : '↓'}{' '}
              {Math.abs(summaryStats.ordersGrowth).toFixed(1)}%
            </span>
          </div>
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm'>
            <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
              平均订单金额
            </h3>
            <p className='text-2xl font-bold text-gray-900 dark:text-white'>
              ¥{summaryStats.averageOrderValue.toFixed(2)}
            </p>
            <span
              className={`${
                summaryStats.aovGrowth >= 0 ? 'text-green-500' : 'text-red-500'
              } text-sm`}
            >
              {summaryStats.aovGrowth >= 0 ? '↑' : '↓'}{' '}
              {Math.abs(summaryStats.aovGrowth).toFixed(1)}%
            </span>
          </div>
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm'>
            <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
              活跃客户数
            </h3>
            <p className='text-2xl font-bold text-gray-900 dark:text-white'>
              {summaryStats.activeCustomers.toLocaleString()}
            </p>
            <span
              className={`${
                summaryStats.customersGrowth >= 0
                  ? 'text-green-500'
                  : 'text-red-500'
              } text-sm`}
            >
              {summaryStats.customersGrowth >= 0 ? '↑' : '↓'}{' '}
              {Math.abs(summaryStats.customersGrowth).toFixed(1)}%
            </span>
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
                <LineChart data={revenueData}>
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
                <BarChart data={productData}>
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
                    data={customerData}
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
                <LineChart data={revenueData}>
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

        {isLoading && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white'></div>
          </div>
        )}
      </div>
    </div>
  );
}
