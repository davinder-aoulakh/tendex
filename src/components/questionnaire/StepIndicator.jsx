/**
 * StepIndicator — shows only the sections relevant to the current path.
 * Accepts visiblePages (the already-filtered page list) so it dynamically
 * reflects the user's procurement type without showing irrelevant sections.
 */
export default function StepIndicator({ currentStep, totalSteps, visiblePages = [] }) {
  return (
    <div className="space-y-3">
      {/* Progress bar segments */}
      <div className="flex items-center gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-300 flex-1 ${
            i < currentStep  ? 'bg-blue-400' :
            i === currentStep ? 'bg-blue-500' :
            'bg-white/15'
          }`} />
        ))}
      </div>

      {/* Section labels — only shown if pages have sectionLabel */}
      {visiblePages.length > 0 && visiblePages.some(p => p.sectionLabel) && (
        <div className="flex items-start gap-1 overflow-hidden">
          {visiblePages.map((page, i) => {
            if (!page.sectionLabel) return null;
            const isDone    = i < currentStep;
            const isCurrent = i === currentStep;
            return (
              <div key={page.id} className="flex-1 min-w-0 text-center">
                <p className={`text-[10px] font-medium truncate transition-colors ${
                  isCurrent ? 'text-blue-300' :
                  isDone    ? 'text-blue-400/60' :
                  'text-white/20'
                }`}>
                  {page.sectionLabel}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-blue-200/40">Step {currentStep + 1} of {totalSteps}</p>
    </div>
  );
}