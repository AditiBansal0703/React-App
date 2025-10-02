import React from 'react';
import Input from '../../ui/Input';

const questionTypes = [
  { value: 'short-text', label: 'Short Text' },
  { value: 'long-text', label: 'Long Text' },
  { value: 'numeric', label: 'Number' },
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'checkboxes', label: 'Checkboxes' }
];

export default function QuestionEditor({ question, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...question, [field]: value });
  };

  return (
    <div className="border rounded p-4 space-y-4 bg-gray-50">
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            label="Question"
            value={question.label}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder="Enter your question"
          />
        </div>
        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={question.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {questionTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(question.type === 'multiple-choice' || question.type === 'checkboxes') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options
          </label>
          <div className="space-y-2">
            {(question.options || []).map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(question.options || [])];
                    newOptions[index] = e.target.value;
                    handleChange('options', newOptions);
                  }}
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newOptions = question.options.filter((_, i) => i !== index);
                    handleChange('options', newOptions);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newOptions = [...(question.options || []), ''];
                handleChange('options', newOptions);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Option
            </button>
          </div>
        </div>
      )}

      {question.type === 'numeric' && (
        <div className="flex gap-4">
          <Input
            type="number"
            label="Minimum"
            value={question.min || ''}
            onChange={(e) => handleChange('min', parseInt(e.target.value))}
          />
          <Input
            type="number"
            label="Maximum"
            value={question.max || ''}
            onChange={(e) => handleChange('max', parseInt(e.target.value))}
          />
        </div>
      )}

      <div className="flex items-center">
        <input
          type="checkbox"
          id={`required-${question.id}`}
          checked={question.required}
          onChange={(e) => handleChange('required', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label
          htmlFor={`required-${question.id}`}
          className="ml-2 text-sm text-gray-700"
        >
          Required
        </label>
      </div>
    </div>
  );
}