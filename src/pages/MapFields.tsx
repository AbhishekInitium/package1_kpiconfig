import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { ArrowRight, ArrowLeft, Save } from 'lucide-react';
import { getExcelHeaders, saveMapping } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { FieldMapping } from '../types';

const MapFields: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  const systemFields = [
    { id: 'employeeId', name: 'Employee ID', description: 'Unique identifier for the employee' },
    { id: 'firstName', name: 'First Name', description: 'Employee\'s first name' },
    { id: 'lastName', name: 'Last Name', description: 'Employee\'s last name' },
    { id: 'department', name: 'Department', description: 'Employee\'s department' },
    { id: 'position', name: 'Position', description: 'Employee\'s job position' },
    { id: 'targetValue', name: 'Target Value', description: 'Target value for KPI calculation' },
    { id: 'actualValue', name: 'Actual Value', description: 'Actual achieved value' },
    { id: 'percentage', name: 'Percentage', description: 'Achievement percentage' },
  ];

  useEffect(() => {
    const fetchHeaders = async () => {
      if (!fileId) return;
      
      try {
        setLoading(true);
        const data = await getExcelHeaders(fileId);
        setHeaders(data.headers);
        
        // Initialize mappings with empty values
        const initialMappings = systemFields.map(field => ({
          systemField: field.id,
          excelHeader: '',
        }));
        setMappings(initialMappings);
      } catch (error) {
        console.error('Error fetching headers:', error);
        addToast('Failed to fetch file headers', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchHeaders();
  }, [fileId, addToast]);

  const handleMappingChange = (systemField: string, excelHeader: string) => {
    setMappings(prev => 
      prev.map(mapping => 
        mapping.systemField === systemField 
          ? { ...mapping, excelHeader } 
          : mapping
      )
    );
  };

  const handleSaveMapping = async () => {
    if (!fileId) return;
    
    try {
      setIsSaving(true);
      
      // Filter out any unmapped fields
      const validMappings = mappings.filter(m => m.excelHeader !== '');
      
      if (validMappings.length === 0) {
        addToast('Please map at least one field before saving', 'error');
        return;
      }
      
      await saveMapping(fileId, validMappings);
      addToast('Field mapping saved successfully!', 'success');
      navigate('/configure');
    } catch (error) {
      console.error('Error saving mapping:', error);
      addToast('Failed to save field mapping', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Map Excel Fields</h1>
        <p className="mt-2 text-gray-600">
          Map the headers from your Excel file to the system fields for KPI configuration.
        </p>
      </div>

      <Card>
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Excel File Headers</h3>
          <div className="flex flex-wrap gap-2">
            {headers.map((header, index) => (
              <span 
                key={index} 
                className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
              >
                {header}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Map Fields</h3>
          
          <div className="space-y-6">
            {systemFields.map((field) => (
              <div key={field.id} className="flex flex-col md:flex-row md:items-center md:space-x-4">
                <div className="w-full md:w-1/3 mb-2 md:mb-0">
                  <p className="font-medium text-gray-800">{field.name}</p>
                  <p className="text-sm text-gray-500">{field.description}</p>
                </div>
                
                <div className="w-full md:w-1/3 flex items-center">
                  <div className="flex-1 bg-gray-50 p-2 rounded-md text-gray-700 border border-gray-200">
                    {field.id}
                  </div>
                  <ArrowRight className="mx-4 text-gray-400" />
                </div>
                
                <div className="w-full md:w-1/3">
                  <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={mappings.find(m => m.systemField === field.id)?.excelHeader || ''}
                    onChange={(e) => handleMappingChange(field.id, e.target.value)}
                  >
                    <option value="">-- Select Excel Header --</option>
                    {headers.map((header, index) => (
                      <option key={index} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => navigate('/upload')}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Upload
          </Button>
          
          <Button
            variant="primary"
            onClick={handleSaveMapping}
            isLoading={isSaving}
            className="flex items-center"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Mapping
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MapFields;