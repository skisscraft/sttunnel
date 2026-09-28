"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "tbm-academy.course-progress";

type Progress = Record<string, string>; // slug -> ISO date completed

function read(): Progress {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Progress) : {};
  } catch {
    return {};
  }
}

/** Per-device course progress (no accounts in v1, so this lives in the browser only). */
export function useProgress() {
  const [progress, setProgress] = useState<Progress>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setProgress(read());
      setReady(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const setDone = useCallback((slug: string, done: boolean) => {
    setProgress((p) => {
      const next = { ...p };
      if (done) next[slug] = new Date().toISOString();
      else delete next[slug];
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // storage unavailable (private mode); progress just won't persist
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
    setProgress({});
  }, []);

  return { progress, ready, setDone, reset };
}
