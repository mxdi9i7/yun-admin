export default function Home() {
  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <main className='flex flex-col gap-8 row-start-2 items-center w-full max-w-md mx-auto'>
        <div className='w-full'>
          <h1 className='text-2xl font-bold text-center mb-8'>云氏钥匙</h1>
          <div className='bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full'>
            <h2 className='text-xl font-semibold mb-6 text-center'>
              管理员登录
            </h2>
            <form className='space-y-6'>
              <div>
                <label
                  htmlFor='username'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2'
                >
                  用户名
                </label>
                <input
                  type='text'
                  id='username'
                  name='username'
                  className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
                  placeholder='请输入用户名'
                  required
                />
              </div>
              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2'
                >
                  密码
                </label>
                <input
                  type='password'
                  id='password'
                  name='password'
                  className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
                  placeholder='请输入密码'
                  required
                />
              </div>
              <button
                type='submit'
                className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium'
              >
                登录
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
