import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import FileUploader from './FileUploader';
import GlobalVariablesTab from './GlobalVariablesTab';
import BaseDataTab from './BaseDataTab';
import QualificationKpiTab from './QualificationKpiTab';
import AdjustmentKpiTab from './AdjustmentKpiTab';
import ExclusionKpiTab from './ExclusionKpiTab';
import CreditHierarchyTab from './CreditHierarchyTab';

type TabType = 'base' | 'qualification' | 'adjustment' | 'exclusion' | 'hierarchy' | 'global';

interface UploadedFile {
  filename: string;
  columns: string[];
}

interface UploadedFiles {
  base: UploadedFile | null;
  hierarchy: UploadedFile | null;
  lookup: Record<string, UploadedFile>;
}

const defaultGlobalVariables = [
  {
    name: "RTAMT",
    description: "Row total",
    dataType: "Currency"
  },
  {
    name: "ATAMT",
    description: "Adjusted total",
    dataType: "Currency"
  }
];

const ConfigureKPI: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('base');
  const [isSaving, setIsSaving] = useState(false);
  const [kpiIdentifier, setKpiIdentifier] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    base: null,
    hierarchy: null,
    lookup: {},
  });
  
  const [config, setConfig] = useState({
    baseDataMapping: {
      agentField: '',
      txnIdField: '',
      txnDateField: '',
      amountField: '',
    },
    globalVariables: defaultGlobalVariables,
    qualificationRules: [],
    adjustmentRules: [],
    exclusionRules: [],
    creditHierarchy: {
      id: '',
      managerField: '',
      validFromField: '',
      validToField: '',
    },
  });

  const tabs = [
    { id: 'base', label: 'Base Data' },
    { id: 'qualification', label: 'Qualification KPI\'s' },
    { id: 'adjustment', label: 'Adjustment KPI\'s' },
    { id: 'exclusion', label: 'Exclusion KPI\'s' },
    { id: 'hierarchy', label: 'Credit Hierarchy' },
    { id: 'global', label: 'Global Variables' },
  ];

  const handleSave = () => {
    if (!kpiIdentifier.trim()) {
      addToast('Please enter a KPI identifier', 'error');
      return;
    }

    if (!uploadedFiles.base) {
      addToast('Please upload a base data file', 'error');
      return;
    }

    try {
      setIsSaving(true);
      
      const now = new Date();
      const ddmmyy = now.toLocaleDateString('en-GB').replace(/\//g, '').slice(0, 6);
      const hhmm = now.toTimeString().slice(0, 5).replace(':', '');
      const filename = `K_${kpiIdentifier}_${ddmmyy}_${hhmm}.json`;

      const configData = {
        caseFileId: kpiIdentifier,
        createdOn: now.toISOString(),
        createdBy: 'admin',
        versions: [
          {
            version: '1.0',
            savedOn: now.toISOString(),
            description: 'Initial Save',
            status: 'Current',
            data: {
              ...config,
              uploadedFiles,
            },
          },
        ],
      };

      const blob = new Blob([JSON.stringify(configData, null, 2)], {
        type: 'application/json',
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      addToast('Configuration saved successfully!', 'success');
      navigate('/manage');
    } catch (error) {
      console.error('Error saving configuration:', error);
      addToast('Failed to save configuration', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create New KPI Configuration</h1>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            KPI Identifier (10 chars max)
          </label>
          <input
            type="text"
            value={kpiIdentifier}
            onChange={(e) => setKpiIdentifier(e.target.value.slice(0, 10))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Enter identifier"
          />
        </div>

        <div className="mb-8">
          <FileUploader
            uploadedFiles={uploadedFiles}
            onUpload={setUploadedFiles}
          />
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

        <div className="py-6">
          {activeTab === 'global' && (
            <GlobalVariablesTab
              variables={config.globalVariables}
              onUpdate={(variables) => setConfig({ ...config, globalVariables: variables })}
            />
          )}
          {activeTab === 'base' && (
            <BaseDataTab
              baseMapping={config.baseDataMapping}
              uploadedBaseColumns={uploadedFiles.base?.columns || []}
              onUpdate={(mapping) => setConfig({ ...config, baseDataMapping: mapping })}
            />
          )}
          {activeTab === 'qualification' && (
            <QualificationKpiTab
              qualificationRules={config.qualificationRules}
              uploadedBaseColumns={uploadedFiles.base?.columns || []}
              uploadedLookupFiles={uploadedFiles.lookup}
              onUpdate={(rules) => setConfig({ ...config, qualificationRules: rules })}
            />
          )}
          {activeTab === 'adjustment' && (
            <AdjustmentKpiTab
              adjustmentRules={config.adjustmentRules}
              uploadedBaseColumns={uploadedFiles.base?.columns || []}
              uploadedLookupFiles={uploadedFiles.lookup}
              globalVariables={config.globalVariables}
              onUpdate={(rules) => setConfig({ ...config, adjustmentRules: rules })}
            />
          )}
          {activeTab === 'exclusion' && (
            <ExclusionKpiTab
              exclusionRules={config.exclusionRules}
              uploadedBaseColumns={uploadedFiles.base?.columns || []}
              globalVariables={config.globalVariables}
              onUpdate={(rules) => setConfig({ ...config, exclusionRules: rules })}
            />
          )}
          {activeTab === 'hierarchy' && (
            <CreditHierarchyTab
              creditHierarchy={config.creditHierarchy}
              uploadedHierarchyColumns={uploadedFiles.hierarchy?.columns || []}
              onUpdate={(hierarchy) => setConfig({ ...config, creditHierarchy: hierarchy })}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigureKPI;