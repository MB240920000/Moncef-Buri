import { useEffect, useState } from "react";

const PREFIX = "nexus_crm_";

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

function notify(key: string) {
  listeners.get(key)?.forEach((fn) => fn());
}

export function readCollection<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T[];
  } catch {
    return fallback;
  }
}

export function writeCollection<T>(key: string, value: T[]) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
  notify(key);
}

/**
 * React hook backed by localStorage, shared across components via a
 * lightweight pub-sub. Acts as a stand-in for a Supabase-backed table —
 * swap the implementation in this file to point at Supabase later
 * without changing call sites.
 */
export function useCollection<T extends { id: string }>(key: string, seed: () => T[]) {
  const [items, setItems] = useState<T[]>(() => {
    const existing = readCollection<T>(key, []);
    if (existing.length === 0) {
      const seeded = seed();
      writeCollection(key, seeded);
      return seeded;
    }
    return existing;
  });

  useEffect(() => {
    const fn = () => setItems(readCollection<T>(key, []));
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(fn);
    return () => {
      listeners.get(key)!.delete(fn);
    };
  }, [key]);

  const add = (item: T) => {
    const next = [...readCollection<T>(key, []), item];
    writeCollection(key, next);
  };

  const update = (id: string, patch: Partial<T>) => {
    const next = readCollection<T>(key, []).map((it) =>
      it.id === id ? { ...it, ...patch } : it
    );
    writeCollection(key, next);
  };

  const remove = (id: string) => {
    const next = readCollection<T>(key, []).filter((it) => it.id !== id);
    writeCollection(key, next);
  };

  const setAll = (next: T[]) => writeCollection(key, next);

  return { items, add, update, remove, setAll };
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
