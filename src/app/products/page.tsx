'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';
import ProductFormModal from '@/components/ProductFormModal';
import InventoryFormModal from '@/components/InventoryFormModal';

interface Product {
  id: number;
  name: string;
  category: string;
  stock: number;
  price: number;
  lastUpdated: string;
}

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Mock data - replace with real API call
  const products: Product[] = [
    {
      id: 1,
      name: '主钥匙A型',
      category: '钥匙',
      stock: 150,
      price: 299.99,
      lastUpdated: '2024-01-15',
    },
    {
      id: 2,
      name: '主钥匙B型',
      category: '钥匙',
      stock: 85,
      price: 399.99,
      lastUpdated: '2024-01-14',
    },
    {
      id: 3,
      name: '锁芯A型',
      category: '配件',
      stock: 200,
      price: 149.99,
      lastUpdated: '2024-01-13',
    },
  ];

  const categories = ['all', '钥匙', '配件', '工具'];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductSubmit = (productData: {
    name: string;
    category: string;
    stock: number;
    price: number;
  }) => {
    // Handle product creation/update
    console.log(productData);
    setIsProductModalOpen(false);
    setEditProduct(null);
  };

  const handleInventorySubmit = (data: {
    productId: number;
    type: 'add' | 'remove';
    quantity: number;
  }) => {
    // Handle inventory update
    console.log(data);
    setIsInventoryModalOpen(false);
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            产品库存管理
          </h1>
          <div className='space-x-4'>
            <button
              onClick={() => setIsInventoryModalOpen(true)}
              className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
            >
              库存调整
            </button>
            <button
              onClick={() => setIsProductModalOpen(true)}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              添加产品
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className='flex flex-col sm:flex-row gap-4 mb-6'>
          <div className='flex-1'>
            <input
              type='text'
              placeholder='搜索产品...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className='px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? '所有类别' : category}
              </option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'
            >
              <div className='flex justify-between items-start mb-4'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                    {product.name}
                  </h3>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {product.category}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.stock > 100
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : product.stock > 50
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  库存: {product.stock}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <p className='text-lg font-semibold text-gray-900 dark:text-white'>
                  ¥{product.price.toFixed(2)}
                </p>
                <button
                  onClick={() => {
                    setEditProduct(product);
                    setIsProductModalOpen(true);
                  }}
                  className='px-3 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors'
                >
                  编辑
                </button>
              </div>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
                最后更新: {product.lastUpdated}
              </p>
            </div>
          ))}
        </div>

        {/* Product Form Modal */}
        <ProductFormModal
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditProduct(null);
          }}
          onSubmit={handleProductSubmit}
          initialData={editProduct || undefined}
        />

        {/* Inventory Form Modal */}
        <InventoryFormModal
          isOpen={isInventoryModalOpen}
          onClose={() => setIsInventoryModalOpen(false)}
          onSubmit={handleInventorySubmit}
          products={products}
        />
      </div>
    </div>
  );
}
