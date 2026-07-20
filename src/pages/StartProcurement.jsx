import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, FileText, DollarSign, Calendar, Hash, AlignLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import AppLayout from '@/components/layout/AppLayout';

const generateProcurementId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 12; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
};

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

export default function StartProcurement() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    title: '',
    reference_number: '',
    high_level_description: '',
    estimated_budget: '',
    delivery_timeline: '',
  });

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Procurement title is required.';
    if (!form.high_level_description.trim()) errs.high_level_description = 'Please provide a brief description of what you need to procure.';
    return errs;
  };

  const handleStart = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    const anonId = getOrCreateAnonId();
    const procId = generateProcurementId();

    const docData = {
      title: form.title.trim(),
      document_type: 'SOW',
      status: 'draft',
      procurement_id: procId,
      questionnaire_type: 'SOW',
      questionnaire_step: 0,
      questionnaire_data: {},
      reference_number: form.reference_number.trim() || undefined,
      high_level_description: form.high_level_description.trim(),
      estimated_budget: form.estimated_budget ? parseFloat(form.estimated_budget) : undefined,
      delivery_timeline: form.delivery_timeline.trim() || undefined,
      project_name: form.title.trim(),
      is_procurement_process: true,
      ...(anonId ? { anonymous_user_id: anonId } : {}),
    };

    Object.keys(docData).forEach(k => docData[k] === undefined && delete docData[k]);

    const doc = await base44.entities.Document.create(docData);

    try {
      localStorage.setItem(`tendex_draft_doc_SOW`, doc.id);
      const initialAnswers = {
        project_name: form.title.trim(),
        ...(form.high_level_description ? { summary_of_services: form.high_level_description.trim() } : {}),
        ...(form.delivery_timeline ? { timeline: form.delivery_timeline.trim() } : {}),
      };
      sessionStorage.setItem(`tendex_questionnaire_SOW`, JSON.stringify(initialAnswers));
      localStorage.setItem(`tendex_answers_SOW`, JSON.stringify(initialAnswers));
    } catch {}

    navigate(`/questionnaire/SOW`);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-6 py-12" style={{ background: 'var(--background)' }}>
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/tool-select')}
            className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(200,30,58,0.10)', border: '1px solid rgba(200,30,58,0.20)' }}>
              <FileText className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h1 className="font-syne font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Start a new procurement</h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Give your procurement a name and a brief description to get started.</p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Procurement Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Procurement Title <span style={{ color: 'var(--primary)' }}>*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => update('title', e.target.value)}
              placeholder="e.g. Office Fit-Out 2025, IT Infrastructure Upgrade"
              className="w-full px-4 py-3 text-sm border outline-none transition-all"
              style={{
                background: 'var(--input)',
                color: 'var(--text-primary)',
                borderColor: errors.title ? 'var(--destructive)' : 'var(--border)',
                borderRadius: 10,
              }}
              onFocus={e => { if (!errors.title) e.target.style.borderColor = 'var(--primary)'; }}
              onBlur={e => { if (!errors.title) e.target.style.borderColor = 'var(--border)'; }}
            />
            {errors.title && <p className="mt-1.5 text-xs" style={{ color: 'var(--destructive)' }}>{errors.title}</p>}
          </div>

          {/* Reference Number */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
              <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />Reference Number <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></span>
            </label>
            <input
              type="text"
              value={form.reference_number}
              onChange={e => update('reference_number', e.target.value)}
              placeholder="e.g. PROC-2025-001"
              className="w-full px-4 py-3 text-sm border outline-none transition-all"
              style={{
                background: 'var(--input)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border)',
                borderRadius: 10,
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* High-Level Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
              <span className="flex items-center gap-1.5"><AlignLeft className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />Description of Need <span style={{ color: 'var(--primary)' }}>*</span></span>
            </label>
            <textarea
              value={form.high_level_description}
              onChange={e => update('high_level_description', e.target.value)}
              placeholder="Briefly describe what you need to procure and why. This helps AI understand your requirements..."
              rows={4}
              className="w-full px-4 py-3 text-sm border outline-none transition-all resize-none"
              style={{
                background: 'var(--input)',
                color: 'var(--text-primary)',
                borderColor: errors.high_level_description ? 'var(--destructive)' : 'var(--border)',
                borderRadius: 10,
              }}
              onFocus={e => { if (!errors.high_level_description) e.target.style.borderColor = 'var(--primary)'; }}
              onBlur={e => { if (!errors.high_level_description) e.target.style.borderColor = 'var(--border)'; }}
            />
            {errors.high_level_description && <p className="mt-1.5 text-xs" style={{ color: 'var(--destructive)' }}>{errors.high_level_description}</p>}
          </div>

          {/* Budget + Timeline row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />Estimated Budget (AUD) <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></span>
              </label>
              <input
                type="number"
                min="0"
                value={form.estimated_budget}
                onChange={e => update('estimated_budget', e.target.value)}
                placeholder="e.g. 250000"
                className="w-full px-4 py-3 text-sm border outline-none transition-all"
                style={{
                  background: 'var(--input)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border)',
                  borderRadius: 10,
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />Required Timeline <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></span>
              </label>
              <input
                type="text"
                value={form.delivery_timeline}
                onChange={e => update('delivery_timeline', e.target.value)}
                placeholder="e.g. Complete by June 2026"
                className="w-full px-4 py-3 text-sm border outline-none transition-all"
                style={{
                  background: 'var(--input)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border)',
                  borderRadius: 10,
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          {/* Info note */}
          <div className="px-4 py-3 text-sm" style={{ background: 'var(--action-subtle)', border: '1px solid var(--action-border)', color: 'var(--text-secondary)', borderRadius: 10 }}>
            <span style={{ color: 'var(--action)' }}>★ </span>
            After this step, AI will guide you through developing your Scope of Work and recommend the right market engagement document (EOI, RFQ, or RFP).
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/tool-select')}
              className="hover-muted"
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            <Button
              size="lg"
              onClick={handleStart}
              disabled={saving}
              className="gap-2 px-8 border-0"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', boxShadow: '0 0 16px rgba(200,30,58,0.25)' }}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Creating...</>
              ) : (
                <>Start Procurement <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}