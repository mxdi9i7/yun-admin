'use client';

import { useState, useEffect } from 'react';
import { OrderItem } from '@/types/order';

interface Product {
  id: number;
  name: string;
  price: number;
  lastIncomingCost?: number;
}

interface Customer {
  id: number;
  name: string;
}

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (order: { customer: string; items: OrderItem[] }) => void;
}

export default function OrderFormModal({
  isOpen,
  onClose,
  onSubmit,
}: OrderFormModalProps) {
  const [customer, setCustomer] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [productSearchTerms, setProductSearchTerms] = useState<string[]>(['']);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[][]>([[]]);
  const [showProductDropdowns, setShowProductDropdowns] = useState<boolean[]>([
    false,
  ]);

  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      productId: 0,
      productName: '',
      quantity: 1,
      price: 0,
    },
  ]);

  // Mock fetch products - replace with real API call
  useEffect(() => {
    const fetchProducts = async () => {
      // Replace with actual API call
      const mockProducts = [
        { id: 1, name: '商品A', price: 299, lastIncomingCost: 200 },
        { id: 2, name: '商品B', price: 499, lastIncomingCost: 350 },
        { id: 3, name: '商品C', price: 699, lastIncomingCost: 500 },
      ];
      setProducts(mockProducts);
    };
    fetchProducts();
  }, []);

  // Mock fetch customers - replace with real API call
  useEffect(() => {
    const fetchCustomers = async () => {
      // Replace with actual API call
      const mockCustomers = [
        { id: 1, name: '张三' },
        { id: 2, name: '李四' },
        { id: 3, name: '王五' },
      ];
      setCustomers(mockCustomers);
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter((c) =>
      c.name.toLowerCase().includes(customerSearchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [customerSearchTerm, customers]);

  useEffect(() => {
    const newFilteredProducts = productSearchTerms.map((term) =>
      products.filter((p) => p.name.toLowerCase().includes(term.toLowerCase()))
    );
    setFilteredProducts(newFilteredProducts);
  }, [productSearchTerms, products]);

  const handleCustomerSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerSearchTerm(e.target.value);
    setShowCustomerDropdown(true);
  };

  const handleCustomerSelect = (selectedCustomer: Customer) => {
    setCustomer(selectedCustomer.name);
    setCustomerSearchTerm(selectedCustomer.name);
    setShowCustomerDropdown(false);
  };

  const handleProductSearch = (index: number, term: string) => {
    const newTerms = [...productSearchTerms];
    newTerms[index] = term;
    setProductSearchTerms(newTerms);

    const newDropdowns = [...showProductDropdowns];
    newDropdowns[index] = true;
    setShowProductDropdowns(newDropdowns);
  };

  const handleProductSelect = (index: number, product: Product) => {
    const newItems = [...orderItems];
    newItems[index] = {
      ...newItems[index],
      productId: product.id,
      productName: product.name,
      price: product.price,
    };
    setOrderItems(newItems);

    const newTerms = [...productSearchTerms];
    newTerms[index] = product.name;
    setProductSearchTerms(newTerms);

    const newDropdowns = [...showProductDropdowns];
    newDropdowns[index] = false;
    setShowProductDropdowns(newDropdowns);
  };

  const handleAddItem = () => {
    setOrderItems([
      ...orderItems,
      {
        productId: 0,
        productName: '',
        quantity: 1,
        price: 0,
      },
    ]);
    setProductSearchTerms([...productSearchTerms, '']);
    setShowProductDropdowns([...showProductDropdowns, false]);
    setFilteredProducts([...filteredProducts, []]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
    setProductSearchTerms(productSearchTerms.filter((_, i) => i !== index));
    setShowProductDropdowns(showProductDropdowns.filter((_, i) => i !== index));
    setFilteredProducts(filteredProducts.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, value: number) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], quantity: value };
    setOrderItems(newItems);
  };

  const handlePriceChange = (index: number, value: number) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], price: value };
    setOrderItems(newItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      customer,
      items: orderItems,
    });
    setCustomer('');
    setCustomerSearchTerm('');
    setOrderItems([
      {
        productId: 0,
        productName: '',
        quantity: 1,
        price: 0,
      },
    ]);
    setProductSearchTerms(['']);
    setShowProductDropdowns([false]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl'>
        <h2 className='text-xl font-bold mb-4 text-gray-900 dark:text-white'>
          新建订单
        </h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-4 relative'>
            <label
              className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              htmlFor='customer'
            >
              客户名称
            </label>
            <input
              type='text'
              id='customer'
              value={customerSearchTerm}
              onChange={handleCustomerSearch}
              onFocus={() => setShowCustomerDropdown(true)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
              required
              placeholder='搜索客户...'
            />
            {showCustomerDropdown && filteredCustomers.length > 0 && (
              <div className='absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg'>
                {filteredCustomers.map((c) => (
                  <div
                    key={c.id}
                    className='px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer'
                    onClick={() => handleCustomerSelect(c)}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='space-y-4'>
            {orderItems.map((item, index) => (
              <div key={index} className='flex gap-4 items-end'>
                <div className='flex-1 relative'>
                  <label
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
                    htmlFor={`product-${index}`}
                  >
                    商品
                  </label>
                  <input
                    type='text'
                    id={`product-${index}`}
                    value={productSearchTerms[index]}
                    onChange={(e) => handleProductSearch(index, e.target.value)}
                    onFocus={() => {
                      const newDropdowns = [...showProductDropdowns];
                      newDropdowns[index] = true;
                      setShowProductDropdowns(newDropdowns);
                    }}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                    required
                    placeholder='搜索商品...'
                  />
                  {showProductDropdowns[index] &&
                    filteredProducts[index]?.length > 0 && (
                      <div className='absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg'>
                        {filteredProducts[index].map((p) => (
                          <div
                            key={p.id}
                            className='px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer'
                            onClick={() => handleProductSelect(index, p)}
                          >
                            <div>{p.name}</div>
                            <div className='text-sm text-gray-500 dark:text-gray-400'>
                              建议售价: ¥{p.price} | 最近进价: ¥
                              {p.lastIncomingCost}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
                <div className='w-32'>
                  <label
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
                    htmlFor={`price-${index}`}
                  >
                    单价
                  </label>
                  <div className='relative'>
                    <span className='absolute left-3 top-2 text-gray-500 dark:text-gray-400'>
                      ¥
                    </span>
                    <input
                      type='number'
                      id={`price-${index}`}
                      value={item.price || ''}
                      onChange={(e) =>
                        handlePriceChange(index, Number(e.target.value))
                      }
                      min='0'
                      step='0.01'
                      className='w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                      required
                    />
                  </div>
                </div>
                <div className='w-32'>
                  <label
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
                    htmlFor={`quantity-${index}`}
                  >
                    数量
                  </label>
                  <input
                    type='number'
                    id={`quantity-${index}`}
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(index, Number(e.target.value))
                    }
                    min='1'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                    required
                  />
                </div>
                {orderItems.length > 1 && (
                  <button
                    type='button'
                    onClick={() => handleRemoveItem(index)}
                    className='px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
                  >
                    删除
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type='button'
            onClick={handleAddItem}
            className='mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
          >
            + 添加商品
          </button>

          <div className='mt-6 flex justify-between items-center'>
            <div className='text-lg font-semibold text-gray-900 dark:text-white'>
              总计: ¥{calculateTotal().toFixed(2)}
            </div>
            <div className='flex gap-4'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              >
                取消
              </button>
              <button
                type='submit'
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                提交订单
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
