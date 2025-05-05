import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { AdjustmentRule } from '../../types/kpi';
import { v4 as uuidv4 } from 'uuid';
import LookupCriteriaChainBuilder from '../kpi/LookupCriteriaChainBuilder';

interface UploadedFile {
  filename: string;
  columns: string[];
}

interface AdjustmentKpiTabProps {
  adjustmentRules: AdjustmentRule[];
  uploadedBaseColumns: string[];
  uploadedLookupFiles: Record<string, UploadedFile>;
  globalVariables: { name: string }[];
  onUpdate: (rules: AdjustmentRule[]) => void;
  isEditing?: boolean;
}

const AdjustmentKpiTab: React.FC<AdjustmentKpiTabProps> = ({
  adjustmentRules,
  uploadedBaseColumns,
  uploadedLookupFiles,
  globalVariables,
  onUpdate,
  isEditing = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AdjustmentRule | null>(null);
  const [formData, setFormData] = useState<Partial<AdjustmentRule>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const resetForm = () => {
    setFormData({});
    setErrors({});
    setIsSubmitted(false);
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

  const handleEdit = (rule: AdjustmentRule) => {
    setFormData({ ...rule });
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleDelete = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this adjustment rule?')) {
      const updatedRules = adjustmentRules.filter(rule => rule.id !== ruleId);
      onUpdate(updatedRules);
    }
  };

  const handleFieldChange = (field: keyof AdjustmentRule, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when field is changed
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    const requiredFields = ['kpiName', 'conditionField', 'adjustFrom', 'adjustWhat'];
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof AdjustmentRule]) {
        newErrors[field] = `${field} is required`;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!validateForm()) {
      return;
    }

    const ruleData: AdjustmentRule = {
      id: editingRule?.id || uuidv4(),
      kpiName: formData.kpiName!,
      description: formData.description || '',
      conditionField: formData.conditionField!,
      adjustFrom: formData.adjustFrom!,
      adjustWhat: formData.adjustWhat!,
      direction: formData.direction || 'Increase',
      type: formData.type || 'Percentage',
      valueType: formData.valueType || 'Fixed',
      lookupChain: formData.valueType === 'Lookup' ? formData.lookupChain : undefined,
    };

    if (editingRule) {
      const updatedRules = adjustmentRules.map(rule =>
        rule.id === editingRule.id ? ruleData : rule
      );
      onUpdate(updatedRules);
    } else {
      onUpdate([...adjustmentRules, ruleData]);
    }

    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Adjustment KPIs</h2>
          <p className="mt-1 text-sm text-gray-500">
            Define adjustment rules for KPI calculations
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

      {adjustmentRules.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No adjustment rules defined yet.</p>
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
                  Type
                </th>
                {isEditing && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adjustmentRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {rule.kpiName}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {rule.description}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {rule.conditionField}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {rule.type} ({rule.valueType})
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
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl h-[90vh] flex flex-col">
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

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    KPI Name
                  </label>
                  <input
                    type="text"
                    value={formData.kpiName || ''}
                    onChange={(e) => handleFieldChange('kpiName', e.target.value)}
                    className={`w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                      errors.kpiName ? 'border-error-500' : ''
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
                    Condition Field
                  </label>
                  <select
                    value={formData.conditionField || ''}
                    onChange={(e) => handleFieldChange('conditionField', e.target.value)}
                    className={`w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                      errors.conditionField ? 'border-error-500' : ''
                    }`}
                  >
                    <option value="">Select source field</option>
                    {uploadedBaseColumns.map((column) => (
                      <option key={column} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                  {errors.conditionField && (
                    <p className="mt-1 text-sm text-error-500">{errors.conditionField}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adjust From
                  </label>
                  <select
                    value={formData.adjustFrom || ''}
                    onChange={(e) => handleFieldChange('adjustFrom', e.target.value)}
                    className={`w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                      errors.adjustFrom ? 'border-error-500' : ''
                    }`}
                  >
                    <option value="">Select source field</option>
                    {uploadedBaseColumns.map((column) => (
                      <option key={column} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                  {errors.adjustFrom && (
                    <p className="mt-1 text-sm text-error-500">{errors.adjustFrom}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adjust What
                  </label>
                  <select
                    value={formData.adjustWhat || ''}
                    onChange={(e) => handleFieldChange('adjustWhat', e.target.value)}
                    className={`w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                      errors.adjustWhat ? 'border-error-500' : ''
                    }`}
                  >
                    <option value="">Select variable</option>
                    {globalVariables.map((variable) => (
                      <option key={variable.name} value={variable.name}>
                        {variable.name}
                      </option>
                    ))}
                  </select>
                  {errors.adjustWhat && (
                    <p className="mt-1 text-sm text-error-500">{errors.adjustWhat}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Direction
                  </label>
                  <select
                    value={formData.direction || 'Increase'}
                    onChange={(e) => handleFieldChange('direction', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Increase">Increase</option>
                    <option value="Decrease">Decrease</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type || 'Percentage'}
                    onChange={(e) => handleFieldChange('type', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Percentage">Percentage</option>
                    <option value="Absolute">Absolute</option>
                  </select>
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

                {formData.valueType === 'Lookup' && (
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Lookup Chain Configuration</h4>
                    <LookupCriteriaChainBuilder
                      lookupChain={formData.lookupChain || []}
                      onChange={(chain) => handleFieldChange('lookupChain', chain)}
                      availableFiles={Object.keys(uploadedLookupFiles)}
                      baseFields={uploadedBaseColumns}
                      fileColumns={Object.fromEntries(
                        Object.entries(uploadedLookupFiles).map(([filename, file]) => [
                          filename,
                          file.columns,
                        ])
                      )}
                    />
                  </div>
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
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdjustmentKpiTab;