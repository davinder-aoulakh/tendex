import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Check, Copy, Bot, MessageSquare, MousePointerClick, Terminal, ShieldCheck, RefreshCw } from 'lucide-react';

const Step = ({ n, children }) => (
  <li className="flex gap-3">
    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
      style={{ background: 'rgba(200,30,58,0.10)', border: '1px solid rgba(200,30,58,0.20)', color: 'var(--primary)' }}>
      {n}
    </span>
    <span className="text-sm leading-relaxed pt-0.5" style={{ color: 'var(--text-secondary)' }}>{children}</span>
  </li>
);

const ClientIntro = ({ icon: Icon, name, blurb }) => (
  <div className="flex items-start gap-3 mb-5">
    <div style={{
      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
      backgroundColor: 'var(--muted)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon style={{ width: 18, height: 18, color: 'var(--text-primary)' }} />
    </div>
    <div>
      <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{name}</h3>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{blurb}</p>
    </div>
  </div>
);

export default function Connect() {
  const serverUrl = new URL('/api/mcp', window.location.origin).toString();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(serverUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              backgroundColor: 'rgba(200,30,58,0.10)',
              border: '1px solid rgba(200,30,58,0.20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot style={{ width: 18, height: 18, color: 'var(--primary)' }} />
            </div>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Connect an AI Assistant</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Point any AI client at your TendeX MCP server to let it read and act on your procurement documents on your behalf.
          </p>
        </div>

        {/* Server URL card */}
        <div className="mb-8 rounded-2xl p-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
            MCP Server URL
          </div>
          <div className="flex items-center gap-3">
            <code className="flex-1 px-3 py-2.5 rounded-lg text-sm font-mono break-all"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              {serverUrl}
            </code>
            <Button onClick={copy} variant="outline" className="flex-shrink-0"
              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              {copied ? <><Check className="w-4 h-4 mr-1.5" />Copied</> : <><Copy className="w-4 h-4 mr-1.5" />Copy</>}
            </Button>
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            This URL is unique to this app. Keep it handy — you'll paste it into your AI client below.
          </p>
        </div>

        {/* Client tabs */}
        <div className="rounded-2xl p-5 sm:p-6"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <Tabs defaultValue="claude">
            <TabsList className="mb-6" style={{ background: 'var(--muted)' }}>
              <TabsTrigger value="claude">Claude</TabsTrigger>
              <TabsTrigger value="chatgpt">ChatGPT</TabsTrigger>
              <TabsTrigger value="cursor">Cursor</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="claude">
              <ClientIntro icon={Bot} name="Claude" blurb="Anthropic's Claude with custom connectors." />
              <ol className="space-y-3">
                <Step n={1}>Open the <strong>profile menu</strong> (top-right) → <strong>Settings</strong> → <strong>Connectors</strong>.</Step>
                <Step n={2}>Click <strong>Add custom connector</strong>.</Step>
                <Step n={3}>Give it a name (e.g. "TendeX") and paste the server URL above.</Step>
                <Step n={4}>Click <strong>Add</strong>. Claude will open your consent page to sign in.</Step>
              </ol>
            </TabsContent>

            <TabsContent value="chatgpt">
              <ClientIntro icon={MessageSquare} name="ChatGPT" blurb="OpenAI's ChatGPT with custom apps." />
              <ol className="space-y-3">
                <Step n={1}>Go to <strong>Apps</strong> and enable <strong>Developer mode</strong> (acknowledge the risk ChatGPT warns about).</Step>
                <Step n={2}>Click <strong>Create app</strong>.</Step>
                <Step n={3}>Name it (e.g. "TendeX") and paste the server URL above.</Step>
                <Step n={4}>Click <strong>Create</strong>, then enable the app from the chat composer before prompting it.</Step>
              </ol>
            </TabsContent>

            <TabsContent value="cursor">
              <ClientIntro icon={MousePointerClick} name="Cursor" blurb="The AI code editor." />
              <ol className="space-y-3">
                <Step n={1}>Open <strong>Settings</strong> → <strong>Tools &amp; Integrations</strong> → <strong>New MCP Server</strong>.</Step>
                <Step n={2}>This opens your <code className="px-1.5 py-0.5 rounded" style={{ background: 'var(--muted)', color: 'var(--text-primary)' }}>mcp.json</code> file.</Step>
                <Step n={3}>Add an entry whose <code className="px-1.5 py-0.5 rounded" style={{ background: 'var(--muted)', color: 'var(--text-primary)' }}>url</code> is the server URL above.</Step>
                <Step n={4}>Save the file and toggle the server on.</Step>
              </ol>
            </TabsContent>

            <TabsContent value="custom">
              <ClientIntro icon={Terminal} name="Custom client" blurb="Any client that speaks streamable HTTP MCP." />
              <ol className="space-y-3">
                <Step n={1}>Copy the server URL above.</Step>
                <Step n={2}>Add it as a <strong>streamable HTTP MCP server</strong> in your client.</Step>
                <Step n={3}>A name and the URL are all most clients need.</Step>
                <Step n={4}>Reload the client so it picks up the new server.</Step>
              </ol>
            </TabsContent>
          </Tabs>
        </div>

        {/* OAuth + refresh notes */}
        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-3 rounded-xl p-4"
            style={{ background: 'var(--action-subtle)', border: '1px solid var(--action-border)' }}>
            <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--action)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>One last step:</strong> each client opens your consent page, where you sign in with your own TendeX account and approve. The assistant only ever acts as you, using your app permissions.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-xl p-4"
            style={{ background: 'var(--warning-subtle)', border: '1px solid var(--warning-border)' }}>
            <RefreshCw className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Refresh the connector</strong> after we ship changes — AI clients cache the tool list, so re-authorize to pick up new tools.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}