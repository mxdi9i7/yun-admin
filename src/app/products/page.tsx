'use client';

import { useState, useEffect } from 'react';
import {
  Product as BaseProduct,
  ProductInsert,
  products,
} from '@/lib/supabase-utils';
import ProductFormModal from '@/components/ProductFormModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import Spinner from '@/components/Spinner';
import LoadingButton from '@/components/LoadingButton';
import { useRouter } from 'next/navigation';

type Product = BaseProduct & { stock: number };

export default function Products() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<
    'all' | 'keys' | 'tools' | 'parts'
  >('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productList, setProductList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  const types = ['all', 'keys', 'tools', 'parts'] as const;
  const pageSize = 10;

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data,
        error,
        count,
        totalPages: pages,
      } = await products.getProducts({
        page: currentPage,
        pageSize,
        searchTerm,
        type: selectedType,
      });

      if (error) throw error;

      setProductList(data || []);
      setTotalPages(pages);
      setTotalProducts(count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取产品列表时发生错误');
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, selectedType]);

  const handleProductSubmit = async (productData: ProductInsert) => {
    try {
      if (selectedProduct) {
        await products.updateProduct(selectedProduct.id, productData);
      } else {
        await products.createProduct(productData);
      }
      await fetchProducts();
      setIsProductModalOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err instanceof Error ? err.message : '保存产品时发生错误');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    try {
      await products.deleteProduct(selectedProduct.id);
      await fetchProducts();
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err instanceof Error ? err.message : '删除产品时发生错误');
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            产品管理
          </h1>
          <LoadingButton
            onClick={() => {
              setSelectedProduct(null);
              setIsProductModalOpen(true);
            }}
          >
            新增产品
          </LoadingButton>
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
            value={selectedType}
            onChange={(e) =>
              setSelectedType(e.target.value as typeof selectedType)
            }
            className='px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {type === 'all'
                  ? '所有类型'
                  : type === 'keys'
                  ? '钥匙'
                  : type === 'tools'
                  ? '工具'
                  : '配件'}
              </option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className='mb-6 bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded'>
            <p className='text-red-700 dark:text-red-200'>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className='flex justify-center items-center py-8'>
            <Spinner size='lg' />
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {productList.map((product) => (
              <div
                key={product.id}
                className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'
              >
                <div className='flex justify-between items-start mb-4'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                      {product.title}
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      {product.type === 'keys'
                        ? '钥匙'
                        : product.type === 'tools'
                        ? '工具'
                        : '配件'}
                    </p>
                  </div>
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <p className='text-lg font-semibold text-gray-900 dark:text-white'>
                      ¥{product.price?.toFixed(2) || '未设置'}
                    </p>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      库存:{' '}
                      <span className='font-semibold'>{product.stock}</span>
                    </p>
                  </div>
                  <div className='flex justify-end space-x-2'>
                    <LoadingButton
                      onClick={() => router.push(`/products/${product.id}`)}
                      variant='secondary'
                      size='sm'
                    >
                      查看详情
                    </LoadingButton>
                    <LoadingButton
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsProductModalOpen(true);
                      }}
                      variant='secondary'
                      size='sm'
                    >
                      编辑
                    </LoadingButton>
                    <LoadingButton
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsDeleteModalOpen(true);
                      }}
                      variant='danger'
                      size='sm'
                    >
                      删除
                    </LoadingButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 0 && (
          <div className='mt-4 flex items-center justify-between'>
            <div className='flex-1 flex justify-between sm:hidden'>
              <LoadingButton
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                variant='secondary'
                size='sm'
              >
                上一页
              </LoadingButton>
              <LoadingButton
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                variant='secondary'
                size='sm'
              >
                下一页
              </LoadingButton>
            </div>
            <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
              <div>
                <p className='text-sm text-gray-700 dark:text-gray-400'>
                  显示第{' '}
                  <span className='font-medium'>
                    {(currentPage - 1) * pageSize + 1}
                  </span>{' '}
                  到{' '}
                  <span className='font-medium'>
                    {Math.min(currentPage * pageSize, totalProducts)}
                  </span>{' '}
                  条， 共 <span className='font-medium'>{totalProducts}</span>{' '}
                  条结果
                </p>
              </div>
              <div>
                <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>
                  <LoadingButton
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    variant='secondary'
                    size='sm'
                  >
                    上一页
                  </LoadingButton>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          page === currentPage
                            ? 'bg-blue-50 text-blue-600 border-blue-500'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <LoadingButton
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    variant='secondary'
                    size='sm'
                  >
                    下一页
                  </LoadingButton>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Product Form Modal */}
        <ProductFormModal
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setSelectedProduct(null);
          }}
          onSubmit={handleProductSubmit}
          initialData={selectedProduct || undefined}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedProduct(null);
          }}
          onConfirm={handleDeleteConfirm}
          title='删除产品'
          message={`确定要删除产品 "${selectedProduct?.title}" 吗？此操作无法撤销。`}
          confirmText='删除'
          cancelText='取消'
        />
      </div>
    </div>
  );
}
