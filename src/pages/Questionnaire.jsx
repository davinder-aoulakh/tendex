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

    // Create document record
    const doc = await base44.entities.Document.create({
      title: answers.project_name || answers.title || `${type} Document - ${new Date().toLocaleDateString()}`,
      document_type: type,
      status: 'draft',
      questionnaire_data: answers,
      project_name: answers.project_name || '',
      organisation_name: answers.organisation_name || '',
      industry: answers.industry || '',
    });

    // Trigger AI content generation (pass doc ID)
    navigate(`/document/${doc.id}?generating=true`);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <button onClick={() => currentStep === 0 ? navigate('/tool-select') : setCurrentStep(s => s - 1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">{type}</span>
            <h1 className="font-display text-2xl font-semibold text-foreground">Tell us about your project</h1>
          </div>
          <p className="text-muted-foreground">Answer a few questions and AI will draft your document.</p>
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
          <span className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps}</span>
          <Button size="lg" onClick={handleNext} disabled={generating} className="gap-2 px-8">
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