import { KPIConfiguration, FieldMapping, UploadResponse, HeaderResponse } from '../types';

const API_URL = '/api';

// Helper function for handling fetch responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'An error occurred');
  }
  return response.json();
};

// Upload an Excel file
export const uploadExcelFile = async (formData: FormData): Promise<UploadResponse> => {
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
};

// Get Excel file headers
export const getExcelHeaders = async (fileId: string): Promise<HeaderResponse> => {
  const response = await fetch(`${API_URL}/headers/${fileId}`);
  return handleResponse(response);
};

// Save field mapping
export const saveMapping = async (fileId: string, mappings: FieldMapping[]): Promise<void> => {
  const response = await fetch(`${API_URL}/mapping/${fileId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mappings }),
  });
  return handleResponse(response);
};

// Fetch all configurations
export const fetchConfigurations = async (): Promise<KPIConfiguration[]> => {
  // This is a temporary mock implementation
  // In a real app, we would fetch from the server
  return Promise.resolve([]);
};

// Save a configuration
export const saveConfiguration = async (config: KPIConfiguration): Promise<KPIConfiguration> => {
  const response = await fetch(`${API_URL}/configurations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });
  return handleResponse(response);
};

// Delete a configuration
export const deleteConfiguration = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/configurations/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};