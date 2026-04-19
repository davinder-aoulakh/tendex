import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, FileText, Clock, CheckCircle, Archive, Trash2, MoreVertical, Search, Zap, Crown, AlertTriangle, Pencil, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import AppLayout from '@/components/layout/AppLayout';
import OnboardingBanner from '@/components/dashboard/OnboardingBanner';
import VersionHistory from '@/components/document/VersionHistory';
import { useToast } from '@/components/ui/use-toast';

const docTypeColors = {
  SOW: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  EOI: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  RFQ: 'bg-green-500/20 text-green-300 border-green-500/30',
  RFP: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
};

const statusIcons = {
  draft: Clock,
  complete: CheckCircle,
  archived: Archive,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [user, setUser] = useState(null);
  const [versionsDocId, setVersionsDocId] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-updated_date'),
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentSub = subscriptions[0];
  const currentPlan = currentSub?.plan || 'free';
  const planLimits = { free: 3, starter: 20, professional: 999 };
  const docsLimit = planLimits[currentPlan] || 3;
  const usagePct = docsLimit === 999 ? 5 : Math.min((documents.length / docsLimit) * 100, 100);
  const nearLimit = docsLimit !== 999 && documents.length >= docsLimit * 0.8;
  const atLimit = docsLimit !== 999 && documents.length >= docsLimit;

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Document.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  const archiveMutation = useMutation({
    mutationFn: (id) => base44.entities.Document.update(id, { status: 'archived' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  // Version counts per document
  const { data: allVersions = [] } = useQuery({
    queryKey: ['all-versions'],
    queryFn: () => base44.entities.DocumentVersion.list(),
  });
  const versionCountMap = allVersions.reduce((acc, v) => {
    acc[v.document_id] = (acc[v.document_id] || 0) + 1;
    return acc;
  }, {});

  const filtered = documents.filter(d => {
    const matchSearch = d.title?.toLowerCase().includes(search.toLowerCase()) ||
      d.project_name?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || d.document_type === filterType;
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const stats = {
    total: documents.length,
    drafts: documents.filter(d => d.status === 'draft').length,
    complete: documents.filter(d => d.status === 'complete').length,
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-10">

        <OnboardingBanner documentCount={documents.length} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-semibold text-white">My Documents</h1>
            <p className="text-blue-200/50 mt-1">Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}</p>
          </div>
          <Link to="/tool-select">
            <Button disabled={atLimit} className="gap-2 bg-blue-500 hover:bg-blue-400 text-white border-0 shadow-lg shadow-blue-500/20 disabled:opacity-50">
              <Plus className="w-4 h-4" /> New Document
            </Button>
          </Link>
        </div>

        {/* Usage / upgrade banner */}
        {atLimit ? (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-3 rounded-xl border border-red-400/30 px-5 py-3.5 mb-6"
            style={{ background: 'rgba(239,68,68,0.08)' }}>
            <div className="flex items-center gap-2 text-sm text-red-300">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              You've reached your {docsLimit}-document limit on the <span className="font-semibold capitalize">{currentPlan}</span> plan.
            </div>
            <Link to="/billing"><Button size="sm" className="bg-blue-500 hover:bg-blue-400 text-white border-0 flex-shrink-0">Upgrade</Button></Link>
          </motion.div>
        ) : nearLimit ? (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-3 rounded-xl border border-amber-400/30 px-5 py-3.5 mb-6"
            style={{ background: 'rgba(245,158,11,0.07)' }}>
            <div className="flex items-center gap-2 text-sm text-amber-300">
              <Zap className="w-4 h-4 flex-shrink-0" />
              {documents.length} of {docsLimit} documents used — consider upgrading.
            </div>
            <Link to="/billing"><Button size="sm" variant="ghost" className="text-amber-300 hover:text-white border border-amber-400/30 hover:bg-white/10 flex-shrink-0 h-7 text-xs">View Plans</Button></Link>
          </motion.div>
        ) : null}

        {/* Plan usage bar */}
        {docsLimit !== 999 && (
          <div className="rounded-xl border border-white/10 px-5 py-4 mb-8 flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-blue-200/50 flex items-center gap-1.5">
                  {currentPlan === 'free' ? <Zap className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
                  <span className="capitalize">{currentPlan} plan</span>
                </span>
                <span className="text-white/60">{documents.length} / {docsLimit} docs</span>
              </div>
              <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className={`rounded-full h-1.5 transition-all ${atLimit ? 'bg-red-500' : nearLimit ? 'bg-amber-400' : 'bg-blue-500'}`}
                  style={{ width: `${usagePct}%` }} />
              </div>
            </div>
            {currentPlan === 'free' && (
              <Link to="/billing">
                <Button size="sm" className="text-xs bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 border border-blue-400/20 h-7">Upgrade</Button>
              </Link>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Documents', value: stats.total, color: 'text-white' },
            { label: 'In Progress', value: stats.drafts, color: 'text-amber-400' },
            { label: 'Completed', value: stats.complete, color: 'text-green-400' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-white/10 p-5" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-blue-200/50 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>


        {/* Filters */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/40" />
              <Input
                placeholder="Search documents..."
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-blue-500/50"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs text-blue-200/40 self-center hidden sm:block">Type:</span>
              {['all', 'SOW', 'EOI', 'RFQ', 'RFP'].map(type => (
                <Button key={type} size="sm"
                  onClick={() => setFilterType(type)}
                  className={`text-xs transition-colors ${filterType === type
                    ? 'bg-blue-500 text-white border-0 hover:bg-blue-400'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'}`}>
                  {type === 'all' ? 'All Types' : type}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-blue-200/40 self-center">Status:</span>
            {['all', 'draft', 'complete', 'archived'].map(s => (
              <Button key={s} size="sm"
                onClick={() => setFilterStatus(s)}
                className={`text-xs capitalize transition-colors ${filterStatus === s
                  ? 'bg-blue-500 text-white border-0 hover:bg-blue-400'
                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'}`}>
                {s === 'all' ? 'All Statuses' : s}
              </Button>
            ))}
          </div>
        </div>

        {/* Document List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <FileText className="w-12 h-12 text-blue-300/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No documents yet</h3>
            <p className="text-blue-200/50 mb-6">Create your first procurement document to get started.</p>
            <Link to="/tool-select">
              <Button className="gap-2 bg-blue-500 hover:bg-blue-400 text-white border-0">
                <Plus className="w-4 h-4" />New Document
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((doc, i) => {
              const StatusIcon = statusIcons[doc.status] || Clock;
              return (
                <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-white/10 p-5 flex items-center justify-between gap-4 hover:border-blue-400/30 transition-all group cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                  onClick={() => navigate(`/document/${doc.id}`)}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-blue-500/15 rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-400/20">
                      <FileText className="w-5 h-5 text-blue-300" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-white truncate">{doc.title}</h3>
                        <Badge className={`text-xs border ${docTypeColors[doc.document_type] || 'bg-white/10 text-white/60'}`}>{doc.document_type}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <StatusIcon className={`w-3.5 h-3.5 flex-shrink-0 ${doc.status === 'complete' ? 'text-green-400' : doc.status === 'archived' ? 'text-white/30' : 'text-amber-400'}`} />
                        <span className="text-xs text-blue-200/50 capitalize">{doc.status}</span>
                        {doc.organisation_name && <span className="text-xs text-blue-200/40 truncate max-w-[160px]">{doc.organisation_name}</span>}
                        {doc.updated_date && <span className="text-xs text-blue-200/30">{format(new Date(doc.updated_date), 'MMM d, yyyy')}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {/* Version count badge */}
                    {versionCountMap[doc.id] > 0 && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-xs text-blue-300/50 border border-white/10 rounded-full px-2 py-0.5">
                        <History className="w-3 h-3" />{versionCountMap[doc.id]}v
                      </span>
                    )}
                    <Button variant="ghost" size="sm"
                      className="hidden sm:flex gap-1.5 text-xs text-white/50 hover:text-white hover:bg-white/10 border border-white/10"
                      onClick={() => navigate(`/document/${doc.id}`)}>
                      <Pencil className="w-3.5 h-3.5" />Edit
                    </Button>
                    <Button variant="ghost" size="sm"
                      className="hidden sm:flex gap-1.5 text-xs text-white/50 hover:text-white hover:bg-white/10 border border-white/10"
                      onClick={() => setVersionsDocId(doc.id)}>
                      <History className="w-3.5 h-3.5" />Versions
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-white/40 hover:text-white hover:bg-white/10">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/document/${doc.id}`)}>
                          <Pencil className="w-4 h-4 mr-2" />Edit Document
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setVersionsDocId(doc.id)}>
                          <History className="w-4 h-4 mr-2" />View Versions
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => archiveMutation.mutate(doc.id)}>
                          <Archive className="w-4 h-4 mr-2" />Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(doc.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Version history slide-in panel */}
      {versionsDocId && (
        <VersionHistory
          documentId={versionsDocId}
          onRestore={(content) => {
            setVersionsDocId(null);
            toast({ title: 'Version restored', description: 'Open the document to see the restored version.' });
          }}
          onClose={() => setVersionsDocId(null)}
        />
      )}
    </AppLayout>
  );
}