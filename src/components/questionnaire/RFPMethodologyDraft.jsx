import { useState } from 'react';
import { Loader2, RefreshCw, Check, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

export default function RFPMethodologyDraft({ answers, value, onChange }) {
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');

  const generate = async () => {
    setGenerating(true);
    const serviceType = answers.service_type || answers.industry || answers.procurement_type || 'professional services';
    const scope = answers.summary_of_services || answers.product_description || answers.combined_primary_outcome || '';
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a procurement document writer for Australian government and corporate procurement.

Draft a formal methodology question to include in a Request for Proposal (RFP) for the following engagement:
- Service type: ${serviceType}
- Scope summary: ${scope || 'Not specified'}

The question should ask suppliers to describe HOW they will deliver the required services. It should:
- Be written in formal Australian procurement language
- Be 2–4 sentences as a question or instruction to the supplier
- Prompt suppliers to describe their proposed approach, project plan, team structure, and quality assurance methods
- Be specific to the service type where possible

Return only the methodology question text — no headings, no preamble.`,
      model: 'gpt_5_mini',
    });
    const text = typeof result === 'string' ? result : '';
    setDraft(text);
    onChange(text);
    setGenerating(false);
    setEditing(false);
  };

  const handleEdit = (val) => {
    setDraft(val);
    onChange(val);
  };

  return (
    <div className="rounded-xl border border-blue-400/20 p-5" style={{ background: 'rgba(59,130,246,0.05)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-blue-200/80">AI-Drafted Methodology Question</p>
        <div className="flex gap-2">
          {draft && !editing && (
            <Button type="button" size="sm" variant="ghost"
              onClick={() => setEditing(true)}
              className="gap-1.5 text-xs text-blue-300/70 hover:text-blue-200 hover:bg-white/10">
              <Pencil className="w-3 h-3" /> Edit
            </Button>
          )}
          <Button type="button" size="sm" variant="ghost"
            onClick={generate} disabled={generating}
            className="gap-1.5 text-xs text-blue-300 hover:text-blue-200 hover:bg-white/10">
            {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            {draft ? 'Regenerate' : 'Generate'}
          </Button>
        </div>
      </div>

      {generating && (
        <div className="flex items-center gap-2 py-4 text-sm text-blue-200/50">
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> Drafting methodology question...
        </div>
      )}

      {!generating && !draft && (
        <p className="text-xs text-blue-200/40 italic">Click "Generate" to draft a methodology question based on your service type.</p>
      )}

      {!generating && draft && (
        editing ? (
          <div className="space-y-3">
            <Textarea
              value={draft}
              onChange={e => handleEdit(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-blue-500/50 min-h-[100px] text-sm"
            />
            <Button type="button" size="sm" onClick={() => setEditing(false)}
              className="gap-1.5 bg-blue-500 hover:bg-blue-400 text-white border-0 text-xs">
              <Check className="w-3 h-3" /> Done
            </Button>
          </div>
        ) : (
          <p className="text-sm text-white/80 leading-relaxed">{draft}</p>
        )
      )}
    </div>
  );
}