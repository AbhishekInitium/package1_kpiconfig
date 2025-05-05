import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchConfigurations, saveConfiguration } from '../services/api';
import { KPIConfiguration } from '../types';

interface ConfigContextType {
  configurations: KPIConfiguration[];
  activeConfig: KPIConfiguration | null;
  loading: boolean;
  error: string | null;
  setActiveConfig: (config: KPIConfiguration | null) => void;
  saveConfig: (config: KPIConfiguration) => Promise<void>;
  refreshConfigurations: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [configurations, setConfigurations] = useState<KPIConfiguration[]>([]);
  const [activeConfig, setActiveConfig] = useState<KPIConfiguration | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshConfigurations = async () => {
    try {
      setLoading(true);
      const data = await fetchConfigurations();
      setConfigurations(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch configurations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (config: KPIConfiguration) => {
    try {
      setLoading(true);
      await saveConfiguration(config);
      await refreshConfigurations();
    } catch (err) {
      setError('Failed to save configuration');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshConfigurations();
  }, []);

  return (
    <ConfigContext.Provider
      value={{
        configurations,
        activeConfig,
        loading,
        error,
        setActiveConfig,
        saveConfig,
        refreshConfigurations,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};