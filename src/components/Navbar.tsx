import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, Settings } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Settings className="h-8 w-8 mr-2" />
              <span className="font-bold text-xl">ICM Admin</span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-800">Dashboard</Link>
                <Link to="/configure" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-800">Configure KPIs</Link>
                <Link to="/manage" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-800">Manage Configs</Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="relative">
                <button className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-white">
                  <span className="mr-2">Admin User</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-800">Dashboard</Link>
            <Link to="/configure" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-800">Configure KPIs</Link>
            <Link to="/manage" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-800">Manage Configs</Link>
          </div>
          <div className="pt-4 pb-3 border-t border-primary-800">
            <div className="flex items-center px-5">
              <div className="ml-3">
                <div className="text-base font-medium leading-none">Admin User</div>
                <div className="text-sm font-medium leading-none text-gray-300">admin@example.com</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;