export default function ProfilePage() {
  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            My Profile
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Manage your account information and preferences
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full name</label>
                  <div className="text-lg text-gray-900 dark:text-white">John Doe</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email address</label>
                  <div className="text-lg text-gray-900 dark:text-white">john@example.com</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                  <div className="text-lg text-gray-900 dark:text-white">Senior Developer</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">About</label>
                <div className="text-gray-900 dark:text-white">
                  Experienced software developer with a passion for creating efficient and scalable applications.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
