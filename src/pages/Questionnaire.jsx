import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Loader2, AlertCircle, Check } from 'lucide-react';
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
import AIScopePurpose from '@/components/questionnaire/AIScopePurpose';
import AIDeliverableChips from '@/components/questionnaire/AIDeliverableChips';
import SOWDocumentReview from '@/components/questionnaire/SOWDocumentReview';
import AIGoodsSpecSuggestion from '@/components/questionnaire/AIGoodsSpecSuggestion';
import RFPEvaluationCriteria from '@/components/questionnaire/RFPEvaluationCriteria';
import RFPMethodologyDraft from '@/components/questionnaire/RFPMethodologyDraft';
import ABNLookup from '@/components/questionnaire/ABNLookup';
import LogoUpload from '@/components/questionnaire/LogoUpload';
import ScopeUpload from '@/components/questionnaire/ScopeUpload';
import FallbackScopeQuestions from '@/components/questionnaire/FallbackScopeQuestions';
import GoodsItemsTable from '@/components/questionnaire/GoodsItemsTable';
import PerItemDelivery from '@/components/questionnaire/PerItemDelivery';
import WarrantyTable from '@/components/questionnaire/WarrantyTable';
import { useAutoSave } from '@/hooks/useAutoSave';

const SESSION_KEY = (type) => `tendex_questionnaire_${type}`;
const LOCAL_KEY = (type) => `tendex_answers_${type}`;
const DRAFT_DOC_KEY = (type) => `tendex_draft_doc_${type}`;
const ANON_ID_KEY = 'tendex_anonymous_user_id';

// Generate immutable 12-char uppercase alphanumeric procurement ID
const generateProcurementId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 12; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
};

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

// Analyze uploaded scope document and recommend document type
const analyzeUploadedScope = async (docUrl, procurementType) => {
  if (!docUrl) {
    // Fallback: ask 3 simple questions if document can't be read
    return {
      score: 0,
      recommendation: 'EOI',
      dimensions: {},
      fallbackQuestions: true,
    };
  }

  try {
    // For now, we can't directly read PDF/DOCX in the frontend
    // So we ask fallback questions instead
    // In production, this would extract text from the document and pass it to LLM
    return {
      score: 0,
      recommendation: 'EOI',
      dimensions: {},
      fallbackQuestions: true,
    };
  } catch {
    // Fallback on error
    return {
      score: 0,
      recommendation: 'EOI',
      dimensions: {},
      fallbackQuestions: true,
    };
  }
};

// Recommend document type from fallback scope questions
const recommendDocTypeFromFallback = (responses) => {
  const { has_known_suppliers, scope_detail_level } = responses;

  let recommendation = 'EOI';

  // Logic: 
  // - EOI: No known suppliers, OR high-level scope
  // - RFQ: Known suppliers + goods-focused
  // - RFP: Known suppliers + detailed scope + services/complex
  if (has_known_suppliers === 'yes') {
    if (scope_detail_level === 'detailed') {
      recommendation = 'RFP';
    } else {
      recommendation = 'RFQ';
    }
  } else {
    recommendation = 'EOI';
  }

  return {
    score: 75,
    recommendation,
    reasoning: `Based on your answers: ${has_known_suppliers === 'yes' ? 'You have known suppliers' : 'You want to explore the market'}, and your scope is ${scope_detail_level === 'detailed' ? 'detailed and comprehensive' : 'still being refined'}. ${recommendation} is the recommended document type.`,
    dimensions: {
      supplier_readiness: has_known_suppliers === 'yes' ? 1 : 0,
      scope_completeness: scope_detail_level === 'detailed' ? 1 : 0.5,
    },
  };
};

export default function Questionnaire() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'procurement';
  const isStandaloneMode = type === 'SOW' && mode === 'standalone';

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

  // Draft document ID for auto-save (persisted to localStorage so it survives page refresh)
  const loadDraftDocId = () => {
    try { return localStorage.getItem(DRAFT_DOC_KEY(type)) || null; } catch { return null; }
  };

  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in
  const [anonId] = useState(() => getOrCreateAnonId());
  const [answers, setAnswers] = useState(loadSaved);
  const [currentStep, setCurrentStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generatingDone, setGeneratingDone] = useState(false);
  const [createdDocId, setCreatedDocId] = useState(null);
  const [errors, setErrors] = useState([]);
  // Auto-save draft document ID — created immediately when questionnaire starts
  const [draftDocId, setDraftDocId] = useState(loadDraftDocId);
  // Auto-save — triggers on navigation
  const { savedAt, saveNow } = useAutoSave({
    docId: draftDocId,
    answers,
    currentStep,
    enabled: !!draftDocId,
  });

  // Scope scoring step (SOW only, after last questionnaire page)
  const [showScoring, setShowScoring] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [scoreData, setScoreData] = useState(null);

  // AI Assist steps (SOW only)
  // 'purpose'      → Assist 1: scope purpose statement (shown after S2)
  // 'deliverables' → Assist 3: deliverable chips (shown after S4c service description)
  // 'sow_review'   → Assist 4: full SOW document review (shown after S6)
  // 'fallback_scope_questions' → Fallback if uploaded scope can't be read
  const [aiStep, setAiStep] = useState(null);
  const [purposeConfirmed, setPurposeConfirmed] = useState(false);
  const [deliverablesShown, setDeliverablesShown] = useState(false);
  const [fallbackScopeAnswers, setFallbackScopeAnswers] = useState({
    has_known_suppliers: null,
    procurement_type_detail: null,
    scope_detail_level: null,
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Pre-populate profile fields from saved user data
      if (u) {
        setAnswers(prev => ({
          ...(u.abn ? { abn: u.abn, _abn_confirmed: true, _abn_entity_name: u.abn_entity_name || '' } : {}),
          ...(u.logo_url ? { logo_url: u.logo_url } : {}),
          ...prev, // prev answers take priority (session in progress)
        }));
      }
    }).catch(() => setUser(null));
  }, []);

  // If resuming an existing draft, fetch its saved step from the DB
  useEffect(() => {
    if (!draftDocId) return;
    base44.entities.Document.filter({ id: draftDocId }).then(docs => {
      if (!docs || docs.length === 0) return;
      const doc = docs[0];
      
      // Restore step (questionnaire_step stored on the record)
      if (typeof doc.questionnaire_step === 'number') {
        // Add a small delay to ensure visiblePages is computed first
        setTimeout(() => setCurrentStep(doc.questionnaire_step), 50);
      }
      
      // Restore answers from DB if localStorage is empty
      if (doc.questionnaire_data && Object.keys(doc.questionnaire_data).length > 0) {
        setAnswers(prev => (Object.keys(prev).length === 0 ? doc.questionnaire_data : prev));
      }
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftDocId, type]);

  // Create the draft document record immediately on first load (if not already created)
  useEffect(() => {
    if (draftDocId) return; // already have one
    const procId = generateProcurementId();
    base44.entities.Document.create({
      title: `Draft ${type} — ${new Date().toLocaleDateString('en-AU')}`,
      document_type: type,
      status: 'draft',
      procurement_id: procId,
      questionnaire_type: type,
      questionnaire_step: 0,
      questionnaire_data: {},
      ...(anonId ? { anonymous_user_id: anonId } : {}),
    }).then(doc => {
      setDraftDocId(doc.id);
      try { localStorage.setItem(DRAFT_DOC_KEY(type), doc.id); } catch {}
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    saveNow(); // auto-save on navigation

    if (type === 'SOW') {
      if (isStandaloneMode) {
        // ── STANDALONE MODE: collect scope info, show review, then generate SOW directly ──
        if (page?.id === 's3_own_scope_option' && answers.has_own_scope === 'yes') {
          analyzeUploadedScope(answers.own_scope_document, answers.procurement_type).then(result => {
            if (result.fallbackQuestions) {
              setAiStep('fallback_scope_questions');
            } else {
              // In standalone mode, skip scoring — generate SOW directly
              handleGenerate('SOW', 'SOW');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
          return;
        }
        if (page?.id === 's2_basics' && !purposeConfirmed && answers.has_own_scope !== 'yes') {
          setAiStep('purpose');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        if (page?.id === 's4c_service_details' && !deliverablesShown && (answers.procurement_type === 'services' || answers.procurement_type === 'both') && answers.has_own_scope !== 'yes') {
          setAiStep('deliverables');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        if (!isLastStep) {
          setCurrentStep(s => s + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        // At last step: show sow_review, then generate SOW directly (no scoring)
        if (aiStep !== 'sow_review') {
          setAiStep('sow_review');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        await handleGenerate('SOW', 'SOW');
        return;
      }

      // ── PROCUREMENT MODE (existing logic) ──
      if (page?.id === 's3_own_scope_option' && answers.has_own_scope === 'yes') {
        analyzeUploadedScope(answers.own_scope_document, answers.procurement_type).then(result => {
          if (result.fallbackQuestions) {
            setAiStep('fallback_scope_questions');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setShowScoring(true);
            setScoring(true);
            setScoreData(result);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
        return;
      }
      if (page?.id === 's2_basics' && !purposeConfirmed && answers.has_own_scope !== 'yes') {
        setAiStep('purpose');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (page?.id === 's4c_service_details' && !deliverablesShown && (answers.procurement_type === 'services' || answers.procurement_type === 'both') && answers.has_own_scope !== 'yes') {
        setAiStep('deliverables');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    if (!isLastStep) {
      setCurrentStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (type === 'SOW' && aiStep !== 'sow_review') {
      // Assist 4: after last SOW page (S6), show full SOW review
      setAiStep('sow_review');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (type === 'SOW' && !showScoring) {
      // Then run scoring
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
    saveNow(); // auto-save on navigation
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
    const title = answers.project_name || answers.rfq_title || answers.rfp_title || answers.eoi_title || `${resolvedType} Document — ${new Date().toLocaleDateString('en-AU')}`;
    const orgName = answers.organisation_name || answers.company_name || '';
    const updateData = {
      title,
      document_type: resolvedType,
      questionnaire_data: {
        ...answers,
        ...(scoreData ? { _ai_recommended_type: scoreData.recommendation } : {}),
        ...(overrideDocType ? { _user_override_type: overrideDocType, _override_timestamp: new Date().toISOString() } : {}),
      },
      project_name: answers.project_name || answers.rfq_title || '',
      organisation_name: orgName,
      industry: answers.industry || answers.service_type || answers.procurement_type || '',
      questionnaire_step: currentStep,
    };

    let docId = draftDocId;
    if (docId) {
      // Finalise the existing draft record
      await base44.entities.Document.update(docId, updateData);
    } else {
      // Fallback: create fresh (should rarely happen)
      const procId = generateProcurementId();
      if (!user && anonId) updateData.anonymous_user_id = anonId;
      updateData.procurement_id = procId;
      updateData.status = 'draft';
      updateData.document_type = resolvedType;
      updateData.title = title;
      const doc = await base44.entities.Document.create(updateData);
      docId = doc.id;
    }

    // Increment documents_used for the user's subscription
    if (user) {
      const subs = await base44.entities.Subscription.filter({ user_email: user.email });
      if (subs.length > 0) {
        const currentCount = subs[0].documents_used || 0;
        await base44.entities.Subscription.update(subs[0].id, {
          documents_used: currentCount + 1,
        });
      }
    }

    try {
      sessionStorage.removeItem(SESSION_KEY(type));
      localStorage.removeItem(LOCAL_KEY(type));
      localStorage.removeItem(DRAFT_DOC_KEY(type));
    } catch {}
    setCreatedDocId(docId);
    navigate(`/document/${docId}?generating=true`);
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
            className="flex items-center gap-1.5 text-sm transition-colors mb-6" style={{ color: 'var(--text-muted)' }}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide" style={{ border: '1px solid var(--border-strong)', color: 'var(--primary)', background: 'rgba(232,34,26,0.08)' }}>
              {type}
            </span>
            <h1 className="font-syne text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{docTypeLabels[type] || type}</h1>
          </div>
          {type === 'SOW' && (
            <p className="text-xs mt-2" style={{ color: '#5C7A99' }}>
              {isStandaloneMode
                ? 'Creating a standalone Scope of Work document.'
                : 'Full procurement journey — your scope will be scored and a market document recommended.'}
            </p>
          )}
          {type !== 'SOW' && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Answer a few questions and AI will draft your document.</p>
          )}
        </div>

        {/* Limit gate */}
        {atLimit && (
          <div className="mb-8 rounded-xl border border-red-400/30 p-5 text-center" style={{ background: 'rgba(239,68,68,0.08)' }}>
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Document limit reached</h3>
            <p className="text-sm text-red-300/80 mb-4">You've used all {docsLimit} documents on your {currentPlan} plan. Upgrade to create more.</p>
            <Link to="/billing">
              <Button className="text-white border-0" style={{ backgroundColor: '#00C9A7' }}>Upgrade Plan</Button>
            </Link>
          </div>
        )}

        {/* Step indicator — hidden during AI assist or scoring steps */}
        {!showScoring && !aiStep && (
          <div className="mb-8">
            <StepIndicator currentStep={currentStep} totalSteps={totalSteps} visiblePages={visiblePages} />
          </div>
        )}

        {/* ── AI ASSIST 1: Scope Purpose Statement ── */}
        {aiStep === 'purpose' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Scope Purpose</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI has drafted a scope purpose statement based on your answers.</p>
            </div>
            <AIScopePurpose
              answers={answers}
              value={answers._scope_purpose}
              onChange={val => updateAnswer('_scope_purpose', val)}
              onConfirm={(val) => {
                updateAnswer('_scope_purpose', val);
                setPurposeConfirmed(true);
                setAiStep(null);
                setCurrentStep(s => s + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <div className="mt-6">
              <Button variant="ghost" onClick={() => { setAiStep(null); }}
                className="hover-muted" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Questions
              </Button>
            </div>
          </div>
        )}

        {/* ── AI ASSIST 3: Deliverable Chips ── */}
        {aiStep === 'deliverables' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Key Deliverables</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI has suggested deliverables based on your service description. Edit as needed.</p>
            </div>
            <AIDeliverableChips
              answers={answers}
              value={answers.key_deliverables}
              onChange={val => updateAnswer('key_deliverables', val)}
            />
            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={() => setAiStep(null)}
                className="hover-muted" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                size="lg"
                onClick={() => {
                  setDeliverablesShown(true);
                  setAiStep(null);
                  setCurrentStep(s => s + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="gap-2 px-8 text-white border-0" style={{ backgroundColor: '#00C9A7', boxShadow: '0 0 20px rgba(0,201,167,0.3)' }}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── AI ASSIST 4: Full SOW Document Review ── */}
        {aiStep === 'sow_review' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Generate Scope of Work</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI is assembling your complete Scope of Work from all your answers.</p>
            </div>
            <SOWDocumentReview
              answers={answers}
              onConfirm={(reviewedSections) => {
                updateAnswer('_sow_sections', reviewedSections);
                setAiStep(null);
                if (isStandaloneMode) {
                  // Standalone: generate SOW directly without scoring
                  handleGenerate('SOW', 'SOW');
                } else {
                  // Procurement mode: trigger scoring
                  setShowScoring(true);
                  setScoring(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  scoreScopeAnswers(answers).then(result => {
                    setScoreData(result);
                    setScoring(false);
                  });
                }
              }}
              onBack={() => setAiStep(null)}
            />
            <div className="mt-4">
              <Button variant="ghost" onClick={() => setAiStep(null)}
                className="hover-muted" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Questions
              </Button>
            </div>
          </div>
        )}

        {/* ── FALLBACK SCOPE QUESTIONS (if document can't be read) ── */}
        {aiStep === 'fallback_scope_questions' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Help Us Understand Your Scope</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>We couldn't automatically read your document. Please answer a few quick questions so we can recommend the right document type.</p>
            </div>
            <FallbackScopeQuestions
              answers={answers}
              onSubmit={(responses) => {
                setFallbackScopeAnswers(responses);
                setAiStep(null);
                // Now proceed to scoring with these responses
                setShowScoring(true);
                setScoring(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                const result = recommendDocTypeFromFallback(responses);
                setScoreData(result);
                setScoring(false);
              }}
            />
            <div className="mt-8">
              <Button variant="ghost" onClick={() => setAiStep(null)}
                className="hover-muted" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </div>
          </div>
        )}

        {/* ── SCOPE SCORING STEP ── */}
        {showScoring && !aiStep && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>AI Scope Review</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>We've analysed your scope to recommend the best document type.</p>
            </div>

            {scoring ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#00C9A7' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Evaluating your scope...</p>
              </div>
            ) : (
              <ScopeScoreResult
                scoreData={scoreData}
                onProceed={(recommendedType) => handleGenerate(recommendedType, null)}
                onOverride={(chosenType) => handleGenerate(scoreData?.recommendation, chosenType)}
              />
            )}

            {!scoring && (
              <div className="mt-8">
                <Button variant="ghost" onClick={() => { setShowScoring(false); setScoreData(null); }}
                  className="hover-muted" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Questions
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── MAIN QUESTIONNAIRE ── */}
        {!showScoring && !aiStep && (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={page?.id || currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{page?.title}</h2>
                    {page?.description && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{page.description}</p>}
                </div>

                {errors.length > 0 && (
                  <div className="mb-5 flex items-center gap-2 text-sm text-red-400 border border-red-400/30 rounded-lg px-4 py-3"
                    style={{ background: 'rgba(239,68,68,0.08)' }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Please complete all required fields before continuing.
                  </div>
                )}

                <div className="space-y-6">
                  {visibleFields.map(field => {
                    // Special field: ABN lookup with live verification
                    if (field.type === 'abn-lookup') {
                        return (
                          <div key={field.key} className="space-y-2">
                            <div className="text-sm font-medium" style={{ color: 'rgba(0,201,167,0.9)' }}>
                            {field.label}
                            {field.required && <span className="text-red-400 ml-1">*</span>}
                          </div>
                          {field.helpText && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{field.helpText}</p>}
                          <ABNLookup
                            value={answers.abn || ''}
                            onChange={val => {
                              updateAnswer('abn', val);
                              updateAnswer('_abn_confirmed', false);
                            }}
                            onConfirmed={(abn, entityName) => {
                              updateAnswer('abn', abn);
                              updateAnswer('_abn_entity_name', entityName);
                              updateAnswer('_abn_confirmed', true);
                              // Persist to user profile if authenticated
                              if (user) {
                                base44.auth.updateMe({ abn, abn_entity_name: entityName }).catch(() => {});
                              }
                            }}
                            confirmed={answers._abn_confirmed}
                            confirmedName={answers._abn_entity_name}
                          />
                          {errors.includes(field.key) && (
                            <p className="text-xs text-red-400">Please verify your ABN before continuing.</p>
                          )}
                        </div>
                      );
                    }

                    // Special field: Logo upload
                    if (field.type === 'logo-upload') {
                      return (
                        <div key={field.key} className="space-y-2">
                          <div className="text-sm font-medium" style={{ color: 'rgba(0,201,167,0.9)' }}>{field.label}</div>
                          {field.helpText && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{field.helpText}</p>}
                          <LogoUpload
                            value={answers.logo_url || null}
                            onChange={url => updateAnswer('logo_url', url)}
                          />
                        </div>
                      );
                    }

                    // Special field: Scope document upload
                    if (field.type === 'scope-upload') {
                      return (
                        <div key={field.key} className="space-y-2">
                          <div className="text-sm font-medium" style={{ color: 'rgba(0,201,167,0.9)' }}>
                            {field.label}
                            {field.required && <span className="text-red-400 ml-1">*</span>}
                          </div>
                          {field.helpText && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{field.helpText}</p>}
                          <ScopeUpload
                            value={answers.own_scope_document || null}
                            onChange={url => updateAnswer('own_scope_document', url)}
                            error={errors.includes(field.key)}
                          />
                          {errors.includes(field.key) && (
                            <p className="text-xs text-red-400">Please upload your scope document before continuing.</p>
                          )}
                        </div>
                      );
                    }

                    // Special field: RFP criteria ranking + AI weightings
                    if (field.type === 'criteria-ranking') {
                      return (
                        <div key={field.key} className="space-y-2">
                          <div className="text-sm font-medium" style={{ color: 'rgba(0,201,167,0.9)' }}>
                            {field.label}
                            {field.required && <span className="text-red-400 ml-1">*</span>}
                          </div>
                          {field.helpText && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{field.helpText}</p>}
                          <RFPEvaluationCriteria
                            ranking={answers.rfp_criteria_ranking}
                            weightings={answers.rfp_criteria_weightings}
                            onChange={({ ranking, weightings }) => {
                              updateAnswer('rfp_criteria_ranking', ranking);
                              updateAnswer('rfp_criteria_weightings', weightings);
                            }}
                          />
                          {errors.includes(field.key) && <p className="text-xs text-red-400">This field is required.</p>}
                        </div>
                      );
                    }

                    // Special field: RFP methodology AI draft
                    if (field.type === 'methodology-draft') {
                      return (
                        <div key={field.key} className="space-y-2">
                          <div className="text-sm font-medium" style={{ color: 'rgba(0,201,167,0.9)' }}>{field.label}</div>
                          {field.helpText && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{field.helpText}</p>}
                          <RFPMethodologyDraft
                            answers={answers}
                            value={answers.rfp_methodology_question}
                            onChange={val => updateAnswer('rfp_methodology_question', val)}
                          />
                        </div>
                      );
                    }

                    // Milestone table
                    if (field.type === 'milestone-table') {
                      return (
                        <div key={field.key} className="space-y-2">
                          <div className="text-sm font-medium" style={{ color: 'rgba(0,201,167,0.9)' }}>
                            {field.label}
                            {field.required && <span className="text-red-400 ml-1">*</span>}
                          </div>
                          <MilestoneTable
                            value={answers[field.key]}
                            onChange={val => updateAnswer(field.key, val)}
                            error={errors.includes(field.key)}
                          />
                        </div>
                      );
                    }

                    // Goods items table with AI suggestions
                    if (field.type === 'goods-items-table') {
                      return (
                        <div key={field.key} className="space-y-2">
                          <div className="text-sm font-medium" style={{ color: 'rgba(0,201,167,0.9)' }}>
                            {field.label}
                            {field.required && <span className="text-red-400 ml-1">*</span>}
                          </div>
                          {field.helpText && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{field.helpText}</p>}
                          <GoodsItemsTable
                            value={answers[field.key] || []}
                            onChange={val => updateAnswer(field.key, val)}
                          />
                          {errors.includes(field.key) && (
                            <p className="text-xs text-red-400">Please add at least one item before continuing.</p>
                          )}
                        </div>
                      );
                    }

                    // Per-item delivery configuration
                    if (field.type === 'per-item-delivery') {
                      return (
                        <div key={field.key} className="space-y-2">
                          <div className="text-sm font-medium" style={{ color: 'rgba(0,201,167,0.9)' }}>{field.label}</div>
                          {field.helpText && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{field.helpText}</p>}
                          <PerItemDelivery
                            goodsItems={answers.goods_items || []}
                            value={answers[field.key] || {}}
                            onChange={val => updateAnswer(field.key, val)}
                          />
                        </div>
                      );
                    }

                    // Warranty table
                    if (field.type === 'warranty-table') {
                      return (
                        <div key={field.key} className="space-y-2">
                          <div className="text-sm font-medium" style={{ color: 'rgba(0,201,167,0.9)' }}>{field.label}</div>
                          {field.helpText && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{field.helpText}</p>}
                          <WarrantyTable
                            goodsItems={answers.goods_items || []}
                            value={answers[field.key] || {}}
                            onChange={val => updateAnswer(field.key, val)}
                          />
                        </div>
                      );
                    }

                    // Default
                    return (
                      <div key={field.key}>
                        <QuestionField
                          field={field}
                          value={answers[field.key]}
                          onChange={val => updateAnswer(field.key, val)}
                          error={errors.includes(field.key)}
                          docType={type}
                        />
                        {/* AI Assist 2: spec suggestion after product_description on S3 */}
                        {type === 'SOW' && field.key === 'product_description' && page?.id === 's3_goods_list' && (
                          <div className="mt-3">
                            <AIGoodsSpecSuggestion
                              productDescription={answers.product_description}
                              category={answers.procurement_type}
                              onAccept={val => updateAnswer('technical_specs', val)}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex justify-between items-center">
              <Button variant="ghost" onClick={handleBack}
                className="hover-muted" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>

              <Button size="lg" onClick={handleNext} disabled={generating || atLimit}
                className="gap-2 px-8 text-white border-0" style={{ backgroundColor: '#00C9A7', boxShadow: '0 0 20px rgba(0,201,167,0.3)' }}>
                {generating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Creating document...</>
                ) : isLastStep ? (
                  <><Sparkles className="w-4 h-4" />{type === 'SOW' ? (isStandaloneMode ? 'Generate Scope of Work' : 'Score my scope →') : `Generate ${type} Document`}</>
                ) : (
                  <>Next <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Auto-save indicator */}
      <AnimatePresence>
        {savedAt && (
          <motion.div
            key={savedAt.getTime()}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 right-4 flex items-center gap-1.5 text-xs text-green-400/70 bg-black/40 backdrop-blur-sm border border-green-400/15 rounded-full px-3 py-1.5 pointer-events-none"
          >
            <Check className="w-3 h-3" /> Saved
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}