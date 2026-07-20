import AppLayout from '@/components/layout/AppLayout';

export default function Settings() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 38px' }}>
        <h1 style={{ fontSize: 25, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Settings options will appear here in a future update.
        </p>
      </div>
    </AppLayout>
  );
}