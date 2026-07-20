import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    {
      title: '1. Introduction',
      content: 'TendeX is an AI-assisted procurement document generation platform operated by TendeX Australia Pty Ltd, located in Perth, Western Australia. ABN [TBC]. This Privacy Policy explains how we collect, use, store, and protect your personal information in accordance with the Australian Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).'
    },
    {
      title: '2. What We Collect',
      content: 'We collect the following information:\n\n• Account Details: Full name, email address, phone number, organisation name, business address\n• ABN Information: Your Australian Business Number and entity name (verified via the ABN Register)\n• Procurement Data: All questionnaire responses, scope documents, supplier details, and generated procurement documents\n• Logo and Branding: Your organisation logo uploaded for document generation\n• Usage Analytics: How you interact with the platform (pages visited, features used, document types created)\n• Billing Information: Name, email, and Stripe payment details (processed by Stripe, not stored by us)'
    },
    {
      title: '3. How We Use Your Information',
      content: 'We use your information for:\n\n• Service Delivery: To generate procurement documents tailored to your organisation\n• AI Quality Improvement: To train and improve our AI models (your data is anonymised)\n• Billing and Invoicing: To process subscriptions via Stripe\n• Communications: To send service updates, new feature announcements, and support responses\n• Compliance: To meet regulatory and legal obligations'
    },
    {
      title: '4. Data Storage and Sovereignty',
      content: 'All personal information and procurement data are stored exclusively in Australia, specifically in AWS ap-southeast-2 (Sydney region). We do not transfer or store your data outside Australia. Your data is encrypted at rest and in transit using industry-standard TLS 1.3 encryption.'
    },
    {
      title: '5. Australian Privacy Principles Compliance',
      content: 'We comply with all Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth). Our information handling practices are designed to:\n\n• Collect only necessary information (APP1)\n• Use and disclose information for primary purposes (APP2)\n• Provide access to personal information upon request (APP12)\n• Correct inaccurate information (APP13)\n• Protect personal information from misuse (APP11)'
    },
    {
      title: '6. Third-Party Services',
      content: 'We use the following third-party services:\n\n• Stripe: Payment processing for subscriptions (subject to Stripe\'s privacy policy)\n• Base44: Platform infrastructure and database hosting (Australian data centres only)\n• LLM Providers: AI models used for document generation (your data is processed according to our data use agreements)\n\nWe only share information with third parties as necessary to provide the service.'
    },
    {
      title: '7. Data Retention',
      content: 'Procurement records, audit logs, and account data are retained for 7 years for regulatory compliance and dispute resolution purposes. After 7 years, data is securely deleted. You may request earlier deletion by contacting hello@tendex.com.au.'
    },
    {
      title: '8. Your Rights',
      content: 'You have the right to:\n\n• Access: Request access to your personal information\n• Correction: Request correction of inaccurate information\n• Deletion: Request deletion of your account and associated data (subject to legal retention obligations)\n• Complaints: Lodge a complaint with the Office of the Australian Information Commissioner (OAIC)\n\nTo exercise these rights, email hello@tendex.com.au.'
    },
    {
      title: '9. Cookies',
      content: 'TendeX uses session cookies only to maintain your login session and remember your preferences. We do not use tracking cookies, advertising cookies, or third-party analytics cookies. You can disable cookies in your browser settings; however, this may affect functionality.'
    },
    {
      title: '10. Contact and Updates',
      content: 'For privacy inquiries or concerns, contact us at hello@tendex.com.au.\n\nThis Privacy Policy was last updated on 14 May 2026. We may update this policy from time to time to reflect changes in our practices or legal requirements. We will notify you of material changes via email.'
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--nav-bg)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ backgroundColor: 'rgba(200,30,58,0.12)', borderColor: 'rgba(200,30,58,0.25)' }}>
              <FileText className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            </div>
            <span className="font-syne font-800 text-lg" style={{ color: 'var(--text-primary)' }}>TendeX</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="font-syne font-800 text-4xl md:text-5xl mb-3" style={{ color: 'var(--text-primary)' }}>Privacy Policy</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Effective from 14 May 2026</p>
        </div>

        <div className="space-y-8">
          {sections.map((section, idx) => (
            <section key={idx} className="rounded-xl border p-8" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h2 className="font-syne font-700 text-xl mb-4" style={{ color: 'var(--text-primary)' }}>{section.title}</h2>
              <p className="leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{section.content}</p>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            For questions about this Privacy Policy, contact hello@tendex.com.au
          </p>
        </div>
      </main>
    </div>
  );
}