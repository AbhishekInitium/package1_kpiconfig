import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface LookupFile {
  filename: string;
  columns: string[];
}

interface LookupCriteria {
  lookupFile: string;
  keyFields: string[];
  valueField: string;
  fieldMapping: Record<string, string>;
}

interface LookupCriteriaBuilderProps {
  lookupFiles: Record<string, LookupFile>;
  baseColumns: string[];
  value: LookupCriteria;
  onChange: (criteria: LookupCriteria) => void;
}

const LookupCriteriaBuilder: React.FC<LookupCriteriaBuilderProps> = ({
  lookupFiles,
  baseColumns,
  value,
  onChange,
}) => {
  const [selectedFile, setSelectedFile] = useState<LookupFile | null>(
    value.lookupFile ? lookupFiles[value.lookupFile] : null
  );

  useEffect(() => {
    if (value.lookupFile && lookupFiles[value.lookupFile]) {
      setSelectedFile(lookupFiles[value.lookupFile]);
    }
  }, [value.lookupFile, lookupFiles]);

  const handleFileChange = (filename: string) => {
    const file = lookupFiles[filename];
    setSelectedFile(file);
    onChange({
      ...value,
      lookupFile: filename,
      keyFields: [],
      valueField: '',
      fieldMapping: {},
    });
  };

  const handleKeyFieldsChange = (selectedFields: string[]) => {
    const newFieldMapping = { ...value.fieldMapping };
    // Remove mappings for fields that are no longer selected
    Object.keys(newFieldMapping).forEach(key => {
      if (!selectedFields.includes(key)) {
        delete newFieldMapping[key];
      }
    });
    onChange({
      ...value,
      keyFields: selectedFields,
      fieldMapping: newFieldMapping,
    });
  };

  const handleFieldMappingChange = (lookupField: string, baseField: string) => {
    onChange({
      ...value,
      fieldMapping: {
        ...value.fieldMapping,
        [lookupField]: baseField,
      },
    });
  };

  if (!Object.keys(lookupFiles).length) {
    return (
      <div className="bg-warning-50 border border-warning-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-warning-400" />
          <div className="ml-3">
            <p className="text-sm text-warning-700">
              No lookup files have been uploaded. Please upload at least one lookup file.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lookup File
        </label>
        <select
          value={value.lookupFile}
          onChange={(e) => handleFileChange(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="">Select a lookup file</option>
          {Object.entries(lookupFiles).map(([filename]) => (
            <option key={filename} value={filename}>
              {filename}
            </option>
          ))}
        </select>
      </div>

      {selectedFile && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key Fields
            </label>
            <select
              multiple
              value={value.keyFields}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                handleKeyFieldsChange(selectedOptions);
              }}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              size={4}
            >
              {selectedFile.columns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Hold Ctrl/Cmd to select multiple fields
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value Field
            </label>
            <select
              value={value.valueField}
              onChange={(e) => onChange({ ...value, valueField: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Select value field</option>
              {selectedFile.columns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>

          {value.keyFields.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field Mapping
              </label>
              <div className="space-y-2">
                {value.keyFields.map((lookupField) => (
                  <div key={lookupField} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 min-w-[150px]">
                      {lookupField}
                    </span>
                    <select
                      value={value.fieldMapping[lookupField] || ''}
                      onChange={(e) => handleFieldMappingChange(lookupField, e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="">Map to base field</option>
                      {baseColumns.map((column) => (
                        <option key={column} value={column}>
                          {column}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LookupCriteriaBuilder;