import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, List } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:block w-64 bg-white shadow-md">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800">KPI Configurator</h2>
        <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
      </div>
      <nav className="mt-6">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 text-gray-700 ${
              isActive ? 'bg-primary-50 border-r-4 border-primary-500' : 'hover:bg-gray-50'
            }`
          }
        >
          <LayoutDashboard className="h-5 w-5 mr-3" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/configure"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 text-gray-700 ${
              isActive ? 'bg-primary-50 border-r-4 border-primary-500' : 'hover:bg-gray-50'
            }`
          }
        >
          <Settings className="h-5 w-5 mr-3" />
          <span>Configure KPIs</span>
        </NavLink>
        <NavLink
          to="/manage"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 text-gray-700 ${
              isActive ? 'bg-primary-50 border-r-4 border-primary-500' : 'hover:bg-gray-50'
            }`
          }
        >
          <List className="h-5 w-5 mr-3" />
          <span>Manage Configs</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;