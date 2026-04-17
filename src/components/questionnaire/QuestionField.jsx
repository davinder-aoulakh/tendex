import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function QuestionField({ question, value, onChange }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={question.key} className="text-sm font-medium text-blue-100/80">
        {question.label}
        {question.required && <span className="text-red-400 ml-1">*</span>}
      </Label>

      {question.type === 'text' && (
        <Input
          id={question.key}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={question.placeholder}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-blue-500/50"
        />
      )}

      {question.type === 'textarea' && (
        <Textarea
          id={question.key}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={question.placeholder}
          className="min-h-[110px] bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-blue-500/50 resize-none"
        />
      )}

      {question.type === 'select' && (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-blue-500/50">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {question.options.map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}