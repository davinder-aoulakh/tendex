import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import EnhancedTextarea from './EnhancedTextarea';
import SuppliersList from './SuppliersList';

export default function QuestionField({ field, value, onChange, error, docType, sameAsValue, onSameAs }) {
  const inputStyle = {
    background: 'var(--input)',
    borderColor: error ? 'rgba(248,113,113,0.6)' : 'var(--border)',
    color: 'var(--text-primary)',
  };
  const inputClass = cn(
    'focus-visible:ring-1',
    error && 'focus-visible:ring-red-400/40'
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={field.key} className={cn('text-sm font-medium', error ? 'text-red-400' : '')} style={error ? {} : { color: 'var(--text-primary)' }}>
          {field.label}
          {!field.required && <span className="font-normal ml-1" style={{ color: 'var(--text-muted)' }}>(optional)</span>}
          {field.required && <span className="text-red-400 ml-1">*</span>}
        </Label>
        {onSameAs && sameAsValue && (
          <button type="button" onClick={onSameAs}
            className="text-xs px-2 py-0.5 rounded-md border transition-colors flex-shrink-0"
            style={{ color: 'var(--action)', borderColor: 'var(--action-border)', background: 'var(--action-subtle)' }}>
            Same as above
          </button>
        )}
      </div>

      {field.helpText && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{field.helpText}</p>}

      {field.type === 'text' && (
        <Input id={field.key} value={value || ''} onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder} className={inputClass} style={inputStyle} />
      )}

      {field.type === 'email' && (
        <Input id={field.key} type="email" value={value || ''} onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder} className={inputClass} style={inputStyle} />
      )}

      {field.type === 'number' && (
        <Input id={field.key} type="number" value={value || ''} onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder} className={inputClass} style={inputStyle} />
      )}

      {field.type === 'date' && (
        <Input id={field.key} type="date" value={value || ''} onChange={e => onChange(e.target.value)}
          className={cn(inputClass, 'date-input')} style={inputStyle} />
      )}

      {field.type === 'textarea' && (
        <EnhancedTextarea field={field} value={value} onChange={onChange} error={error} docType={docType} />
      )}

      {field.type === 'select' && (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger className={inputClass} style={inputStyle}>
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
            )}
            style={{ background: value ? 'var(--primary)' : 'var(--muted)' }}
          >
            <span className={cn(
              'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
              value ? 'translate-x-6' : 'translate-x-1'
            )} />
          </button>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{value ? 'Yes' : 'No'}</span>
        </div>
      )}

      {field.type === 'radio-cards' && (
        <div className={cn('grid gap-3', field.options.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')}>
          {field.options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="text-left p-4 rounded-xl border-2 transition-all"
              style={{
                borderColor: value === opt.value ? 'var(--primary)' : 'var(--border)',
                background: value === opt.value ? 'rgba(232,34,26,0.08)' : 'var(--card)',
              }}
            >
              <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{opt.label}</div>
              {opt.description && <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{opt.description}</div>}
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
                className="w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-all"
                style={{
                  borderColor: checked ? 'var(--primary)' : 'var(--border)',
                  background: checked ? 'rgba(232,34,26,0.08)' : 'var(--card)',
                }}
              >
                <div className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ background: checked ? 'var(--primary)' : 'transparent', borderColor: checked ? 'var(--primary)' : 'var(--border-strong)' }}>
                  {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {field.type === 'suppliers-list' && (
        <SuppliersList value={value} onChange={onChange} />
      )}

      {error && <p className="text-xs text-red-400 mt-1">This field is required.</p>}
    </div>
  );
}