"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "../../../store";
import { QRCodeCard } from "../../../components/QRCodeCard";

export default function CreateEventPage() {
  const { createEvent, events, purgeExpiredEvents, deletePastEvent, pastEvents } = useAppStore();
  const [form, setForm] = useState({ title: "", description: "", start: "", end: "", location: "", hashtags: "" });
  const [creating, setCreating] = useState(false);

  // Safe clipboard copy function
  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Purge expired events on mount
  useEffect(() => { purgeExpiredEvents(); }, [purgeExpiredEvents]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const hashtags = form.hashtags.split(",").map(s => s.trim()).filter(Boolean);
    const startMs = form.start ? new Date(form.start).getTime() : Date.now();
    const endMs = form.end ? new Date(form.end).getTime() : startMs;
    const date = new Date(startMs).toLocaleDateString();
    createEvent({ title: form.title, description: form.description, date, location: form.location, hashtags, startMs, endMs });
    await new Promise(r => setTimeout(r, 800));
    setCreating(false);
    setForm({ title: "", description: "", start: "", end: "", location: "", hashtags: "" });
  };

  return (
    <main className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Create New Event
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Set up your event and generate QR codes for easy sharing
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create Event Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Event Details</h2>
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Title *
                </label>
                <input 
                  className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                  placeholder="Enter event title" 
                  value={form.title} 
                  onChange={e => setForm({ ...form, title: e.target.value })} 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea 
                  className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none" 
                  placeholder="Describe your event"
                  rows={4}
                  value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })} 
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date & Time
                  </label>
                  <input 
                    type="datetime-local" 
                    className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                    value={form.start} 
                    onChange={e => setForm({ ...form, start: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date & Time
                  </label>
                  <input 
                    type="datetime-local" 
                    className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                    value={form.end} 
                    onChange={e => setForm({ ...form, end: e.target.value })} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input 
                    className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                    placeholder="Event location" 
                    value={form.location} 
                    onChange={e => setForm({ ...form, location: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hashtags
                  </label>
                  <input 
                    className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                    placeholder="hashtag1, hashtag2, hashtag3" 
                    value={form.hashtags} 
                    onChange={e => setForm({ ...form, hashtags: e.target.value })} 
                  />
                </div>
              </div>
              
              <button 
                disabled={creating} 
                className="w-full px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {creating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Event...
                  </span>
                ) : (
                  "Create Event"
                )}
              </button>
            </form>
          </div>

          {/* Events List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Events</h2>
              <a href="#past-events" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-200">
                View Past Events
              </a>
            </div>
            
            <div className="space-y-4">
              {events.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No events yet</h3>
                  <p className="text-gray-600 dark:text-gray-300">Create your first event to get started with QR code sharing</p>
                </div>
              )}
              
              {events.map(evt => {
                const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${evt.shortCode}`;
                return (
                  <div key={evt.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:gap-6">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{evt.title}</h3>
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                            Active
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">{evt.description}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(evt.startMs).toLocaleString()} – {new Date(evt.endMs).toLocaleString()}
                          </div>
                          {evt.location && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {evt.location}
                            </div>
                          )}
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Share Link
                          </label>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="text" 
                              value={shareUrl} 
                              readOnly 
                              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                            />
                            <button 
                              onClick={() => copyToClipboard(shareUrl)}
                              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 lg:mt-0 lg:flex-shrink-0">
                        <QRCodeCard text={shareUrl} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div id="past-events" className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Past Events</h3>
              {pastEvents?.length === 0 ? (
                <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-300">No past events yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pastEvents?.map(evt => (
                    <div key={evt.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{evt.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Ended {new Date(evt.endMs).toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => deletePastEvent(evt.id)}
                          className="px-3 py-1.5 rounded-md bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 text-sm font-medium transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
