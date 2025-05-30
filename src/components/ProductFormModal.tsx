'use client';

import Modal from '@/components/Modal';
import LoadingButton from '@/components/LoadingButton';
import { useState, useEffect } from 'react';
import { Product, ProductInsert } from '@/lib/supabase-utils';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: ProductInsert) => void;
  initialData?: Product;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState<ProductInsert>({
    title: '',
    type: 'keys',
    price: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update form data when initialData changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: initialData?.title || '',
        type: initialData?.type || 'keys',
        price: initialData?.price || 0,
      });
      setError(null);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate price
      const priceNum = parseFloat(formData.price.toString());
      if (isNaN(priceNum) || priceNum < 0) {
        throw new Error('请输入有效的价格');
      }

      // Submit with converted price
      onSubmit({
        ...formData,
        price: priceNum,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '表单验证错误');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? '编辑产品' : '新增产品'}
    >
      <form onSubmit={handleSubmit} className='mt-4 space-y-4'>
        <div>
          <label
            htmlFor='title'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300'
          >
            产品名称
          </label>
          <input
            type='text'
            id='title'
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
          />
        </div>

        <div>
          <label
            htmlFor='type'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300'
          >
            类型
          </label>
          <select
            id='type'
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as ProductInsert['type'],
              })
            }
            required
            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
          >
            <option value='keys'>钥匙</option>
            <option value='tools'>工具</option>
            <option value='parts'>配件</option>
          </select>
        </div>

        <div>
          <label
            htmlFor='price'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300'
          >
            价格
          </label>
          <div className='relative mt-1 rounded-md shadow-sm'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
              <span className='text-gray-500 sm:text-sm'>¥</span>
            </div>
            <input
              type='text'
              id='price'
              value={formData.price}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty string or numbers with up to 2 decimal places
                if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                  setFormData({ ...formData, price: parseFloat(value) || 0 });
                }
              }}
              placeholder='0.00'
              required
              className='block w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            />
          </div>
        </div>

        {error && (
          <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
        )}

        <div className='mt-6 flex justify-end space-x-3'>
          <LoadingButton
            type='button'
            variant='secondary'
            onClick={onClose}
            disabled={isLoading}
          >
            取消
          </LoadingButton>
          <LoadingButton
            type='submit'
            isLoading={isLoading}
            loadingText='保存中...'
          >
            保存
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}
