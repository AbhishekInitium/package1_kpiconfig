import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { Settings, List } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">KPI Configuration Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to the ICM Admin KPI Configurator. Manage and configure Key Performance Indicators
          for your incentive compensation management system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-l-4 border-primary-500">
          <div className="flex items-center">
            <div className="bg-primary-100 p-3 rounded-full">
              <Settings className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Configure KPIs</h3>
              <p className="text-gray-500 text-sm">Create and manage KPI configurations</p>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-accent-500">
          <div className="flex items-center">
            <div className="bg-accent-100 p-3 rounded-full">
              <List className="h-6 w-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Manage Configs</h3>
              <p className="text-gray-500 text-sm">View and edit saved configurations</p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Quick Actions">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <h4 className="font-medium">Create New Configuration</h4>
              <p className="text-sm text-gray-500">Set up a new KPI configuration</p>
            </div>
            <Link to="/configure">
              <Button variant="primary">Configure</Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <h4 className="font-medium">View Configurations</h4>
              <p className="text-sm text-gray-500">Manage existing configurations</p>
            </div>
            <Link to="/manage">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;