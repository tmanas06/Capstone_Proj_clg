import MyEvents from '@/components/events/MyEvents';
export const dynamic = 'force-dynamic';

export default function MyEventsPage() {
  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">My Events</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">Manage your registered and saved events</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <MyEvents />
          </div>
        </div>
      </div>
    </div>
  );
}
