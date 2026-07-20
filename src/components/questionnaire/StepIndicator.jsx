/**
 * StepIndicator — shows only the sections relevant to the current path.
 * Accepts visiblePages (the already-filtered page list) so it dynamically
 * reflects the user's procurement type without showing irrelevant sections.
 */
export default function StepIndicator({ currentStep, totalSteps, visiblePages = [] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 flex-wrap">
        {visiblePages.map((page, i) => {
          const isDone    = i < currentStep;
          const isCurrent = i === currentStep;
          return (
            <div
              key={page.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={{
                background:   isDone    ? 'var(--success-subtle)'
                            : isCurrent ? 'var(--primary)'
                            : 'transparent',
                borderColor:  isDone    ? 'var(--success-border)'
                            : isCurrent ? 'var(--primary)'
                            : 'var(--border)',
                color:        isDone    ? 'var(--success)'
                            : isCurrent ? 'var(--primary-foreground)'
                            : 'var(--text-muted)',
              }}
            >
              {isDone && (
                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {page.sectionLabel || `Step ${i + 1}`}
            </div>
          );
        })}
      </div>
      <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
        Step {currentStep + 1} of {totalSteps}
      </p>
    </div>
  );
}