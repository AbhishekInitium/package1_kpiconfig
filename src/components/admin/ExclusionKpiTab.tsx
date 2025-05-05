import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { ExclusionRule } from '../../types/kpi';
import { v4 as uuidv4 } from 'uuid';

interface ExclusionKpiTabProps {
  exclusionRules: ExclusionRule[];
  uploadedBaseColumns: string[];
  globalVariables: { name: string }[];
  onUpdate: (rules: ExclusionRule[]) => void;
}

const ExclusionKpiTab: React.FC<ExclusionKpiTabProps> = ({
  exclusionRules,
  uploadedBaseColumns,
  globalVariables,
  onUpdate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ExclusionRule | null>(null);
  const [formData, setFormData] = useState<Partial<ExclusionRule>>({
    kpiName: '',
    description: '',
    sourceField: '',
    statusUpdate: '',
  });

  const resetForm = () => {
    setFormData({
      kpiName: '',
      description: '',
      sourceField: '',
      statusUpdate: '',
    });
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

  const handleEdit = (rule: ExclusionRule) => {
    setFormData({ ...rule });
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleDelete = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this exclusion rule?')) {
      const updatedRules = exclusionRules.filter(rule => rule.id !== ruleId);
      onUpdate(updatedRules);
    }
  };

  const handleFieldChange = (field: keyof ExclusionRule, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const ruleData: ExclusionRule = {
      id: editingRule?.id || uuidv4(),
      kpiName: formData.kpiName || '',
      description: formData.description || '',
      sourceField: formData.sourceField || '',
      statusUpdate: formData.statusUpdate || '',
    };

    if (editingRule) {
      const updatedRules = exclusionRules.map(rule =>
        rule.id === editingRule.id ? ruleData : rule
      );
      onUpdate(updatedRules);
    } else {
      onUpdate([...exclusionRules, ruleData]);
    }

    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Exclusion KPIs</h2>
          <p className="mt-1 text-sm text-gray-500">
            Define exclusion rules for KPI calculations
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Rule
        </button>
      </div>

      {exclusionRules.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No exclusion rules defined yet.</p>
          <button
            onClick={handleOpenModal}
            className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            Add your first rule
          </button>
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
                  Status Update
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exclusionRules.map((rule) => (
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
                    {rule.statusUpdate}
                  </td>
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
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter KPI name"
                />
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
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select source field</option>
                  {uploadedBaseColumns.map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Update
                </label>
                <select
                  value={formData.statusUpdate || ''}
                  onChange={(e) => handleFieldChange('statusUpdate', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select status variable</option>
                  {globalVariables.map((variable) => (
                    <option key={variable.name} value={variable.name}>
                      {variable.name}
                    </option>
                  ))}
                </select>
              </div>

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

export default ExclusionKpiTab;