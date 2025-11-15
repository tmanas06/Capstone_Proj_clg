'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import ThemeToggle from './ThemeToggle';
import WalletConnectButton from './WalletConnectButton';

const Navbar = () => {
  const pathname = usePathname();
  const isEventsPage = pathname?.startsWith('/events') ?? false;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const jobLinks = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Jobs', href: '/dashboard/job-search' },
    { name: 'KYC', href: '/auth/kyc-verification' },
    { name: 'Post Job', href: '/employer/job-postings' },
  ];
  
  const eventLinks = [
    { name: 'Events', href: '/events' },
    { name: 'Create Event', href: '/events/create' },
    { name: 'My Events', href: '/events/my-events' },
    { name: 'Rewards', href: '/events/rewards' },
    { name: 'Dashboard', href: '/events/dashboard' },
    { name: 'Communities', href: '/events/communities' },
  ];
  
  const navLinks = isEventsPage ? eventLinks : jobLinks;

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link 
              href={isEventsPage ? '/' : '/events'} 
              className="text-xl font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
            >
              {isEventsPage ? 'Events' : 'Job Network'}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <ThemeToggle />
            <WalletConnectButton />
            <Link
              href={isEventsPage ? '/' : '/events'}
              className="inline-flex items-center px-4 py-2 border border-indigo-600 text-sm font-medium rounded-lg text-indigo-600 bg-transparent hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-indigo-900/20 transition-all duration-200"
            >
              Switch to {isEventsPage ? 'Job Network' : 'Events'}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  pathname === link.href
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center space-x-4">
                <WalletConnectButton />
              </div>
              <div className="mt-3 px-3">
                <Link
                  href={isEventsPage ? '/' : '/events'}
                  className="block w-full text-center px-4 py-2 border border-indigo-600 text-sm font-medium rounded-lg text-indigo-600 bg-transparent hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-indigo-900/20 transition-all duration-200"
                >
                  Switch to {isEventsPage ? 'Job Network' : 'Events'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
