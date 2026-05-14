import { useEffect, useRef, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Auto-save hook for procurement questionnaire.
 * - Saves immediately when `trigger` changes (navigation events).
 * - Also saves on a 30-second interval.
 * - Silently retries on failure (no user-visible error).
 * - Returns { savedAt, saveNow } — savedAt is a Date or null.
 */
export function useAutoSave({ docId, answers, currentStep, enabled = true }) {
  const [savedAt, setSavedAt] = useState(null);
  const retryQueueRef = useRef(null);
  const isSavingRef = useRef(false);

  const doSave = useCallback(async (data) => {
    if (!docId || !enabled) return;
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    try {
      await base44.entities.Document.update(docId, {
        questionnaire_data: data.answers,
        questionnaire_step: data.step,
      });
      setSavedAt(new Date());
      retryQueueRef.current = null;
    } catch {
      // Queue for retry
      retryQueueRef.current = data;
    } finally {
      isSavingRef.current = false;
    }
  }, [docId, enabled]);

  // Retry queued save every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      if (retryQueueRef.current) {
        doSave(retryQueueRef.current);
      }
    }, 10_000);
    return () => clearInterval(interval);
  }, [doSave]);

  // 30-second auto-save interval
  useEffect(() => {
    if (!enabled || !docId) return;
    const interval = setInterval(() => {
      doSave({ answers, step: currentStep });
    }, 30_000);
    return () => clearInterval(interval);
  }, [doSave, answers, currentStep, enabled, docId]);

  // Expose imperative save for navigation events
  const saveNow = useCallback(() => {
    doSave({ answers, step: currentStep });
  }, [doSave, answers, currentStep]);

  return { savedAt, saveNow };
}