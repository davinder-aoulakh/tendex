import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { getVisiblePages, getVisibleFields, validatePage } from '@/lib/questionnaireConfig';
import QuestionField from '@/components/questionnaire/QuestionField';
import MilestoneTable from '@/components/questionnaire/MilestoneTable';
import StepIndicator from '@/components/questionnaire/StepIndicator';
import GeneratingScreen from '@/components/document/GeneratingScreen';
import ScopeScoreResult from '@/components/questionnaire/ScopeScoreResult';
import { scoreScopeAnswers } from '@/lib/scopeScorer';

const SESSION_KEY = (type) => `tendex_questionnaire_${type}`;
// Persists the full answers (including procurement_type branch) to localStorage
// so the user resumes on the correct path across sessions.
const LOCAL_KEY = (type) => `tendex_answers_${type}`;
const ANON_ID_KEY = 'tendex_anonymous_user_id';

const getOrCreateAnonId = () => {
  try {
    let id = localStorage.getItem(ANON_ID_KEY);
    if (!id) {
      id = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(ANON_ID_KEY, id);
    }
    return id;
  } catch { return null; }
};

export default function Questionnaire() {
  const { type } = useParams();
  const navigate = useNavigate();

  // Load from sessionStorage first, fall back to localStorage (cross-session persistence)
  const loadSaved = () => {
    try {
      const session = sessionStorage.getItem(SESSION_KEY(type));
      if (session) return JSON.parse(session);
      const local = localStorage.getItem(LOCAL_KEY(type));
      if (local) return JSON.parse(local);
    } catch {}
    return {};
  };

  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in
  const [anonId] = useState(() => getOrCreateAnonId());
  const [answers, setAnswers] = useState(loadSaved);
  const [currentStep, setCurrentStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generatingDone, setGeneratingDone] = useState(false);
  const [createdDocId, setCreatedDocId] = useState(null);
  const [errors, setErrors] = useState([]);
  // Scope scoring step (SOW only, after last questionnaire page)
  const [showScoring, setShowScoring] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [scoreData, setScoreData] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => setUser(null)); }, []);

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  // For authenticated users: fetch their documents; for anonymous: fetch by anon ID
  const { data: documents = [] } = useQuery({
    queryKey: ['documents-count', user?.email, anonId],
    queryFn: () => {
      if (user?.email) {
        return base44.entities.Document.filter({ created_by: user.email });
      }
      if (anonId) {
        return base44.entities.Document.filter({ anonymous_user_id: anonId });
      }
      return [];
    },
    enabled: user !== undefined, // wait until auth check resolves
  });

  const currentSub = subscriptions[0];
  const currentPlan = currentSub?.plan || 'free';
  const planLimits = { free: 3, starter: 20, professional: 999 };
  const docsLimit = planLimits[currentPlan] || 3;
  const atLimit = documents.length >= docsLimit && docsLimit !== 999;

  // Recompute visible pages whenever answers change
  const visiblePages = getVisiblePages(type, answers);
  const totalSteps = visiblePages.length;
  const page = visiblePages[currentStep] || visiblePages[0];
  const isLastStep = currentStep === totalSteps - 1;

  // Persist to both sessionStorage and localStorage on every answer change
  useEffect(() => {
    try {
      const blob = JSON.stringify(answers);
      sessionStorage.setItem(SESSION_KEY(type), blob);
      localStorage.setItem(LOCAL_KEY(type), blob);
    } catch {}
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
    } else if (type === 'SOW' && !showScoring) {
      // SOW: run scoring before generating
      setShowScoring(true);
      setScoring(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const result = await scoreScopeAnswers(answers);
      setScoreData(result);
      setScoring(false);
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

  const handleGenerate = async (finalDocType, overrideDocType) => {
    setGenerating(true);
    const resolvedType = overrideDocType || finalDocType || type;
    const docData = {
      title: answers.project_name || answers.rfq_title || answers.eoi_title || `${resolvedType} Document — ${new Date().toLocaleDateString('en-AU')}`,
      document_type: resolvedType,
      status: 'draft',
      // Full answers snapshot — includes procurement_type branch key so the
      // user can resume on the correct path in a later session.
      questionnaire_data: {
        ...answers,
        // Log AI recommendation and any override with timestamp
        ...(scoreData ? { _ai_recommended_type: scoreData.recommendation } : {}),
        ...(overrideDocType ? { _user_override_type: overrideDocType, _override_timestamp: new Date().toISOString() } : {}),
      },
      project_name: answers.project_name || answers.rfq_title || '',
      organisation_name: answers.organisation_name || answers.company_name || '',
      industry: answers.industry || answers.service_type || answers.procurement_type || '',
    };
    if (!user && anonId) {
      docData.anonymous_user_id = anonId;
    }
    const doc = await base44.entities.Document.create(docData);
    try {
      sessionStorage.removeItem(SESSION_KEY(type));
      localStorage.removeItem(LOCAL_KEY(type));
    } catch {}
    setCreatedDocId(doc.id);
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

        {/* Limit gate */}
        {atLimit && (
          <div className="mb-8 rounded-xl border border-red-400/30 p-5 text-center" style={{ background: 'rgba(239,68,68,0.08)' }}>
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white mb-1">Document limit reached</h3>
            <p className="text-sm text-red-300/80 mb-4">You've used all {docsLimit} documents on your {currentPlan} plan. Upgrade to create more.</p>
            <Link to="/billing">
              <Button className="bg-blue-500 hover:bg-blue-400 text-white border-0">Upgrade Plan</Button>
            </Link>
          </div>
        )}

        {/* Step indicator — hidden during scoring step */}
        {!showScoring && (
          <div className="mb-8">
            <StepIndicator currentStep={currentStep} totalSteps={totalSteps} visiblePages={visiblePages} />
          </div>
        )}

        {/* ── SCOPE SCORING STEP (SOW only, after last page) ── */}
        {showScoring ? (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">AI Scope Review</h2>
              <p className="text-sm text-blue-200/50">We've analysed your answers to recommend the best next step.</p>
            </div>

            {scoring ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                <p className="text-blue-200/50 text-sm">Evaluating your scope...</p>
              </div>
            ) : (
              <ScopeScoreResult
                scoreData={scoreData}
                onProceed={(recommendedType) => handleGenerate(recommendedType, null)}
                onOverride={(chosenType) => handleGenerate(scoreData?.recommendation, chosenType)}
              />
            )}

            {/* Back to questionnaire */}
            {!scoring && (
              <div className="mt-8">
                <Button variant="ghost" onClick={() => { setShowScoring(false); setScoreData(null); }}
                  className="text-white/50 hover:text-white hover:bg-white/10 border border-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Questions
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
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
                        docType={type}
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

              <Button size="lg" onClick={handleNext} disabled={generating || atLimit}
                className="gap-2 px-8 bg-blue-500 hover:bg-blue-400 text-white border-0 shadow-lg shadow-blue-500/20">
                {generating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Creating document...</>
                ) : isLastStep ? (
                  <><Sparkles className="w-4 h-4" />Review Scope</>
                ) : (
                  <>Next <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}