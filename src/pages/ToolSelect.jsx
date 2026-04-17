import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Lightbulb, ClipboardList, Search, ArrowRight, Bot, Sparkles } from 'lucide-react';
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
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    accentBg: 'bg-blue-50',
    examples: ['IT system implementation', 'Marketing campaign', 'Consulting engagement'],
  },
  {
    id: 'EOI',
    icon: Lightbulb,
    title: 'Expression of Interest (EOI)',
    description: 'Invite suppliers to indicate their interest and capability for an upcoming opportunity.',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    accentBg: 'bg-purple-50',
    examples: ['Pre-qualification of suppliers', 'Market sounding', 'Shortlisting vendors'],
  },
  {
    id: 'RFQ',
    icon: ClipboardList,
    title: 'Request for Quotation (RFQ)',
    description: 'Solicit price quotes from suppliers for well-defined goods or services.',
    color: 'bg-green-50 text-green-600 border-green-200',
    accentBg: 'bg-green-50',
    examples: ['Office supplies procurement', 'Standard software licences', 'Routine maintenance'],
  },
  {
    id: 'RFP',
    icon: Search,
    title: 'Request for Proposal (RFP)',
    description: 'Invite detailed proposals from vendors for complex or innovative solutions.',
    color: 'bg-orange-50 text-orange-600 border-orange-200',
    accentBg: 'bg-orange-50',
    examples: ['Enterprise software solution', 'Professional services', 'Strategic partnership'],
  },
];

export default function ToolSelect() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

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
    if (selected) {
      navigate(`/questionnaire/${selected}`);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-4xl font-semibold text-foreground mb-3">What document do you need?</h1>
          <p className="text-muted-foreground text-lg">Choose a document type or describe your need and let AI guide you.</p>
        </motion.div>

        {/* AI Assist */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Not sure? Describe your need</h2>
          </div>
          <div className="flex gap-3">
            <Textarea
              placeholder="e.g. I need to hire a web developer to build our e-commerce site..."
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              className="min-h-[80px] resize-none flex-1"
            />
            <Button onClick={handleAiSelect} disabled={aiLoading || !aiQuery.trim()} className="self-end gap-2 whitespace-nowrap">
              {aiLoading ? <><Sparkles className="w-4 h-4 animate-spin" />Analysing...</> : <><Sparkles className="w-4 h-4" />Suggest Type</>}
            </Button>
          </div>
          {aiSuggestion && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 bg-accent rounded-lg text-sm">
              <span className="font-semibold text-primary">Recommended: {aiSuggestion.type}</span>
              <span className="text-muted-foreground ml-2">— {aiSuggestion.reason}</span>
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
                  ? 'border-primary bg-accent shadow-md'
                  : 'border-border bg-card hover:border-primary/40 hover:shadow-sm'
              }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${tool.accentBg}`}>
                <tool.icon className={`w-5 h-5 ${selected === tool.id ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{tool.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{tool.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {tool.examples.map(ex => (
                  <span key={ex} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">{ex}</span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex justify-end">
          <Button size="lg" onClick={handleProceed} disabled={!selected} className="gap-2 px-8">
            Continue with {selected || '...'} <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}