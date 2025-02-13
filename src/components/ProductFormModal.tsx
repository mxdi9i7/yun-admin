'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: {
    name: string;
    category: string;
    stock: number;
    price: number;
  }) => void;
  initialData?: {
    name: string;
    category: string;
    stock: number;
    price: number;
  };
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ProductFormModalProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || '钥匙');
  const [stock, setStock] = useState(initialData?.stock || 0);
  const [price, setPrice] = useState(initialData?.price || 0);

  const categories = ['钥匙', '配件', '工具'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      category,
      stock,
      price,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className='space-y-6 p-2'>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-4'>
          {initialData ? '编辑产品' : '添加产品'}
        </h2>

        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
            产品名称
          </label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className='mt-1 block w-full px-4 py-2 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            placeholder='输入产品名称'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
            类别
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className='mt-1 block w-full px-4 py-2 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
              库存数量
            </label>
            <input
              type='number'
              min={0}
              value={stock || ''}
              onChange={(e) => setStock(Number(e.target.value))}
              onFocus={(e) => {
                if (stock === 0) setStock(null);
              }}
              onBlur={(e) => {
                if (!stock) setStock(0);
              }}
              required
              className='mt-1 block w-full px-4 py-2 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
              placeholder='0'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
              价格
            </label>
            <div className='relative'>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
                ¥
              </span>
              <input
                type='number'
                min={0}
                step='0.01'
                value={price || ''}
                onChange={(e) => setPrice(Number(e.target.value))}
                onFocus={(e) => {
                  if (price === 0) setPrice(null);
                }}
                onBlur={(e) => {
                  if (!price) setPrice(0);
                }}
                required
                className='mt-1 block w-full pl-8 pr-4 py-2 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                placeholder='0.00'
              />
            </div>
          </div>
        </div>

        <div className='flex justify-end gap-4'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
          >
            取消
          </button>
          <button
            type='submit'
            className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700'
          >
            {initialData ? '保存' : '添加'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
