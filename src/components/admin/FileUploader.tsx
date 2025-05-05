import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Trash2, AlertCircle, X } from 'lucide-react';
import * as xlsx from 'xlsx';

interface UploadedFile {
  filename: string;
  columns: string[];
}

interface UploadedFiles {
  base: UploadedFile | null;
  hierarchy: UploadedFile | null;
  lookup: Record<string, UploadedFile>;
}

interface FileUploaderProps {
  uploadedFiles: UploadedFiles;
  onUpload: (files: UploadedFiles) => void;
}

type FileCategory = 'base' | 'hierarchy' | 'lookup';

const FileUploader: React.FC<FileUploaderProps> = ({ uploadedFiles, onUpload }) => {
  const [selectedCategory, setSelectedCategory] = useState<FileCategory>('base');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid Excel file (.xls or .xlsx)');
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size should not exceed 5MB');
      return false;
    }

    return true;
  };

  const processFile = async (file: File) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = xlsx.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = xlsx.utils.sheet_to_json(firstSheet, { header: 1 });
          
          // Get headers (first row)
          const headers = jsonData[0] as string[];

          const newFile: UploadedFile = {
            filename: file.name,
            columns: headers,
          };

          let updatedFiles = { ...uploadedFiles };

          if (selectedCategory === 'lookup') {
            updatedFiles.lookup = {
              ...updatedFiles.lookup,
              [file.name]: newFile,
            };
          } else {
            updatedFiles[selectedCategory] = newFile;
          }

          onUpload(updatedFiles);
          setError('');
        } catch (err) {
          console.error('Error processing Excel file:', err);
          setError('Failed to process Excel file. Please ensure it\'s a valid format.');
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error('Error reading file:', err);
      setError('Failed to read file. Please try again.');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      await processFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      await processFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (category: FileCategory, filename?: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    let updatedFiles = { ...uploadedFiles };

    if (category === 'lookup' && filename) {
      const { [filename]: _, ...remainingLookups } = updatedFiles.lookup;
      updatedFiles.lookup = remainingLookups;
    } else {
      updatedFiles[category] = null;
    }

    onUpload(updatedFiles);
  };

  const renderFileList = () => {
    const files: { category: FileCategory; filename: string }[] = [];

    if (uploadedFiles.base) {
      files.push({
        category: 'base',
        filename: uploadedFiles.base.filename,
      });
    }

    if (uploadedFiles.hierarchy) {
      files.push({
        category: 'hierarchy',
        filename: uploadedFiles.hierarchy.filename,
      });
    }

    Object.entries(uploadedFiles.lookup).forEach(([filename]) => {
      files.push({
        category: 'lookup',
        filename,
      });
    });

    if (files.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No files uploaded yet
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                File
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {files.map((file) => (
              <tr key={file.filename} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="capitalize">{file.category}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">{file.filename}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-success-600">
                  Uploaded
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleDelete(file.category, file.filename)}
                    className="text-error-600 hover:text-error-900"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">File Configuration</h2>
          <p className="mt-1 text-sm text-gray-500">
            Upload Excel files for KPI configuration
          </p>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as FileCategory)}
          className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="base">Base Data</option>
          <option value="hierarchy">Hierarchy Data</option>
          <option value="lookup">Lookup Data</option>
        </select>
      </div>

      <div
        className={`
          border-2 border-dashed rounded-lg p-8
          ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center">
          <Upload className="h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-900">
            Drag and drop your Excel file here
          </p>
          <p className="mt-1 text-sm text-gray-500">
            or click to browse files
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Select File
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-error-600 bg-error-50 p-3 rounded-md">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {renderFileList()}
    </div>
  );
};

export default FileUploader;