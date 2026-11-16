import { useCallback, useEffect, useState } from 'react';

// "dynamic" | "simple". Every new visit opens in dynamic mode; a choice made
// with the toggle is kept for the rest of the browser session only (so a
// reload doesn't undo it), never across visits. sessionStorage is a
// strictly-functional preference, not tracking, so it doesn't need consent.
const KEY = 'csd-view-mode';
export const DEFAULT_MODE = 'dynamic';

const read = () => {
  try {
    const value = window.sessionStorage.getItem(KEY);
    return value === 'simple' || value === 'dynamic' ? value : DEFAULT_MODE;
  } catch {
    return DEFAULT_MODE;
  }
};

export default function useViewMode() {
  const [mode, setModeState] = useState(read);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(KEY, mode);
    } catch {
      /* storage blocked: the toggle still works for this page view */
    }
    document.documentElement.dataset.viewMode = mode;
  }, [mode]);

  const setMode = useCallback((next) => setModeState(next), []);
  return [mode, setMode];
}
