const BASE_URL = import.meta.env.VITE_UDS_BACKEND_URL

export async function udsPost(path: string, payload: unknown) {
  console.log("POST [", `${BASE_URL}${path}`, "]")
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const msg = await res.text()
    throw new Error(`UDS backend error: ${msg}`)
  }

  return res.json()
}

export async function udsGet(path: string) {
  console.log("GET [", `${BASE_URL}${path}`, "]")
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
  })

  if (!res.ok) {
    const msg = await res.text()
    throw new Error(`UDS backend error: ${msg}`)
  }

  return res.json()
}

export async function udsGetLogs(): Promise<string[]> {
    const res = await fetch('https://uds.ilaario.it/api/uds/logs');
  
    if (!res.ok) {
      throw new Error(`Failed to load logs: ${res.status}`);
    }
  
    const data = await res.json();
    return (data.entries ?? []) as string[];
  }