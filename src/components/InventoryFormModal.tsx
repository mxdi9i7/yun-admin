'use client';

import Modal from '@/components/Modal';
import LoadingButton from '@/components/LoadingButton';
import { useState, useEffect } from 'react';
import { Product } from '@/lib/supabase-utils';

interface InventoryRecord {
  id: number;
  product: number;
  quantity: number;
  price: number;
  notes: string | null;
}

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    id?: number;
    productId: number;
    type: 'add';
    quantity: number;
    notes?: string;
    price: number;
  }) => Promise<void> | void;
  products: (Product & { stock: number })[];
  selectedProduct?: Product & { stock: number };
  initialData?: InventoryRecord;
  mode?: 'create' | 'edit';
}

export default function InventoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  products,
  selectedProduct,
  initialData,
  mode = 'create',
}: InventoryFormModalProps) {
  const [formData, setFormData] = useState({
    productId: selectedProduct?.id || products[0]?.id || 0,
    type: 'add' as const,
    quantityStr: '1',
    notes: '',
    price: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === 'edit') {
        setFormData({
          productId: initialData.product,
          type: 'add',
          quantityStr: initialData.quantity.toString(),
          notes: initialData.notes || '',
          price: initialData.price,
        });
      } else {
        setFormData({
          productId: selectedProduct?.id || products[0]?.id || 0,
          type: 'add',
          quantityStr: '1',
          notes: '',
          price: 0,
        });
      }
      setError(null);
    }
  }, [isOpen, initialData, mode, selectedProduct, products]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate and parse quantity
      const quantity = parseInt(formData.quantityStr);
      if (isNaN(quantity) || formData.quantityStr.trim() === '') {
        throw new Error('请输入有效的数量');
      }
      if (mode === 'create' && quantity < 1) {
        throw new Error('入库数量必须大于 0');
      }

      if (mode === 'create' && !formData.price) {
        throw new Error('入库时必须填写进价');
      }

      await onSubmit({
        productId: formData.productId,
        type: formData.type,
        quantity,
        notes: formData.notes,
        price: formData.price,
        id: mode === 'edit' && initialData ? initialData.id : undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存库存记录时发生错误');
      console.error('Error saving inventory log:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? '编辑库存记录' : '入库'}
    >
      <form onSubmit={handleSubmit} className='mt-4 space-y-4'>
        <div>
          <label
            htmlFor='productId'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300'
          >
            产品
          </label>
          <select
            id='productId'
            value={formData.productId}
            onChange={(e) =>
              setFormData({
                ...formData,
                productId: parseInt(e.target.value),
              })
            }
            disabled={!!selectedProduct || mode === 'edit'}
            required
            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50'
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.title} (当前库存: {product.stock})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor='quantity'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300'
          >
            数量
          </label>
          <input
            type='text'
            id='quantity'
            value={formData.quantityStr}
            onChange={(e) => {
              const value = e.target.value;
              // Allow empty string, negative sign, and numbers
              if (value === '' || value === '-' || /^-?\d+$/.test(value)) {
                setFormData({
                  ...formData,
                  quantityStr: value,
                });
              }
            }}
            required
            placeholder={mode === 'edit' ? '输入数量' : '输入数量（正数）'}
            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
          />
          {mode === 'edit' && (
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              可输入正数或负数
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='price'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300'
          >
            进价
          </label>
          <div className='relative mt-1 rounded-md shadow-sm'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
              <span className='text-gray-500 sm:text-sm'>¥</span>
            </div>
            <input
              type='number'
              id='price'
              value={formData.price || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setFormData({
                  ...formData,
                  price: value,
                });
              }}
              required
              min='0'
              step='0.01'
              placeholder='0.00'
              className='block w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            />
          </div>
          {mode === 'create' && (
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              入库时必须填写进价
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='notes'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300'
          >
            备注
          </label>
          <textarea
            id='notes'
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={3}
            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
          />
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
