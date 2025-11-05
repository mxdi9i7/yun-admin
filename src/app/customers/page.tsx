'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';
import CustomerFormModal from '@/components/CustomerFormModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import Spinner from '@/components/Spinner';
import { customers, orders } from '@/lib/supabase-utils';
import type { Database } from '@/types/supabase';

type Customer = Database['public']['Tables']['customers']['Row'];

type CustomerWithLatestOrder = Customer & {
  latestOrderDate: string | null;
  latestOrderContent: string | null;
};

// Add a utility function for formatting phone numbers
const formatPhoneNumber = (phone: string | null) => {
  if (!phone) return '---';
  // Format as XXX-XXXX-XXXX
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
};

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof Customer>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );
  const [deleteOrderCount, setDeleteOrderCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [customerList, setCustomerList] = useState<CustomerWithLatestOrder[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const pageSize = 10;

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data,
        error,
        count,
        totalPages: pages,
      } = await customers.getCustomers({
        page: currentPage,
        pageSize,
        searchTerm,
        sortColumn,
        sortDirection,
      });

      if (error) throw error;

      // Fetch latest order for each customer
      const customersWithOrders = await Promise.all(
        (data || []).map(async (customer) => {
          const { data: orderData } = await orders.getOrders({
            customerId: customer.id,
            page: 1,
            pageSize: 1,
          });

          if (orderData && orderData.length > 0) {
            const latestOrder = orderData[0];
            const orderContent = latestOrder.order_items
              .map((item: any) => item.products.title)
              .join(', ');

            return {
              ...customer,
              latestOrderDate: latestOrder.created_at,
              latestOrderContent: orderContent,
            };
          }

          return {
            ...customer,
            latestOrderDate: null,
            latestOrderContent: null,
          };
        }),
      );

      setCustomerList(customersWithOrders);
      setTotalPages(pages);
      setTotalCustomers(count || 0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while fetching customers',
      );
      console.error('Error fetching customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, sortColumn, sortDirection]);

  const handleCreateCustomer = async (customerData: {
    name: string;
    phone: string | null;
    address: string | null;
    notes: string | null;
  }) => {
    try {
      await customers.createCustomer({ ...customerData, email: null });
      setIsCreateModalOpen(false);
      fetchCustomers(); // Refresh the list
    } catch (err) {
      console.error('Error creating customer:', err);
      setError(err instanceof Error ? err.message : '创建客户时发生错误');
    }
  };

  const handleEditCustomer = async (customerData: {
    name: string;
    phone: string | null;
    address: string | null;
    notes: string | null;
  }) => {
    if (!selectedCustomer) return;
    try {
      await customers.updateCustomer(selectedCustomer.id, {
        ...customerData,
        email: null,
      });
      setIsEditModalOpen(false);
      setSelectedCustomer(null);
      fetchCustomers(); // Refresh the list
    } catch (err) {
      console.error('Error updating customer:', err);
      setError(err instanceof Error ? err.message : '更新客户时发生错误');
    }
  };

  const handleDeleteClick = async (customer: Customer) => {
    try {
      // Get the order count for this customer
      const { count, error: countError } =
        await customers.getCustomerOrderCount(customer.id);

      if (countError) {
        console.error('Error getting order count:', countError);
        setError('获取订单数量时发生错误');
        return;
      }

      setCustomerToDelete(customer);
      setDeleteOrderCount(count);
      setIsDeleteModalOpen(true);
    } catch (err) {
      console.error('Error preparing delete:', err);
      setError(err instanceof Error ? err.message : '准备删除时发生错误');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;

    setIsDeleting(true);
    try {
      const { error: deleteError } = await customers.deleteCustomer(
        customerToDelete.id,
      );

      if (deleteError) throw deleteError;

      setIsDeleteModalOpen(false);
      setCustomerToDelete(null);
      setDeleteOrderCount(0);
      fetchCustomers(); // Refresh the list
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError(err instanceof Error ? err.message : '删除客户时发生错误');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = (column: keyof Customer) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 font-[family-name:var(--font-geist-sans)]'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8 flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
              客户管理
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              管理您的客户数据库
            </p>
          </div>
          <button
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm hover:shadow-md'
            onClick={() => setIsCreateModalOpen(true)}
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
                d='M12 4v16m8-8H4'
              />
            </svg>
            添加客户
          </button>
        </div>

        {/* Create Customer Modal */}
        <CustomerFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateCustomer}
          mode='create'
        />

        {/* Edit Customer Modal */}
        <CustomerFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCustomer(null);
          }}
          onSubmit={handleEditCustomer}
          mode='edit'
          initialData={
            selectedCustomer
              ? {
                  name: selectedCustomer.name,
                  phone: selectedCustomer.phone,
                  address: selectedCustomer.address,
                  notes: selectedCustomer.notes,
                }
              : undefined
          }
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setCustomerToDelete(null);
            setDeleteOrderCount(0);
          }}
          onConfirm={handleDeleteConfirm}
          title='删除客户'
          message={
            <div>
              <p className='mb-3'>
                确定要删除客户{' '}
                <span className='font-semibold'>{customerToDelete?.name}</span>{' '}
                吗？
              </p>
              {deleteOrderCount > 0 ? (
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
                        该客户有 {deleteOrderCount} 个相关订单
                      </p>
                      <p className='text-sm text-yellow-700 dark:text-yellow-300 mt-1'>
                        删除后，这些订单将被重新分配给"[已删除的客户]"占位符，以保留订单历史记录。
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
                  该客户没有相关订单。
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

        {/* Search Section */}
        <div className='mb-6 relative'>
          <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
            <svg
              className='h-5 w-5 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>
          <input
            type='text'
            placeholder='搜索客户...'
            className='w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg 
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500
                      dark:text-white shadow-sm transition-all duration-200
                      hover:shadow-md focus:shadow-md'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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

        {/* Customer Table */}
        {!isLoading && (
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden'>
            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
              <thead className='bg-gray-50 dark:bg-gray-900'>
                <tr>
                  <th
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer'
                    onClick={() => handleSort('name')}
                  >
                    客户名称
                    {sortColumn === 'name' && (
                      <span className='ml-2'>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer'
                    onClick={() => handleSort('phone')}
                  >
                    电话
                    {sortColumn === 'phone' && (
                      <span className='ml-2'>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    最近订单
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                {customerList.map((customer) => (
                  <tr key={customer.id}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      {customer.name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                      {customer.phone ? (
                        <span className='font-mono'>
                          {formatPhoneNumber(customer.phone)}
                        </span>
                      ) : (
                        <span className='text-gray-300 dark:text-gray-700 text-sm'>
                          --
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-500 dark:text-gray-400'>
                      {customer.latestOrderDate &&
                      customer.latestOrderContent ? (
                        <div>
                          <div className='text-gray-900 dark:text-white font-medium'>
                            {new Date(
                              customer.latestOrderDate,
                            ).toLocaleDateString('zh-CN')}
                          </div>
                          <div className='text-gray-500 dark:text-gray-400 text-xs truncate max-w-xs'>
                            {customer.latestOrderContent}
                          </div>
                        </div>
                      ) : (
                        <span className='text-gray-400 dark:text-gray-600 italic'>
                          暂无订单
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <button
                        className='text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mr-4'
                        onClick={() => router.push(`/customers/${customer.id}`)}
                      >
                        查看详情
                      </button>
                      <button
                        className='text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4'
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsEditModalOpen(true);
                        }}
                      >
                        编辑
                      </button>
                      <button
                        className='text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
                        onClick={() => handleDeleteClick(customer)}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 0 && (
          <div className='mt-4 flex items-center justify-between'>
            <div className='flex-1 flex justify-between sm:hidden'>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className='px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'
              >
                上一页
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className='ml-3 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'
              >
                下一页
              </button>
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
                    {Math.min(currentPage * pageSize, totalCustomers)}
                  </span>{' '}
                  条， 共 <span className='font-medium'>{totalCustomers}</span>{' '}
                  条结果
                </p>
              </div>
              <div>
                <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50'
                  >
                    上一页
                  </button>
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
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50'
                  >
                    下一页
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
