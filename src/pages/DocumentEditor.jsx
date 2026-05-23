import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Download, ChevronLeft, Save, Check, RefreshCw, History, MessageSquare, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateDocumentContent, SECTION_LABELS, SECTION_SCHEMAS } from '@/lib/aiDocumentGenerator';
import DocumentSection from '@/components/document/DocumentSection';
import PDFExport from '@/components/document/PDFExport';
import PDFPreview from '@/components/document/PDFPreview';
import GeneratingScreen from '@/components/document/GeneratingScreen';
import VersionHistory from '@/components/document/VersionHistory';
import VersionCompare from '@/components/document/VersionCompare';
import PresenceAvatars from '@/components/document/PresenceAvatars';
import CommentsSidebar from '@/components/document/CommentsSidebar';
import { usePresence } from '@/hooks/usePresence';
import AppLayout from '@/components/layout/AppLayout';
import { useToast } from '@/components/ui/use-toast';

export default function DocumentEditor() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [generatingDone, setGeneratingDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editedContent, setEditedContent] = useState({});
  const [showPDF, setShowPDF] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
   const [showCompare, setShowCompare] = useState(false);
   const [showComments, setShowComments] = useState(false);
   const [showSnapshotDialog, setShowSnapshotDialog] = useState(false);
   const [snapshotName, setSnapshotName] = useState('');
   const [savingSnapshot, setSavingSnapshot] = useState(false);
   const hasGenerated = useRef(false);
   const { presence, me, setActiveSection } = usePresence(id);

  const { data: doc, isLoading } = useQuery({
    queryKey: ['document', id],
    queryFn: () => base44.entities.Document.filter({ id }),
    select: (data) => data[0],
  });

  useEffect(() => {
    if (!doc) return;

    // Auto-generate if navigated here fresh with ?generating=true
    if (searchParams.get('generating') === 'true' && !doc.ai_enhanced_content && !hasGenerated.current) {
      hasGenerated.current = true;
      handleGenerate(doc);
      return;
    }

    // Load existing content — prefer final_content, fall back to ai_enhanced_content
    // Unwrap nested { response: { ... } } if the LLM returned that structure
    const unwrap = (obj) => {
      if (!obj || Object.keys(obj).length === 0) return null;
      if (obj.response && typeof obj.response === 'object') return obj.response;
      return obj;
    };

    const existing = unwrap(doc.final_content) || unwrap(doc.ai_enhanced_content);
    if (existing) {
      setEditedContent(existing);
    }
  // Use JSON stringify so the effect fires when content actually changes, not just reference
  }, [doc?.id, JSON.stringify(doc?.final_content), JSON.stringify(doc?.ai_enhanced_content)]);

  const saveVersion = async (content, source, label) => {
    const existing = await base44.entities.DocumentVersion.filter({ document_id: id }, '-version_number', 1);
    const nextVersion = existing.length > 0 ? (existing[0].version_number || 1) + 1 : 1;
    await base44.entities.DocumentVersion.create({
      document_id: id,
      version_number: nextVersion,
      label,
      source,
      content,
    });
    queryClient.invalidateQueries({ queryKey: ['versions', id] });
  };

  const handleGenerate = async (document) => {
    const docToUse = document || doc;
    if (!docToUse) return;
    setGenerating(true);
    setGeneratingDone(false);
    const content = await generateDocumentContent(docToUse.document_type, docToUse.questionnaire_data || {});
    await base44.entities.Document.update(docToUse.id, {
      ai_enhanced_content: content,
      final_content: content,
      status: 'complete',
    });
    await saveVersion(content, 'ai_generated', 'AI Generated');
    setEditedContent(content);
    queryClient.invalidateQueries({ queryKey: ['document', id] });
    setGeneratingDone(true);
    setTimeout(() => setGenerating(false), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Document.update(id, { final_content: editedContent });
    await saveVersion(editedContent, 'manual_save', 'Manual Save');
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    queryClient.invalidateQueries({ queryKey: ['document', id] });
    toast({ title: 'Document saved', description: 'Your changes have been saved.' });
  };

  const handleSectionChange = (sectionKey, value) => {
    setEditedContent(prev => ({ ...prev, [sectionKey]: value }));
  };

  const handleSaveSnapshot = async () => {
    if (!snapshotName.trim()) {
      toast({ title: 'Snapshot name required', description: 'Please enter a name for your snapshot.', variant: 'destructive' });
      return;
    }
    setSavingSnapshot(true);
    await saveVersion(editedContent, 'manual_save', snapshotName);
    setSavingSnapshot(false);
    setSnapshotName('');
    setShowSnapshotDialog(false);
    toast({ title: 'Snapshot saved', description: `Saved snapshot: "${snapshotName}"` });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#00C9A7' }} />
        </div>
      </AppLayout>
    );
  }

  const sections = doc ? SECTION_SCHEMAS[doc.document_type] || [] : [];
  const hasContent = editedContent && Object.keys(editedContent).length > 0;

  return (
    <AppLayout>
      <div className="px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <button onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-sm transition-colors mb-3" style={{ color: 'var(--text-muted)' }}>
              <ChevronLeft className="w-4 h-4" />Back to Dashboard
            </button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-syne text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{doc?.title || 'Document'}</h1>
              <Badge style={{ background: 'rgba(232,34,26,0.12)', color: 'var(--primary)', borderColor: 'var(--border-strong)', border: '1px solid' }}>{doc?.document_type}</Badge>
              <Badge className={`capitalize border ${doc?.status === 'complete' ? 'bg-green-500/20 text-green-300 border-green-500/30' : ''}`} style={doc?.status !== 'complete' ? { background: 'var(--muted)', color: 'var(--text-muted)', borderColor: 'var(--border)' } : {}}>
                {doc?.status}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <PresenceAvatars presence={presence} />
            <Button variant="ghost" size="sm" onClick={() => setShowComments(c => !c)}
              className="gap-2 hover-muted" style={{ border: '1px solid var(--border)', color: showComments ? 'var(--text-primary)' : 'var(--text-secondary)', background: showComments ? 'var(--muted)' : undefined }}>
              <MessageSquare className="w-4 h-4" />Comments
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleGenerate()} disabled={generating}
              className="gap-2 hover-muted" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />Regenerate
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSave} disabled={saving}
              className="gap-2 hover-muted" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              {saved ? <Check className="w-4 h-4 text-green-400" /> : saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowSnapshotDialog(true)}
              className="gap-2 hover-muted" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <Camera className="w-4 h-4" />Snapshot
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowHistory(h => !h)}
              className="gap-2 hover-muted" style={{ border: '1px solid var(--border)', color: showHistory ? 'var(--text-primary)' : 'var(--text-secondary)', background: showHistory ? 'var(--muted)' : undefined }}>
              <History className="w-4 h-4" />History
            </Button>
            <Button size="sm" onClick={() => setShowPDF(true)} disabled={!hasContent}
              className="gap-2 text-white border-0" style={{ backgroundColor: '#00C9A7', boxShadow: '0 0 20px rgba(0,201,167,0.3)' }}>
              <Download className="w-4 h-4" />Export
            </Button>
          </div>
        </div>

        {/* Generating overlay */}
        {generating && <GeneratingScreen done={generatingDone} documentId={id} />}

        {/* Split layout: editor left, PDF preview right */}
        {!generating && (
          <div className="flex gap-6" style={{ minHeight: 'calc(100vh - 220px)' }}>
            {/* Left: Editor */}
            <div className="flex-1 min-w-0">
              {hasContent ? (
                <div className="space-y-5">
                  {sections.map((sectionKey, i) => (
                    editedContent[sectionKey] && (
                      <motion.div key={sectionKey} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <DocumentSection
                          title={SECTION_LABELS[sectionKey] || sectionKey}
                          sectionKey={sectionKey}
                          content={editedContent[sectionKey]}
                          onChange={(val) => handleSectionChange(sectionKey, val)}
                          onFocus={() => setActiveSection(sectionKey)}
                          onBlur={() => setActiveSection('')}
                          activeEditors={presence.filter(p => p.active_section === sectionKey)}
                        />
                      </motion.div>
                    )
                  ))}
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={saving} size="lg"
                      className="gap-2 px-8 text-white border-0" style={{ backgroundColor: '#00C9A7', boxShadow: '0 0 20px rgba(0,201,167,0.3)' }}>
                      {saved ? <><Check className="w-4 h-4" />Saved!</> : saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Changes</>}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border p-16 text-center" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <Sparkles className="w-10 h-10 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No content yet</h3>
                  <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Generate AI content based on your questionnaire answers.</p>
                  <Button onClick={() => handleGenerate()} className="gap-2 text-white border-0" style={{ backgroundColor: '#00C9A7' }}>
                    <Sparkles className="w-4 h-4" />Generate Document
                  </Button>
                </div>
              )}
            </div>

            {/* Right: PDF Preview */}
            <div className="hidden lg:flex flex-col w-[480px] flex-shrink-0 rounded-xl overflow-hidden sticky top-20" style={{ height: 'calc(100vh - 140px)', background: 'var(--card)', border: '1px solid var(--border)' }}>
              <PDFPreview doc={doc} content={editedContent} />
            </div>
          </div>
        )}
      </div>

      {showPDF && doc && (
        <PDFExport doc={doc} content={editedContent} onClose={() => setShowPDF(false)} />
      )}

      <AnimatePresence>
        {showComments && (
          <CommentsSidebar
            documentId={id}
            sections={sections}
            me={me}
            onClose={() => setShowComments(false)}
          />
        )}
        {showCompare && doc && (
          <VersionCompare
            documentId={id}
            documentType={doc.document_type}
            onClose={() => setShowCompare(false)}
          />
        )}
        {showHistory && (
          <VersionHistory
            documentId={id}
            onRestore={(content) => { setEditedContent(content); setShowHistory(false); toast({ title: 'Version restored', description: 'The document has been restored to the selected version.' }); }}
            onClose={() => setShowHistory(false)}
            onCompare={() => { setShowHistory(false); setShowCompare(true); }}
          />
        )}
      </AnimatePresence>
    </AppLayout>
  );
}