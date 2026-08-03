import React, { useState, useEffect } from 'react';
import { Zap, Check, Sparkles, BookOpen, DollarSign, ListTodo } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { api } from '../../lib/axios';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [rawInput, setRawInput] = useState('');
  const [captureType, setCaptureType] = useState<'AUTO' | 'NOTE' | 'TASK' | 'EXPENSE'>('AUTO');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'q') || (e.ctrlKey && e.key.toLowerCase() === 'q')) {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawInput.trim() || loading) return;
    setLoading(true);
    setSuccessMsg('');

    try {
      const { data } = await api.post('/ai/quick-capture', {
        rawInput,
        type: captureType,
      });

      const created = data.data?.createdType || 'ITEM';
      setSuccessMsg(`Captured as ${created}!`);
      setRawInput('');
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚡ Global Quick Capture (Save in < 3s)">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="flex items-center gap-1.5 p-1 bg-secondary/50 rounded-lg">
          {[
            { id: 'AUTO', label: '⚡ AI Auto-Detect', icon: Sparkles },
            { id: 'NOTE', label: '📝 Note / Idea', icon: BookOpen },
            { id: 'TASK', label: '✅ Task', icon: ListTodo },
            { id: 'EXPENSE', label: '💰 Expense', icon: DollarSign },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setCaptureType(type.id as any)}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                captureType === type.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-1">
          <textarea
            autoFocus
            rows={3}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="Type anything... e.g. 'Build landing page mockup' or 'Spent $15 on coffee' or 'Idea: AI voice memo app'"
            className="w-full bg-secondary/40 border border-border/50 rounded-xl p-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-accent resize-none placeholder-muted-foreground"
            required
          />
          <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1">
            <span>Tip: Press <kbd className="px-1 py-0.5 bg-secondary rounded border border-border">Alt + Q</kbd> anywhere to open Quick Capture</span>
            <span>Captured in &lt; 3s</span>
          </div>
        </div>

        {successMsg && (
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold rounded-lg flex items-center gap-2">
            <Check size={14} />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading || !rawInput.trim()} className="flex items-center gap-1.5">
            {loading ? (
              <>
                <Zap size={14} className="animate-spin text-amber-400" />
                <span>Capturing...</span>
              </>
            ) : (
              <>
                <Zap size={14} className="text-amber-400" />
                <span>Instant Capture</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
