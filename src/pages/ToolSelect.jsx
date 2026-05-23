import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lightbulb, ClipboardList, Search, ArrowRight, Bot, Sparkles, AlertCircle, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import AppLayout from '@/components/layout/AppLayout';

const standaloneTools = [
  {
    id: 'EOI',
    icon: Lightbulb,
    title: 'Expression of Interest (EOI)',
    description: 'Invite suppliers to indicate their interest and capability for an upcoming opportunity.',
    iconColor: 'text-purple-300',
    examples: ['Pre-qualification of suppliers', 'Market sounding', 'Shortlisting vendors'],
  },
  {
    id: 'RFQ',
    icon: ClipboardList,
    title: 'Request for Quotation (RFQ)',
    description: 'Solicit price quotes from suppliers for well-defined goods or services.',
    iconColor: 'text-green-300',
    examples: ['Office supplies procurement', 'Standard software licences', 'Routine maintenance'],
  },
  {
    id: 'RFP',
    icon: Search,
    title: 'Request for Proposal (RFP)',
    description: 'Invite detailed proposals from vendors for complex or innovative solutions.',
    iconColor: 'text-orange-300',
    examples: ['Enterprise software solution', 'Professional services', 'Strategic partnership'],
  },
];

export default function ToolSelect() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [docsUsed, setDocsUsed] = useState(0);

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return;
        const subs = await base44.entities.Subscription.filter({ user_email: user.email });
        if (subs.length > 0) {
          const sub = subs[0];
          setSubscription(sub);
          setDocsUsed(sub.documents_used || 0);
          if (sub.plan === 'free' && sub.renewal_date) {
            const renewalDate = new Date(sub.renewal_date);
            if (new Date() > renewalDate) setIsTrialExpired(true);
          }
        }
      } catch (err) {
        console.error('Error loading subscription:', err);
      }
    };
    loadSubscription();
  }, []);

  const handleAiSelect = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiSuggestion(null);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `A small business user wants to create a procurement document. Their need: "${aiQuery}".
      Based on this, recommend ONE of: SOW, EOI, RFQ, or RFP.
      Return JSON with: { "type": "SOW|EOI|RFQ|RFP", "reason": "short 1-sentence reason" }`,
      response_json_schema: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          reason: { type: 'string' },
        },
      },
    });
    setAiSuggestion(result);
    setSelected(result.type);
    setAiLoading(false);
  };

  const handleProceed = () => {
    if (isTrialExpired) { navigate('/billing'); return; }
    if (subscription?.plan === 'free' && docsUsed >= subscription.documents_limit) { navigate('/billing'); return; }
    if (!selected) return;
    // SOW goes through full procurement journey; EOI/RFQ/RFP go directly to questionnaire
    navigate(`/questionnaire/${selected}`);
  };

  const continueLabel = () => {
    if (!selected) return 'Select a document type';
    if (selected === 'SOW') return 'Start procurement journey →';
    return `Create ${selected} document →`;
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Trial expired paywall */}
        {isTrialExpired && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 rounded-lg border border-amber-400/30 bg-amber-400/10 p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-300 mb-1">Trial Period Expired</h3>
                <p className="text-sm text-amber-200/70 mb-4">Your free trial has ended. Upgrade to continue creating new documents.</p>
                <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-white border-0" onClick={() => navigate('/billing')}>Upgrade Now</Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Free plan limit reached */}
        {!isTrialExpired && subscription?.plan === 'free' && docsUsed >= subscription.documents_limit && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 rounded-lg p-6" style={{ border: '1px solid rgba(232,34,26,0.3)', background: 'rgba(232,34,26,0.1)' }}>
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#E8221A' }} />
              <div className="flex-1">
                <h3 className="font-semibold mb-1" style={{ color: '#EF9A9A' }}>Document Limit Reached</h3>
                <p className="text-sm mb-4" style={{ color: 'rgba(232,34,26,0.6)' }}>You've created {docsUsed} of {subscription.documents_limit} allowed document(s) on your free plan. Upgrade to create more.</p>
                <Button size="sm" className="text-white border-0" style={{ backgroundColor: '#E8221A' }} onClick={() => navigate('/billing')}>Upgrade Plan</Button>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-syne text-4xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>What do you need?</h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Start a full procurement journey or create a standalone document.</p>
        </motion.div>

        {/* AI Assist */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border p-6 mb-10" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Not sure? Describe your need</h2>
          </div>
          <div className="flex gap-3">
            <Textarea
              placeholder="e.g. I need to hire a web developer to build our e-commerce site..."
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              className="min-h-[80px] resize-none flex-1 focus-visible:ring-1"
              style={{ background: 'var(--input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
            <Button onClick={handleAiSelect} disabled={aiLoading || !aiQuery.trim()}
              className="self-end gap-2 whitespace-nowrap text-white border-0" style={{ backgroundColor: '#E8221A', boxShadow: '0 0 20px rgba(232,34,26,0.3)' }}>
              {aiLoading ? <><Sparkles className="w-4 h-4 animate-spin" />Analysing...</> : <><Sparkles className="w-4 h-4" />Suggest Type</>}
            </Button>
          </div>
          {aiSuggestion && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg text-sm" style={{ background: 'var(--muted)', border: '1px solid var(--border-strong)' }}>
              <span className="font-semibold" style={{ color: 'var(--primary)' }}>Recommended: {aiSuggestion.type}</span>
              <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>— {aiSuggestion.reason}</span>
            </motion.div>
          )}
        </motion.div>

        {/* SECTION A — Full Procurement Journey (SOW) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#5C7A99' }}>Start a full procurement</p>
          <div
            className="rounded-2xl border-2 p-6 mb-10 cursor-pointer transition-all"
            style={{
              background: selected === 'SOW' ? 'rgba(0,201,167,0.08)' : 'var(--card)',
              borderColor: selected === 'SOW' ? 'var(--primary)' : 'var(--border)',
              boxShadow: selected === 'SOW' ? '0 0 24px rgba(0,201,167,0.1)' : 'none',
            }}
            onClick={() => setSelected('SOW')}
            role="button"
            aria-pressed={selected === 'SOW'}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,201,167,0.12)', border: '1px solid rgba(0,201,167,0.25)' }}>
                <Layers className="w-6 h-6" style={{ color: '#00C9A7' }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h3 className="font-syne font-700 text-lg" style={{ color: 'var(--text-primary)' }}>Full Procurement Journey</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,201,167,0.1)', color: '#00C9A7', border: '1px solid rgba(0,201,167,0.2)' }}>
                    Recommended starting point
                  </span>
                </div>
                <p className="text-sm mb-3" style={{ color: '#8FA5C0' }}>
                  Start here if you are beginning a new procurement from scratch. TendeX will help you define your scope, score its quality, and recommend the right market document (EOI, RFQ, or RFP) — all in one guided flow.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Define scope of work', 'AI quality scoring', 'Recommend EOI / RFQ / RFP', 'Generate market-ready document'].map(step => (
                    <span key={step} className="text-xs px-2 py-1 rounded-md"
                      style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* SECTION B — Standalone document types */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#5C7A99' }}>Or create a standalone document</p>
          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {standaloneTools.map((tool, i) => (
              <motion.button key={tool.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 + 0.25 }}
                onClick={() => setSelected(tool.id)}
                className="text-left p-6 rounded-2xl border-2 transition-all"
                style={{
                  borderColor: selected === tool.id ? 'var(--primary)' : 'var(--border)',
                  background: selected === tool.id ? 'rgba(232,34,26,0.12)' : 'var(--card)',
                  boxShadow: selected === tool.id ? '0 0 20px rgba(232,34,26,0.15)' : 'none',
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                  <tool.icon className={`w-5 h-5 ${tool.iconColor}`} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{tool.title}</h3>
                <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{tool.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {tool.examples.map(ex => (
                    <span key={ex} className="text-xs px-2 py-1 rounded-md" style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>{ex}</span>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Continue button */}
        <div className="flex flex-col items-end gap-3">
          <Button size="lg" onClick={handleProceed} disabled={!selected}
            className="gap-2 px-8 border-0" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', boxShadow: '0 4px 12px rgba(232,34,26,0.2)' }}>
            {continueLabel()} {selected && <ArrowRight className="w-4 h-4" />}
          </Button>
          <button
            className="text-sm transition-colors"
            style={{ color: '#5C7A99' }}
            onMouseEnter={e => e.currentTarget.style.color = '#8FA5C0'}
            onMouseLeave={e => e.currentTarget.style.color = '#5C7A99'}
            onClick={() => navigate('/questionnaire/SOW?mode=standalone')}
          >
            Just need a Scope of Work document? Create one directly →
          </button>
        </div>
      </div>
    </AppLayout>
  );
}