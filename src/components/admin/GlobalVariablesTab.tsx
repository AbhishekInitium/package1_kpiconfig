import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { GlobalVariable } from '../../types/kpi';
import { v4 as uuidv4 } from 'uuid';

interface GlobalVariablesTabProps {
  variables: GlobalVariable[];
  onUpdate: (variables: GlobalVariable[]) => void;
  isEditing?: boolean;
}

const GlobalVariablesTab: React.FC<GlobalVariablesTabProps> = ({ 
  variables, 
  onUpdate,
  isEditing = true 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<GlobalVariable | null>(null);
  const [formData, setFormData] = useState<GlobalVariable>({
    name: '',
    description: '',
    dataType: 'String'
  });
  const [error, setError] = useState<string>('');

  const dataTypes = ['Currency', 'String', 'Number', 'Date'];

  const resetForm = () => {
    setFormData({ name: '', description: '', dataType: 'String' });
    setError('');
    setEditingVariable(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (variable: GlobalVariable) => {
    setFormData({ ...variable });
    setEditingVariable(variable);
    setIsModalOpen(true);
  };

  const handleDelete = (variableName: string) => {
    if (confirm('Are you sure you want to delete this variable?')) {
      const updatedVariables = variables.filter(v => v.name !== variableName);
      onUpdate(updatedVariables);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Variable name is required');
      return false;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }

    if (!editingVariable && variables.some(v => v.name === formData.name)) {
      setError('A variable with this name already exists');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    if (editingVariable) {
      const updatedVariables = variables.map(v =>
        v.name === editingVariable.name ? formData : v
      );
      onUpdate(updatedVariables);
    } else {
      onUpdate([...variables, formData]);
    }

    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Global Variables</h2>
        {isEditing && (
          <button
            onClick={handleOpenModal}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Variable
          </button>
        )}
      </div>

      {variables.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No global variables defined yet.</p>
          {isEditing && (
            <button
              onClick={handleOpenModal}
              className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              Add your first variable
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variable Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Type
                </th>
                {isEditing && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {variables.map((variable) => (
                <tr key={variable.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {variable.name}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {variable.description}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {variable.dataType}
                  </td>
                  {isEditing && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(variable)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(variable.name)}
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
                {editingVariable ? 'Edit Variable' : 'Add New Variable'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-error-50 text-error-700 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variable Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Enter variable name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Enter variable description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Type
                </label>
                <select
                  value={formData.dataType}
                  onChange={(e) => setFormData({ ...formData, dataType: e.target.value as GlobalVariable['dataType'] })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  {dataTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
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
                  {editingVariable ? 'Update' : 'Add'} Variable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalVariablesTab;