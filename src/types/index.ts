export interface KPIThresholds {
  min: number;
  target: number;
  exceptional: number;
}

export interface KPIMetric {
  id: string;
  name: string;
  description: string;
  targetField: string;
  actualField: string;
  weight: number;
  thresholds: KPIThresholds;
}

export interface KPIConfiguration {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  metrics: KPIMetric[];
}

export interface FieldMapping {
  systemField: string;
  excelHeader: string;
}

export interface UploadResponse {
  fileId: string;
  message: string;
}

export interface HeaderResponse {
  headers: string[];
}