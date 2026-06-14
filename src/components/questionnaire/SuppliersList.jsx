import { useState } from 'react';
import { Plus, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

const EMPTY_SUPPLIER = () => ({ name: '', contact: '', email: '', phone: '' });

export default function SuppliersList({ value, onChange }) {
  const suppliers = (value && Array.isArray(value) && value.length > 0) ? value : [EMPTY_SUPPLIER()];

  const update = (index, field, val) => {
    const updated = suppliers.map((s, i) => i === index ? { ...s, [field]: val } : s);
    onChange(updated);
  };

  const addSupplier = () => {
    onChange([...suppliers, EMPTY_SUPPLIER()]);
  };

  const removeSupplier = (index) => {
    const updated = suppliers.filter((_, i) => i !== index);
    onChange(updated.length > 0 ? updated : [EMPTY_SUPPLIER()]);
  };

  const inputStyle = {
    background: 'var(--input)',
    borderColor: 'var(--border)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {suppliers.map((supplier, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border p-4 space-y-3 relative"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Supplier {index + 1}
                </span>
              </div>
              {suppliers.length > 1 && (
                <button
                  onClick={() => removeSupplier(index)}
                  className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
                  style={{ color: 'var(--destructive)' }}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Supplier Name <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(optional)</span>
                </label>
                <Input
                  value={supplier.name}
                  onChange={e => update(index, 'name', e.target.value)}
                  placeholder="Company name"
                  style={inputStyle}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Contact Person <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(optional)</span>
                </label>
                <Input
                  value={supplier.contact}
                  onChange={e => update(index, 'contact', e.target.value)}
                  placeholder="Full name"
                  style={inputStyle}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Email Address <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(optional)</span>
                </label>
                <Input
                  type="email"
                  value={supplier.email}
                  onChange={e => update(index, 'email', e.target.value)}
                  placeholder="supplier@company.com"
                  style={inputStyle}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Phone Number <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(optional)</span>
                </label>
                <Input
                  value={supplier.phone}
                  onChange={e => update(index, 'phone', e.target.value)}
                  placeholder="+61 4xx xxx xxx"
                  style={inputStyle}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <Button
        type="button"
        variant="ghost"
        onClick={addSupplier}
        className="w-full gap-2 border-dashed"
        style={{ border: '1px dashed var(--border)', color: 'var(--text-secondary)' }}
      >
        <Plus className="w-4 h-4" /> Add another supplier
      </Button>
    </div>
  );
}