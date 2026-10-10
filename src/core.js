(function initCore(root, factory) {
  const api = factory();
  root.BiliRotateCore = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createCore() {
  "use strict";

  const VALID_ANGLES = Object.freeze([0, 90, 180, 270]);

  function normalizeAngle(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return ((Math.round(numeric / 90) * 90) % 360 + 360) % 360;
  }

  function nextAngle(current, direction) {
    const step = direction === "counterclockwise" ? -90 : 90;
    return normalizeAngle(normalizeAngle(current) + step);
  }

  function fitScale(width, height, angle) {
    const w = Number(width);
    const h = Number(height);
    const normalized = normalizeAngle(angle);
    if (normalized % 180 === 0 || w <= 0 || h <= 0) return 1;
    return Math.min(w / h, h / w);
  }

  function isValidAngle(value) {
    return VALID_ANGLES.includes(Number(value));
  }

  return Object.freeze({ VALID_ANGLES, normalizeAngle, nextAngle, fitScale, isValidAngle });
});
