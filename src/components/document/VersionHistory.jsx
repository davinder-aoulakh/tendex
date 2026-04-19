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
      className="fixed top-0 right-0 h-full w-80 z-40 flex flex-col border-l border-white/10 shadow-2xl"
      style={{ background: 'rgba(8,13,36,0.98)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-white text-sm">Version History</h3>
        </div>
        <div className="flex items-center gap-1">
          {onCompare && (
            <Button variant="ghost" size="sm" onClick={onCompare}
              className="h-7 px-2 text-xs gap-1.5 text-blue-300/60 hover:text-blue-200 hover:bg-white/10">
              <ArrowLeftRight className="w-3.5 h-3.5" />Compare
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}
            className="w-7 h-7 text-white/40 hover:text-white hover:bg-white/10">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Version list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {isLoading ? (
          <div className="space-y-2 pt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
            ))}
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-8 h-8 text-blue-300/20 mx-auto mb-3" />
            <p className="text-sm text-blue-200/40">No versions yet.</p>
            <p className="text-xs text-blue-200/30 mt-1">Versions are saved each time you save or regenerate.</p>
          </div>
        ) : (
          versions.map((v, i) => (
            <div key={v.id}
              className="rounded-xl border border-white/10 p-4 hover:border-blue-400/30 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {v.source === 'ai_generated'
                    ? <Sparkles className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    : <Pencil className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />}
                  <span className="text-sm font-medium text-white">
                    {v.label || (v.source === 'ai_generated' ? 'AI Generated' : 'Manual Save')}
                  </span>
                </div>
                {i === 0 && (
                  <Badge className="text-xs bg-green-500/20 text-green-300 border-green-500/30 flex-shrink-0">Latest</Badge>
                )}
              </div>
              <p className="text-xs text-blue-200/40 mb-3 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {v.created_date ? format(new Date(v.created_date), 'dd MMM yyyy, h:mm a') : '—'}
              </p>

              {confirmId === v.id ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => restoreMutation.mutate(v)}
                    disabled={restoreMutation.isPending}
                    className="flex-1 h-7 text-xs bg-blue-500 hover:bg-blue-400 text-white border-0">
                    Confirm Restore
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}
                    className="h-7 text-xs text-white/50 hover:text-white hover:bg-white/10 border border-white/10">
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setConfirmId(v.id)}
                  className="w-full h-7 text-xs gap-1.5 text-white/50 hover:text-white hover:bg-white/10 border border-white/10">
                  <RotateCcw className="w-3 h-3" />Restore this version
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-3 border-t border-white/10">
        <p className="text-xs text-blue-200/30 text-center">
          Versions are saved automatically on each save or AI regeneration.
        </p>
      </div>
    </motion.div>
  );
}