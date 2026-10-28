import "./registerTsx.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
const { Character } = await import("../src/pages/components/Character.tsx");
const { TeamCharacter } = await import("../src/pages/components/TeamCharacter.tsx");
const { CharacterCardContents } = await import("../src/pages/components/CharacterCardContents.tsx");

const props = { name: "Test Hero", image: "hero.png", imageWidth: 120, imageHeight: 120, imageWidthTeam: 375, imageHeightTeam: 359 };
for (const alignment of ["hero", "villain", "neutral"]) {
  test(`${alignment} styling reaches compact, 3D and shared card art`, () => {
    for (const Component of [Character, TeamCharacter, CharacterCardContents]) {
      const html = renderToStaticMarkup(createElement(Component, { ...props, alignment }));
      assert.ok(html.includes(`data-alignment="${alignment}"`));
      assert.ok(html.includes('class="character-card__alignment-effect" aria-hidden="true"'));
      assert.ok(html.includes("Test Hero"));
    }
  });
}
test("legacy cards do not assume an alignment or create particle effects", () => {
  const html = renderToStaticMarkup(createElement(Character, props));
  assert.ok(!html.includes("data-alignment"));
  assert.ok(!html.includes("character-card__alignment-effect"));
});
