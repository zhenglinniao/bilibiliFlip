"use strict";

const MESSAGE_SOURCE = "video-zhuan-zhuan";

async function ensureInjected(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { source: MESSAGE_SOURCE, type: "get-state" });
    return true;
  } catch (_error) {
    try {
      await chrome.scripting.insertCSS({ target: { tabId }, files: ["content.css"] });
      await chrome.scripting.executeScript({ target: { tabId }, files: ["src/core.js"] });
      await chrome.scripting.executeScript({ target: { tabId }, files: ["src/content.js"] });
      return true;
    } catch (_injectionError) {
      return false;
    }
  }
}

chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !(await ensureInjected(tab.id))) return;

  const payload = command === "reset-rotation"
    ? { source: MESSAGE_SOURCE, type: "set-angle", angle: 0 }
    : {
        source: MESSAGE_SOURCE,
        type: "rotate",
        direction: command === "rotate-counterclockwise" ? "counterclockwise" : "clockwise"
      };
  await chrome.tabs.sendMessage(tab.id, payload).catch(() => undefined);
});
