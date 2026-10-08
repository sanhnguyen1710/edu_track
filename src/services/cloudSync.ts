import { RegistrationRequest } from '../types';

const CLOUD_SYNC_ID = 'ff808181a09d98f701a119644c341b99';
const CLOUD_ENDPOINT = `https://api.restful-api.dev/objects/${CLOUD_SYNC_ID}`;

// Helper timeout fetch
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 6000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Fetch latest requests from Cloud Relay
 */
export async function fetchCloudRequests(): Promise<RegistrationRequest[] | null> {
  try {
    const res = await fetchWithTimeout(CLOUD_ENDPOINT, { method: 'GET' }, 5000);
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.data?.syncData) {
      const parsed = JSON.parse(json.data.syncData);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.log('Cloud sync fetch error:', err);
  }
  return null;
}

/**
 * Save / Update requests on Cloud Relay
 */
export async function saveCloudRequests(requests: RegistrationRequest[]): Promise<boolean> {
  try {
    const payload = {
      name: 'EduTrack Live Cloud Sync',
      data: {
        syncData: JSON.stringify(requests),
        lastUpdated: new Date().toISOString(),
      },
    };

    const res = await fetchWithTimeout(CLOUD_ENDPOINT, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }, 6000);

    return res.ok;
  } catch (err) {
    console.log('Cloud sync save error:', err);
    return false;
  }
}

/**
 * Merge local requests with cloud requests and update both
 */
export async function syncRequestsWithCloud(
  localRequests: RegistrationRequest[]
): Promise<RegistrationRequest[]> {
  const cloudList = await fetchCloudRequests();

  const map = new Map<string, RegistrationRequest>();

  // 1. Add cloud items
  if (cloudList && cloudList.length > 0) {
    cloudList.forEach(r => {
      if (r && r.username) {
        map.set(r.username.toLowerCase(), r);
      }
    });
  }

  // 2. Merge local items
  localRequests.forEach(loc => {
    if (!loc || !loc.username) return;
    const key = loc.username.toLowerCase();
    if (!map.has(key)) {
      map.set(key, loc);
    } else {
      const cloudItem = map.get(key)!;
      // If local has approved while cloud is pending, or local was updated
      if (loc.status === 'approved' && cloudItem.status !== 'approved') {
        map.set(key, { ...cloudItem, ...loc });
      } else if (loc.status === 'rejected' && cloudItem.status !== 'rejected') {
        map.set(key, { ...cloudItem, ...loc });
      }
    }
  });

  const merged = Array.from(map.values());

  // Push back merged to cloud in background
  if (merged.length > 0) {
    saveCloudRequests(merged).catch(() => {});
  }

  return merged;
}

/**
 * Subscribe to cloud updates via polling
 */
export function subscribeCloudRequests(
  callback: (requests: RegistrationRequest[]) => void,
  intervalMs = 6000
): () => void {
  let isMounted = true;

  const poll = async () => {
    if (!isMounted) return;
    const latest = await fetchCloudRequests();
    if (isMounted && latest && latest.length > 0) {
      callback(latest);
    }
  };

  // Run initial poll
  poll();

  const timer = setInterval(poll, intervalMs);

  return () => {
    isMounted = false;
    clearInterval(timer);
  };
}
