(function initVideoRotator() {
  "use strict";

  if (globalThis.__videoZhuanZhuanLoaded) return;
  globalThis.__videoZhuanZhuanLoaded = true;

  const core = globalThis.BiliRotateCore;
  const STORAGE_DEFAULTS = { rememberRotation: true, savedAngle: 0 };
  const VIDEO_CLASS = "vzz-rotated-video";
  const PLAYER_SELECTOR = [
    ".bpx-player-container",
    ".bilibili-player",
    "#bilibili-player",
    "#playerWrap",
    "[class*='player-container']"
  ].join(",");

  let angle = 0;
  let activeVideo = null;
  let resizeObserver = null;
  let refreshTimer = null;
  let toastTimer = null;

  function videoScore(video) {
    const rect = video.getBoundingClientRect();
    const visible = rect.width > 1 && rect.height > 1;
    const inKnownPlayer = Boolean(video.closest(PLAYER_SELECTOR));
    return (visible ? rect.width * rect.height : 0) + (inKnownPlayer ? 1_000_000_000 : 0);
  }

  function findMainVideo() {
    const videos = Array.from(document.querySelectorAll("video"));
    if (!videos.length) return null;
    return videos.reduce((best, candidate) =>
      videoScore(candidate) > videoScore(best) ? candidate : best
    );
  }

  function clearVideo(video) {
    if (!video) return;
    video.classList.remove(VIDEO_CLASS);
    video.style.removeProperty("--vzz-angle");
    video.style.removeProperty("--vzz-scale");
  }

  function updateTransform() {
    if (!activeVideo || !activeVideo.isConnected) return;
    if (angle === 0) {
      clearVideo(activeVideo);
      return;
    }
    const scale = core.fitScale(activeVideo.clientWidth, activeVideo.clientHeight, angle);
    activeVideo.style.setProperty("--vzz-angle", `${angle}deg`);
    activeVideo.style.setProperty("--vzz-scale", String(scale));
    activeVideo.classList.add(VIDEO_CLASS);
  }

  function watchVideo(video) {
    if (video === activeVideo) {
      updateTransform();
      return;
    }
    clearVideo(activeVideo);
    resizeObserver?.disconnect();
    activeVideo = video;
    if (activeVideo) {
      resizeObserver = new ResizeObserver(updateTransform);
      resizeObserver.observe(activeVideo);
    }
    updateTransform();
  }

  function refreshVideo() {
    watchVideo(findMainVideo());
  }

  function scheduleRefresh() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refreshVideo, 80);
  }

  function showToast(message) {
    let toast = document.querySelector(".vzz-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "vzz-toast";
      toast.setAttribute("role", "status");
      document.documentElement.appendChild(toast);
    }
    toast.textContent = message;
    requestAnimationFrame(() => toast.classList.add("vzz-toast-visible"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("vzz-toast-visible"), 1100);
  }

  async function persistAngle() {
    const { rememberRotation = true } = await chrome.storage.local.get(STORAGE_DEFAULTS);
    if (rememberRotation) await chrome.storage.local.set({ savedAngle: angle });
  }

  async function setAngle(next, announce = true) {
    angle = core.normalizeAngle(next);
    refreshVideo();
    await persistAngle();
    if (announce) showToast(angle === 0 ? "已恢复原方向" : `视频已旋转 ${angle}°`);
    return { angle, hasVideo: Boolean(activeVideo) };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || message.source !== "video-zhuan-zhuan") return undefined;
    const respond = async () => {
      refreshVideo();
      if (message.type === "get-state") {
        return { angle, hasVideo: Boolean(activeVideo) };
      }
      if (message.type === "set-angle") return setAngle(message.angle);
      if (message.type === "rotate") {
        return setAngle(core.nextAngle(angle, message.direction));
      }
      return { angle, hasVideo: Boolean(activeVideo), error: "unknown-message" };
    };
    respond().then(sendResponse);
    return true;
  });

  const mutationObserver = new MutationObserver(scheduleRefresh);
  mutationObserver.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("fullscreenchange", scheduleRefresh);
  window.addEventListener("resize", scheduleRefresh, { passive: true });

  chrome.storage.local.get(STORAGE_DEFAULTS).then(({ rememberRotation, savedAngle }) => {
    angle = rememberRotation ? core.normalizeAngle(savedAngle) : 0;
    refreshVideo();
  });
})();
