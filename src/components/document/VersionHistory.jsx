import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { History, RotateCcw, Sparkles, Pencil, ChevronRight, X, Clock, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function VersionHistory({ documentId, onRestore, onClose, onCompare }) {
  const [confirmId, setConfirmId] = useState(null);
  const queryClient = useQueryClient();

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['versions', documentId],
    queryFn: () => base44.entities.DocumentVersion.filter(
      { document_id: documentId },
      '-created_date',
      50
    ),
  });

  const restoreMutation = useMutation({
    mutationFn: async (version) => {
      await base44.entities.Document.update(documentId, { final_content: version.content });
      return version.content;
    },
    onSuccess: (content) => {
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
      onRestore(content);
      setConfirmId(null);
    },
  });

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-80 z-40 flex flex-col shadow-2xl"
      style={{ background: 'var(--card)', borderLeft: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <History className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Version History</h3>
        </div>
        <div className="flex items-center gap-1">
          {onCompare && (
            <Button variant="ghost" size="sm" onClick={onCompare}
              className="h-7 px-2 text-xs gap-1.5 hover-muted" style={{ color: 'var(--text-secondary)' }}>
              <ArrowLeftRight className="w-3.5 h-3.5" />Compare
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}
            className="w-7 h-7 hover-muted" style={{ color: 'var(--text-muted)' }}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Version list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {isLoading ? (
          <div className="space-y-2 pt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-lg animate-pulse" style={{ background: 'var(--muted)' }} />
            ))}
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No versions yet.</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Versions are saved each time you save or regenerate.</p>
          </div>
        ) : (
          versions.map((v, i) => (
            <div key={v.id}
              className="rounded-xl border p-4 transition-all"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {v.source === 'ai_generated'
                    ? <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                    : <Pencil className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--purple)' }} />}
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {v.label || (v.source === 'ai_generated' ? 'AI Generated' : 'Manual Save')}
                  </span>
                </div>
                {i === 0 && (
                  <Badge className="text-xs bg-green-500/20 text-green-300 border-green-500/30 flex-shrink-0">Latest</Badge>
                )}
              </div>
              <p className="text-xs mb-3 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <Clock className="w-3 h-3" />
                {v.created_date ? format(new Date(v.created_date), 'dd MMM yyyy, h:mm a') : '—'}
              </p>

              {confirmId === v.id ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => restoreMutation.mutate(v)}
                      disabled={restoreMutation.isPending}
                      className="flex-1 h-7 text-xs text-white border-0" style={{ backgroundColor: 'var(--action)' }}>
                      Confirm Restore
                    </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}
                    className="h-7 text-xs hover-muted" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setConfirmId(v.id)}
                  className="w-full h-7 text-xs gap-1.5 hover-muted" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <RotateCcw className="w-3 h-3" />Restore this version
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
         <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
           Versions are saved automatically on each save, regeneration, or custom snapshots.
         </p>
       </div>
    </motion.div>
  );
}