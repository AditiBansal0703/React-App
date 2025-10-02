import React, { useState } from 'react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import QuestionEditor from './QuestionEditor';

export default function AssessmentBuilder({ jobId, initialData, onSave }) {
  const [assessment, setAssessment] = useState(initialData || {
    jobId,
    title: '',
    sections: [
      {
        id: 'sec1',
        title: 'Basic Information',
        questions: []
      }
    ]
  });

  const addQuestion = (sectionId) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            questions: [
              ...section.questions,
              {
                id: `q${section.questions.length + 1}`,
                type: 'short-text',
                label: '',
                required: false
              }
            ]
          };
        }
        return section;
      })
    }));
  };

  const updateQuestion = (sectionId, questionId, updates) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            questions: section.questions.map(q => 
              q.id === questionId ? { ...q, ...updates } : q
            )
          };
        }
        return section;
      })
    }));
  };

  const addSection = () => {
    setAssessment(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: `sec${prev.sections.length + 1}`,
          title: 'New Section',
          questions: []
        }
      ]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(assessment);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <Input
          label="Assessment Title"
          value={assessment.title}
          onChange={(e) => setAssessment(prev => ({ ...prev, title: e.target.value }))}
          required
        />

        {assessment.sections.map((section, index) => (
          <div key={section.id} className="border rounded-lg p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between">
              <Input
                value={section.title}
                onChange={(e) => {
                  setAssessment(prev => ({
                    ...prev,
                    sections: prev.sections.map(s => 
                      s.id === section.id ? { ...s, title: e.target.value } : s
                    )
                  }));
                }}
                className="text-xl font-medium"
              />
            </div>

            <div className="space-y-4">
              {section.questions.map((question) => (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  onChange={(updates) => updateQuestion(section.id, question.id, updates)}
                />
              ))}
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => addQuestion(section.id)}
            >
              Add Question
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="secondary" onClick={addSection}>
          Add Section
        </Button>
        <Button type="submit" variant="primary">
          Save Assessment
        </Button>
      </div>
    </form>
  );
}