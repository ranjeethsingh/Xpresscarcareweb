"use client";

import { useEffect, useRef } from "react";

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

/**
 * Calls `onTimeout` after `timeoutMs` of no user activity (mouse, keyboard,
 * scroll, touch). The timer resets on every activity event. Pass `enabled:
 * false` to turn the whole thing off (e.g. when nobody is logged in yet).
 */
export function useInactivityLogout(
  onTimeout: () => void,
  timeoutMs: number,
  enabled: boolean
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onTimeoutRef = useRef(onTimeout);

  // Always call the latest version of onTimeout, without needing to
  // re-attach event listeners every time it changes.
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    if (!enabled) return;

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onTimeoutRef.current();
      }, timeoutMs);
    };

    resetTimer();

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [enabled, timeoutMs]);
}
