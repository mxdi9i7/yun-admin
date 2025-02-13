import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customer: { name: string; phone: string }) => void;
  initialCustomer?: { name: string; phone: string };
  mode?: 'create' | 'edit';
}

export default function CreateCustomerModal({
  isOpen,
  onClose,
  onSubmit,
  initialCustomer,
  mode = 'create',
}: CreateCustomerModalProps) {
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
  });

  useEffect(() => {
    if (initialCustomer && mode === 'edit') {
      setNewCustomer(initialCustomer);
    }
  }, [initialCustomer, mode]);

  const validatePhone = (phone: string) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = () => {
    const newErrors = {
      name: !newCustomer.name.trim() ? '请输入客户名称' : '',
      phone: !validatePhone(newCustomer.phone) ? '请输入有效的手机号码' : '',
    };

    setErrors(newErrors);

    if (!newErrors.name && !newErrors.phone) {
      onSubmit(newCustomer);
      if (mode === 'create') {
        setNewCustomer({ name: '', phone: '' });
      }
      setErrors({ name: '', phone: '' });
    }
  };

  const handleClose = () => {
    if (mode === 'create') {
      setNewCustomer({ name: '', phone: '' });
    }
    setErrors({ name: '', phone: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size='md'>
      <div className='p-8'>
        <div className='flex items-center gap-4 mb-8'>
          <div className='p-3 bg-blue-100 dark:bg-blue-900 rounded-xl'>
            <svg
              className='w-6 h-6 text-blue-600 dark:text-blue-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d={
                  mode === 'create'
                    ? 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
                    : 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
                }
              />
            </svg>
          </div>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
            {mode === 'create' ? '添加新客户' : '编辑客户'}
          </h2>
        </div>

        <div className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              客户名称
            </label>
            <input
              type='text'
              value={newCustomer.name}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, name: e.target.value })
              }
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200
                ${
                  errors.name
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                } 
                dark:bg-gray-700 dark:text-white hover:border-gray-300 dark:hover:border-gray-500`}
              placeholder='输入客户姓名'
            />
            {errors.name && (
              <p className='mt-2 text-sm text-red-600 dark:text-red-400'>
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              手机号码
            </label>
            <div className='relative'>
              <span className='absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 dark:text-gray-400'>
                +86
              </span>
              <input
                type='tel'
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all duration-200
                  ${
                    errors.phone
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  }
                  dark:bg-gray-700 dark:text-white hover:border-gray-300 dark:hover:border-gray-500`}
                placeholder='输入手机号码'
              />
            </div>
            {errors.phone && (
              <p className='mt-2 text-sm text-red-600 dark:text-red-400'>
                {errors.phone}
              </p>
            )}
          </div>

          <div className='flex justify-end gap-4 mt-8'>
            <button
              onClick={handleClose}
              className='px-6 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 
                rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200
                dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className='px-6 py-3 text-sm font-medium text-white bg-blue-600 border-2 border-transparent 
                rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md'
            >
              {mode === 'create' ? '创建客户' : '保存修改'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
