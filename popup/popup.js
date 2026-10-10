"use strict";

const SOURCE = "video-zhuan-zhuan";
const status = document.querySelector("#status");
const angleOutput = document.querySelector("#angle-output");
const angleButtons = Array.from(document.querySelectorAll("[data-angle]"));
const directionButtons = Array.from(document.querySelectorAll("[data-direction]"));
const controlButtons = [...angleButtons, ...directionButtons];
const remember = document.querySelector("#remember");
let activeTabId = null;

function setControlsEnabled(enabled) {
  controlButtons.forEach((button) => { button.disabled = !enabled; });
}

function renderState(state) {
  const angle = Number(state?.angle) || 0;
  angleOutput.textContent = `${angle}°`;
  angleButtons.forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.angle) === angle);
  });
  status.textContent = state?.hasVideo ? "已连接当前视频" : "当前页面暂未找到视频";
  status.className = state?.hasVideo ? "ready" : "";
}

function renderError() {
  status.textContent = "此页面不允许扩展运行";
  status.className = "error";
  setControlsEnabled(false);
}

async function send(message) {
  return chrome.tabs.sendMessage(activeTabId, { source: SOURCE, ...message });
}

async function ensureInjected() {
  try {
    return await send({ type: "get-state" });
  } catch (_error) {
    await chrome.scripting.insertCSS({ target: { tabId: activeTabId }, files: ["content.css"] });
    await chrome.scripting.executeScript({ target: { tabId: activeTabId }, files: ["src/core.js"] });
    await chrome.scripting.executeScript({ target: { tabId: activeTabId }, files: ["src/content.js"] });
    return send({ type: "get-state" });
  }
}

angleButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    try {
      renderState(await send({ type: "set-angle", angle: Number(button.dataset.angle) }));
    } catch (_error) {
      renderError();
    }
  });
});

directionButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    try {
      renderState(await send({ type: "rotate", direction: button.dataset.direction }));
    } catch (_error) {
      renderError();
    }
  });
});

remember.addEventListener("change", async () => {
  await chrome.storage.local.set({ rememberRotation: remember.checked });
  if (!remember.checked) await chrome.storage.local.set({ savedAngle: 0 });
});

(async function initialize() {
  setControlsEnabled(false);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTabId = tab?.id ?? null;
  const settings = await chrome.storage.local.get({ rememberRotation: true });
  remember.checked = settings.rememberRotation;
  if (!activeTabId) return renderError();
  try {
    renderState(await ensureInjected());
    setControlsEnabled(true);
  } catch (_error) {
    renderError();
  }
})();
