'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: {
    id: number;
    name: string;
    stock: number;
  }[];
}

export default function InventoryFormModal({
  isOpen,
  onClose,
  products,
}: InventoryFormModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number;
    name: string;
    stock: number;
  } | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [type, setType] = useState<'add' | 'remove'>('add');

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    // Here you would typically make an API call to update inventory
    console.log({
      productId: selectedProduct.id,
      quantity,
      type,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className='space-y-6 p-2'>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-4'>
          调整库存
        </h2>

        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
            产品名称
          </label>
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedProduct(null);
            }}
            className='mt-1 block w-full px-4 py-2 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            placeholder='搜索产品...'
          />
          {searchTerm && filteredProducts.length > 0 && !selectedProduct && (
            <div className='mt-1 border rounded-md shadow-sm max-h-40 overflow-y-auto'>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setSearchTerm(product.name);
                  }}
                  className='px-4 py-2 hover:bg-gray-100 cursor-pointer'
                >
                  {product.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedProduct && (
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
              当前库存
            </label>
            <input
              type='number'
              value={selectedProduct.stock}
              disabled
              className='mt-1 block w-full px-4 py-2 rounded-md border-2 border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            />
          </div>
        )}

        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
            操作类型
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'add' | 'remove')}
            className='mt-1 block w-full px-4 py-2 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
          >
            <option value='add'>入库</option>
            <option value='remove'>出库</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
            数量
          </label>
          <input
            type='number'
            min={0}
            value={quantity || ''}
            onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
            onFocus={(e) => {
              if (quantity === 0) setQuantity(null);
            }}
            onBlur={(e) => {
              if (!quantity) setQuantity(0);
            }}
            required
            className='mt-1 block w-full px-4 py-2 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            placeholder='0'
          />
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
            disabled={!selectedProduct}
            className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300'
          >
            确认
          </button>
        </div>
      </form>
    </Modal>
  );
}
