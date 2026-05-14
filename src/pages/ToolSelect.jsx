import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Lightbulb, ClipboardList, Search, ArrowRight, Bot, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import AppLayout from '@/components/layout/AppLayout';

const tools = [
  {
    id: 'SOW',
    icon: FileText,
    title: 'Scope of Work (SOW)',
    description: 'Define project deliverables, timelines, and responsibilities for a specific engagement.',
    iconColor: 'text-[#00C9A7]',
    examples: ['IT system implementation', 'Marketing campaign', 'Consulting engagement'],
  },
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

        const subs = await base44.entities.Subscription.filter({
          user_email: user.email,
        });
        
        if (subs.length > 0) {
          const sub = subs[0];
          setSubscription(sub);
          setDocsUsed(sub.documents_used || 0);

          // Check if free trial is expired
          if (sub.plan === 'free' && sub.renewal_date) {
            const renewalDate = new Date(sub.renewal_date);
            const today = new Date();
            if (today > renewalDate) {
              setIsTrialExpired(true);
            }
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
    // Check if free trial is expired
    if (isTrialExpired) {
      navigate('/billing');
      return;
    }

    // Check if free plan has reached document limit
    if (subscription?.plan === 'free' && docsUsed >= subscription.documents_limit) {
      navigate('/billing');
      return;
    }

    if (selected) navigate(`/questionnaire/${selected}`);
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
                <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-white border-0"
                  onClick={() => navigate('/billing')}>
                  Upgrade Now
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Free plan limit reached */}
        {!isTrialExpired && subscription?.plan === 'free' && docsUsed >= subscription.documents_limit && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 rounded-lg p-6" style={{ border: '1px solid rgba(0,201,167,0.3)', background: 'rgba(0,201,167,0.1)' }}>
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#00C9A7' }} />
              <div className="flex-1">
                <h3 className="font-semibold mb-1" style={{ color: '#7FEEE1' }}>Document Limit Reached</h3>
                <p className="text-sm mb-4" style={{ color: 'rgba(0,201,167,0.5)' }}>You've created {docsUsed} of {subscription.documents_limit} allowed document(s) on your free plan. Upgrade to create more.</p>
                <Button size="sm" className="text-white border-0" style={{ backgroundColor: '#00C9A7' }}
                  onClick={() => navigate('/billing')}>
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-4xl font-semibold text-white mb-3">What document do you need?</h1>
          <p className="text-lg" style={{ color: 'rgba(0,201,167,0.6)' }}>Choose a document type or describe your need and let AI guide you.</p>
        </motion.div>

        {/* AI Assist */}
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
           className="rounded-2xl border border-white/10 p-6 mb-8" style={{ background: 'rgba(255,255,255,0.05)' }}>
           <div className="flex items-center gap-2 mb-3">
             <Bot className="w-5 h-5" style={{ color: '#00C9A7' }} />
             <h2 className="font-semibold text-white">Not sure? Describe your need</h2>
           </div>
           <div className="flex gap-3">
             <Textarea
               placeholder="e.g. I need to hire a web developer to build our e-commerce site..."
               value={aiQuery}
               onChange={e => setAiQuery(e.target.value)}
               className="min-h-[80px] resize-none flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30"
               style={{ '--tw-ring-color': 'rgba(0,201,167,0.5)' }}
             />
             <Button onClick={handleAiSelect} disabled={aiLoading || !aiQuery.trim()}
               className="self-end gap-2 whitespace-nowrap text-white border-0" style={{ backgroundColor: '#00C9A7', boxShadow: '0 0 20px rgba(0,201,167,0.3)' }}>
               {aiLoading ? <><Sparkles className="w-4 h-4 animate-spin" />Analysing...</> : <><Sparkles className="w-4 h-4" />Suggest Type</>}
             </Button>
           </div>
           {aiSuggestion && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg text-sm" style={{ border: '1px solid rgba(0,201,167,0.3)', background: 'rgba(0,201,167,0.1)' }}>
               <span className="font-semibold" style={{ color: '#00C9A7' }}>Recommended: {aiSuggestion.type}</span>
               <span className="ml-2" style={{ color: 'rgba(0,201,167,0.5)' }}>— {aiSuggestion.reason}</span>
             </motion.div>
           )}
         </motion.div>

        {/* Tool Cards */}
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          {tools.map((tool, i) => (
            <motion.button key={tool.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 + 0.2 }}
              onClick={() => setSelected(tool.id)}
              className={`text-left p-6 rounded-2xl border-2 transition-all ${
                 selected === tool.id
                   ? 'shadow-lg'
                   : 'border-white/10'
               }`}
               style={{
                 borderColor: selected === tool.id ? 'rgba(0,201,167,0.6)' : 'rgba(255,255,255,0.1)',
                 background: selected === tool.id ? 'rgba(0,201,167,0.12)' : 'rgba(255,255,255,0.04)',
                 boxShadow: selected === tool.id ? '0 0 20px rgba(0,201,167,0.15)' : 'none'
               }}
               onMouseEnter={(e) => !selected && (e.currentTarget.style.borderColor = 'rgba(0,201,167,0.3)')}
               onMouseLeave={(e) => !selected && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-white/10" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <tool.icon className={`w-5 h-5 ${tool.iconColor}`} />
              </div>
              <h3 className="font-semibold text-white mb-2">{tool.title}</h3>
              <p className="text-sm mb-3 leading-relaxed" style={{ color: 'rgba(0,201,167,0.5)' }}>{tool.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {tool.examples.map(ex => (
                   <span key={ex} className="text-xs px-2 py-1 rounded-md" style={{ border: '1px solid rgba(0,201,167,0.3)', background: 'rgba(0,201,167,0.1)', color: 'rgba(0,201,167,0.6)' }}>{ex}</span>
                 ))}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex justify-end">
           <Button size="lg" onClick={handleProceed} disabled={!selected}
             className="gap-2 px-8 text-white border-0" style={{ backgroundColor: '#00C9A7', boxShadow: '0 0 20px rgba(0,201,167,0.3)' }}>
             Continue with {selected || '...'} <ArrowRight className="w-4 h-4" />
           </Button>
         </div>
      </div>
    </AppLayout>
  );
}