import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ConfigureKPI from './pages/ConfigureKPI';
import UploadExcel from './pages/UploadExcel';
import MapFields from './pages/MapFields';
import ManageConfigs from './pages/ManageConfigs';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="configure" element={<ConfigureKPI />} />
        <Route path="upload" element={<UploadExcel />} />
        <Route path="map/:fileId" element={<MapFields />} />
        <Route path="manage" element={<ManageConfigs />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;