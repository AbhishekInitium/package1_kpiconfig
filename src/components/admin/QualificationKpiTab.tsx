import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { QualificationRule } from '../../types/kpi';
import { v4 as uuidv4 } from 'uuid';

interface UploadedFile {
  filename: string;
  columns: string[];
}

interface QualificationKpiTabProps {
  qualificationRules: QualificationRule[];
  uploadedBaseColumns: string[];
  uploadedLookupFiles: Record<string, UploadedFile>;
  onUpdate: (rules: QualificationRule[]) => void;
  isEditing?: boolean;
}

const QualificationKpiTab: React.FC<QualificationKpiTabProps> = ({
  qualificationRules,
  uploadedBaseColumns,
  uploadedLookupFiles,
  onUpdate,
  isEditing = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<QualificationRule | null>(null);
  const [formData, setFormData] = useState<Partial<QualificationRule>>({
    evaluationLevel: 'Per Record',
    aggregation: 'N/A',
    valueType: 'Fixed',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      evaluationLevel: 'Per Record',
      aggregation: 'N/A',
      valueType: 'Fixed',
    });
    setErrors({});
    setEditingRule(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (rule: QualificationRule) => {
    setFormData({ ...rule });
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleDelete = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this qualification rule?')) {
      const updatedRules = qualificationRules.filter(rule => rule.id !== ruleId);
      onUpdate(updatedRules);
    }
  };

  const validateField = (field: keyof QualificationRule, value: string): string => {
    switch (field) {
      case 'kpiName':
        if (!value.trim()) {
          return 'KPI name is required';
        }
        if (!/^[A-Z][A-Za-z0-9]*$/.test(value)) {
          return 'KPI name must start with a capital letter and contain only letters and numbers';
        }
        if (!editingRule && qualificationRules.some(rule => rule.kpiName === value)) {
          return 'A rule with this KPI name already exists';
        }
        break;
      case 'sourceField':
        if (!value) {
          return 'Source field is required';
        }
        break;
      case 'evaluationLevel':
        if (!value) {
          return 'Evaluation level is required';
        }
        break;
    }
    return '';
  };

  const handleFieldChange = (field: keyof QualificationRule, value: any) => {
    const error = typeof value === 'string' ? validateField(field, value) : '';
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));
    
    if (field === 'evaluationLevel') {
      const aggregation = value === 'Per Record' ? 'N/A' : 'Sum';
      setFormData(prev => ({
        ...prev,
        [field]: value,
        aggregation,
      }));
    } else if (field === 'valueType' && value === 'Fixed') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        lookupTable: undefined,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    const requiredFields: (keyof QualificationRule)[] = ['kpiName', 'sourceField', 'evaluationLevel'];
    
    requiredFields.forEach(field => {
      const value = formData[field] as string;
      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    if (formData.valueType === 'Lookup') {
      if (!formData.lookupTable?.file) {
        newErrors.lookupFile = 'Lookup file is required';
        isValid = false;
      }
      if (!formData.lookupTable?.keyFields?.length) {
        newErrors.keyFields = 'At least one key field is required';
        isValid = false;
      }
      if (!formData.lookupTable?.valueField) {
        newErrors.valueField = 'Value field is required';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const ruleData: QualificationRule = {
      id: editingRule?.id || uuidv4(),
      kpiName: formData.kpiName!,
      description: formData.description || '',
      sourceField: formData.sourceField!,
      valueType: formData.valueType || 'Fixed',
      evaluationLevel: formData.evaluationLevel!,
      aggregation: formData.evaluationLevel === 'Per Record' ? 'N/A' : (formData.aggregation as 'Sum' | 'Average' | 'Max' | 'Min'),
      lookupTable: formData.valueType === 'Lookup' ? formData.lookupTable : undefined,
    };

    if (editingRule) {
      const updatedRules = qualificationRules.map(rule =>
        rule.id === editingRule.id ? ruleData : rule
      );
      onUpdate(updatedRules);
    } else {
      onUpdate([...qualificationRules, ruleData]);
    }

    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Qualification KPIs</h2>
          <p className="mt-1 text-sm text-gray-500">
            Define qualification rules for KPI calculations
          </p>
        </div>
        {isEditing && (
          <button
            onClick={handleOpenModal}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </button>
        )}
      </div>

      {qualificationRules.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No qualification rules defined yet.</p>
          {isEditing && (
            <button
              onClick={handleOpenModal}
              className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              Add your first rule
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KPI Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source Field
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evaluation Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aggregation
                </th>
                {isEditing && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {qualificationRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {rule.kpiName}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {rule.description}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {rule.sourceField}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {rule.valueType}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {rule.evaluationLevel}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {rule.aggregation}
                  </td>
                  {isEditing && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="text-error-600 hover:text-error-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingRule ? 'Edit Rule' : 'Add New Rule'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  KPI Name
                </label>
                <input
                  type="text"
                  value={formData.kpiName || ''}
                  onChange={(e) => handleFieldChange('kpiName', e.target.value)}
                  className={`w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                    errors.kpiName ? 'border-error-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter KPI name"
                />
                {errors.kpiName && (
                  <p className="mt-1 text-sm text-error-500">{errors.kpiName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source Field
                </label>
                <select
                  value={formData.sourceField || ''}
                  onChange={(e) => handleFieldChange('sourceField', e.target.value)}
                  className={`w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                    errors.sourceField ? 'border-error-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select source field</option>
                  {uploadedBaseColumns.map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
                {errors.sourceField && (
                  <p className="mt-1 text-sm text-error-500">{errors.sourceField}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value Type
                </label>
                <select
                  value={formData.valueType || 'Fixed'}
                  onChange={(e) => handleFieldChange('valueType', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Fixed">Fixed</option>
                  <option value="Lookup">Lookup</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evaluation Level
                </label>
                <select
                  value={formData.evaluationLevel || 'Per Record'}
                  onChange={(e) => handleFieldChange('evaluationLevel', e.target.value)}
                  className={`w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                    errors.evaluationLevel ? 'border-error-500' : 'border-gray-300'
                  }`}
                >
                  <option value="Per Record">Per Record</option>
                  <option value="Per Agent">Per Agent</option>
                </select>
                {errors.evaluationLevel && (
                  <p className="mt-1 text-sm text-error-500">{errors.evaluationLevel}</p>
                )}
              </div>

              {formData.evaluationLevel === 'Per Agent' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aggregation
                  </label>
                  <select
                    value={formData.aggregation || 'Sum'}
                    onChange={(e) => handleFieldChange('aggregation', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Sum">Sum</option>
                    <option value="Average">Average</option>
                    <option value="Max">Max</option>
                    <option value="Min">Min</option>
                  </select>
                </div>
              )}

              {formData.valueType === 'Lookup' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lookup File
                    </label>
                    <select
                      value={formData.lookupTable?.file || ''}
                      onChange={(e) => handleFieldChange('lookupTable', {
                        ...formData.lookupTable,
                        file: e.target.value,
                        keyFields: [],
                        valueField: '',
                      })}
                      className={`w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                        errors.lookupFile ? 'border-error-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select lookup file</option>
                      {Object.keys(uploadedLookupFiles).map((filename) => (
                        <option key={filename} value={filename}>
                          {filename}
                        </option>
                      ))}
                    </select>
                    {errors.lookupFile && (
                      <p className="mt-1 text-sm text-error-500">{errors.lookupFile}</p>
                    )}
                  </div>

                  {formData.lookupTable?.file && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Key Fields
                        </label>
                        <select
                          multiple
                          value={formData.lookupTable?.keyFields || []}
                          onChange={(e) => {
                            const selectedOptions = Array.from(
                              e.target.selectedOptions,
                              (option) => option.value
                            );
                            handleFieldChange('lookupTable', {
                              ...formData.lookupTable,
                              keyFields: selectedOptions,
                            });
                          }}
                          className={`w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                            errors.keyFields ? 'border-error-500' : 'border-gray-300'
                          }`}
                          size={4}
                        >
                          {uploadedLookupFiles[formData.lookupTable.file].columns.map((column) => (
                            <option key={column} value={column}>
                              {column}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          Hold Ctrl/Cmd to select multiple fields
                        </p>
                        {errors.keyFields && (
                          <p className="mt-1 text-sm text-error-500">{errors.keyFields}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Value Field
                        </label>
                        <select
                          value={formData.lookupTable?.valueField || ''}
                          onChange={(e) => handleFieldChange('lookupTable', {
                            ...formData.lookupTable,
                            valueField: e.target.value,
                          })}
                          className={`w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                            errors.valueField ? 'border-error-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select value field</option>
                          {uploadedLookupFiles[formData.lookupTable.file].columns.map((column) => (
                            <option key={column} value={column}>
                              {column}
                            </option>
                          ))}
                        </select>
                        {errors.valueField && (
                          <p className="mt-1 text-sm text-error-500">{errors.valueField}</p>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  {editingRule ? 'Update' : 'Add'} Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualificationKpiTab;