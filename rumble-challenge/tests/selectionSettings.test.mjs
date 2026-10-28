import "./registerTsx.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const { useSelectionSettings } = await import("../src/pages/hooks/useSelectionSettings.ts");

function loadSettings(saved) {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: () => saved === null ? null : JSON.stringify(saved) },
  });
  let snapshot;
  function Probe() {
    snapshot = useSelectionSettings();
    return null;
  }
  try {
    renderToStaticMarkup(createElement(Probe));
    return snapshot;
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else delete globalThis.localStorage;
  }
}

test("existing saved settings keep their count, speed and bans and default to classic mode", () => {
  const settings = loadSettings({ drawCount: 2, drawSpeed: "fast", bannedCharacters: ["A::assault"] });
  assert.equal(settings.drawMode, "classic");
  assert.equal(settings.drawCount, 2);
  assert.equal(settings.drawSpeed, "fast");
  assert.ok(settings.bannedCharacters.has("A::assault"));
});

test("the saved slot machine preference is restored", () => {
  assert.equal(loadSettings({ drawMode: "slot-machine" }).drawMode, "slot-machine");
});

test("the saved roulette preference is restored", () => {
  assert.equal(loadSettings({ drawMode: "roulette" }).drawMode, "roulette");
});

test("fresh settings and unknown animation modes safely use classic mode", () => {
  assert.equal(loadSettings(null).drawMode, "classic");
  assert.equal(loadSettings({ drawMode: "unknown" }).drawMode, "classic");
});
