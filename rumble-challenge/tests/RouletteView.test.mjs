import "./registerTsx.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { readFileSync } from "node:fs";

const { Roulette } = await import("../src/pages/components/selection/Roulette.tsx");
const { createRouletteFrames } = await import("../src/pages/utils/roulette.utils.ts");
const ptBR = JSON.parse(readFileSync(new URL("../src/i18n/locales/pt-BR.json", import.meta.url)));
await i18n.use(initReactI18next).init({ lng: "pt-BR", resources: { "pt-BR": { translation: ptBR } } });
const characters = [0, 1, 2, 3].map(index => ({ id: String(index), name: `Hero ${index}`, image: `hero-${index}.png`, type: "assault" }));
const defaults = { characters, entries: [0, 2, 3], drawCount: 2, frame: null, isSelecting: false, hasIndividualBans: false, challengeMode: false, infos: {} };
const render = props => renderToStaticMarkup(createElement(Roulette, { ...defaults, ...props }));

test("the wheel displays photos only for its eligible characters", () => {
  const html = render({});
  assert.ok(html.includes('href="hero-0.png"'));
  assert.ok(html.includes('href="hero-2.png"'));
  assert.ok(!html.includes('href="hero-1.png"'));
  assert.ok(!html.includes("<h2>Roleta de personagens"));
  assert.ok(!html.includes("NaN"));
});

test("two selected characters launch two balls without the lateral member panel", () => {
  const entries = [0, 2, 3].map(index => ({ character: characters[index], index }));
  const frames = createRouletteFrames({ entries, team: entries.slice(0, 2), speed: "instant" });
  const html = render({ frame: frames[0], infos: { "0": { name: "Herói Localizado" } } });
  assert.equal((html.match(/class="roulette__ball"/g) ?? []).length, 2);
  assert.ok(html.includes("Herói Localizado"));
  assert.ok(html.includes("Hero 2"));
  assert.ok(!html.includes("roulette__results"));
  assert.ok(!html.includes("Membro 1"));
  assert.ok(!html.includes("Membro 2"));
});

test("roulette omits the removed captions and ban explanation", () => {
  const html = render({ drawCount: 3, hasIndividualBans: true, challengeMode: true });
  assert.ok(!html.includes("Cada bolinha respeita os banimentos do seu membro"));
  assert.ok(!html.includes("3 bolinhas, 3 personagens"));
  assert.ok(!html.includes("O Modo Desafio aplica os banimentos após o giro"));
});

test("the branded center is the launch button and displays the configured ball count", () => {
  const html = render({ drawCount: 3, hasAvailableTeam: true, onDraw: () => {} });
  assert.ok(html.includes('<button type="button" class="roulette__hub"'));
  assert.ok(html.includes('aria-label="Lançar 3 bolinhas"'));
  assert.ok(html.includes("3 bolas"));
  assert.ok(html.includes("favicon-rumble.png"));
  assert.ok(html.includes("CHALLENGE"));
  assert.ok(!html.includes('disabled=""'));
  for (const props of [{ isSelecting: true }, { hasAvailableTeam: false }, { onDraw: undefined }]) {
    assert.ok(render({ hasAvailableTeam: true, onDraw: () => {}, ...props }).includes('disabled=""'));
  }
  assert.ok(render({ drawCount: 1 }).includes("1 bola"));
});

test("an empty wheel does not fabricate pockets or results", () => {
  const html = render({ entries: [] });
  assert.ok(html.includes("Nenhum personagem disponível"));
  assert.ok(!html.includes('href="hero-'));
  assert.ok(!html.includes('class="roulette__ball"'));
});

test("unbanning a character refreshes the idle wheel after a previous spin", () => {
  const entries = [0, 2, 3].map(index => ({ character: characters[index], index }));
  const [frame] = createRouletteFrames({ entries, team: entries.slice(0, 2), speed: "instant" });
  const html = render({ frame, entries: [0, 1, 2, 3] });
  assert.ok(html.includes('href="hero-1.png"'));
  assert.ok(!html.includes('class="roulette__ball"'));
});
