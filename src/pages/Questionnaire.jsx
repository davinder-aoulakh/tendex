import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import AppLayout from '@/components/layout/AppLayout';
import { getQuestions } from '@/lib/questionnaireConfig';
import QuestionField from '@/components/questionnaire/QuestionField';
import StepIndicator from '@/components/questionnaire/StepIndicator';

export default function Questionnaire() {
  const { type } = useParams();
  const navigate = useNavigate();
  const questions = getQuestions(type);
  const steps = Math.ceil(questions.length / 3);

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [generating, setGenerating] = useState(false);

  const stepQuestions = questions.slice(currentStep * 3, currentStep * 3 + 3);
  const isLastStep = currentStep === steps - 1;

  const updateAnswer = (key, value) => setAnswers(prev => ({ ...prev, [key]: value }));

  const handleNext = async () => {
    if (!isLastStep) {
      setCurrentStep(s => s + 1);
    } else {
      await handleGenerate();
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    const doc = await base44.entities.Document.create({
      title: answers.project_name || answers.title || `${type} Document - ${new Date().toLocaleDateString()}`,
      document_type: type,
      status: 'draft',
      questionnaire_data: answers,
      project_name: answers.project_name || '',
      organisation_name: answers.organisation_name || '',
      industry: answers.industry || '',
    });
    navigate(`/document/${doc.id}?generating=true`);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <button onClick={() => currentStep === 0 ? navigate('/tool-select') : setCurrentStep(s => s - 1)}
            className="flex items-center gap-1.5 text-sm text-blue-200/50 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3 mb-2">
            <span className="border border-blue-400/30 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide" style={{ background: 'rgba(59,130,246,0.1)' }}>{type}</span>
            <h1 className="font-display text-2xl font-semibold text-white">Tell us about your project</h1>
          </div>
          <p className="text-blue-200/50">Answer a few questions and AI will draft your document.</p>
        </div>

        <StepIndicator currentStep={currentStep} totalSteps={steps} />

        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }} className="space-y-6 mt-8">
            {stepQuestions.map(q => (
              <QuestionField key={q.key} question={q} value={answers[q.key] || ''} onChange={v => updateAnswer(q.key, v)} />
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex justify-between items-center">
          <span className="text-sm text-blue-200/40">Step {currentStep + 1} of {steps}</span>
          <Button size="lg" onClick={handleNext} disabled={generating}
            className="gap-2 px-8 bg-blue-500 hover:bg-blue-400 text-white border-0 shadow-lg shadow-blue-500/20">
            {generating ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Generating Document...</>
            ) : isLastStep ? (
              <><Sparkles className="w-4 h-4" />Generate with AI</>
            ) : (
              <>Next <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}