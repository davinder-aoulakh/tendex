import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FallbackScopeQuestions({ answers, onSubmit }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({
    has_known_suppliers: null,
    procurement_type_detail: null,
    scope_detail_level: null,
  });

  const questions = [
    {
      key: 'has_known_suppliers',
      title: 'Do you have known suppliers for this procurement?',
      options: [
        { value: 'yes', label: 'Yes — I have specific suppliers in mind', description: 'I can identify and approach particular suppliers' },
        { value: 'no',  label: 'No — I want to explore the market', description: "I'm not sure who can deliver this" },
      ],
    },
    {
      key: 'procurement_type_detail',
      title: 'What is the primary focus of your procurement?',
      options: [
        { value: 'goods',    label: 'Goods — products and materials',      description: 'We need physical items supplied' },
        { value: 'services', label: 'Services — labour and expertise',     description: 'We need professional services' },
        { value: 'both',     label: 'Both — goods and services together',  description: 'Goods + services as part of one engagement' },
      ],
    },
    {
      key: 'scope_detail_level',
      title: 'How detailed is your scope description?',
      options: [
        { value: 'detailed',     label: 'Detailed — I've defined requirements clearly', description: 'Specifications are clear and comprehensive' },
        { value: 'high_level',   label: 'High-level — I have a general idea',        description: 'I need market input to refine requirements' },
      ],
    },
  ];

  const q = questions[currentQuestion];
  const isComplete = Object.values(responses).every(v => v !== null);

  const handleSelect = (value) => {
    setResponses(prev => ({ ...prev, [q.key]: value }));
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleSubmit = () => {
    if (isComplete) {
      onSubmit(responses);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-1">{q.title}</h3>
        <div className="w-full bg-blue-400/20 rounded-full h-1 mt-4">
          <div
            className="bg-blue-400 h-1 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-blue-200/50 mt-2">Question {currentQuestion + 1} of {questions.length}</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {q.options.map(opt => {
          const isSelected = responses[q.key] === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                isSelected
                  ? 'border-blue-400 bg-blue-400/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all ${
                    isSelected
                      ? 'border-blue-400 bg-blue-400'
                      : 'border-white/30'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-950" />}
                </div>
                <div>
                  <p className="text-white font-medium">{opt.label}</p>
                  <p className="text-sm text-blue-200/50 mt-1">{opt.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="text-white/50 disabled:opacity-50 disabled:cursor-not-allowed hover:text-white transition-colors"
        >
          ← Back
        </button>
        {currentQuestion === questions.length - 1 && isComplete ? (
          <Button
            onClick={handleSubmit}
            className="gap-2 px-6 bg-blue-500 hover:bg-blue-400 text-white border-0 shadow-lg shadow-blue-500/20"
          >
            Proceed to Document Type <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestion(prev => prev + 1)}
            disabled={responses[q.key] === null}
            className="gap-2 px-6 bg-blue-500 hover:bg-blue-400 text-white border-0 shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            Next <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}