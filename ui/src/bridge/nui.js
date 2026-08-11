const isDevBuild = import.meta.env.DEV;
const RESOURCE_NAME = 'murphy_radialmenu';
const TIMEOUT_MS = 15000;

const pending = new Map();
let seq = 0;

function getResourceName() {
  try {
    if (typeof window !== 'undefined' && typeof window.GetParentResourceName === 'function')
      return window.GetParentResourceName();
  } catch (_) { }
  return null;
}

// Idempotent: called from a useEffect whose deps re-trigger the effect
// (setLocale/callbacks are not memoized) -> without this guard, every re-run
// added another 'message' listener that was never removed (CEF degradation).
let callbackListenerReady = false;
function initCallbackListener() {
  if (callbackListenerReady) return;
  callbackListenerReady = true;
  window.addEventListener('message', (event) => {
    if (event.data?.action !== 'nui:callback:result') return;
    const { requestId, result } = event.data.payload || {};
    if (!requestId) return;
    const entry = pending.get(requestId);
    if (!entry) return;
    clearTimeout(entry.timer);
    pending.delete(requestId);
    entry.resolve(result);
  });
}

async function call(callbackName, payload = {}) {
  const rid = `cb_${Date.now()}_${++seq}`;

  if (isDevBuild) {
    console.groupCollapsed('%cNUI call -> ' + callbackName, 'color:#8be9fd');
    console.log('rid:', rid);
    console.log('payload:', payload);
    console.groupEnd();
  }

  const resName = getResourceName();
  if (!resName) {
    // Dev mode -- no FiveM runtime, return from test data if available
    if (isDevBuild) {
      try {
        const { testResponses } = await import('../data/testData');
        const mock = testResponses[callbackName];
        if (mock) {
          if (isDevBuild) console.log('%cNUI mock <-', 'color:#50fa7b', callbackName, mock);
          return typeof mock === 'function' ? mock(payload) : mock;
        }
      } catch (_) { }
      console.warn('[NUI] No mock data for', callbackName);
      return { ok: false, error: 'dev_no_mock' };
    }
    return { ok: false, error: 'no_resource' };
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(rid);
      resolve({ ok: false, error: 'timeout' });
    }, TIMEOUT_MS);

    pending.set(rid, { resolve, reject, timer });

    fetch(`https://${resName}/${callbackName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ ...payload, __rid: rid }),
    }).catch(() => {
      // Fetch failure in NUI is common in dev -- don't reject
    });
  });
}

function sendNUI(action, payload = {}) {
  if (isDevBuild) {
    console.groupCollapsed('%cNUI send -> ' + action, 'color:#8be9fd');
    console.log('payload:', payload);
    console.groupEnd();
  }

  const resName = getResourceName();
  if (!resName) return;

  fetch(`https://${resName}/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(payload),
  }).catch(() => { });
}

function closeMenu() {
  sendNUI('closeMenu', {});
}

export { call, sendNUI, closeMenu, initCallbackListener, isDevBuild };
