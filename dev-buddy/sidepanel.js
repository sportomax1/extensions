const statusEl = document.getElementById('status');
const toggleBtn = document.getElementById('toggle');
const reloadBtn = document.getElementById('reload');

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function setStatus(text, kind = '') {
  statusEl.textContent = text;
  statusEl.className = `status ${kind}`.trim();
}

async function sendToggle() {
  try {
    const tab = await getActiveTab();
    if (!tab?.id) throw new Error('No active tab');
    await chrome.tabs.sendMessage(tab.id, { type: 'DEV_TOGGLE' });
    setStatus('Toggled inspector on the current page.', 'ok');
  } catch (error) {
    setStatus('Inspector is unavailable on this tab. Open or refresh a normal webpage, then try again.', 'warn');
  }
}

async function reconnect() {
  try {
    const tab = await getActiveTab();
    if (!tab?.id) throw new Error('No active tab');
    await chrome.tabs.reload(tab.id);
    setStatus('Page reloading. Dev Buddy will reconnect automatically.', 'ok');
  } catch (error) {
    setStatus('Could not reload the active tab.', 'warn');
  }
}

toggleBtn.addEventListener('click', sendToggle);
reloadBtn.addEventListener('click', reconnect);
