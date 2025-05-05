import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ArrowDown } from 'lucide-react';

export interface LookupStep {
  stepId: number;
  sourceFields: string[];
  targetFile: string;
  targetKeyFields: string[];
  returnedFields: string[];
  resultVariable: string;
  finalResultField?: string;
  lookupApplicationMode?: "Fixed" | "Percentage";
}

interface LookupCriteriaChainBuilderProps {
  lookupChain: LookupStep[];
  onChange: (updatedChain: LookupStep[]) => void;
  onDone?: () => void;
  availableFiles: string[];
  baseFields: string[];
  fileColumns: Record<string, string[]>;
}

const LookupCriteriaChainBuilder: React.FC<LookupCriteriaChainBuilderProps> = ({
  lookupChain = [], // Provide default empty array
  onChange,
  onDone,
  availableFiles,
  baseFields,
  fileColumns,
}) => {
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});
  const chainEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      chainEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  const validateResultVariable = (value: string, stepId: number): string => {
    if (!value.trim()) {
      return 'Result variable name is required';
    }
    
    const isDuplicate = lookupChain.some(
      step => step.stepId !== stepId && step.resultVariable === value
    );
    
    if (isDuplicate) {
      return 'Result variable name must be unique';
    }
    
    return '';
  };

  const validateChain = (): boolean => {
    if (lookupChain.length === 0) {
      return false;
    }

    const lastStep = lookupChain[lookupChain.length - 1];
    return !!(
      lastStep.sourceFields.length > 0 &&
      lastStep.targetFile &&
      lastStep.targetKeyFields.length > 0 &&
      lastStep.returnedFields.length > 0 &&
      lastStep.finalResultField &&
      lastStep.lookupApplicationMode
    );
  };

  const getAvailableSourceFields = (stepIndex: number): string[] => {
    if (stepIndex === 0) {
      return baseFields;
    }

    const previousStepResults = lookupChain
      .slice(0, stepIndex)
      .map(s => s.resultVariable)
      .filter(Boolean);

    return [...baseFields, ...previousStepResults];
  };

  const handleAddStep = () => {
    const newStepId = lookupChain.length === 0 ? 1 : Math.max(...lookupChain.map(s => s.stepId)) + 1;
    
    const newStep: LookupStep = {
      stepId: newStepId,
      sourceFields: [],
      targetFile: '',
      targetKeyFields: [],
      returnedFields: [],
      resultVariable: `step${newStepId}_result`,
    };

    const updatedChain = [...lookupChain, newStep];
    
    // Remove final result fields from previous last step if it exists
    if (lookupChain.length > 0) {
      const previousLastStep = updatedChain[updatedChain.length - 2];
      delete previousLastStep.finalResultField;
      delete previousLastStep.lookupApplicationMode;
    }

    onChange(updatedChain);
    scrollToBottom();
  };

  const handleRemoveStep = (stepId: number) => {
    const updatedChain = lookupChain
      .filter(step => step.stepId !== stepId)
      .map((step, index) => ({
        ...step,
        stepId: index + 1,
        resultVariable: `step${index + 1}_result`,
      }));

    const finalChain = updatedChain.map((step, index) => {
      const availableFields = getAvailableSourceFields(index);
      return {
        ...step,
        sourceFields: step.sourceFields.filter(field => availableFields.includes(field)),
      };
    });
    
    const updatedErrors = { ...errors };
    delete updatedErrors[stepId];
    setErrors(updatedErrors);
    
    onChange(finalChain);
  };

  const handleStepChange = (stepId: number, field: keyof LookupStep, value: any) => {
    const updatedChain = lookupChain.map(step => {
      if (step.stepId === stepId) {
        const updates: Partial<LookupStep> = { [field]: value };

        if (field === 'targetFile') {
          updates.targetKeyFields = [];
          updates.returnedFields = [];
          updates.finalResultField = undefined;
        }
        
        if (field === 'resultVariable') {
          const error = validateResultVariable(value as string, stepId);
          setErrors(prev => ({
            ...prev,
            [stepId]: {
              ...prev[stepId],
              resultVariable: error,
            },
          }));
        }

        if (field === 'returnedFields' && step.finalResultField) {
          const newReturnedFields = value as string[];
          if (!newReturnedFields.includes(step.finalResultField)) {
            updates.finalResultField = undefined;
          }
        }

        return { ...step, ...updates };
      }
      return step;
    });

    onChange(updatedChain);
  };

  const renderStepPreview = (step: LookupStep): string | null => {
    if (!step.sourceFields.length || !step.targetFile || 
        !step.targetKeyFields.length || !step.returnedFields.length || 
        !step.resultVariable) {
      return null;
    }

    const sourceFieldsText = step.sourceFields.join(', ');
    const keyFieldsText = step.targetKeyFields
      .map(field => `${field} = {selected}`)
      .join(', ');
    const returnedFieldsText = step.returnedFields.join(', ');
    const finalResultText = step.finalResultField 
      ? ` → Final: ${step.finalResultField}` 
      : '';

    return `Source: ${sourceFieldsText} → Lookup File: ${step.targetFile} → Key: ${keyFieldsText} → Returns: ${returnedFieldsText}${finalResultText}`;
  };

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto px-2">
      {lookupChain.map((step, index) => {
        const isLastStep = index === lookupChain.length - 1;
        const targetFileColumns = step.targetFile ? fileColumns[step.targetFile] || [] : [];

        return (
          <div
            key={step.stepId}
            id={`lookup-step-${step.stepId}`}
            className="bg-white rounded-lg border border-gray-200 p-6 relative"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Step {step.stepId}
              </h3>
              {lookupChain.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveStep(step.stepId)}
                  className="text-error-600 hover:text-error-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Result Variable Name
                  <span className="text-error-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={step.resultVariable}
                  onChange={(e) => handleStepChange(step.stepId, 'resultVariable', e.target.value)}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                    errors[step.stepId]?.resultVariable ? 'border-error-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter result variable name"
                />
                {errors[step.stepId]?.resultVariable ? (
                  <p className="mt-1 text-sm text-error-500">
                    {errors[step.stepId].resultVariable}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    This value will be used as input in the next step if chaining
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source Fields
                </label>
                <select
                  multiple
                  value={step.sourceFields}
                  onChange={(e) => {
                    const selectedOptions = Array.from(
                      e.target.selectedOptions,
                      option => option.value
                    );
                    handleStepChange(step.stepId, 'sourceFields', selectedOptions);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  size={4}
                >
                  {getAvailableSourceFields(index).map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Hold Ctrl/Cmd to select multiple fields
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target File
                </label>
                <select
                  value={step.targetFile}
                  onChange={(e) => handleStepChange(step.stepId, 'targetFile', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">Select a file</option>
                  {availableFiles.map((file) => (
                    <option key={file} value={file}>
                      {file}
                    </option>
                  ))}
                </select>
              </div>

              {step.targetFile && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Key Fields
                    </label>
                    <select
                      multiple
                      value={step.targetKeyFields}
                      onChange={(e) => {
                        const selectedOptions = Array.from(
                          e.target.selectedOptions,
                          option => option.value
                        );
                        handleStepChange(step.stepId, 'targetKeyFields', selectedOptions);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      size={4}
                    >
                      {targetFileColumns.map((column) => (
                        <option key={column} value={column}>
                          {column}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Hold Ctrl/Cmd to select multiple fields
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Returned Fields
                    </label>
                    <select
                      multiple
                      value={step.returnedFields}
                      onChange={(e) => {
                        const selectedOptions = Array.from(
                          e.target.selectedOptions,
                          option => option.value
                        );
                        handleStepChange(step.stepId, 'returnedFields', selectedOptions);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      size={4}
                    >
                      {targetFileColumns.map((column) => (
                        <option key={column} value={column}>
                          {column}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Hold Ctrl/Cmd to select multiple fields
                    </p>
                  </div>

                  {isLastStep && step.returnedFields.length > 0 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Result Field to Apply
                        </label>
                        <select
                          value={step.finalResultField || ''}
                          onChange={(e) => handleStepChange(step.stepId, 'finalResultField', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                          <option value="">Select result field</option>
                          {step.returnedFields.map((field) => (
                            <option key={field} value={field}>
                              {field}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          How to Apply Returned Value
                        </label>
                        <select
                          value={step.lookupApplicationMode || 'Fixed'}
                          onChange={(e) => handleStepChange(
                            step.stepId,
                            'lookupApplicationMode',
                            e.target.value as 'Fixed' | 'Percentage'
                          )}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                          <option value="Fixed">Fixed Value</option>
                          <option value="Percentage">Percentage</option>
                        </select>
                      </div>
                    </>
                  )}
                </>
              )}

              {renderStepPreview(step) && (
                <div className="mt-2 text-sm text-gray-600 italic border-l-2 border-gray-300 pl-3">
                  Step {step.stepId} Preview: {renderStepPreview(step)}
                </div>
              )}
            </div>

            {index < lookupChain.length - 1 && (
              <div className="flex justify-center my-4">
                <ArrowDown className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
        );
      })}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleAddStep}
          className="py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Lookup Step
        </button>

        {onDone && (
          <button
            type="button"
            onClick={onDone}
            disabled={!validateChain()}
            className={`px-4 py-2 rounded-md text-white ${
              validateChain()
                ? 'bg-primary-600 hover:bg-primary-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Done
          </button>
        )}
      </div>
      
      <div ref={chainEndRef} />
    </div>
  );
};

export default LookupCriteriaChainBuilder;