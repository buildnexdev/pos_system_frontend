/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: Global API loading counter for overlay spinner
 * Edit Date: 2026-11-14
 */

type Listener = (active: boolean, count: number) => void;

let pending = 0;
let visible = false;
let showTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<Listener>();

const SHOW_DELAY_MS = 120;

function notify() {
  listeners.forEach((fn) => fn(visible, pending));
}

function scheduleShow() {
  if (showTimer || visible) return;
  showTimer = setTimeout(() => {
    showTimer = null;
    if (pending > 0) {
      visible = true;
      notify();
    }
  }, SHOW_DELAY_MS);
}

function clearShowTimer() {
  if (showTimer) {
    clearTimeout(showTimer);
    showTimer = null;
  }
}

export function startGlobalLoading() {
  pending += 1;
  scheduleShow();
  notify();
}

export function stopGlobalLoading() {
  pending = Math.max(0, pending - 1);
  if (pending === 0) {
    clearShowTimer();
    visible = false;
  }
  notify();
}

export function resetGlobalLoading() {
  pending = 0;
  clearShowTimer();
  visible = false;
  notify();
}

export function subscribeGlobalLoading(listener: Listener) {
  listeners.add(listener);
  listener(visible, pending);
  return () => {
    listeners.delete(listener);
  };
}

export function isGlobalLoadingActive() {
  return visible;
}
