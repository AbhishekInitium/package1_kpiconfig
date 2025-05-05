import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import { uploadExcelFile } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const UploadExcel: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      validateFile(selectedFile);
    }
  };

  const validateFile = (selectedFile: File) => {
    // Check file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    
    if (!validTypes.includes(selectedFile.type)) {
      addToast('Please select a valid Excel file (.xls or .xlsx)', 'error');
      return;
    }

    // Check file size (5MB limit)
    if (selectedFile.size > 5 * 1024 * 1024) {
      addToast('File size exceeds 5MB limit', 'error');
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('excelFile', file);
      
      const response = await uploadExcelFile(formData);
      
      addToast('File uploaded successfully!', 'success');
      // Navigate to mapping page with the file ID
      navigate(`/map/${response.fileId}`);
    } catch (error) {
      console.error('Upload failed:', error);
      addToast('Failed to upload file. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Excel File</h1>
        <p className="mt-2 text-gray-600">
          Upload an Excel file containing your KPI data for mapping and configuration.
        </p>
      </div>

      <Card>
        <div 
          className={`
            border-2 border-dashed rounded-lg p-8 text-center
            ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
            ${file ? 'bg-success-50 border-success-300' : ''}
            transition-colors duration-200
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center">
            {file ? (
              <>
                <div className="bg-success-100 rounded-full p-3 mb-4">
                  <Check className="h-8 w-8 text-success-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">File Selected:</h3>
                <div className="flex items-center mb-4">
                  <FileSpreadsheet className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-600">{file.name}</span>
                </div>
              </>
            ) : (
              <>
                <div className="bg-gray-100 rounded-full p-3 mb-4">
                  <Upload className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Drop your Excel file here</h3>
                <p className="text-gray-500 mb-4">or click to browse files</p>
              </>
            )}

            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
            />

            {!file && (
              <label htmlFor="file-upload">
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                >
                  Select File
                </Button>
              </label>
            )}

            {file && (
              <div className="flex space-x-4 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setFile(null)}
                >
                  Change File
                </Button>
                <Button
                  variant="primary"
                  onClick={handleUpload}
                  isLoading={isUploading}
                >
                  Upload & Continue
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-start text-sm text-gray-500">
            <AlertCircle className="h-5 w-5 text-warning-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-700">Important Notes:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Upload Excel (.xls, .xlsx) files only</li>
                <li>Maximum file size: 5MB</li>
                <li>Your Excel file should have headers in the first row</li>
                <li>File should contain KPI-related data for proper mapping</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UploadExcel;