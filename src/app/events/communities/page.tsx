"use client";

import { useState } from "react";
import Link from "next/link";

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Dummy communities data
  const communities = [
    {
      id: 1,
      name: "Web3 Developers",
      description: "A community for blockchain developers, DeFi enthusiasts, and Web3 builders. Share knowledge, collaborate on projects, and stay updated with the latest trends.",
      members: 1250,
      events: 12,
      image: "🔷",
      tags: ["web3", "blockchain", "defi", "ethereum"],
      featured: true,
    },
    {
      id: 2,
      name: "AI & Machine Learning",
      description: "Connect with AI researchers, ML engineers, and data scientists. Discuss cutting-edge AI technologies, share research papers, and collaborate on projects.",
      members: 890,
      events: 8,
      image: "🤖",
      tags: ["ai", "ml", "data-science", "neural-networks"],
      featured: true,
    },
    {
      id: 3,
      name: "Startup Founders",
      description: "Network with fellow entrepreneurs, share startup experiences, and get advice from successful founders. Perfect for early-stage and growth-stage startups.",
      members: 650,
      events: 6,
      image: "🚀",
      tags: ["startups", "entrepreneurship", "business", "networking"],
      featured: false,
    },
    {
      id: 4,
      name: "Crypto Traders",
      description: "Join discussions about cryptocurrency trading, market analysis, and investment strategies. Share insights and learn from experienced traders.",
      members: 2100,
      events: 15,
      image: "📈",
      tags: ["crypto", "trading", "investing", "bitcoin"],
      featured: false,
    },
    {
      id: 5,
      name: "NFT Creators",
      description: "A space for NFT artists, collectors, and creators. Showcase your work, discover new collections, and connect with the NFT community.",
      members: 750,
      events: 5,
      image: "🎨",
      tags: ["nft", "art", "digital-art", "collectibles"],
      featured: false,
    },
    {
      id: 6,
      name: "DeFi Protocols",
      description: "Deep dive into decentralized finance protocols, yield farming, liquidity pools, and DeFi innovations. Learn and share DeFi strategies.",
      members: 1100,
      events: 10,
      image: "💎",
      tags: ["defi", "yield-farming", "liquidity", "protocols"],
      featured: false,
    },
  ];

  const filteredCommunities = communities.filter((community) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Communities
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Join communities, connect with like-minded people, and discover events
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search communities by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Featured Communities */}
        {searchQuery === "" && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Featured Communities
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {communities
                .filter((c) => c.featured)
                .map((community) => (
                  <div
                    key={community.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-5xl">{community.image}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {community.name}
                          </h3>
                          <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium rounded-full">
                            Featured
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          {community.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {community.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              {community.members.toLocaleString()} members
                            </span>
                            <span className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              {community.events} events
                            </span>
                          </div>
                          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors duration-200">
                            Join Community
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* All Communities */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {searchQuery ? `Search Results (${filteredCommunities.length})` : "All Communities"}
          </h2>
          {filteredCommunities.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No communities found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Try adjusting your search query
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.map((community) => (
                <div
                  key={community.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-3">{community.image}</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {community.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {community.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4 justify-center">
                    {community.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      {community.members.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {community.events}
                    </span>
                  </div>
                  <button className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors duration-200">
                    Join Community
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

