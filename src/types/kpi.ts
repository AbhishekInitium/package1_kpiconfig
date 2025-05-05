import { LookupStep } from '../components/kpi/LookupCriteriaChainBuilder';

export interface BaseDataMapping {
  agentField: string;
  txnIdField: string;
  txnDateField: string;
  amountField: string;
}

export interface GlobalVariable {
  name: string;
  description: string;
  dataType: 'Currency' | 'String' | 'Number' | 'Date';
}

export interface QualificationRule {
  id: string;
  kpiName: string;
  description: string;
  sourceField: string;
  valueType: 'Fixed' | 'Lookup';
  evaluationLevel: 'Per Record' | 'Per Agent';
  aggregation: 'N/A' | 'Sum' | 'Average' | 'Max' | 'Min';
  lookupTable?: {
    file: string;
    keyFields: string[];
    valueField: string;
  };
}

export interface AdjustmentRule {
  id: string;
  kpiName: string;
  description: string;
  conditionField: string;
  adjustFrom: string;
  adjustWhat: string;
  direction: 'Increase' | 'Decrease';
  type: 'Percentage' | 'Absolute';
  valueType: 'Fixed' | 'Lookup';
  value?: number;
  lookupChain?: LookupStep[];
}

export interface ExclusionRule {
  id: string;
  kpiName: string;
  description: string;
  sourceField: string;
  statusUpdate: string;
}

export interface CreditHierarchy {
  id: string;
  managerField: string;
  validFromField: string;
  validToField: string;
}

export interface KPIVersion {
  version: string;
  savedOn: string;
  description: string;
  status: 'Current' | 'Previous' | 'Deprecated';
  data: {
    baseDataMapping: BaseDataMapping;
    globalVariables: GlobalVariable[];
    qualificationRules: QualificationRule[];
    adjustmentRules: AdjustmentRule[];
    exclusionRules: ExclusionRule[];
    creditHierarchy: CreditHierarchy;
  };
}

export interface KPIConfiguration {
  caseFileId: string;
  createdOn: string;
  createdBy: string;
  versions: KPIVersion[];
}