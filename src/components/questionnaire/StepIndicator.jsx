export default function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-300 flex-1 ${
            i < currentStep ? 'bg-blue-400' :
            i === currentStep ? 'bg-blue-500' :
            'bg-white/15'
          }`} />
        ))}
      </div>
      <p className="text-xs text-blue-200/40">Step {currentStep + 1} of {totalSteps}</p>
    </div>
  );
}