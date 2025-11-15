"use client";
import { useEffect } from "react";
import { useAppStore } from "@/store";

export default function Dashboard() {
  const shares = useAppStore(s => s.shares);
  const events = useAppStore(s => s.events);
  const recordShare = useAppStore(s => s.recordShare);
  const verifyShare = useAppStore(s => s.verifyShare);
  const byId = Object.fromEntries(events.map(e => [e.id, e] as const));
  const totalEarned = shares.filter(s => s.verified).reduce((n, s) => n + s.reward, 0);

  // Add dummy share records if no shares exist
  useEffect(() => {
    try {
      // Only run once on mount
      const hasInitialized = typeof window !== 'undefined' ? sessionStorage.getItem('dashboard-initialized') : null;
      if (hasInitialized) return;
      
      if (shares.length === 0) {
        // Get or create an event first
        let event = events[0];
        
        // If no events exist, create a dummy event
        if (!event) {
          const createEventFn = useAppStore.getState().createEvent;
          const now = Date.now();
          const startDate = new Date(now + 7 * 24 * 60 * 60 * 1000); // 7 days from now
          const endDate = new Date(now + 8 * 24 * 60 * 60 * 1000); // 8 days from now
          
          event = createEventFn({
            title: 'Web3 Developer Meetup 2025',
            description: 'Join us for an exciting meetup featuring talks on blockchain development, DeFi protocols, and the future of Web3.',
            date: startDate.toLocaleDateString(),
            location: 'San Francisco, CA - Tech Hub Conference Center',
            hashtags: ['web3', 'blockchain', 'defi', 'ethereum', 'meetup'],
            startMs: startDate.getTime(),
            endMs: endDate.getTime(),
          });
        }
        
        if (event) {
          // Create dummy shares for the event
          // Share 1: Twitter - Verified
          const share1 = recordShare({
            eventId: event.id,
            platform: 'twitter',
            url: 'https://twitter.com/user/status/1234567890',
          });
          // Verify it after a short delay
          setTimeout(() => {
            try {
              verifyShare(share1.id, 5.50); // 5.50 POSTMINT reward
            } catch (e) {
              console.warn('Could not verify share1:', e);
            }
          }, 100);

          // Share 2: LinkedIn - Verified
          const share2 = recordShare({
            eventId: event.id,
            platform: 'linkedin',
            url: 'https://linkedin.com/feed/update/1234567890',
          });
          setTimeout(() => {
            try {
              verifyShare(share2.id, 7.25); // 7.25 POSTMINT reward
            } catch (e) {
              console.warn('Could not verify share2:', e);
            }
          }, 200);

          // Share 3: Twitter - Pending
          setTimeout(() => {
            try {
              recordShare({
                eventId: event.id,
                platform: 'twitter',
                url: 'https://twitter.com/user/status/0987654321',
              });
            } catch (e) {
              console.warn('Could not create share3:', e);
            }
          }, 300);

          console.log('✅ Dummy shares created for dashboard');
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('dashboard-initialized', 'true');
          }
        }
      } else {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('dashboard-initialized', 'true');
        }
      }
    } catch (error) {
      console.error('Error initializing dashboard dummy data:', error);
    }
  }, []); // Empty dependency array - only run once

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Track your event sharing activity and earnings
          </p>
        </div>

        <div className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Shares</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{shares.length}</div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Verified Shares</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{shares.filter(s => s.verified).length}</div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Earned</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalEarned.toFixed(2)} POSTMINT</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
            <div className="space-y-3">
              {shares.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No activity yet</h3>
                  <p className="text-gray-600 dark:text-gray-300">Start sharing events to see your activity here</p>
                </div>
              ) : (
                shares.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${s.verified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {s.platform} · {byId[s.eventId]?.title || 'Event'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(s.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {s.verified ? (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                          +{s.reward} POSTMINT
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded-full">
                          Pending
                        </span>
                      )}
                      <a 
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium" 
                        href={s.url} 
                        target="_blank" 
                        rel="noreferrer"
                      >
                        View
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


