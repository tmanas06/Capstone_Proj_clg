export default function FreelancersPage() {
  const gigs = [
    {
      id: 1,
      title: 'Website Redesign',
      client: 'Startup Inc.',
      budget: '$2,000 - $5,000',
      posted: '1 day ago',
      skills: ['Web Design', 'UI/UX', 'Responsive Design'],
      duration: '1-3 months',
      level: 'Intermediate'
    },
    {
      id: 2,
      title: 'Mobile App Development',
      client: 'MobileFirst',
      budget: '$5,000 - $10,000',
      posted: '3 days ago',
      skills: ['React Native', 'Firebase', 'API Integration'],
      duration: '3-6 months',
      level: 'Expert'
    },
    {
      id: 3,
      title: 'E-commerce Development',
      client: 'ShopLocal',
      budget: '$3,000 - $7,000',
      posted: '1 week ago',
      skills: ['Shopify', 'Liquid', 'JavaScript'],
      duration: '2-4 months',
      level: 'Intermediate'
    },
    { id: 4,
      title: 'Content Writing',
      client: 'BloggersHub', 
      budget: '$1,000 - $3,000',
      posted: '2 days ago',
      skills: ['Copywriting', 'SEO', 'Blogging'],
      duration: '1-2 months',
      level: 'Intermediate'
    },
    {
      id: 5,
      title: 'Graphic Design',
      client: 'DesignStudio',
      budget: '$1,500 - $4,000',
      posted: '1 week ago',
      skills: ['Photoshop', 'Illustrator', 'Branding'],
      duration: '1-3 months',
      level: 'Intermediate'
    },
    {
      id: 6,
      title: 'Digital Marketing',
      client: 'MarketPros',
      budget: '$2,000 - $6,000',
      posted: '4 days ago',
      skills: ['SEO', 'Google Ads', 'Social Media'],
      duration: '2-4 months',
      level: 'Intermediate'
    },
  ];

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Freelance Gigs
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Discover exciting freelance opportunities and projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <div key={gig.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{gig.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">{gig.client}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  gig.level === 'Expert' 
                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    : gig.level === 'Intermediate'
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                    : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                }`}>
                  {gig.level}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Budget: {gig.budget}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Duration: {gig.duration}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Posted {gig.posted}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {gig.skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-md">
                    {skill}
                  </span>
                ))}
              </div>
              
              <button className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
