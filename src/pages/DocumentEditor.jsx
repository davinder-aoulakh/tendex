import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Download, ChevronLeft, Save, Check, RefreshCw, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateDocumentContent, SECTION_LABELS, SECTION_SCHEMAS } from '@/lib/aiDocumentGenerator';
import DocumentSection from '@/components/document/DocumentSection';
import PDFExport from '@/components/document/PDFExport';
import AppLayout from '@/components/layout/AppLayout';
import { useToast } from '@/components/ui/use-toast';

export default function DocumentEditor() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editedContent, setEditedContent] = useState({});
  const [showPDF, setShowPDF] = useState(false);
  const hasGenerated = useRef(false);

  const { data: doc, isLoading } = useQuery({
    queryKey: ['document', id],
    queryFn: () => base44.entities.Document.filter({ id }),
    select: (data) => data[0],
  });

  // Auto-generate if coming fresh from questionnaire
  useEffect(() => {
    if (doc && searchParams.get('generating') === 'true' && !doc.ai_enhanced_content && !hasGenerated.current) {
      hasGenerated.current = true;
      handleGenerate(doc);
    }
    if (doc?.final_content && Object.keys(doc.final_content).length > 0) {
      setEditedContent(doc.final_content);
    } else if (doc?.ai_enhanced_content && Object.keys(doc.ai_enhanced_content).length > 0) {
      setEditedContent(doc.ai_enhanced_content);
    }
  }, [doc]);

  const handleGenerate = async (document) => {
    const docToUse = document || doc;
    if (!docToUse) return;
    setGenerating(true);
    const content = await generateDocumentContent(docToUse.document_type, docToUse.questionnaire_data || {});
    await base44.entities.Document.update(docToUse.id, {
      ai_enhanced_content: content,
      final_content: content,
      status: 'complete',
    });
    setEditedContent(content);
    queryClient.invalidateQueries({ queryKey: ['document', id] });
    setGenerating(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Document.update(id, { final_content: editedContent });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    queryClient.invalidateQueries({ queryKey: ['document', id] });
    toast({ title: 'Document saved', description: 'Your changes have been saved.' });
  };

  const handleSectionChange = (sectionKey, value) => {
    setEditedContent(prev => ({ ...prev, [sectionKey]: value }));
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const sections = doc ? SECTION_SCHEMAS[doc.document_type] || [] : [];
  const hasContent = editedContent && Object.keys(editedContent).length > 0;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors">
              <ChevronLeft className="w-4 h-4" />Back to Dashboard
            </button>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-semibold text-foreground">{doc?.title || 'Document'}</h1>
              <Badge variant="secondary">{doc?.document_type}</Badge>
              <Badge variant={doc?.status === 'complete' ? 'default' : 'secondary'} className="capitalize">{doc?.status}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleGenerate()} disabled={generating} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />Regenerate
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={saving} className="gap-2">
              {saved ? <Check className="w-4 h-4 text-green-500" /> : saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save'}
            </Button>
            <Button size="sm" onClick={() => setShowPDF(true)} disabled={!hasContent} className="gap-2">
              <Download className="w-4 h-4" />Export PDF
            </Button>
          </div>
        </div>

        {/* Generating State */}
        {generating && (
          <div className="bg-accent/50 rounded-2xl p-12 text-center border border-border mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-primary animate-pulse" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">AI is drafting your document...</h2>
            <p className="text-muted-foreground text-sm">Using GPT-4o to generate professional procurement content. This takes 30-60 seconds.</p>
            <div className="mt-6 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          </div>
        )}

        {/* Content Sections */}
        {!generating && hasContent && (
          <div className="space-y-5">
            {sections.map((sectionKey, i) => (
              editedContent[sectionKey] && (
                <motion.div key={sectionKey} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <DocumentSection
                    title={SECTION_LABELS[sectionKey] || sectionKey}
                    content={editedContent[sectionKey]}
                    onChange={(val) => handleSectionChange(sectionKey, val)}
                  />
                </motion.div>
              )
            ))}
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2 px-8">
                {saved ? <><Check className="w-4 h-4" />Saved!</> : saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Changes</>}
              </Button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!generating && !hasContent && (
          <div className="bg-card rounded-2xl border border-border p-16 text-center">
            <Sparkles className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No content yet</h3>
            <p className="text-muted-foreground mb-6">Generate AI content based on your questionnaire answers.</p>
            <Button onClick={() => handleGenerate()} className="gap-2"><Sparkles className="w-4 h-4" />Generate Document</Button>
          </div>
        )}
      </div>

      {/* PDF Modal */}
      {showPDF && doc && (
        <PDFExport doc={doc} content={editedContent} onClose={() => setShowPDF(false)} />
      )}
    </AppLayout>
  );
}