import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FileText, ChevronRight, ChevronDown, Search,
  Check, AlertTriangle, ArrowRight, Plus
} from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import AppLayout from '@/components/layout/AppLayout';
import { useToast } from '@/components/ui/use-toast';

// ── HELPERS ────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  try {
    return formatDistanceToNowStrict(new Date(dateStr), { addSuffix: true });
  } catch {
    return '—';
  }
}

function getContractType(doc) {
  if (doc.contract_type) return doc.contract_type;
  const pt = doc.questionnaire_data?.procurement_type;
  return pt === 'goods' ? 'Goods'
    : pt === 'services' ? 'Services'
    : pt === 'both' ? 'Goods and Services'
    : '—';
}

function getStageLabel(doc) {
  if (doc.current_stage) return doc.current_stage;
  if (doc.status === 'complete') {
    const t = doc.document_type;
    return t === 'EOI' ? 'Expression of Interest — issued'
      : t === 'RFQ' ? 'Request for Quote — issued'
      : t === 'RFP' ? 'Request for Proposal — issued'
      : 'Scope of Work — complete';
  }
  const t = doc.questionnaire_type || doc.document_type;
  return t === 'EOI' ? 'Expression of Interest'
    : t === 'RFQ' ? 'Request for Quote'
    : t === 'RFP' ? 'Request for Proposal'
    : 'Scope of Work';
}

function getWhoseTurn(doc) {
  if (doc.status === 'draft') return 'yours';
  if (doc.status === 'complete' || doc.status === 'issued') return 'them';
  return null;
}

const DOC_TYPE_PILL_STYLE = {
  SOW: { background: 'var(--action-subtle)',  color: 'var(--action)'  },
  EOI: { background: 'var(--purple-subtle)', color: 'var(--purple)' },
  RFQ: { background: 'var(--warning-subtle)', color: 'var(--warning)' },
  RFP: { background: 'var(--success-subtle)', color: 'var(--success)' },
};

function sortDocs(docs, field, asc) {
  return [...docs].sort((a, b) => {
    let av, bv;
    if (field === 'title') {
      av = (a.title || '').toLowerCase();
      bv = (b.title || '').toLowerCase();
      return asc ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    if (field === 'updated') {
      av = new Date(a.updated_date || 0).getTime();
      bv = new Date(b.updated_date || 0).getTime();
      return asc ? av - bv : bv - av;
    }
    if (field === 'contract') {
      av = getContractType(a); bv = getContractType(b);
      return asc ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    if (field === 'stage') {
      av = getStageLabel(a); bv = getStageLabel(b);
      return asc ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return 0;
  });
}

// ── SMALL COMPONENTS ───────────────────────────────────────────────

function SortableHeader({ label, field, sortField, sortAsc, onSort }) {
  const active = sortField === field;
  return (
    <th
      onClick={() => onSort(field)}
      style={{
        padding: '11px 16px', textAlign: 'left', cursor: 'pointer',
        fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.05em', userSelect: 'none',
        color: active ? 'var(--primary)' : 'var(--text-muted)',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {label}
        <ChevronDown
          style={{
            width: 10, height: 10,
            opacity: active ? 1 : 0.4,
            color: active ? 'var(--primary)' : 'inherit',
            transform: active && !sortAsc ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s ease',
          }}
        />
      </span>
    </th>
  );
}

function StatusPill({ status }) {
  const done = status === 'complete' || status === 'issued';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: '11.5px', fontWeight: 700, padding: '4px 10px',
      borderRadius: 20, border: '1px solid ' + (done ? 'var(--success-border)' : 'var(--warning-border)'),
      background: done ? 'var(--success-subtle)' : 'var(--warning-subtle)',
      color: done ? 'var(--success)' : 'var(--warning)',
    }}>
      {done && <Check style={{ width: 11, height: 11 }} />}
      {done ? 'Completed' : 'In Progress'}
    </span>
  );
}

function WhoseTurnBadge({ turn }) {
  if (!turn) return null;
  const yours = turn === 'yours';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: '10.5px', fontWeight: 500, marginTop: 2,
      color: yours ? 'var(--primary)' : 'var(--text-muted)',
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
        background: yours ? 'var(--primary)' : 'var(--text-muted)',
      }} />
      {yours ? 'Your turn' : 'Waiting on suppliers'}
    </span>
  );
}

function ActionButton({ doc, navigate }) {
  const isDraft = doc.status === 'draft';
  const handleClick = () => {
    try {
      if (doc.questionnaire_type) {
        localStorage.setItem('tendex_draft_doc_' + doc.questionnaire_type, doc.id);
        if (doc.questionnaire_data) {
          localStorage.setItem(
            'tendex_answers_' + doc.questionnaire_type,
            JSON.stringify(doc.questionnaire_data)
          );
        }
      }
    } catch {}
    if (doc.questionnaire_type && !doc.final_content && isDraft) {
      navigate('/questionnaire/' + doc.questionnaire_type);
    } else {
      navigate('/document/' + doc.id);
    }
  };
  return (
    <button
      onClick={handleClick}
      style={{
        fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 7,
        whiteSpace: 'nowrap', cursor: 'pointer',
        background: isDraft ? 'var(--primary)' : 'var(--card)',
        color: isDraft ? '#fff' : 'var(--text-primary)',
        border: isDraft ? 'none' : '1px solid var(--border-strong)',
      }}
    >
      {isDraft ? 'Continue' : 'View'}
    </button>
  );
}

// ── DOCUMENT SECTION ───────────────────────────────────────────────

function DocumentSection({
  title, subtitle, accentColor, accentSubtle,
  documents, isProcurement, navigate,
}) {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [contractFilter, setContractFilter] = useState('all');
  const [sortField, setSortField] = useState('updated');
  const [sortAsc, setSortAsc] = useState(false);
  const [completedOpen, setCompletedOpen] = useState(false);

  const active = documents.filter(d => d.status !== 'complete' && d.status !== 'archived' && d.status !== 'issued');
  const completed = documents.filter(d => d.status === 'complete' || d.status === 'issued' || d.status === 'archived');

  const applyFilters = (docs) => docs.filter(d => {
    const ms = !search || (d.title || '').toLowerCase().includes(search.toLowerCase());
    const mst = stageFilter === 'all' || getStageLabel(d).toLowerCase().includes(stageFilter.toLowerCase());
    const mc = contractFilter === 'all' || getContractType(d) === contractFilter;
    return ms && mst && mc;
  });

  const handleSort = (field) => {
    if (sortField === field) setSortAsc(a => !a);
    else { setSortField(field); setSortAsc(true); }
  };

  const filteredActive = sortDocs(applyFilters(active), sortField, sortAsc);
  const hasFilters = search || stageFilter !== 'all' || contractFilter !== 'all';

  const stageOptions = [
    'Scope of Work', 'Expression of Interest',
    'Request for Quote', 'Request for Proposal',
  ];

  const TableHeaderRow = () => (
    <thead>
      <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
        <SortableHeader label="Title" field="title" sortField={sortField} sortAsc={sortAsc} onSort={handleSort} />
        <SortableHeader label="Contract Type" field="contract" sortField={sortField} sortAsc={sortAsc} onSort={handleSort} />
        {isProcurement
          ? <SortableHeader label="Stage" field="stage" sortField={sortField} sortAsc={sortAsc} onSort={handleSort} />
          : (
            <>
              <SortableHeader label="Document Type" field="stage" sortField={sortField} sortAsc={sortAsc} onSort={handleSort} />
              <th style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                Status
              </th>
            </>
          )
        }
        <SortableHeader label="Last Updated" field="updated" sortField={sortField} sortAsc={sortAsc} onSort={handleSort} />
        <th style={{ width: 90 }} />
      </tr>
    </thead>
  );

  const DataRow = ({ doc, faded }) => (
    <tr
      style={{ borderBottom: '1px solid var(--border)', opacity: faded ? 0.8 : 1, transition: 'background 0.1s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <td style={{ padding: '15px 16px' }}>
        <button
          onClick={() => navigate('/document/' + doc.id)}
          style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
        >
          {doc.title}
        </button>
      </td>
      <td style={{ padding: '15px 16px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
        {getContractType(doc)}
      </td>
      {isProcurement
        ? (
          <td style={{ padding: '15px 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                {getStageLabel(doc)}
              </span>
              {!faded && <WhoseTurnBadge turn={getWhoseTurn(doc)} />}
            </div>
          </td>
        ) : (
          <>
            <td style={{ padding: '15px 16px' }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6,
                ...DOC_TYPE_PILL_STYLE[doc.document_type],
              }}>
                {doc.document_type === 'SOW' ? 'Scope of Work'
                  : doc.document_type === 'EOI' ? 'Expression of Interest'
                  : doc.document_type === 'RFQ' ? 'Request for Quote'
                  : doc.document_type === 'RFP' ? 'Request for Proposal'
                  : doc.document_type}
              </span>
            </td>
            <td style={{ padding: '15px 16px' }}>
              <StatusPill status={doc.status} />
            </td>
          </>
        )
      }
      <td style={{ padding: '15px 16px', fontSize: 12, color: 'var(--text-muted)' }}>
        {timeAgo(doc.updated_date)}
      </td>
      <td style={{ padding: '15px 16px' }}>
        <ActionButton doc={doc} navigate={navigate} />
      </td>
    </tr>
  );

  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 18, padding: '26px 26px 22px', marginBottom: 32,
      boxShadow: '0 1px 1px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.05)',
      borderTop: '4px solid ' + accentColor,
    }}>

      {/* Group heading */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 5 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: accentSubtle, color: accentColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isProcurement
            ? (
              <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                <path d="M4 19v-6h6v6"/>
                <path d="M10 13V7h6v6"/>
                <path d="M16 7h4"/>
                <circle cx="21" cy="7" r="1.4" fill="currentColor" stroke="none"/>
                <circle cx="4" cy="19" r="1.4" fill="currentColor" stroke="none"/>
              </svg>
            )
            : <FileText style={{ width: 19, height: 19 }} />
          }
        </div>
        <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
          {title}
        </h2>
      </div>
      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 20px 50px' }}>
        {subtitle}
      </p>

      {/* Active section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Active
          <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--muted)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: 20, textTransform: 'none', letterSpacing: 0 }}>
            {filteredActive.length}
          </span>
        </div>
        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setStageFilter('all'); setContractFilter('all'); }}
            style={{ fontSize: 12, fontWeight: 600, color: accentColor, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Clear filters x
          </button>
        )}
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1.4', minWidth: 160 }}>
          <Search style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isProcurement ? 'Search procurement processes...' : 'Search documents...'}
            style={{
              width: '100%', padding: '10px 14px 10px 36px', borderRadius: 10,
              border: '1px solid var(--border)', background: 'var(--background)',
              color: 'var(--text-primary)', fontSize: '13.5px', fontFamily: 'inherit',
              outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = accentColor}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <select
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
          style={{ flex: 1, minWidth: 140, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', fontWeight: 500, cursor: 'pointer', outline: 'none' }}
        >
          <option value="all">{isProcurement ? 'All stages' : 'All document types'}</option>
          {stageOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select
          value={contractFilter}
          onChange={e => setContractFilter(e.target.value)}
          style={{ flex: 1, minWidth: 140, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', fontWeight: 500, cursor: 'pointer', outline: 'none' }}
        >
          <option value="all">All contract types</option>
          <option value="Goods">Goods</option>
          <option value="Services">Services</option>
          <option value="Goods and Services">Goods and Services</option>
        </select>
      </div>

      {/* Active table */}
      <div style={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        {filteredActive.length === 0
          ? (
            <div style={{ padding: '30px 18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              {hasFilters
                ? 'No results match these filters.'
                : 'No active ' + (isProcurement ? 'procurement processes' : 'documents') + ' yet.'}
            </div>
          )
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <TableHeaderRow />
              <tbody>
                {filteredActive.map(doc => <DataRow key={doc.id} doc={doc} faded={false} />)}
              </tbody>
            </table>
          )
        }
      </div>

      {/* Completed accordion */}
      {completed.length > 0 && (
        <>
          <button
            onClick={() => setCompletedOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '13px 18px', cursor: 'pointer',
              background: 'var(--success-subtle)', border: '1px solid var(--success-border)',
              borderRadius: 12, userSelect: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>
              <ChevronRight style={{ width: 14, height: 14, transition: 'transform 0.2s ease', transform: completedOpen ? 'rotate(90deg)' : 'none' }} />
              <Check style={{ width: 14, height: 14 }} />
              {'Completed ' + (isProcurement ? 'Procurement Processes' : 'Documents')}
              <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--card)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: 20 }}>
                {completed.length}
              </span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
              Click to expand
            </span>
          </button>

          {completedOpen && (
            <div style={{ marginTop: 10, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--background)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <TableHeaderRow />
                <tbody>
                  {completed.map(doc => <DataRow key={doc.id} doc={doc} faded={true} />)}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── MAIN DASHBOARD ─────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', user?.email],
    queryFn: () => user?.email
      ? base44.entities.Document.filter({ created_by: user.email }, '-updated_date')
      : Promise.resolve([]),
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
  const atLimit = docsLimit !== 999 && documents.length >= docsLimit;

  const deleteMutation = useMutation({
    mutationFn: id => base44.entities.Document.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({ title: 'Document deleted' });
    },
  });

  // Split into procurement processes vs standalone documents
  const procurementDocs = documents.filter(d =>
    d.is_procurement_process === true ||
    (d.questionnaire_type === 'SOW' && d.status === 'draft' && !d.final_content)
  );
  const standaloneDocs = documents.filter(d => !procurementDocs.includes(d));

  const stats = {
    procTotal: procurementDocs.length,
    procInProgress: procurementDocs.filter(d => d.status === 'draft').length,
    procComplete: procurementDocs.filter(d => d.status === 'complete' || d.status === 'issued').length,
    docTotal: standaloneDocs.length,
    docInProgress: standaloneDocs.filter(d => d.status === 'draft').length,
    docComplete: standaloneDocs.filter(d => d.status === 'complete' || d.status === 'issued').length,
  };

  const firstName = user?.first_name || user?.full_name?.split(' ')[0] || 'there';

  return (
    <AppLayout>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '36px 38px 60px' }}>

        {/* At-limit banner */}
        {atLimit && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 12, borderRadius: 11, padding: '13px 18px', marginBottom: 26,
              background: 'var(--card)', border: '1px solid rgba(239,68,68,0.35)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13.5px', color: 'var(--destructive)' }}>
              <AlertTriangle style={{ width: 16, height: 16, flexShrink: 0 }} />
              <span>
                <strong>You have reached your {docsLimit}-document limit</strong> on the {currentPlan} plan.
              </span>
            </div>
            <button
              onClick={() => navigate('/billing')}
              style={{ fontWeight: 700, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, whiteSpace: 'nowrap' }}
            >
              Upgrade <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          </motion.div>
        )}

        {/* Greeting */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 25, margin: '0 0 4px', letterSpacing: '-0.4px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {getGreeting()}, {firstName}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
            Here's what's happening across your procurement processes and documents.
          </p>
        </div>

        {/* START SOMETHING NEW */}
        <p style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: '0 0 12px' }}>
          Start something new
        </p>

        <div className="dashboard-start-grid">

          {/* Flagship card — guided procurement */}
          <button
            onClick={() => { if (!atLimit) navigate('/start-procurement'); }}
            disabled={atLimit}
            style={{
              borderRadius: 16, padding: 24, border: 'none', textAlign: 'left',
              cursor: atLimit ? 'not-allowed' : 'pointer',
              background: atLimit ? 'var(--muted)' : 'var(--primary)',
              color: '#fff', opacity: atLimit ? 0.6 : 1,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              boxShadow: atLimit ? 'none' : '0 4px 24px rgba(200,30,58,0.28)',
              transition: 'transform 0.12s ease',
            }}
            onMouseEnter={e => { if (!atLimit) e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
          >
            <div>
              <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.82, marginBottom: 14 }}>
                Guided
              </div>
              <svg style={{ width: 26, height: 26, marginBottom: 12 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M4 19v-6h6v6"/>
                <path d="M10 13V7h6v6"/>
                <path d="M16 7h4"/>
                <circle cx="21" cy="7" r="1.4" fill="currentColor" stroke="none"/>
                <circle cx="4" cy="19" r="1.4" fill="currentColor" stroke="none"/>
              </svg>
              <h3 style={{ fontSize: 18, margin: '0 0 7px', fontWeight: 700 }}>
                Start a Procurement Process
              </h3>
              <p style={{ fontSize: 13, margin: 0, opacity: 0.88, lineHeight: 1.5, maxWidth: '88%' }}>
                Walks you through every step — Scope of Work, then routes you to the right document to engage the market.
              </p>
            </div>
            <div style={{ alignSelf: 'flex-end', marginTop: 16 }}>
              <ArrowRight style={{ width: 19, height: 19 }} />
            </div>
          </button>

          {/* Create a Document card with 4 tiles */}
          <div style={{
            borderRadius: 16, padding: 24,
            border: '1px solid var(--border)', background: 'var(--card)',
            boxShadow: '0 1px 1px rgba(0,0,0,0.03), 0 6px 20px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 6 }}>
              Single document — no guided process
            </div>
            <h3 style={{ fontSize: 15, margin: '0 0 3px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Create a Document
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 15px', lineHeight: 1.4 }}>
              Pick a document type to generate on its own, without the full procurement walkthrough.
            </p>

            <div className="dashboard-doc-tiles">
              {[
                { key: 'SOW', label: 'Scope of Work',          hint: 'Define what you need.',  accent: 'action', path: '/questionnaire/SOW?mode=standalone' },
                { key: 'EOI', label: 'Expression of Interest', hint: 'Gauge interest.',         accent: 'purple', path: '/questionnaire/EOI' },
                { key: 'RFQ', label: 'Request for Quote',      hint: 'Get pricing.',            accent: 'warning', path: '/questionnaire/RFQ' },
                { key: 'RFP', label: 'Request for Proposal',   hint: 'Ask for approach.',       accent: 'success', path: '/questionnaire/RFP' },
              ].map(tile => (
                <button
                  key={tile.key}
                  onClick={() => { if (!atLimit) navigate(tile.path); }}
                  disabled={atLimit}
                  style={{
                    border: '1px solid var(--border)', borderRadius: 12,
                    padding: '13px 11px', cursor: atLimit ? 'not-allowed' : 'pointer',
                    textAlign: 'left', background: 'transparent',
                    opacity: atLimit ? 0.5 : 1, transition: 'transform 0.12s ease',
                  }}
                  onMouseEnter={e => { if (!atLimit) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, marginBottom: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--' + tile.accent + '-subtle)',
                    color: 'var(--' + tile.accent + ')',
                  }}>
                    <FileText style={{ width: 15, height: 15 }} />
                  </div>
                  <h4 style={{ fontSize: 12, margin: '0 0 3px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                    {tile.label}
                  </h4>
                  <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.35 }}>
                    {tile.hint}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="dashboard-stats-grid">
          {[
            {
              label: 'Procurement Processes', accent: 'var(--primary)', accentBorder: 'var(--primary)',
              total: stats.procTotal, inProgress: stats.procInProgress, complete: stats.procComplete,
              isProcurement: true,
            },
            {
              label: 'Documents', accent: 'var(--action)', accentBorder: 'var(--action)',
              total: stats.docTotal, inProgress: stats.docInProgress, complete: stats.docComplete,
              isProcurement: false,
            },
          ].map((group, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{
                background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14,
                padding: '16px 20px',
                boxShadow: '0 1px 1px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
                borderTop: '3px solid ' + group.accent,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 700, color: group.accent, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {group.isProcurement
                  ? (
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                      <path d="M4 19v-6h6v6"/>
                      <path d="M10 13V7h6v6"/>
                      <path d="M16 7h4"/>
                      <circle cx="21" cy="7" r="1.4" fill="currentColor" stroke="none"/>
                      <circle cx="4" cy="19" r="1.4" fill="currentColor" stroke="none"/>
                    </svg>
                  )
                  : <FileText style={{ width: 14, height: 14 }} />
                }
                {group.label}
              </div>
              <div style={{ display: 'flex' }}>
                {[
                  { num: group.total,      lbl: 'Total',       color: 'var(--text-primary)' },
                  { num: group.inProgress, lbl: 'In Progress', color: 'var(--warning)' },
                  { num: group.complete,   lbl: 'Completed',   color: 'var(--success)' },
                ].map((s, j) => (
                  <div key={j} style={{ flex: 1, textAlign: 'center', padding: '2px 10px', borderRight: j < 2 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ display: 'block', fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: s.color }}>
                      {s.num}
                    </span>
                    <span style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginTop: 3, color: s.color === 'var(--text-primary)' ? 'var(--text-muted)' : s.color }}>
                      {s.lbl}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 80, borderRadius: 14, background: 'var(--muted)', opacity: 0.6 }} />
            ))}
          </div>
        ) : (
          <>
            <DocumentSection
              title="Procurement Processes"
              subtitle="Guided, multi-step — from Scope of Work through to engaging the market."
              accentColor="var(--primary)"
              accentSubtle="rgba(200,30,58,0.10)"
              documents={procurementDocs}
              isProcurement={true}
              navigate={navigate}
            />
            <DocumentSection
              title="Documents"
              subtitle="Single documents generated on their own, without the guided procurement walkthrough."
              accentColor="var(--action)"
              accentSubtle="var(--action-subtle)"
              documents={standaloneDocs}
              isProcurement={false}
              navigate={navigate}
            />
          </>
        )}

      </div>
    </AppLayout>
  );
}