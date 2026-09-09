const ACTIVE_BADGE = "ON";

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "toggle-dictation") return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  try {
    await chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_DICTATION" });
  } catch (error) {
    console.debug("Browser Dictation could not reach this page:", error);
  }
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type !== "DICTATION_STATE" || !sender.tab?.id) return;

  const tabId = sender.tab.id;
  const active = Boolean(message.active);

  chrome.action.setBadgeText({ tabId, text: active ? ACTIVE_BADGE : "" });
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#dc2626" });
  chrome.action.setTitle({
    tabId,
    title: active ? "Browser Dictation — listening" : "Browser Dictation"
  });
});
