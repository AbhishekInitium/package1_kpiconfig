import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { Upload, Edit, X, Save } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { KPIConfiguration } from '../types';
import GlobalVariablesTab from '../components/admin/GlobalVariablesTab';
import BaseDataTab from '../components/admin/BaseDataTab';
import QualificationKpiTab from '../components/admin/QualificationKpiTab';
import AdjustmentKpiTab from '../components/admin/AdjustmentKpiTab';
import ExclusionKpiTab from '../components/admin/ExclusionKpiTab';
import CreditHierarchyTab from '../components/admin/CreditHierarchyTab';

type TabType = 'base' | 'qualification' | 'adjustment' | 'exclusion' | 'hierarchy' | 'global';

const ManageConfigs: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('base');
  const [config, setConfig] = useState<KPIConfiguration | null>(null);
  const [kpiConfig, setKpiConfig] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalConfig, setOriginalConfig] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{
    base: { filename: string; columns: string[] } | null;
    hierarchy: { filename: string; columns: string[] } | null;
    lookup: Record<string, { filename: string; columns: string[] }>;
  }>({
    base: null,
    hierarchy: null,
    lookup: {},
  });

  const tabs = [
    { id: 'base', label: 'Base Data' },
    { id: 'qualification', label: 'Qualification KPI\'s' },
    { id: 'adjustment', label: 'Adjustment KPI\'s' },
    { id: 'exclusion', label: 'Exclusion KPI\'s' },
    { id: 'hierarchy', label: 'Credit Hierarchy' },
    { id: 'global', label: 'Global Variables' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      addToast('Please select a JSON configuration file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedConfig = JSON.parse(content);

        if (!parsedConfig.caseFileId || !parsedConfig.versions || !Array.isArray(parsedConfig.versions)) {
          throw new Error('Invalid configuration format');
        }

        setConfig(parsedConfig);
        const currentVersion = parsedConfig.versions.find(v => v.status === 'Current');
        if (!currentVersion) {
          throw new Error('No current version found in configuration');
        }
        
        setKpiConfig(currentVersion.data);
        if (currentVersion.data.uploadedFiles) {
          setUploadedFiles(currentVersion.data.uploadedFiles);
        }

        setIsEditing(false);
        setHasChanges(false);
        setOriginalConfig(JSON.parse(JSON.stringify(currentVersion.data)));
        addToast('Configuration loaded successfully', 'success');
      } catch (error) {
        console.error('Error parsing configuration:', error);
        addToast('Invalid configuration file format', 'error');
      }
    };

    reader.readAsText(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        setKpiConfig(JSON.parse(JSON.stringify(originalConfig)));
        setIsEditing(false);
        setHasChanges(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleConfigUpdate = (newData: any) => {
    if (!isEditing) return;
    setKpiConfig(newData);
    setHasChanges(true);
  };

  const getNextVersion = (currentVersion: string): string => {
    const [major, minor] = currentVersion.split('.').map(Number);
    return `${major}.${minor + 1}`;
  };

  const handleSave = () => {
    if (!config || !kpiConfig || !hasChanges) return;

    try {
      const now = new Date();
      const ddmmyy = now.toLocaleDateString('en-GB').replace(/\//g, '').slice(0, 6);
      const hhmm = now.toTimeString().slice(0, 5).replace(':', '');
      
      // Find current version and mark it as deprecated
      const updatedVersions = config.versions.map(version => ({
        ...version,
        status: version.status === 'Current' ? 'Deprecated' : version.status
      }));

      // Get the last version number and increment it
      const lastVersion = config.versions[config.versions.length - 1];
      const newVersionNumber = getNextVersion(lastVersion.version);
      
      // Create new version
      const newVersion = {
        version: newVersionNumber,
        savedOn: now.toISOString(),
        description: 'Updated configuration',
        status: 'Current',
        data: {
          ...kpiConfig,
          uploadedFiles,
        },
      };

      const updatedConfig = {
        ...config,
        versions: [...updatedVersions, newVersion],
      };

      const filename = `K_${config.caseFileId}_${ddmmyy}_${hhmm}.json`;
      const blob = new Blob([JSON.stringify(updatedConfig, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setConfig(updatedConfig);
      setOriginalConfig(JSON.parse(JSON.stringify(kpiConfig)));
      setIsEditing(false);
      setHasChanges(false);
      addToast('Configuration saved successfully', 'success');
    } catch (error) {
      console.error('Error saving configuration:', error);
      addToast('Failed to save configuration', 'error');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Configurations</h1>
            <p className="mt-2 text-gray-600">
              Upload and edit existing KPI configurations.
            </p>
          </div>
          {!config && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".json"
                onChange={handleFileUpload}
              />
              <Button
                variant="primary"
                onClick={handleUploadClick}
                className="flex items-center"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Configuration
              </Button>
            </div>
          )}
        </div>
      </div>

      {!config ? (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center">
            <div className="bg-gray-100 rounded-full p-4 mb-4">
              <Upload className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No configuration loaded</h3>
            <p className="text-gray-500 mb-6">
              Upload a configuration file to get started
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Configuration Details</h2>
                <p className="text-sm text-gray-500">ID: {config.caseFileId}</p>
              </div>
              <div className="space-x-4">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="flex items-center"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      disabled={!hasChanges}
                      className="flex items-center"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleEdit}
                    className="flex items-center"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Configuration
                  </Button>
                )}
              </div>
            </div>

            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                      ${activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {kpiConfig && (
              <div className="py-6">
                {activeTab === 'global' && (
                  <GlobalVariablesTab
                    variables={kpiConfig.globalVariables}
                    onUpdate={(variables) => handleConfigUpdate({ ...kpiConfig, globalVariables: variables })}
                    isEditing={isEditing}
                  />
                )}
                {activeTab === 'base' && (
                  <BaseDataTab
                    baseMapping={kpiConfig.baseDataMapping}
                    uploadedBaseColumns={uploadedFiles.base?.columns || []}
                    onUpdate={(mapping) => handleConfigUpdate({ ...kpiConfig, baseDataMapping: mapping })}
                    isEditing={isEditing}
                  />
                )}
                {activeTab === 'qualification' && (
                  <QualificationKpiTab
                    qualificationRules={kpiConfig.qualificationRules}
                    uploadedBaseColumns={uploadedFiles.base?.columns || []}
                    uploadedLookupFiles={uploadedFiles.lookup}
                    onUpdate={(rules) => handleConfigUpdate({ ...kpiConfig, qualificationRules: rules })}
                    isEditing={isEditing}
                  />
                )}
                {activeTab === 'adjustment' && (
                  <AdjustmentKpiTab
                    adjustmentRules={kpiConfig.adjustmentRules}
                    uploadedBaseColumns={uploadedFiles.base?.columns || []}
                    uploadedLookupFiles={uploadedFiles.lookup}
                    globalVariables={kpiConfig.globalVariables}
                    onUpdate={(rules) => handleConfigUpdate({ ...kpiConfig, adjustmentRules: rules })}
                    isEditing={isEditing}
                  />
                )}
                {activeTab === 'exclusion' && (
                  <ExclusionKpiTab
                    exclusionRules={kpiConfig.exclusionRules}
                    uploadedBaseColumns={uploadedFiles.base?.columns || []}
                    globalVariables={kpiConfig.globalVariables}
                    onUpdate={(rules) => handleConfigUpdate({ ...kpiConfig, exclusionRules: rules })}
                    isEditing={isEditing}
                  />
                )}
                {activeTab === 'hierarchy' && (
                  <CreditHierarchyTab
                    creditHierarchy={kpiConfig.creditHierarchy}
                    uploadedHierarchyColumns={uploadedFiles.hierarchy?.columns || []}
                    onUpdate={(hierarchy) => handleConfigUpdate({ ...kpiConfig, creditHierarchy: hierarchy })}
                    isEditing={isEditing}
                  />
                )}
              </div>
            )}

            <div className="border-t border-gray-200 pt-4 mt-6">
              <h3 className="text-lg font-medium mb-4">Version History</h3>
              <div className="space-y-4">
                {config.versions.map((version, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Version {version.version}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(version.savedOn).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {version.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManageConfigs;