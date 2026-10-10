"use strict";

const assert = require("node:assert/strict");
const { normalizeAngle, nextAngle, fitScale, isValidAngle } = require("../src/core.js");

assert.equal(normalizeAngle(0), 0);
assert.equal(normalizeAngle(360), 0);
assert.equal(normalizeAngle(-90), 270);
assert.equal(normalizeAngle(181), 180);
assert.equal(normalizeAngle("invalid"), 0);

assert.equal(nextAngle(270, "clockwise"), 0);
assert.equal(nextAngle(0, "counterclockwise"), 270);

assert.equal(fitScale(1920, 1080, 0), 1);
assert.equal(fitScale(1920, 1080, 180), 1);
assert.equal(fitScale(1920, 1080, 90), 0.5625);
assert.equal(fitScale(1080, 1920, 270), 0.5625);
assert.equal(fitScale(0, 0, 90), 1);

assert.equal(isValidAngle(90), true);
assert.equal(isValidAngle(45), false);

console.log("core tests passed");
