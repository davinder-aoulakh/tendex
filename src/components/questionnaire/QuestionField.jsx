import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import EnhancedTextarea from './EnhancedTextarea';

export default function QuestionField({ field, value, onChange, error, docType }) {
  const inputClass = cn(
    'bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-blue-500/50',
    error && 'border-red-400/60 focus-visible:ring-red-400/40'
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={field.key} className={cn('text-sm font-medium', error ? 'text-red-400' : 'text-blue-100/80')}>
          {field.label}
          {!field.required && <span className="text-blue-300/40 font-normal ml-1">(optional)</span>}
          {field.required && <span className="text-red-400 ml-1">*</span>}
        </Label>
      </div>

      {field.helpText && <p className="text-xs text-blue-200/40">{field.helpText}</p>}

      {field.type === 'text' && (
        <Input id={field.key} value={value || ''} onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder} className={inputClass} />
      )}

      {field.type === 'email' && (
        <Input id={field.key} type="email" value={value || ''} onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder} className={inputClass} />
      )}

      {field.type === 'number' && (
        <Input id={field.key} type="number" value={value || ''} onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder} className={inputClass} />
      )}

      {field.type === 'date' && (
        <Input id={field.key} type="date" value={value || ''} onChange={e => onChange(e.target.value)}
          className={cn(inputClass, 'date-input')} />
      )}

      {field.type === 'textarea' && (
        <EnhancedTextarea field={field} value={value} onChange={onChange} error={error} docType={docType} />
      )}

      {field.type === 'select' && (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger className={cn(inputClass, 'focus:ring-blue-500/50')}>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {field.options.map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {field.type === 'toggle' && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange(!value)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
              value ? 'bg-blue-500' : 'bg-white/20'
            )}
          >
            <span className={cn(
              'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
              value ? 'translate-x-6' : 'translate-x-1'
            )} />
          </button>
          <span className="text-sm text-blue-200/60">{value ? 'Yes' : 'No'}</span>
        </div>
      )}

      {field.type === 'radio-cards' && (
        <div className={cn('grid gap-3', field.options.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')}>
          {field.options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                'text-left p-4 rounded-xl border-2 transition-all',
                value === opt.value
                  ? 'border-blue-400/60 shadow-lg shadow-blue-500/10'
                  : 'border-white/10 hover:border-blue-400/30',
              )}
              style={{ background: value === opt.value ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)' }}
            >
              <div className="font-medium text-white text-sm">{opt.label}</div>
              {opt.description && <div className="text-xs text-blue-200/50 mt-1">{opt.description}</div>}
            </button>
          ))}
        </div>
      )}

      {field.type === 'checkbox-multi' && (
        <div className="space-y-2">
          {field.options.map(opt => {
            const checked = Array.isArray(value) && value.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  const current = Array.isArray(value) ? value : [];
                  onChange(checked ? current.filter(v => v !== opt.value) : [...current, opt.value]);
                }}
                className={cn(
                  'w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-all',
                  checked ? 'border-blue-400/40' : 'border-white/10 hover:border-white/20'
                )}
                style={{ background: checked ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.03)' }}
              >
                <div className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                  checked ? 'bg-blue-500 border-blue-500' : 'border-white/30'
                )}>
                  {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-sm text-blue-100/80">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="text-xs text-red-400 mt-1">This field is required.</p>}
    </div>
  );
}