export default function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
          i < currentStep ? 'bg-primary flex-1' :
          i === currentStep ? 'bg-primary flex-[2]' :
          'bg-border flex-1'
        }`} />
      ))}
    </div>
  );
}