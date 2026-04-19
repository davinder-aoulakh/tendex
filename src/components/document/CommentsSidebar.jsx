import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Check, ChevronDown, ChevronUp, CornerDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SECTION_LABELS } from '@/lib/aiDocumentGenerator';
import { format } from 'date-fns';

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function avatarColor(email = '') {
  const colors = ['#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#ef4444','#06b6d4'];
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) | 0;
  return colors[Math.abs(h) % colors.length];
}

function Avatar({ name, email, size = 7 }) {
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: avatarColor(email) }}
    >
      {initials(name)}
    </div>
  );
}

function CommentThread({ comment, replies, me, onReply, onResolve }) {
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`rounded-xl border overflow-hidden transition-all ${
      comment.resolved ? 'border-white/5 opacity-50' : 'border-white/10'
    }`} style={{ background: 'rgba(255,255,255,0.04)' }}>
      {/* Comment header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start gap-2.5">
          <Avatar name={comment.author_name} email={comment.author_email} size={7} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-white/80">{comment.author_name}</span>
              <span className="text-xs text-blue-200/30">
                {comment.created_date ? format(new Date(comment.created_date), 'dd MMM, h:mm a') : ''}
              </span>
              {comment.resolved && (
                <Badge className="text-xs bg-emerald-500/15 text-emerald-300 border-emerald-500/20">Resolved</Badge>
              )}
            </div>
            {!collapsed && (
              <p className="text-sm text-blue-100/70 mt-1.5 leading-relaxed">{comment.text}</p>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!comment.resolved && me && (
              <Button variant="ghost" size="icon"
                className="w-6 h-6 text-white/20 hover:text-emerald-400 hover:bg-white/5"
                onClick={() => onResolve(comment.id)}
                title="Mark resolved">
                <Check className="w-3 h-3" />
              </Button>
            )}
            <Button variant="ghost" size="icon"
              className="w-6 h-6 text-white/20 hover:text-white hover:bg-white/5"
              onClick={() => setCollapsed(c => !c)}>
              {collapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Replies */}
      {!collapsed && replies.length > 0 && (
        <div className="border-t border-white/8 px-4 py-2 space-y-2.5">
          {replies.map(r => (
            <div key={r.id} className="flex items-start gap-2">
              <CornerDownRight className="w-3 h-3 text-white/20 mt-1 flex-shrink-0" />
              <Avatar name={r.author_name} email={r.author_email} size={5} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white/70">{r.author_name}</span>
                  <span className="text-xs text-blue-200/25">
                    {r.created_date ? format(new Date(r.created_date), 'dd MMM, h:mm a') : ''}
                  </span>
                </div>
                <p className="text-xs text-blue-100/60 mt-0.5 leading-relaxed">{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply area */}
      {!collapsed && !comment.resolved && me && (
        <div className="border-t border-white/8 px-3 py-2">
          {showReply ? (
            <div className="flex items-end gap-2">
              <Textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Write a reply…"
                className="flex-1 min-h-[56px] text-xs resize-none bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-blue-500/40"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && replyText.trim()) {
                    onReply(comment.id, replyText.trim());
                    setReplyText('');
                    setShowReply(false);
                  }
                }}
              />
              <div className="flex flex-col gap-1.5">
                <Button size="icon"
                  className="w-7 h-7 bg-blue-500 hover:bg-blue-400 text-white border-0"
                  disabled={!replyText.trim()}
                  onClick={() => { onReply(comment.id, replyText.trim()); setReplyText(''); setShowReply(false); }}>
                  <Send className="w-3 h-3" />
                </Button>
                <Button size="icon" variant="ghost"
                  className="w-7 h-7 text-white/30 hover:text-white hover:bg-white/10"
                  onClick={() => { setShowReply(false); setReplyText(''); }}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowReply(true)}
              className="text-xs text-blue-300/40 hover:text-blue-300/70 transition-colors">
              Reply…
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function CommentsSidebar({ documentId, sections, me, onClose }) {
  const qc = useQueryClient();
  const [activeSection, setActiveSection] = useState('all');
  const [newText, setNewText] = useState('');
  const [newSection, setNewSection] = useState(sections[0] || '');
  const [showResolved, setShowResolved] = useState(false);

  const { data: allComments = [] } = useQuery({
    queryKey: ['comments', documentId],
    queryFn: () => base44.entities.DocumentComment.filter({ document_id: documentId }, '-created_date', 200),
    refetchInterval: 15_000,
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsub = base44.entities.DocumentComment.subscribe(() => {
      qc.invalidateQueries({ queryKey: ['comments', documentId] });
    });
    return () => unsub();
  }, [documentId]);

  const addComment = useMutation({
    mutationFn: (data) => base44.entities.DocumentComment.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', documentId] }),
  });

  const addReply = useMutation({
    mutationFn: ({ parentId, text }) => base44.entities.DocumentComment.create({
      document_id: documentId,
      section_key: allComments.find(c => c.id === parentId)?.section_key || '',
      author_email: me?.email || 'anonymous',
      author_name: me?.full_name || me?.email?.split('@')[0] || 'Anonymous',
      text,
      parent_id: parentId,
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', documentId] }),
  });

  const resolveComment = useMutation({
    mutationFn: (id) => base44.entities.DocumentComment.update(id, { resolved: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', documentId] }),
  });

  const handlePost = () => {
    if (!newText.trim() || !me) return;
    addComment.mutate({
      document_id: documentId,
      section_key: newSection,
      author_email: me.email,
      author_name: me.full_name || me.email.split('@')[0],
      text: newText.trim(),
      resolved: false,
    });
    setNewText('');
  };

  // Group: top-level comments (no parent_id) + their replies
  const topLevel = allComments.filter(c => !c.parent_id);
  const replies = allComments.filter(c => !!c.parent_id);

  const filtered = topLevel.filter(c => {
    if (!showResolved && c.resolved) return false;
    if (activeSection !== 'all' && c.section_key !== activeSection) return false;
    return true;
  });

  const unresolvedCount = topLevel.filter(c => !c.resolved).length;

  // Section tabs — only show sections that have comments (+ "all")
  const activeSections = [...new Set(topLevel.map(c => c.section_key).filter(Boolean))];

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
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-white text-sm">Comments</h3>
          {unresolvedCount > 0 && (
            <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded-full">
              {unresolvedCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm"
            onClick={() => setShowResolved(v => !v)}
            className="h-7 px-2 text-xs text-white/30 hover:text-white hover:bg-white/10">
            {showResolved ? 'Hide resolved' : 'Show resolved'}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}
            className="w-7 h-7 text-white/40 hover:text-white hover:bg-white/10">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Section filter tabs */}
      {activeSections.length > 0 && (
        <div className="flex gap-1.5 px-4 py-2.5 border-b border-white/8 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSection('all')}
            className={`text-xs px-2.5 py-1 rounded-full flex-shrink-0 transition-colors ${
              activeSection === 'all'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-white/40 hover:text-white border border-white/10'
            }`}>
            All
          </button>
          {activeSections.map(sk => (
            <button key={sk}
              onClick={() => setActiveSection(sk)}
              className={`text-xs px-2.5 py-1 rounded-full flex-shrink-0 transition-colors truncate max-w-[120px] ${
                activeSection === sk
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-white/40 hover:text-white border border-white/10'
              }`}>
              {SECTION_LABELS[sk] || sk}
            </button>
          ))}
        </div>
      )}

      {/* Comment list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <MessageSquare className="w-8 h-8 text-blue-300/15 mx-auto mb-3" />
            <p className="text-sm text-blue-200/30">No comments yet.</p>
            <p className="text-xs text-blue-200/20 mt-1">Be the first to comment on this document.</p>
          </div>
        ) : (
          filtered.map(comment => (
            <CommentThread
              key={comment.id}
              comment={comment}
              replies={replies.filter(r => r.parent_id === comment.id)}
              me={me}
              onReply={(parentId, text) => addReply.mutate({ parentId, text })}
              onResolve={(id) => resolveComment.mutate(id)}
            />
          ))
        )}
      </div>

      {/* New comment form */}
      <div className="border-t border-white/10 px-4 py-4 space-y-2.5">
        {!me ? (
          <p className="text-xs text-blue-200/40 text-center py-2">Sign in to leave comments.</p>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Avatar name={me.full_name} email={me.email} size={6} />
              <select
                value={newSection}
                onChange={e => setNewSection(e.target.value)}
                className="flex-1 text-xs rounded-lg border border-white/10 bg-white/5 text-white/70 px-2.5 py-1.5 focus:outline-none focus:border-blue-500/50"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <option value="" style={{ background: '#0d1b4b' }}>General</option>
                {sections.map(sk => (
                  <option key={sk} value={sk} style={{ background: '#0d1b4b' }}>
                    {SECTION_LABELS[sk] || sk}
                  </option>
                ))}
              </select>
            </div>
            <Textarea
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="Add a comment… (⌘+Enter to post)"
              className="min-h-[72px] text-sm resize-none bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-blue-500/40"
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && newText.trim()) handlePost();
              }}
            />
            <Button
              onClick={handlePost}
              disabled={!newText.trim() || addComment.isPending}
              size="sm"
              className="w-full gap-1.5 bg-blue-500 hover:bg-blue-400 text-white border-0 disabled:opacity-40">
              <Send className="w-3.5 h-3.5" />Post Comment
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}