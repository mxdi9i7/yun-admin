'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product, products } from '@/lib/supabase-utils';
import Spinner from '@/components/Spinner';
import LoadingButton from '@/components/LoadingButton';
import InventoryFormModal from '@/components/InventoryFormModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useToast } from '@/components/ToastProvider';

interface InventoryRecord {
  id: number;
  product: number;
  quantity: number;
  price: number;
  created_at: string;
  notes: string | null;
  product_details?: Product & { stock: number };
}

export default function Inventory() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>(
    []
  );
  const [productsList, setProductsList] = useState<
    (Product & { stock: number })[]
  >([]);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<InventoryRecord | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 10;
  const toast = useToast();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all products first
      const { data: productsData, error: productsError } =
        await products.getProducts({
          page: 1,
          pageSize: 1000, // Get all products
          searchTerm: '',
          type: 'all',
        });

      if (productsError) throw productsError;
      setProductsList(productsData || []);

      // Fetch inventory records
      const {
        data: inventoryData,
        error: inventoryError,
        count,
        totalPages: fetchedTotalPages,
      } = await products.getInventoryRecords({
        page: currentPage,
        pageSize,
      });

      if (inventoryError) throw inventoryError;

      // Combine inventory records with product details
      const recordsWithProducts = (inventoryData || []).map((record) => ({
        ...record,
        product_details: productsData?.find((p) => p.id === record.product),
      })) as InventoryRecord[];

      setInventoryRecords(recordsWithProducts);
      setTotalPages(fetchedTotalPages ?? Math.ceil((count || 0) / pageSize));
      setTotalRecords(count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据时发生错误');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleInventorySubmit = async (data: {
    id?: number;
    productId: number;
    type: 'add';
    quantity: number;
    notes?: string;
    price: number;
  }) => {
    try {
      if (data.id) {
        // Edit mode
        const { error } = await products.updateInventoryRecord(data.id, {
          quantity: data.quantity,
          price: data.price,
          notes: data.notes,
        });
        if (error) throw error;
        toast.show({
          title: '成功',
          description: '库存记录已更新',
          variant: 'success',
        });
        setIsEditModalOpen(false);
      } else {
        // Create mode
        if (!data.price) {
          throw new Error('入库时必须填写进价');
        }
        await products.updateInventory(data);
        toast.show({
          title: '成功',
          description: '库存记录已创建',
          variant: 'success',
        });
        setIsInventoryModalOpen(false);
      }
      await fetchData();
      setSelectedRecord(null);
    } catch (err) {
      console.error('Error saving inventory:', err);
      const errorMessage =
        err instanceof Error ? err.message : '保存库存记录时发生错误';
      setError(errorMessage);
      toast.show({
        title: '错误',
        description: errorMessage,
        variant: 'error',
      });
    }
  };

  const handleEdit = (record: InventoryRecord) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;
    try {
      const { error } = await products.deleteInventoryRecord(selectedRecord.id);
      if (error) throw error;
      toast.show({
        title: '成功',
        description: '库存记录已删除',
        variant: 'success',
      });
      await fetchData();
      setIsDeleteModalOpen(false);
      setSelectedRecord(null);
    } catch (err) {
      console.error('Error deleting inventory record:', err);
      const errorMessage =
        err instanceof Error ? err.message : '删除库存记录时发生错误';
      setError(errorMessage);
      toast.show({
        title: '错误',
        description: errorMessage,
        variant: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8'>
        <div className='flex justify-center items-center py-8'>
          <Spinner size='lg' />
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
              库存管理
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              查看和管理所有产品的库存记录
            </p>
          </div>
          <LoadingButton onClick={() => setIsInventoryModalOpen(true)}>
            调整库存
          </LoadingButton>
        </div>

        {/* Error Message */}
        {error && (
          <div className='mb-6 bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded'>
            <p className='text-red-700 dark:text-red-200'>{error}</p>
          </div>
        )}

        {/* Inventory Records Table */}
        <div className='bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
              <thead className='bg-gray-50 dark:bg-gray-900'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    时间
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    产品
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    变动数量
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    单价
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    备注
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                {inventoryRecords.map((record) => (
                  <tr key={record.id}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      {new Date(record.created_at).toLocaleString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      <Link
                        href={`/products/${record.product}`}
                        className='text-blue-600 dark:text-blue-400 hover:underline'
                      >
                        {record.product_details?.title || '未知产品'}
                      </Link>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      <span
                        className={
                          record.quantity > 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }
                      >
                        {record.quantity > 0 ? '+' : ''}
                        {record.quantity}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      ¥{record.price.toFixed(2)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                      {record.notes || '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      <Link
                        href={`/products/${record.product}`}
                        className='text-blue-600 dark:text-blue-400 hover:underline'
                      >
                        查看产品
                      </Link>
                    </td>
                  </tr>
                ))}
                {inventoryRecords.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className='px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400'
                    >
                      暂无记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700'>
              <div className='flex items-center justify-between'>
                <div className='text-sm text-gray-700 dark:text-gray-400'>
                  显示第{' '}
                  <span className='font-medium'>
                    {(currentPage - 1) * pageSize + 1}
                  </span>{' '}
                  到{' '}
                  <span className='font-medium'>
                    {Math.min(currentPage * pageSize, totalRecords)}
                  </span>{' '}
                  条， 共 <span className='font-medium'>{totalRecords}</span>{' '}
                  条记录
                </div>
                <div className='flex space-x-2'>
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
              </div>
            </div>
          )}
        </div>

        {/* Inventory Form Modal */}
        <InventoryFormModal
          isOpen={isInventoryModalOpen}
          onClose={() => setIsInventoryModalOpen(false)}
          onSubmit={handleInventorySubmit}
          products={productsList}
        />
      </div>
    </div>
  );
}
