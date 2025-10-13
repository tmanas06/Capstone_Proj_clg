export default function CompaniesPage() {
  const companies = [
    { id: 1, name: 'TechCorp', industry: 'Technology', location: 'San Francisco, CA', employees: '500-1000', rating: 4.8 },
    { id: 2, name: 'DevSolutions', industry: 'Software Development', location: 'New York, NY', employees: '100-500', rating: 4.6 },
    { id: 3, name: 'WebMasters', industry: 'Web Development', location: 'Austin, TX', employees: '50-100', rating: 4.7 },
    { id: 4, name: 'CloudNet', industry: 'Cloud Services', location: 'Seattle, WA', employees: '1000+', rating: 4.9 },
    { id: 5, name: 'DataPros', industry: 'Data Analytics', location: 'Boston, MA', employees: '200-500', rating: 4.5 },
    { id: 6, name: 'AI Innovators', industry: 'Artificial Intelligence', location: 'Palo Alto, CA', employees: '100-200', rating: 4.8 },
    { id: 7, name: 'CyberSecure', industry: 'Cybersecurity', location: 'Chicago, IL', employees: '50-100', rating: 4.6 },
    { id: 8, name: 'FinTech Solutions', industry: 'Financial Technology', location: 'New York, NY', employees: '500-1000', rating: 4.7 },
    { id: 9, name: 'HealthTech', industry: 'Healthcare Technology', location: 'San Diego, CA', employees: '200-500', rating: 4.4 },
    { id: 10, name: 'GreenEnergy', industry: 'Renewable Energy', location: 'Denver, CO', employees: '100-200', rating: 4.5 },
  ];

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Top Companies
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Discover leading companies hiring talented professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div key={company.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{company.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">{company.industry}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium rounded-full">
                  Hiring
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {company.location}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {company.employees} employees
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  {company.rating}/5 rating
                </div>
              </div>
              
              <div className="mt-6">
                <button className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200">
                  View Jobs
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
