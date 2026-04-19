import { useEffect, useRef, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#ef4444', '#06b6d4', '#f97316',
];

function hashColor(email) {
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) | 0;
  return COLORS[Math.abs(h) % COLORS.length];
}

const HEARTBEAT_MS = 15_000;
const STALE_MS = 40_000;

export function usePresence(documentId) {
  const [presence, setPresence] = useState([]);
  const [me, setMe] = useState(null);
  const myRecordId = useRef(null);
  const heartbeatRef = useRef(null);
  const activeSection = useRef(null);

  // Load current user once
  useEffect(() => {
    base44.auth.me().then(u => {
      if (u) setMe(u);
    }).catch(() => {});
  }, []);

  // Register + heartbeat
  useEffect(() => {
    if (!documentId || !me) return;

    const upsert = async (section) => {
      const color = hashColor(me.email);
      const payload = {
        document_id: documentId,
        user_email: me.email,
        user_name: me.full_name || me.email.split('@')[0],
        color,
        active_section: section || '',
        last_seen: new Date().toISOString(),
      };
      if (myRecordId.current) {
        await base44.entities.DocumentPresence.update(myRecordId.current, payload).catch(() => {});
      } else {
        // Check if a stale record exists for this user+doc
        const existing = await base44.entities.DocumentPresence.filter({
          document_id: documentId,
          user_email: me.email,
        }).catch(() => []);
        if (existing.length > 0) {
          myRecordId.current = existing[0].id;
          await base44.entities.DocumentPresence.update(myRecordId.current, payload).catch(() => {});
        } else {
          const rec = await base44.entities.DocumentPresence.create(payload).catch(() => null);
          if (rec) myRecordId.current = rec.id;
        }
      }
    };

    upsert();
    heartbeatRef.current = setInterval(() => upsert(activeSection.current), HEARTBEAT_MS);

    return () => {
      clearInterval(heartbeatRef.current);
      if (myRecordId.current) {
        base44.entities.DocumentPresence.delete(myRecordId.current).catch(() => {});
        myRecordId.current = null;
      }
    };
  }, [documentId, me?.email]);

  // Subscribe to presence changes
  useEffect(() => {
    if (!documentId) return;

    const refresh = async () => {
      const all = await base44.entities.DocumentPresence.filter({ document_id: documentId }).catch(() => []);
      const cutoff = Date.now() - STALE_MS;
      const active = all.filter(p =>
        p.user_email !== me?.email &&
        new Date(p.last_seen).getTime() > cutoff
      );
      setPresence(active);
    };

    refresh();
    const unsub = base44.entities.DocumentPresence.subscribe(() => refresh());
    const poll = setInterval(refresh, HEARTBEAT_MS);

    return () => { unsub(); clearInterval(poll); };
  }, [documentId, me?.email]);

  const setActiveSection = useCallback((sectionKey) => {
    activeSection.current = sectionKey;
    if (myRecordId.current) {
      base44.entities.DocumentPresence.update(myRecordId.current, {
        active_section: sectionKey || '',
        last_seen: new Date().toISOString(),
      }).catch(() => {});
    }
  }, []);

  return { presence, me, setActiveSection };
}