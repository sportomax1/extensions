const KEY = 'clipboardBuddyItems';
const MAX_ITEMS = 250;

async function saveText(text, source = 'selection') {
  const clean = String(text || '').trim();
  if (!clean) return;
  const { [KEY]: items = [] } = await chrome.storage.local.get(KEY);
  const next = items.filter(x => x.text !== clean);
  next.unshift({
    id: crypto.randomUUID(),
    text: clean,
    title: clean.split(/\r?\n/)[0].slice(0, 72),
    tags: [],
    pinned: false,
    source,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  await chrome.storage.local.set({ [KEY]: next.slice(0, MAX_ITEMS) });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'clipboard-buddy-save-selection',
      title: 'Save selection to Clipboard Buddy',
      contexts: ['selection']
    });
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'clipboard-buddy-save-selection') {
    saveText(info.selectionText, 'page selection');
  }
});
