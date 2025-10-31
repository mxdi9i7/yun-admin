'use client';

import { useState, useEffect } from 'react';
import LoadingButton from '@/components/LoadingButton';
import { customers, products } from '@/lib/supabase-utils';
import type { Database } from '@/types/supabase';

type Customer = Database['public']['Tables']['customers']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: {
    customerId: number;
    items: Array<{
      productId: number;
      quantity: number;
      price: number;
    }>;
    notes?: string;
  }) => Promise<void> | void;
}

export default function OrderFormModal({
  isOpen,
  onClose,
  onSubmit,
}: OrderFormModalProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [productSearchTerms, setProductSearchTerms] = useState<string[]>(['']);
  const [productList, setProductList] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[][]>([[]]);
  const [showProductDropdowns, setShowProductDropdowns] = useState<boolean[]>([
    false,
  ]);

  const [orderItems, setOrderItems] = useState<
    Array<{
      productId: number;
      productName: string;
      quantity: number;
      price: number;
    }>
  >([
    {
      productId: 0,
      productName: '',
      quantity: 1,
      price: 0,
    },
  ]);

  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await products.getProducts({
        page: 1,
        pageSize: 1000,
        searchTerm: '',
        type: 'all',
      });

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      setProductList(data || []);
    };
    fetchProducts();
  }, []);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await customers.getCustomers({
        page: 1,
        pageSize: 1000,
        searchTerm: '',
      });

      if (error) {
        console.error('Error fetching customers:', error);
        return;
      }

      setCustomerList(data || []);
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customerList.filter((c) =>
      c.name.toLowerCase().includes(customerSearchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [customerSearchTerm, customerList]);

  useEffect(() => {
    const newFilteredProducts = productSearchTerms.map((term) =>
      productList.filter((p) =>
        p.title.toLowerCase().includes(term.toLowerCase())
      )
    );
    setFilteredProducts(newFilteredProducts);
  }, [productSearchTerms, productList]);

  const handleCustomerSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerSearchTerm(e.target.value);
    setShowCustomerDropdown(true);
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearchTerm(customer.name);
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
      productName: product.title,
      price: product.price || 0,
    };
    setOrderItems(newItems);

    const newTerms = [...productSearchTerms];
    newTerms[index] = product.title;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!selectedCustomer) {
      setError('请选择客户');
      setIsLoading(false);
      return;
    }

    const validItems = orderItems.filter(
      (item) => item.productId && item.quantity && item.price
    );

    if (validItems.length === 0) {
      setError('请至少添加一个有效的商品');
      setIsLoading(false);
      return;
    }

    try {
      await onSubmit({
        customerId: selectedCustomer.id,
        items: validItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        notes: notes || undefined,
      });

      setSelectedCustomer(null);
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
      setNotes('');
      setError(null);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        <h2 className='text-xl font-bold mb-4 text-gray-900 dark:text-white'>
          新建订单
        </h2>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Error Message */}
          {error && (
            <div className='p-4 bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 rounded'>
              <p className='text-sm text-red-700 dark:text-red-200'>{error}</p>
            </div>
          )}

          {/* Customer Selection */}
          <div className='relative'>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              客户
            </label>
            <input
              type='text'
              value={customerSearchTerm}
              onChange={handleCustomerSearch}
              placeholder='搜索客户...'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            />
            {showCustomerDropdown && filteredCustomers.length > 0 && (
              <div className='absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto'>
                {filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    type='button'
                    onClick={() => handleCustomerSelect(customer)}
                    className='w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                  >
                    {customer.name}
                    {customer.phone && (
                      <span className='text-gray-500 dark:text-gray-400 ml-2'>
                        ({customer.phone})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className='space-y-4'>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
              商品列表
            </label>
            {orderItems.map((item, index) => (
              <div
                key={index}
                className='flex gap-4 items-end p-4 border border-gray-200 dark:border-gray-700 rounded-lg'
              >
                {/* Product Search */}
                <div className='flex-1'>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    产品
                  </label>
                  <div className='relative'>
                    <input
                      type='text'
                      value={productSearchTerms[index]}
                      onChange={(e) => handleProductSearch(index, e.target.value)}
                      placeholder='搜索商品...'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                    />
                    {showProductDropdowns[index] &&
                      filteredProducts[index].length > 0 && (
                        <div className='absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto'>
                          {filteredProducts[index].map((product) => (
                            <button
                              key={product.id}
                              type='button'
                              onClick={() => handleProductSelect(index, product)}
                              className='w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                            >
                              {product.title}
                              {product.price && (
                                <span className='text-gray-500 dark:text-gray-400 ml-2'>
                                  (¥{product.price.toFixed(2)})
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                </div>

                {/* Quantity */}
                <div className='w-24'>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    数量
                  </label>
                  <input
                    type='number'
                    min='1'
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(index, parseInt(e.target.value) || 0)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                  />
                </div>

                {/* Price */}
                <div className='w-32'>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    单价
                  </label>
                  <div className='relative'>
                    <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                      <span className='text-gray-500 sm:text-sm'>¥</span>
                    </div>
                    <input
                      type='number'
                      min='0'
                      step='0.01'
                      value={item.price}
                      onChange={(e) =>
                        handlePriceChange(index, parseFloat(e.target.value) || 0)
                      }
                      className='w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                    />
                  </div>
                </div>

                {/* Remove Button */}
                {orderItems.length > 1 && (
                  <button
                    type='button'
                    onClick={() => handleRemoveItem(index)}
                    className='p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 self-end mb-1'
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
                        d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}

            {/* Add Item Button */}
            <button
              type='button'
              onClick={handleAddItem}
              className='w-full px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:outline-none'
            >
              添加商品
            </button>
          </div>

          {/* Notes */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              备注
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            />
          </div>

          {/* Total */}
          <div className='text-right'>
            <p className='text-lg font-semibold text-gray-900 dark:text-white'>
              总计: ¥{calculateTotal().toFixed(2)}
            </p>
          </div>

          {/* Form Actions */}
          <div className='flex justify-end space-x-3'>
            <LoadingButton
              type='button'
              variant='secondary'
              onClick={onClose}
              disabled={isLoading}
            >
              取消
            </LoadingButton>
            <LoadingButton type='submit' isLoading={isLoading} loadingText='创建中...'>
              创建订单
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
