import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AppLayout from '@/components/layout/AppLayout';

const generateProcurementId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 12; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
};

export default function StartProcurement() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const createAndRedirect = async () => {
      try {
        const procId = generateProcurementId();

        // Pre-populate company details from the user's saved business profile
        let questionnaireData = {};
        try {
          const currentUser = await base44.auth.me();
          if (currentUser) {
            const users = await base44.entities.User.filter({ email: currentUser.email });
            const profile = users[0] || {};
            const prefill = {};

            if (profile.organisation_name) {
              prefill.organisation_name = profile.organisation_name;
            } else if (profile.abn_entity_name) {
              prefill.organisation_name = profile.abn_entity_name;
            }

            if (profile.logo_url) prefill.logo_url = profile.logo_url;

            if (profile.abn_confirmed && profile.abn) {
              prefill.abn = profile.abn;
              prefill._abn_confirmed = true;
              prefill._abn_entity_name = profile.abn_entity_name || '';
              prefill._abn_entity_type_name = profile.abn_entity_type_name || '';
              prefill._abn_gst_registered = profile.abn_gst_registered || false;
              prefill._abn_active_since = profile.abn_active_since || null;
              if (profile.abn_address_state) prefill.organisation_state = profile.abn_address_state;
            }

            questionnaireData = prefill;
          }
        } catch (profileErr) {
          console.error('Failed to load business profile for pre-fill:', profileErr);
        }

        const doc = await base44.entities.Document.create({
          title:                'New Procurement',
          document_type:        'SOW',
          status:               'draft',
          procurement_id:       procId,
          questionnaire_type:   'SOW',
          questionnaire_step:   0,
          questionnaire_data:   questionnaireData,
          is_procurement_process: true,
        });

        try {
          localStorage.setItem('tendex_draft_doc_SOW', doc.id);
        } catch {}

        navigate('/questionnaire/SOW?docId=' + doc.id, { replace: true });
      } catch (err) {
        console.error('Failed to create procurement:', err);
        setError('Something went wrong. Please try again.');
      }
    };

    createAndRedirect();
  }, []);

  if (error) {
    return (
      <AppLayout>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '60vh', gap: 16,
        }}>
          <p style={{ color: 'var(--destructive)', fontSize: 14 }}>{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'var(--primary)', color: '#fff', border: 'none',
              padding: '10px 20px', borderRadius: 9, cursor: 'pointer',
              fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh', gap: 14,
      }}>
        <Loader2 style={{
          width: 30, height: 30, color: 'var(--primary)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Setting up your procurement...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </AppLayout>
  );
}