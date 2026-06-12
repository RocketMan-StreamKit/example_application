const titleEl = document.getElementById('title');
const subtitleEl = document.getElementById('subtitle');
const randomValueEl = document.getElementById('random-value');
const clickCountEl = document.getElementById('click-count');
const statusEl = document.getElementById('status');
const timestampEl = document.getElementById('timestamp');
const incrementBtn = document.getElementById('increment-btn');
const refreshBtn = document.getElementById('refresh-btn');

const addonId =
  window.location.pathname.split('/').filter(Boolean)[1] || 'example_application';
const pageToken = new URLSearchParams(window.location.search).get('token') || '';

/** @type {ReturnType<typeof setInterval> | null} */
let pollTimer = null;

/** @type {{ label?: string; accentColor?: string; refreshInterval?: number; showTimestamp?: boolean }} */
let cachedParams = {};

const apiUrl = (path, query = {}) => {
  const params = new URLSearchParams({ token: pageToken, ...query });
  return `/addon/${encodeURIComponent(addonId)}/${path}?${params.toString()}`;
};

const setStatus = (message, isError = false) => {
  statusEl.textContent = message;
  statusEl.classList.toggle('is-error', isError);
};

const applyParams = params => {
  cachedParams = params || {};

  if (typeof params.label === 'string' && params.label.trim()) {
    titleEl.textContent = params.label.trim();
  }

  const accent =
    typeof params.accentColor === 'string' && params.accentColor.trim()
      ? params.accentColor.trim()
      : '#3b82f6';
  document.documentElement.style.setProperty('--accent', accent);

  subtitleEl.textContent =
    `Addon: ${addonId} · refresh every ${Math.max(1, Number(params.refreshInterval) || 2)}s`;

  restartPolling();
};

const loadParams = async () => {
  const response = await fetch(apiUrl('params'));
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Failed to load params');
  }
  applyParams(data);
  return data;
};

const loadState = async () => {
  const response = await fetch(apiUrl('state'));
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Failed to load state');
  }

  randomValueEl.textContent = String(data.randomValue ?? '—');
  clickCountEl.textContent = String(data.clickCount ?? 0);

  if (cachedParams.showTimestamp !== false && data.refreshedAt) {
    timestampEl.textContent = `Last refresh: ${new Date(data.refreshedAt).toLocaleTimeString()}`;
    timestampEl.hidden = false;
  } else {
    timestampEl.hidden = true;
  }

  setStatus('Connected to addon worker');
  return data;
};

const incrementCounter = async () => {
  incrementBtn.disabled = true;
  try {
    const response = await fetch(apiUrl('increment'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta: 1 }),
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Increment failed');
    }
    clickCountEl.textContent = String(data.clickCount ?? 0);
    setStatus('Worker accepted POST /increment');
    await loadState();
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'Increment failed', true);
  } finally {
    incrementBtn.disabled = false;
  }
};

const restartPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }

  const seconds = Math.max(1, Number(cachedParams.refreshInterval) || 2);
  pollTimer = setInterval(() => {
    loadState().catch(error => {
      setStatus(error instanceof Error ? error.message : 'Poll failed', true);
    });
  }, seconds * 1000);
};

const bootstrap = async () => {
  if (!pageToken) {
    setStatus('Missing page token in URL', true);
    return;
  }

  try {
    await loadParams();
    await loadState();
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'Startup failed', true);
  }
};

incrementBtn.addEventListener('click', () => {
  incrementCounter();
});

refreshBtn.addEventListener('click', () => {
  Promise.all([loadParams(), loadState()]).catch(error => {
    setStatus(error instanceof Error ? error.message : 'Refresh failed', true);
  });
});

bootstrap();
