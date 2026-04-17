import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import AppLayout from '@/components/layout/AppLayout';
import { getVisiblePages, getVisibleFields, validatePage } from '@/lib/questionnaireConfig';
import QuestionField from '@/components/questionnaire/QuestionField';
import MilestoneTable from '@/components/questionnaire/MilestoneTable';
import StepIndicator from '@/components/questionnaire/StepIndicator';

const SESSION_KEY = (type) => `tendex_questionnaire_${type}`;

export default function Questionnaire() {
  const { type } = useParams();
  const navigate = useNavigate();

  // Load from session storage if available
  const loadSaved = () => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY(type));
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  };

  const [answers, setAnswers] = useState(loadSaved);
  const [currentStep, setCurrentStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [errors, setErrors] = useState([]);

  // Recompute visible pages whenever answers change
  const visiblePages = getVisiblePages(type, answers);
  const totalSteps = visiblePages.length;
  const page = visiblePages[currentStep] || visiblePages[0];
  const isLastStep = currentStep === totalSteps - 1;

  // Persist to session storage on every answer change
  useEffect(() => {
    try { sessionStorage.setItem(SESSION_KEY(type), JSON.stringify(answers)); } catch {}
  }, [answers, type]);

  // Reset step if visible pages shrink
  useEffect(() => {
    if (currentStep >= visiblePages.length) {
      setCurrentStep(Math.max(0, visiblePages.length - 1));
    }
  }, [visiblePages.length]);

  const updateAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    setErrors(prev => prev.filter(e => e !== key));
  };

  const handleNext = async () => {
    const pageErrors = validatePage(page, answers);
    if (pageErrors.length > 0) {
      setErrors(pageErrors);
      return;
    }
    setErrors([]);
    if (!isLastStep) {
      setCurrentStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      await handleGenerate();
    }
  };

  const handleBack = () => {
    setErrors([]);
    if (currentStep === 0) {
      navigate('/tool-select');
    } else {
      setCurrentStep(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    const doc = await base44.entities.Document.create({
      title: answers.project_name || answers.rfq_title || answers.eoi_title || `${type} Document — ${new Date().toLocaleDateString('en-AU')}`,
      document_type: type,
      status: 'draft',
      questionnaire_data: answers,
      project_name: answers.project_name || answers.rfq_title || '',
      organisation_name: answers.organisation_name || answers.company_name || '',
      industry: answers.industry || answers.service_type || answers.procurement_type || '',
    });
    // Clear session storage after successful creation
    try { sessionStorage.removeItem(SESSION_KEY(type)); } catch {}
    navigate(`/document/${doc.id}?generating=true`);
  };

  const visibleFields = page ? getVisibleFields(page, answers) : [];

  const docTypeLabels = {
    SOW: 'Scope of Work',
    EOI: 'Expression of Interest',
    RFQ: 'Request for Quotation',
    RFP: 'Request for Proposal',
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-blue-200/50 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="border border-blue-400/30 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide"
              style={{ background: 'rgba(59,130,246,0.1)' }}>
              {type}
            </span>
            <h1 className="font-display text-2xl font-semibold text-white">{docTypeLabels[type] || type}</h1>
          </div>
          <p className="text-blue-200/50 text-sm">Answer a few questions and AI will draft your document.</p>
        </div>

        {/* Step indicator */}
        <div className="mb-8">
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        </div>

        {/* Page */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page?.id || currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Page header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">{page?.title}</h2>
              {page?.description && <p className="text-sm text-blue-200/50">{page.description}</p>}
            </div>

            {/* Validation banner */}
            {errors.length > 0 && (
              <div className="mb-5 flex items-center gap-2 text-sm text-red-400 border border-red-400/30 rounded-lg px-4 py-3"
                style={{ background: 'rgba(239,68,68,0.08)' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Please complete all required fields before continuing.
              </div>
            )}

            {/* Fields */}
            <div className="space-y-6">
              {visibleFields.map(field => (
                field.type === 'milestone-table' ? (
                  <div key={field.key} className="space-y-2">
                    <div className="text-sm font-medium text-blue-100/80">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </div>
                    <MilestoneTable
                      value={answers[field.key]}
                      onChange={val => updateAnswer(field.key, val)}
                      error={errors.includes(field.key)}
                    />
                  </div>
                ) : (
                  <QuestionField
                    key={field.key}
                    field={field}
                    value={answers[field.key]}
                    onChange={val => updateAnswer(field.key, val)}
                    error={errors.includes(field.key)}
                  />
                )
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-10 flex justify-between items-center">
          <Button variant="ghost" onClick={handleBack}
            className="text-white/50 hover:text-white hover:bg-white/10 border border-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <Button size="lg" onClick={handleNext} disabled={generating}
            className="gap-2 px-8 bg-blue-500 hover:bg-blue-400 text-white border-0 shadow-lg shadow-blue-500/20">
            {generating ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Creating document...</>
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