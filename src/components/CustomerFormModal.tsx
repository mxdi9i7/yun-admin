import { Dialog } from '@headlessui/react';
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import LoadingButton from '@/components/LoadingButton';
import { Customer, CustomerInsert, customers } from '@/lib/supabase-utils';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customerData: {
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    notes: string | null;
  }) => Promise<void> | void;
  initialData?: {
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    notes: string | null;
  };
  mode?: 'create' | 'edit';
}

export default function CustomerFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}: CustomerFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        name: initialData.name,
        phone: initialData.phone || '',
        email: initialData.email || '',
        address: initialData.address || '',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({ name: '', phone: '', email: '', address: '', notes: '' });
    }
    setErrors({ name: '', phone: '' });
    setSubmitError(null);
  }, [initialData, mode, isOpen]);

  const validatePhone = (phone: string) => {
    if (!phone) return true; // Empty phone number is valid
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitError(null);
    try {
      await onSubmit({
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        address: formData.address.trim() || null,
        notes: formData.notes.trim() || null,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '提交失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? '添加新客户' : '编辑客户'}
    >
      <form onSubmit={handleSubmit} className='space-y-4'>
        {submitError && (
          <div className='p-4 bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 rounded'>
            <p className='text-sm text-red-700 dark:text-red-200'>
              {submitError}
            </p>
          </div>
        )}

        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
            客户名称
          </label>
          <input
            type='text'
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`mt-1 block w-full rounded-md border ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
            required
          />
          {errors.name && (
            <p className='mt-1 text-sm text-red-600'>{errors.name}</p>
          )}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
            手机号码
          </label>
          <input
            type='tel'
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className={`mt-1 block w-full rounded-md border ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
          />
          {errors.phone && (
            <p className='mt-1 text-sm text-red-600'>{errors.phone}</p>
          )}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
            邮箱
          </label>
          <input
            type='email'
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
            地址
          </label>
          <input
            type='text'
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
            备注
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={3}
            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
          />
        </div>

        <div className='flex justify-end space-x-3 mt-6'>
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
            loadingText={mode === 'create' ? '创建中...' : '保存中...'}
          >
            {mode === 'create' ? '创建客户' : '保存修改'}
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}
