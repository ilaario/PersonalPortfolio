const BASE_URL = import.meta.env.VITE_UDS_BACKEND_URL;

// SID per questo browser / dispositivo
let SESSION_ID: string | null = null;

function getSessionId(): string {
  if (SESSION_ID) return SESSION_ID;

  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('uds.sid');
    if (stored) {
      SESSION_ID = stored;
      return SESSION_ID;
    }
  }

  // genera un nuovo SID
  let sid: string;
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    sid = crypto.randomUUID();
  } else {
    sid = `sess-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem('uds.sid', sid);
  }

  SESSION_ID = sid;
  console.log('[UDS] new sessionId =', sid);
  return sid;
}

function buildUrl(path: string): string {
  const base = BASE_URL ?? '';
  // path ti arriva tipo "/api/uds/session"
  const url = new URL(path, base);
  url.searchParams.set('sid', getSessionId());
  return url.toString();
}

export async function udsPost(path: string, payload: unknown) {
  const url = buildUrl(path);
  console.log('POST [', url, ']');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`UDS backend error: ${msg}`);
  }

  return res.json();
}

export async function udsGet(path: string) {
  const url = buildUrl(path);
  console.log('GET [', url, ']');

  const res = await fetch(url, {
    method: 'GET',
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`UDS backend error: ${msg}`);
  }

  return res.json();
}

export async function udsGetLogs(): Promise<string[]> {
  const url = buildUrl('/api/uds/logs');
  console.log('GET [', url, ']');

  const res = await fetch(url, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error(`Failed to load logs: ${res.status}`);
  }

  const data = await res.json();
  return (data.entries ?? []) as string[];
}