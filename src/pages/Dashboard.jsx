import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, FileText, Clock, CheckCircle, Archive, Trash2, MoreVertical, Search, Zap, Crown, AlertTriangle, Pencil, History, Play, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import AppLayout from '@/components/layout/AppLayout';
import OnboardingBanner from '@/components/dashboard/OnboardingBanner';
import VersionHistory from '@/components/document/VersionHistory';
import { useToast } from '@/components/ui/use-toast';

const docTypeStyles = {
  SOW: { background: 'rgba(232,34,26,0.12)', color: '#E8221A', borderColor: 'rgba(232,34,26,0.35)' },
  EOI: { background: 'var(--warning-subtle)', color: 'var(--warning)', borderColor: 'var(--warning-border)' },
  RFQ: { background: 'var(--success-subtle)', color: 'var(--success)', borderColor: 'var(--success-border)' },
  RFP: { background: 'var(--action-subtle)', color: 'var(--action)', borderColor: 'var(--action-border)' },
};

// Map document type + status to procurement status label
const getProcurementStatus = (doc) => {
  if (doc.status === 'complete') {
    const suffix = doc.questionnaire_type ? `${doc.questionnaire_type} issued` : 'issued';
    return `Complete — ${suffix}`;
  }
  if (doc.status === 'draft') {
    const stage = doc.questionnaire_step !== undefined && doc.questionnaire_step > 0 ? 'Questionnaire' : 'Scope';
    return `In progress — ${stage}`;
  }
  return doc.status;
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
    queryKey: ['documents', user?.email],
    queryFn: () => user?.email ? base44.entities.Document.filter({ created_by: user.email }, '-updated_date') : Promise.resolve([]),
    enabled: !!user?.email,
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentSub = subscriptions[0];
  const currentPlan = currentSub?.plan || 'free';
  const planLimits = { free: 25, starter: 50, professional: 999 };
  const docsLimit = currentSub?.documents_limit || planLimits[currentPlan] || 25;
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
      d.project_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.procurement_id?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchStatus && d.status !== 'archived';
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
            <h1 className="font-syne font-800 text-3xl" style={{ color: 'var(--text-primary)' }}>My Documents</h1>
            <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-white/60 hover:text-white border border-white/10 hover:bg-white/10">
                  Quick create <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <DropdownMenuLabel className="text-xs" style={{ color: 'var(--text-muted)' }}>Create a document directly</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate('/questionnaire/SOW?mode=standalone')} style={{ color: 'var(--text-primary)' }}>Scope of Work (SOW)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/questionnaire/EOI')} style={{ color: 'var(--text-primary)' }}>Expression of Interest (EOI)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/questionnaire/RFQ')} style={{ color: 'var(--text-primary)' }}>Request for Quotation (RFQ)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/questionnaire/RFP')} style={{ color: 'var(--text-primary)' }}>Request for Proposal (RFP)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/start-procurement">
              <Button className="gap-2 border-0 shadow-lg" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', boxShadow: '0 0 20px rgba(232,34,26,0.3)' }}>
                <Plus className="w-4 h-4" /> Start Procurement
              </Button>
            </Link>
          </div>
        </div>

        {/* Usage / upgrade banner */}
        {atLimit ? (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-3 rounded-xl px-5 py-3.5 mb-6"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--destructive)' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              You've reached your {docsLimit}-document limit on the <span className="font-semibold capitalize">{currentPlan}</span> plan.
            </div>
            <Link to="/billing"><Button size="sm" className="border-0 flex-shrink-0" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>Upgrade</Button></Link>
          </motion.div>
        ) : nearLimit ? (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-3 rounded-xl px-5 py-3.5 mb-6"
            style={{ background: 'var(--warning-subtle)', border: '1px solid var(--warning-border)' }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--warning)' }}>
              <Zap className="w-4 h-4 flex-shrink-0" />
              {documents.length} of {docsLimit} documents used — consider upgrading.
            </div>
            <Link to="/billing"><Button size="sm" variant="ghost" className="flex-shrink-0 h-7 text-xs" style={{ color: 'var(--warning)', border: '1px solid var(--warning-border)' }}>View Plans</Button></Link>
          </motion.div>
        ) : null}

        {/* Plan usage bar */}
        {docsLimit !== 999 && (
           <div className="rounded-xl border border-white/10 px-5 py-4 mb-8 flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
             <div className="flex-1">
               <div className="flex justify-between text-xs mb-1.5">
                 <span className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                   {currentPlan === 'free' ? <Zap className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
                   <span className="capitalize">{currentPlan} plan</span>
                 </span>
                 <span className="text-white/60">{documents.length} / {docsLimit} docs</span>
               </div>
               <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.1)' }}>
                 <div className="rounded-full h-1.5 transition-all" style={{ backgroundColor: atLimit ? 'var(--destructive)' : nearLimit ? 'var(--warning)' : 'var(--primary)' }}
                   style={{ width: `${usagePct}%` }} />
               </div>
             </div>
             {currentPlan === 'free' && (
               <Link to="/billing">
                   <Button size="sm" className="text-xs h-7" style={{ color: 'var(--primary)', border: '1px solid rgba(232,34,26,0.3)', backgroundColor: 'rgba(232,34,26,0.1)' }}>Upgrade</Button>
                 </Link>
             )}
           </div>
         )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Documents', value: stats.total, varColor: 'var(--text-primary)' },
            { label: 'In Progress', value: stats.drafts, varColor: 'var(--warning)' },
            { label: 'Completed', value: stats.complete, varColor: 'var(--success)' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-5">
              <div className="text-3xl font-bold" style={{ color: s.varColor }}>{s.value}</div>
              <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(232,34,26,0.4)' }} />
             <Input
               placeholder="Search by title or document ID..."
               className="pl-9 focus-visible:ring-[#E8221A]/50"
               style={{ background: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
               value={search}
               onChange={e => setSearch(e.target.value)}
             />
           </div>
          </div>
          <div className="flex gap-2 flex-wrap">
           <span className="text-xs self-center" style={{ color: 'var(--text-muted)' }}>Filter:</span>
            {['all', 'draft', 'complete'].map(s => (
              <Button key={s} size="sm"
                onClick={() => setFilterStatus(s)}
                style={filterStatus === s
                  ? { background: 'var(--primary)', color: 'var(--primary-foreground)', border: 'none' }
                  : { background: 'var(--muted)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                className="text-xs capitalize transition-colors hover-muted">
                {s === 'all' ? 'All Status' : s === 'draft' ? 'In Progress' : 'Completed'}
              </Button>
            ))}
          </div>
        </div>

        {/* Document List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--muted)' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
           <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(232,34,26,0.2)' }} />
           <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
             {documents.length === 0 ? "You haven't started any procurements yet" : 'No procurements match your filters'}
           </h3>
           <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
             {documents.length === 0 ? 'Start your first one to begin.' : 'Try adjusting your search or filters.'}
           </p>
           {documents.length === 0 && (
             <div className="flex flex-col items-center gap-3">
               <Link to="/start-procurement">
                 <Button className="gap-2 border-0" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                     <Plus className="w-4 h-4" />Start a new procurement
                   </Button>
               </Link>
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="sm" className="gap-1 text-xs hover-muted" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                     Quick create <ChevronDown className="w-3 h-3" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                   <DropdownMenuLabel className="text-xs" style={{ color: 'var(--text-muted)' }}>Create a document directly</DropdownMenuLabel>
                   <DropdownMenuItem onClick={() => navigate('/questionnaire/SOW?mode=standalone')} style={{ color: 'var(--text-primary)' }}>Scope of Work (SOW)</DropdownMenuItem>
                   <DropdownMenuItem onClick={() => navigate('/questionnaire/EOI')} style={{ color: 'var(--text-primary)' }}>Expression of Interest (EOI)</DropdownMenuItem>
                   <DropdownMenuItem onClick={() => navigate('/questionnaire/RFQ')} style={{ color: 'var(--text-primary)' }}>Request for Quotation (RFQ)</DropdownMenuItem>
                   <DropdownMenuItem onClick={() => navigate('/questionnaire/RFP')} style={{ color: 'var(--text-primary)' }}>Request for Proposal (RFP)</DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
             </div>
           )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                     <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Title</th>
                     <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>ID</th>
                     <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Type</th>
                     <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Status</th>
                     <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Last Modified</th>
                     <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Actions</th>
                   </tr>
                </thead>
                <tbody>
                  {filtered.map((doc, i) => (
                    <motion.tr key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="row-hover transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-6 py-3.5">
                        <button onClick={() => {
                          if (doc.status === 'draft' && doc.questionnaire_type && !doc.final_content) {
                            try {
                              localStorage.setItem(`tendex_draft_doc_${doc.questionnaire_type}`, doc.id);
                              if (doc.questionnaire_data) localStorage.setItem(`tendex_answers_${doc.questionnaire_type}`, JSON.stringify(doc.questionnaire_data));
                            } catch {}
                            navigate(`/questionnaire/${doc.questionnaire_type}`);
                          } else {
                            navigate(`/document/${doc.id}`);
                          }
                        }} className="font-medium transition-colors text-sm text-left" style={{ color: 'var(--text-primary)' }}>
                          {doc.title}
                        </button>
                      </td>
                      <td className="px-6 py-3.5">
                         <span className="text-xs font-mono" style={{ color: 'var(--text-disabled)' }}>{doc.procurement_id || '—'}</span>
                       </td>
                      <td className="px-6 py-3.5">
                        <Badge className="text-xs border font-semibold px-2 py-0.5 rounded-full" style={docTypeStyles[doc.document_type]}>{doc.document_type}</Badge>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-xs font-medium" style={{ color: doc.status === 'complete' ? 'var(--success)' : 'var(--warning)' }}>
                          {getProcurementStatus(doc)}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                         <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>
                          {doc.updated_date ? format(new Date(doc.updated_date), 'd MMMM yyyy') : '—'}
                         </span>
                       </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          {doc.status === 'draft' && doc.questionnaire_type && !doc.final_content && (
                            <Button variant="ghost" size="sm"
                                className="gap-1 text-xs h-7" style={{ color: 'var(--primary)', border: '1px solid rgba(232,34,26,0.3)' }}
                                    onClick={() => {
                                      try {
                                        localStorage.setItem(`tendex_draft_doc_${doc.questionnaire_type}`, doc.id);
                                        if (doc.questionnaire_data) {
                                          localStorage.setItem(`tendex_answers_${doc.questionnaire_type}`, JSON.stringify(doc.questionnaire_data));
                                        }
                                      } catch {}
                                      navigate(`/questionnaire/${doc.questionnaire_type}`);
                                    }}>
                              <Play className="w-3 h-3" />Continue
                            </Button>
                          )}
                          {doc.status === 'complete' && (
                            <Button variant="ghost" size="sm"
                              className="gap-1 text-xs h-7" style={{ color: 'var(--primary)', border: '1px solid rgba(232,34,26,0.3)' }}
                                onClick={() => navigate(`/document/${doc.id}`)}>
                                <FileText className="w-3 h-3" />View
                              </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-7 h-7 hover-muted" style={{ color: 'var(--text-muted)' }}>
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                             <DropdownMenuItem onClick={() => navigate(`/document/${doc.id}`)} style={{ color: 'var(--text-primary)' }}>
                                <FileText className="w-4 h-4 mr-2" />Open
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                // Duplicate: create a new doc from this one
                                const newDoc = {
                                  title: `${doc.title} (Copy)`,
                                  document_type: doc.document_type,
                                  status: 'draft',
                                  procurement_id: Array.from({ length: 12 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join(''),
                                  questionnaire_type: doc.questionnaire_type,
                                  questionnaire_data: doc.questionnaire_data,
                                  questionnaire_step: 0,
                                  project_name: doc.project_name,
                                  organisation_name: doc.organisation_name,
                                  industry: doc.industry,
                                };
                                base44.entities.Document.create(newDoc).then(createdDoc => {
                                  queryClient.invalidateQueries({ queryKey: ['documents'] });
                                  toast({ title: 'Document duplicated', description: 'New copy created successfully.' });
                                });
                              }} style={{ color: 'var(--text-primary)' }}>
                                <FileText className="w-4 h-4 mr-2" />Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem style={{ color: 'var(--destructive)' }} onClick={() => deleteMutation.mutate(doc.id)}>
                                                 <Trash2 className="w-4 h-4 mr-2" />Delete
                                               </DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filtered.map((doc, i) => (
                <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-xl p-4 space-y-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  {/* Title */}
                  <button onClick={() => {
                    if (doc.status === 'draft' && doc.questionnaire_type && !doc.final_content) {
                      try {
                        localStorage.setItem(`tendex_draft_doc_${doc.questionnaire_type}`, doc.id);
                        if (doc.questionnaire_data) localStorage.setItem(`tendex_answers_${doc.questionnaire_type}`, JSON.stringify(doc.questionnaire_data));
                      } catch {}
                      navigate(`/questionnaire/${doc.questionnaire_type}`);
                    } else {
                      navigate(`/document/${doc.id}`);
                    }
                  }} className="text-left font-medium transition-colors truncate w-full" style={{ color: 'var(--text-primary)' }}>
                    {doc.title}
                  </button>

                  {/* ID + Type Row */}
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{doc.procurement_id || '—'}</span>
                    <Badge className="text-xs border font-semibold px-2 py-0.5 rounded-full" style={docTypeStyles[doc.document_type]}>{doc.document_type}</Badge>
                  </div>

                  {/* Status + Last Modified Row */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                      <div className="mt-0.5 font-medium" style={{ color: doc.status === 'complete' ? 'var(--success)' : 'var(--warning)' }}>
                        {getProcurementStatus(doc)}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Modified:</span>
                        <div className="mt-0.5" style={{ color: 'var(--text-disabled)' }}>
                        {doc.updated_date ? format(new Date(doc.updated_date), 'd MMM yyyy') : '—'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                    {doc.status === 'draft' && doc.questionnaire_type && !doc.final_content && (
                      <Button variant="ghost" size="sm"
                        className="flex-1 gap-1 text-xs h-7" style={{ color: 'var(--primary)', border: '1px solid rgba(232,34,26,0.3)' }}
                          onClick={() => {
                            try {
                              localStorage.setItem(`tendex_draft_doc_${doc.questionnaire_type}`, doc.id);
                            if (doc.questionnaire_data) {
                              localStorage.setItem(`tendex_answers_${doc.questionnaire_type}`, JSON.stringify(doc.questionnaire_data));
                            }
                          } catch {}
                          navigate(`/questionnaire/${doc.questionnaire_type}`);
                        }}>
                        <Play className="w-3 h-3" />Continue
                      </Button>
                    )}
                    {doc.status === 'complete' && (
                      <Button variant="ghost" size="sm"
                        className="flex-1 gap-1 text-xs h-7" style={{ color: 'var(--primary)', border: '1px solid rgba(232,34,26,0.3)' }}
                          onClick={() => navigate(`/document/${doc.id}`)}>
                          <FileText className="w-3 h-3" />View
                      </Button>
                    )}
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-8 h-8 hover-muted" style={{ color: 'var(--text-muted)' }}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                      <DropdownMenuItem onClick={() => navigate(`/document/${doc.id}`)} style={{ color: 'var(--text-primary)' }}>
                        <FileText className="w-4 h-4 mr-2" />Open
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        const newDoc = {
                          title: `${doc.title} (Copy)`,
                          document_type: doc.document_type,
                          status: 'draft',
                          procurement_id: Array.from({ length: 12 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join(''),
                          questionnaire_type: doc.questionnaire_type,
                          questionnaire_data: doc.questionnaire_data,
                          questionnaire_step: 0,
                          project_name: doc.project_name,
                          organisation_name: doc.organisation_name,
                          industry: doc.industry,
                        };
                        base44.entities.Document.create(newDoc).then(createdDoc => {
                          queryClient.invalidateQueries({ queryKey: ['documents'] });
                          toast({ title: 'Document duplicated', description: 'New copy created successfully.' });
                        });
                      }} style={{ color: 'var(--text-primary)' }}>
                        <FileText className="w-4 h-4 mr-2" />Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem style={{ color: 'var(--destructive)' }} onClick={() => deleteMutation.mutate(doc.id)}>
                         <Trash2 className="w-4 h-4 mr-2" />Delete
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
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