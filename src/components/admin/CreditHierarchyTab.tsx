import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { CreditHierarchy } from '../../types/kpi';

interface CreditHierarchyTabProps {
  creditHierarchy: CreditHierarchy;
  uploadedHierarchyColumns: string[];
  onUpdate: (hierarchy: CreditHierarchy) => void;
}

const CreditHierarchyTab: React.FC<CreditHierarchyTabProps> = ({
  creditHierarchy,
  uploadedHierarchyColumns,
  onUpdate,
}) => {
  const [hierarchy, setHierarchy] = useState<CreditHierarchy>(creditHierarchy);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setHierarchy(creditHierarchy);
  }, [creditHierarchy]);

  const validateField = (field: keyof CreditHierarchy, value: string): string => {
    if (!value) {
      return `${field} is required`;
    }
    if (!uploadedHierarchyColumns.includes(value)) {
      return 'Selected column is not available in the hierarchy file';
    }
    return '';
  };

  const handleFieldChange = (field: keyof CreditHierarchy, value: string) => {
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));

    const updatedHierarchy = {
      ...hierarchy,
      [field]: value,
    };
    setHierarchy(updatedHierarchy);

    if (!error) {
      onUpdate(updatedHierarchy);
    }
  };

  if (!uploadedHierarchyColumns || uploadedHierarchyColumns.length === 0) {
    return (
      <div className="bg-warning-50 border border-warning-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-warning-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-warning-800">
              No Hierarchy File Uploaded
            </h3>
            <div className="mt-2 text-sm text-warning-700">
              <p>
                Please upload a hierarchy file first. The file should contain columns for:
              </p>
              <ul className="list-disc list-inside mt-2">
                <li>Manager/Supervisor information</li>
                <li>Valid from date</li>
                <li>Valid to date</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderField = (
    field: keyof CreditHierarchy,
    label: string,
    description: string
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        <span className="text-error-500 ml-1">*</span>
      </label>
      <p className="text-sm text-gray-500">{description}</p>
      <select
        value={hierarchy[field]}
        onChange={(e) => handleFieldChange(field, e.target.value)}
        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
          errors[field] ? 'border-error-500' : 'border-gray-300'
        }`}
      >
        <option value="">Select a column</option>
        {uploadedHierarchyColumns.map((column) => (
          <option key={column} value={column}>
            {column}
          </option>
        ))}
      </select>
      {errors[field] && (
        <p className="mt-1 text-sm text-error-500">{errors[field]}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Credit Hierarchy Configuration</h2>
        <p className="mt-1 text-sm text-gray-500">
          Configure how credit will be split based on reporting hierarchy
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {renderField(
          'managerField',
          'Manager Field',
          'Select the column that identifies the manager or supervisor'
        )}

        {renderField(
          'validFromField',
          'Valid From Field',
          'Select the column containing the start date of the reporting relationship'
        )}

        {renderField(
          'validToField',
          'Valid To Field',
          'Select the column containing the end date of the reporting relationship'
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-gray-900">Current Configuration</h3>
        <div className="mt-2 text-sm text-gray-500">
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(hierarchy).map(([key, value]) => (
              <li key={key}>
                <span className="font-medium">{key}:</span>{' '}
                {value || 'Not mapped'}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreditHierarchyTab;