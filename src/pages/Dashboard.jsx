import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, FileText, Clock, CheckCircle, Archive, Trash2, MoreVertical, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import AppLayout from '@/components/layout/AppLayout';

const docTypeColors = {
  SOW: 'bg-blue-100 text-blue-700',
  EOI: 'bg-purple-100 text-purple-700',
  RFQ: 'bg-green-100 text-green-700',
  RFP: 'bg-orange-100 text-orange-700',
};

const statusIcons = {
  draft: Clock,
  complete: CheckCircle,
  archived: Archive,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-updated_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Document.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  const archiveMutation = useMutation({
    mutationFn: (id) => base44.entities.Document.update(id, { status: 'archived' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  const filtered = documents.filter(d => {
    const matchSearch = d.title?.toLowerCase().includes(search.toLowerCase()) ||
      d.project_name?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || d.document_type === filterType;
    return matchSearch && matchType;
  });

  const stats = {
    total: documents.length,
    drafts: documents.filter(d => d.status === 'draft').length,
    complete: documents.filter(d => d.status === 'complete').length,
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">My Documents</h1>
            <p className="text-muted-foreground mt-1">Manage your procurement documents</p>
          </div>
          <Link to="/tool-select">
            <Button className="gap-2"><Plus className="w-4 h-4" /> New Document</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Documents', value: stats.total, color: 'text-foreground' },
            { label: 'In Progress', value: stats.drafts, color: 'text-amber-600' },
            { label: 'Completed', value: stats.complete, color: 'text-green-600' },
          ].map((s, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search documents..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {['all', 'SOW', 'EOI', 'RFQ', 'RFP'].map(type => (
              <Button key={type} variant={filterType === type ? 'default' : 'outline'} size="sm"
                onClick={() => setFilterType(type)} className="text-xs">{type === 'all' ? 'All' : type}</Button>
            ))}
          </div>
        </div>

        {/* Document List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No documents yet</h3>
            <p className="text-muted-foreground mb-6">Create your first procurement document to get started.</p>
            <Link to="/tool-select"><Button className="gap-2"><Plus className="w-4 h-4" />New Document</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((doc, i) => {
              const StatusIcon = statusIcons[doc.status] || Clock;
              return (
                <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border border-border p-5 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-foreground truncate">{doc.title}</h3>
                        <Badge className={`text-xs ${docTypeColors[doc.document_type] || 'bg-muted text-muted-foreground'}`}>{doc.document_type}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <StatusIcon className={`w-3.5 h-3.5 ${doc.status === 'complete' ? 'text-green-500' : doc.status === 'archived' ? 'text-muted-foreground' : 'text-amber-500'}`} />
                        <span className="text-xs text-muted-foreground capitalize">{doc.status}</span>
                        {doc.updated_date && <span className="text-xs text-muted-foreground">{format(new Date(doc.updated_date), 'MMM d, yyyy')}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/document/${doc.id}`)}>Open</Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8"><MoreVertical className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
    </AppLayout>
  );
}