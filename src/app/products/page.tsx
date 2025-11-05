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
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOrderCount, setDeleteOrderCount] = useState(0);
  const [deleteInventoryCount, setDeleteInventoryCount] = useState(0);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleDeleteClick = async (product: Product) => {
    try {
      // Get the order count and inventory count for this product
      const [
        { count: orderCount, error: orderCountError },
        { count: inventoryCount, error: inventoryCountError },
      ] = await Promise.all([
        products.getProductOrderCount(product.id),
        products.getProductInventoryCount(product.id),
      ]);

      if (orderCountError || inventoryCountError) {
        console.error(
          'Error getting counts:',
          orderCountError || inventoryCountError,
        );
        setError('获取相关记录数量时发生错误');
        return;
      }

      setSelectedProduct(product);
      setDeleteOrderCount(orderCount);
      setDeleteInventoryCount(inventoryCount);
      setIsDeleteModalOpen(true);
    } catch (err) {
      console.error('Error preparing delete:', err);
      setError(err instanceof Error ? err.message : '准备删除时发生错误');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    setIsDeleting(true);
    try {
      const { error: deleteError } = await products.deleteProduct(
        selectedProduct.id,
      );

      if (deleteError) throw deleteError;

      await fetchProducts();
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      setDeleteOrderCount(0);
      setDeleteInventoryCount(0);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err instanceof Error ? err.message : '删除产品时发生错误');
    } finally {
      setIsDeleting(false);
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

        {/* Empty State */}
        {!isLoading && productList.length === 0 && (
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center'>
            <div className='inline-flex justify-center items-center w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full mb-6'>
              <svg
                className='w-10 h-10 text-blue-600 dark:text-blue-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                />
              </svg>
            </div>
            <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-3'>
              {searchTerm || selectedType !== 'all'
                ? '未找到符合条件的产品'
                : '还没有任何产品'}
            </h3>
            <p className='text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto'>
              {searchTerm || selectedType !== 'all'
                ? '尝试调整搜索条件或筛选条件'
                : '开始添加您的第一个产品到库存中'}
            </p>
            {searchTerm || selectedType !== 'all' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                }}
                className='inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                <svg
                  className='w-5 h-5 mr-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                  />
                </svg>
                重置筛选条件
              </button>
            ) : (
              <LoadingButton
                onClick={() => {
                  setSelectedProduct(null);
                  setIsProductModalOpen(true);
                }}
                size='lg'
                className='inline-flex items-center mx-auto'
              >
                <svg
                  className='w-5 h-5 mr-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 4v16m8-8H4'
                  />
                </svg>
                添加第一个产品
              </LoadingButton>
            )}
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && productList.length > 0 && (
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
                      onClick={() => handleDeleteClick(product)}
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
                    ),
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
            setDeleteOrderCount(0);
            setDeleteInventoryCount(0);
          }}
          onConfirm={handleDeleteConfirm}
          title='删除产品'
          message={
            <div>
              <p className='mb-3'>
                确定要删除产品{' '}
                <span className='font-semibold'>{selectedProduct?.title}</span>{' '}
                吗？
              </p>
              {deleteOrderCount > 0 || deleteInventoryCount > 0 ? (
                <div className='mt-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
                  <div className='flex items-start'>
                    <svg
                      className='w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-2 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                      />
                    </svg>
                    <div>
                      <p className='text-sm font-medium text-yellow-800 dark:text-yellow-200'>
                        该产品有相关记录将被删除：
                      </p>
                      <ul className='text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1 list-disc list-inside'>
                        {deleteOrderCount > 0 && (
                          <li>{deleteOrderCount} 个订单项</li>
                        )}
                        {deleteInventoryCount > 0 && (
                          <li>{deleteInventoryCount} 条库存记录</li>
                        )}
                      </ul>
                      <p className='text-sm text-yellow-700 dark:text-yellow-300 mt-2'>
                        删除后，所有相关记录将被永久移除。这可能会影响历史数据的完整性。
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
                  该产品未在任何订单或库存记录中使用。
                </p>
              )}
              <p className='mt-4 text-sm font-medium text-red-600 dark:text-red-400'>
                此操作无法撤销！
              </p>
            </div>
          }
          confirmText='删除'
          cancelText='取消'
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}
