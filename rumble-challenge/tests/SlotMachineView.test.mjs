import "./registerTsx.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { readFileSync } from "node:fs";

const { SlotMachine } = await import("../src/pages/components/selection/SlotMachine.tsx");
const { DrawButton } = await import("../src/pages/components/selection/DrawButton.tsx");
const { createSlotMachineFrames } = await import("../src/pages/utils/slotMachine.utils.ts");
const ptBR = JSON.parse(readFileSync(new URL("../src/i18n/locales/pt-BR.json", import.meta.url)));
await i18n.use(initReactI18next).init({ lng: "pt-BR", resources: { "pt-BR": { translation: ptBR } } });

const characters = Array.from({ length: 3 }, (_, index) => ({
  id: String(index), name: `Hero ${index}`, image: `hero-${index}.png`,
  imageWidthTeam: 375, imageHeightTeam: 359,
}));
const defaultProps = { characters, drawCount: 3, frame: null, isSelecting: false, infos: {} };
const render = props => renderToStaticMarkup(createElement(SlotMachine, { ...defaultProps, ...props }));

test("before the first draw the reels already display characters without marking winners", () => {
  const html = render({});
  for (const index of [0, 1, 2]) assert.ok(html.includes(`src="hero-${index}.png"`));
  assert.ok(!html.includes("slot-machine__placeholder"));
  assert.ok(!html.includes("slot-machine__reel--locked"));
});

test("the machine omits the visible mode title and explanatory subtitle", () => {
  const html = render({});
  assert.ok(!html.includes("<h2>Caça-níquel"));
  assert.ok(!html.includes("Os rolos param um de cada vez."));
});

test("the machine has border lights and no selected-character counter", () => {
  const html = render({});
  assert.ok(html.includes('class="slot-machine__lights"'));
  assert.ok(!html.includes('class="slot-machine__progress"'));
});

test("border lighting has one lamp at each corner and alternating lamps on every edge", () => {
  const html = render({});
  for (const corner of ["top-left", "top-right", "bottom-left", "bottom-right"]) {
    assert.equal(html.split(`data-lamp-corner="${corner}"`).length - 1, 1);
  }
  assert.ok(html.includes('data-lamp-phase="0"'));
  assert.ok(html.includes('data-lamp-phase="1"'));
});

test("the lever preserves the draw button's accessible label and disabled rules", () => {
  for (const [isSelecting, hasAvailableTeam, disabled] of [[false, true, false], [true, true, true], [false, false, true]]) {
    const html = renderToStaticMarkup(createElement(DrawButton, {
      appearance: "lever", drawCount: 3, isSelecting, hasAvailableTeam, onClick() {},
    }));
    assert.ok(html.includes("slot-machine__lever"));
    assert.ok(html.includes('aria-label="'));
    assert.equal(html.includes('disabled=""'), disabled);
  }
});

test("idle reels match the configured team size even after the previous draw used three reels", () => {
  const html = render({
    drawCount: 1,
    frame: { indexes: [0, 1, 2], lockedCount: 3, step: 10, delay: 100 },
  });
  assert.equal((html.match(/<article/g) ?? []).length, 1);
  assert.ok(!html.includes("Pronto para sortear"));
  assert.ok(!html.includes("slot-machine__reel--locked"));
});

test("the reel displays a localized name and a locked result", () => {
  const html = render({
    drawCount: 1,
    infos: { "0": { name: "Herói Localizado" } },
    frame: { indexes: [0], lockedCount: 1, step: 3, delay: 100 },
  });
  assert.ok(html.includes("Herói Localizado"));
  assert.ok(!html.includes("Definido"));
  assert.ok(!html.includes("undefined"));
});

test("spinning shows the outgoing and incoming art without requiring symbol or background", () => {
  const html = render({
    drawCount: 1, isSelecting: true,
    frame: { indexes: [1], previousIndexes: [0], lockedCount: 0, step: 3, delay: 100 },
  });
  assert.ok(html.includes('src="hero-0.png"'));
  assert.ok(html.includes('src="hero-1.png"'));
  assert.ok(!html.includes("Girando…"));
  assert.ok(!html.includes("url(undefined)"));
});

test("a spin mounts a complete strip per reel so movement does not depend on rebuilding two cards each tick", () => {
  const indexed = characters.map((character, index) => ({ character, index }));
  const frames = createSlotMachineFrames({
    team: indexed, candidatesByMember: indexed.map(item => [item]), speed: "fast",
  });
  const html = render({ frame: frames[0], isSelecting: true });
  assert.equal((html.match(/class="slot-machine__strip"/g) ?? []).length, 3);
  assert.ok(!html.includes('class="slot-machine__track"'));
  assert.ok(html.includes('class="slot-machine__strip" aria-hidden="true"'));
});

test("the stopped window retains the losing options above and below the centered winner", () => {
  const html = render({
    drawCount: 1,
    frame: {
      indexes: [0], lockedCount: 1, step: 1, elapsed: 40, delay: 0,
      animation: {
        id: "neighbor-test",
        reels: [{ indexes: [1, 0], times: [0, 40], duration: 40, beforeIndex: 2, afterIndex: 2 }],
      },
    },
  });
  const above = html.indexOf('data-reel-position="above"');
  const selected = html.indexOf('data-reel-position="selected"');
  const below = html.indexOf('data-reel-position="below"');
  assert.ok(above >= 0 && selected > above && below > selected);
  assert.ok(html.slice(above, selected).includes('src="hero-1.png"'));
  assert.ok(html.slice(selected, below).includes('src="hero-0.png"'));
  assert.ok(html.slice(below).includes('src="hero-2.png"'));
  assert.ok(html.includes('class="slot-machine__payline"'));
});
