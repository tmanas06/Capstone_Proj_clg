"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useAppStore } from "@/store";

function useEventByCode(code: string | undefined) {
  const events = useAppStore(s => s.events);
  return useMemo(() => events.find(e => e.shortCode === code), [events, code]);
}

async function generatePostPrompt(title: string, description: string, hashtags: string[]) {
  const base = `Join me at ${title}! ${description}`.slice(0, 180);
  const tags = hashtags.slice(0, 4).map(t => (t.startsWith('#') ? t : `#${t}`)).join(' ');
  return `${base} ${tags}`.trim();
}

export default function SharePage() {
  const params = useParams();
  const code = (params?.code as string) || undefined;
  const eventItem = useEventByCode(code);
  const recordShare = useAppStore(s => s.recordShare);
  const verifyShare = useAppStore(s => s.verifyShare);
  const [text, setText] = useState("");
  const [platform, setPlatform] = useState<'twitter' | 'linkedin'>("twitter");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<'idle' | 'generated' | 'shared' | 'verified'>("idle");

  useEffect(() => {
    if (!eventItem) return;
    generatePostPrompt(eventItem.title, eventItem.description, eventItem.hashtags).then(setText);
  }, [eventItem]);

  if (!eventItem) return <div className="text-neutral-400">Invalid share link.</div>;
  const now = Date.now();
  const expired = eventItem.endMs && eventItem.endMs < now;
  if (expired) {
    return (
      <div className="max-w-xl p-6 rounded-lg border border-neutral-800 bg-neutral-900/40">
        <div className="text-xl font-semibold">This event has ended.</div>
        <div className="text-neutral-400 text-sm mt-1">Sharing is disabled for ended events.</div>
      </div>
    );
  }

  const shareIntent = () => {
    if (platform === 'twitter') {
      const href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(href, '_blank');
    } else {
      const href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${encodeURIComponent(text)}`;
      window.open(href, '_blank');
    }
    setStatus('shared');
  };

  const onVerify = () => {
    const rec = recordShare({ eventId: eventItem.id, platform, url });
    verifyShare(rec.id, 10);
    setStatus('verified');
  };

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Share: {eventItem.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Generate and share AI-powered social media posts to earn rewards
            </p>
          </div>

          <div className="space-y-6">
            {/* Post Generation */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Generated Post</h2>
              <textarea 
                className="w-full h-32 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none" 
                value={text} 
                onChange={e => setText(e.target.value)}
                placeholder="Your AI-generated post will appear here..."
              />
            </div>

            {/* Share Controls */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Share to Social Media</h2>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <select 
                  className="flex-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                  value={platform} 
                  onChange={e => setPlatform(e.target.value as 'twitter' | 'linkedin')}
                >
                  <option value="twitter">Twitter/X</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
                <button 
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200" 
                  onClick={shareIntent}
                >
                  Share Now
                </button>
              </div>
            </div>

            {/* Verification */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Verify & Earn Rewards</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Paste your post URL here to verify:
                  </label>
                  <input 
                    className="w-full rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                    placeholder="https://twitter.com/your-post-url..." 
                    value={url} 
                    onChange={e => setUrl(e.target.value)} 
                  />
                </div>
                <button 
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200" 
                  onClick={onVerify}
                >
                  Verify & Claim 10 POSTMINT
                </button>
              </div>
            </div>

            {/* Status */}
            {status === 'verified' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Verified Successfully!</h3>
                    <p className="text-green-700 dark:text-green-300">10 POSTMINT tokens have been added to your account.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


