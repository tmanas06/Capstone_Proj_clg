export default function DevelopersPage() {
  const jobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      location: 'Remote',
      type: 'Full-time',
      salary: '$120,000 - $150,000',
      posted: '2 days ago',
      skills: ['React', 'TypeScript', 'Next.js']
    },
    {
      id: 2,
      title: 'Backend Engineer',
      company: 'DevSolutions',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$130,000 - $160,000',
      posted: '1 week ago',
      skills: ['Node.js', 'Python', 'PostgreSQL']
    },
    {
      id: 3,
      title: 'Full Stack Developer',
      company: 'WebMasters',
      location: 'Austin, TX',
      type: 'Contract',
      salary: '$70 - $90/hr',
      posted: '3 days ago',
      skills: ['React', 'Node.js', 'MongoDB']
    },
    { id: 4,
      title: 'Cloud Engineer',
      company: 'CloudNet',
      location: 'Seattle, WA',
      type: 'Full-time',
      salary: '$120,000 - $150,000',
      posted: '2 weeks ago',
      skills: ['AWS', 'Docker', 'Kubernetes']
    },
    {
      id: 5,
      title: 'Data Scientist',
      company: 'DataPros',
      location: 'Boston, MA',
      type: 'Full-time',
      salary: '$110,000 - $140,000',
      posted: '1 week ago',
      skills: ['Python', 'Machine Learning', 'SQL']
    },
    {
      id: 6,
      title: 'AI Researcher',
      company: 'AI Innovators',
      location: 'Palo Alto, CA',
      type: 'Full-time',
      salary: '$130,000 - $160,000',
      posted: '1 week ago',
      skills: ['Python', 'TensorFlow', 'PyTorch']
    },
  ];

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Developer Jobs
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Find your next opportunity in software development
          </p>
        </div>

        <div className="space-y-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      job.type === 'Full-time' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    }`}>
                      {job.type}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {job.company}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      {job.salary}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-md">
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400">Posted {job.posted}</p>
                </div>
                
                <div className="lg:flex-shrink-0">
                  <button className="w-full lg:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
