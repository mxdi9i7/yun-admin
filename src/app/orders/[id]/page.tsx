'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  customer: string;
  items: OrderItem[];
  createdAt: string;
  total: number;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [order, setOrder] = useState<Order | null>({
    id: 1,
    customer: '张三',
    items: [
      {
        id: 1,
        productId: 1,
        productName: '商品A',
        quantity: 2,
        price: 299.99,
      },
      {
        id: 2,
        productId: 2,
        productName: '商品B',
        quantity: 1,
        price: 699.0,
      },
    ],
    createdAt: '2024-01-15T08:30:00Z',
    total: 1298.98,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<OrderItem | null>(
    null
  );

  // Mock data for dropdowns
  const customers = ['张三', '李四', '王五', '赵六'];
  const products = [
    { id: 1, productId: 1, productName: '商品A', price: 299.99 },
    { id: 2, productId: 2, productName: '商品B', price: 699.0 },
    { id: 3, productId: 3, productName: '商品C', price: 499.99 },
  ];

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleCustomerSelect = (customer: string) => {
    if (order) {
      setOrder({ ...order, customer });
    }
    setCustomerSearch('');
  };

  const handleAddProduct = () => {
    if (selectedProduct && order) {
      const newItem = { ...selectedProduct, quantity: 1 };
      const newItems = [...order.items, newItem];
      const newTotal = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      setOrder({ ...order, items: newItems, total: newTotal });
      setSelectedProduct(null);
      setProductSearch('');
    }
  };

  const handleUpdateQuantity = (itemId: number, quantity: number) => {
    if (order) {
      const newItems = order.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      const newTotal = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      setOrder({ ...order, items: newItems, total: newTotal });
    }
  };

  const handleUpdatePrice = (itemId: number, price: number) => {
    if (order) {
      const newItems = order.items.map((item) =>
        item.id === itemId ? { ...item, price } : item
      );
      const newTotal = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      setOrder({ ...order, items: newItems, total: newTotal });
    }
  };

  const handleRemoveItem = (itemId: number) => {
    if (order) {
      const newItems = order.items.filter((item) => item.id !== itemId);
      const newTotal = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      setOrder({ ...order, items: newItems, total: newTotal });
    }
  };

  const handleDelete = async () => {
    if (window.confirm('确定要删除此订单吗？')) {
      try {
        setLoading(true);
        // API call to delete order would go here
        router.push('/orders');
      } catch (err) {
        setError('删除订单失败');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-lg font-medium text-gray-600 dark:text-gray-300'>
          加载中...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-red-500 font-medium'>{error}</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-lg font-medium text-gray-600 dark:text-gray-300'>
          未找到订单
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden'>
          <div className='p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700'>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
              <div>
                <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                  订单详情
                </h1>
                <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                  订单号: #{order.id}
                </p>
              </div>
              <div className='flex items-center gap-4'>
                <div className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'>
                  待处理
                </div>
                <button
                  onClick={handleEdit}
                  className={`px-4 py-2 text-sm font-medium text-white ${
                    isEditing
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {isEditing ? '保存' : '编辑'}
                </button>
                <button
                  onClick={handleDelete}
                  className='px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                >
                  删除
                </button>
              </div>
            </div>
          </div>

          <div className='p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
              客户信息
            </h2>
            <div className='mt-4 space-y-2'>
              {isEditing ? (
                <div className='relative'>
                  <input
                    type='text'
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder='搜索客户...'
                    className='w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600'
                  />
                  {customerSearch && (
                    <div className='absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border rounded-lg shadow-lg'>
                      {customers
                        .filter((c) => c.includes(customerSearch))
                        .map((customer) => (
                          <div
                            key={customer}
                            onClick={() => handleCustomerSelect(customer)}
                            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer'
                          >
                            {customer}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className='text-gray-700 dark:text-gray-300 font-medium'>
                  {order.customer}
                </div>
              )}
              <div className='text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2'>
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          <div className='p-6 sm:p-8'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-6'>
              订单商品
            </h2>
            {isEditing && (
              <div className='mb-4 flex gap-2'>
                <div className='relative flex-1'>
                  <input
                    type='text'
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder='添加商品...'
                    className='w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600'
                  />
                  {productSearch && (
                    <div className='absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border rounded-lg shadow-lg'>
                      {products
                        .filter((p) => p.productName.includes(productSearch))
                        .map((product) => (
                          <div
                            key={product.id}
                            onClick={() => setSelectedProduct(product)}
                            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer'
                          >
                            {product.productName} - ¥{product.price}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAddProduct}
                  disabled={!selectedProduct}
                  className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
                >
                  添加
                </button>
              </div>
            )}
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-200 dark:border-gray-700'>
                    <th className='text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      商品名称
                    </th>
                    <th className='text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      单价
                    </th>
                    <th className='text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      数量
                    </th>
                    <th className='text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      小计
                    </th>
                    {isEditing && (
                      <th className='text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                        操作
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className='py-4 px-4 text-sm text-gray-900 dark:text-white font-medium'>
                        {item.productName}
                      </td>
                      <td className='py-4 px-4 text-sm text-gray-500 dark:text-gray-400 text-right'>
                        {isEditing ? (
                          <div className='relative inline-flex items-center'>
                            <span className='absolute left-3 text-gray-500 dark:text-gray-400'>
                              ¥
                            </span>
                            <input
                              type='number'
                              min='0'
                              step='0.01'
                              value={item.price}
                              onChange={(e) =>
                                handleUpdatePrice(
                                  item.id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className='w-28 py-1.5 pl-7 pr-3 text-right border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            />
                          </div>
                        ) : (
                          <span>¥{item.price.toFixed(2)}</span>
                        )}
                      </td>
                      <td className='py-4 px-4 text-sm text-gray-500 dark:text-gray-400 text-right'>
                        {isEditing ? (
                          <input
                            type='number'
                            min='1'
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateQuantity(
                                item.id,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className='w-20 py-1.5 px-3 text-right border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          />
                        ) : (
                          item.quantity
                        )}
                      </td>
                      <td className='py-4 px-4 text-sm text-gray-900 dark:text-white font-medium text-right'>
                        ¥{(item.price * item.quantity).toFixed(2)}
                      </td>
                      {isEditing && (
                        <td className='py-4 px-4 text-right'>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className='text-red-600 hover:text-red-700'
                          >
                            删除
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      colSpan={isEditing ? 4 : 3}
                      className='py-4 px-4 text-right text-sm font-medium text-gray-900 dark:text-white'
                    >
                      总计:
                    </td>
                    <td className='py-4 px-4 text-right text-base font-semibold text-gray-900 dark:text-white'>
                      ¥{order.total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
