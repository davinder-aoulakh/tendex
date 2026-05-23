import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

export default function PresenceAvatars({ presence }) {
  if (!presence || presence.length === 0) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1.5">
        <span className="text-xs mr-0.5" style={{ color: 'var(--text-muted)' }}>Also editing:</span>
        <div className="flex -space-x-1.5">
          {presence.slice(0, 5).map((p) => (
            <Tooltip key={p.id}>
              <TooltipTrigger asChild>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white border-2 cursor-default select-none ring-2 ring-offset-0 transition-transform hover:scale-110 hover:z-10"
                  style={{ backgroundColor: p.color, borderColor: 'var(--background)' }}
                >
                  {initials(p.user_name)}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p className="font-medium">{p.user_name}</p>
                {p.active_section && (
                  <p style={{ color: 'var(--text-muted)' }}>editing: {p.active_section}</p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
          {presence.length > 5 && (
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white border-2"
              style={{ borderColor: 'var(--background)', background: 'var(--muted)' }}>
              +{presence.length - 5}
            </div>
          )}
        </div>
        {/* Pulsing dot */}
        <span className="relative flex h-2 w-2 ml-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
      </div>
    </TooltipProvider>
  );
}