'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const sessionId = localStorage.getItem('sessionId');
      const storedRole = localStorage.getItem('userRole');
      setIsLoggedIn(!!sessionId);
      setUserRole(storedRole);
    };

    checkAuth();
    // Add event listener for storage changes
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sessionId');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUserRole(null);
    router.push('/');
  };

  const isActive = (path) => pathname === path;

  return (
    <nav className="bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-purple-600 rounded-full p-2 flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6"
                  >
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                    <line x1="6" y1="1" x2="6" y2="4" />
                    <line x1="10" y1="1" x2="10" y2="4" />
                    <line x1="14" y1="1" x2="14" y2="4" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-purple-400 hover:text-purple-300">
                  CMR Cafeteria
                </span>
              </Link>
            </div>
            {isLoggedIn && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {userRole === 'STUDENT' ? (
                  <>
                    <Link
                      href="/menu"
                      className={`${
                        isActive('/menu')
                          ? 'border-purple-400 text-purple-400'
                          : 'border-transparent text-gray-300 hover:text-purple-300'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      Menu
                    </Link>
                    <Link
                      href="/track-order"
                      className={`${
                        isActive('/track-order')
                          ? 'border-purple-400 text-purple-400'
                          : 'border-transparent text-gray-300 hover:text-purple-300'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      Track Order
                    </Link>
                  </>
                ) : userRole === 'ADMIN' && (
                  <Link
                    href="/admin/dashboard"
                    className={`${
                      isActive('/admin/dashboard')
                        ? 'border-purple-400 text-purple-400'
                        : 'border-transparent text-gray-300 hover:text-purple-300'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            )}
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/student/login"
                  className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Student Login
                </Link>
                <Link
                  href="/admin/login"
                  className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Admin Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            {isLoggedIn && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-purple-300 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {!isOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden bg-gray-900`}>
        <div className="pt-2 pb-3 space-y-1">
          {isLoggedIn ? (
            <>
              {userRole === 'STUDENT' ? (
                <>
                  <Link
                    href="/menu"
                    className={`${
                      isActive('/menu')
                        ? 'bg-gray-800 text-purple-400 border-purple-400'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-purple-300'
                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  >
                    Menu
                  </Link>
                  <Link
                    href="/track-order"
                    className={`${
                      isActive('/track-order')
                        ? 'bg-gray-800 text-purple-400 border-purple-400'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-purple-300'
                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  >
                    Track Order
                  </Link>
                </>
              ) : userRole === 'ADMIN' && (
                <Link
                  href="/admin/dashboard"
                  className={`${
                    isActive('/admin/dashboard')
                      ? 'bg-gray-800 text-purple-400 border-purple-400'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-purple-300'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left pl-3 pr-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-purple-300 block text-base font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/student/login"
                className="block pl-3 pr-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-purple-300 text-base font-medium"
              >
                Student Login
              </Link>
              <Link
                href="/admin/login"
                className="block pl-3 pr-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-purple-300 text-base font-medium"
              >
                Admin Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 