import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { BaseDataMapping } from '../../types/kpi';

interface BaseDataTabProps {
  baseMapping: BaseDataMapping;
  uploadedBaseColumns: string[];
  onUpdate: (mapping: BaseDataMapping) => void;
}

const BaseDataTab: React.FC<BaseDataTabProps> = ({
  baseMapping,
  uploadedBaseColumns,
  onUpdate,
}) => {
  const [mapping, setMapping] = useState<BaseDataMapping>(baseMapping);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setMapping(baseMapping);
  }, [baseMapping]);

  const handleFieldChange = (field: keyof BaseDataMapping, value: string) => {
    const updatedMapping = { ...mapping, [field]: value };
    setMapping(updatedMapping);
    validateMapping(updatedMapping);
    onUpdate(updatedMapping);
  };

  const validateMapping = (currentMapping: BaseDataMapping) => {
    // Check for empty selections
    const emptyFields = Object.entries(currentMapping)
      .filter(([_, value]) => !value)
      .map(([key, _]) => key);

    if (emptyFields.length > 0) {
      setError(`Please select values for all fields: ${emptyFields.join(', ')}`);
      return false;
    }

    // Check for duplicate selections
    const selections = Object.values(currentMapping);
    const uniqueSelections = new Set(selections);
    if (selections.length !== uniqueSelections.size) {
      setError('Each field must map to a unique column');
      return false;
    }

    setError('');
    return true;
  };

  const renderFieldDropdown = (
    fieldName: keyof BaseDataMapping,
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
        value={mapping[fieldName]}
        onChange={(e) => handleFieldChange(fieldName, e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
      >
        <option value="">Select a column</option>
        {uploadedBaseColumns.map((column) => (
          <option key={column} value={column}>
            {column}
          </option>
        ))}
      </select>
    </div>
  );

  if (!uploadedBaseColumns || uploadedBaseColumns.length === 0) {
    return (
      <div className="bg-warning-50 border border-warning-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-warning-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-warning-800">
              No Base File Uploaded
            </h3>
            <div className="mt-2 text-sm text-warning-700">
              <p>
                Please upload a base data file first. The file should contain
                columns for:
              </p>
              <ul className="list-disc list-inside mt-2">
                <li>Agent/Employee identifier</li>
                <li>Transaction ID</li>
                <li>Transaction Date</li>
                <li>Transaction Amount</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Base Data Mapping</h2>
        <p className="mt-1 text-sm text-gray-500">
          Map the required fields from your base data file to configure KPI calculations.
        </p>
      </div>

      {error && (
        <div className="bg-error-50 border border-error-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-error-400" />
            <div className="ml-3">
              <p className="text-sm text-error-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {renderFieldDropdown(
          'agentField',
          'Agent Field',
          'Select the column that identifies the sales employee or agent'
        )}

        {renderFieldDropdown(
          'txnIdField',
          'Transaction ID Field',
          'Select the column containing unique transaction identifiers'
        )}

        {renderFieldDropdown(
          'txnDateField',
          'Transaction Date Field',
          'Select the column containing transaction dates'
        )}

        {renderFieldDropdown(
          'amountField',
          'Amount Field',
          'Select the column containing transaction amounts'
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-gray-900">Current Mapping</h3>
        <div className="mt-2 text-sm text-gray-500">
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(mapping).map(([key, value]) => (
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

export default BaseDataTab;