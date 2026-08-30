import { useMemo, useState } from "react";

import personagensJson from "../personagens.json";

import { Character } from "./components/Character";

import { TeamModal } from "./components/TeamModal";
import type {
  DrawCount,
  DrawSpeed,
  MemberSlot,
} from "./components/settings/settings.types";
import { SettingsModal } from "./components/settings/SettingsModal";

export interface CharacterType {
  name: string;
  image: string;
  type: string;
  symbol: string;
  background: string;
  imageWidth: number;
  imageHeight: number;
  imageWidthTeam: number;
  imageHeightTeam: number;
}

interface CharacterWithIndex {
  character: CharacterType;
  index: number;
}

const personagens: CharacterType[] = personagensJson;

const DRAW_SPEED_CONFIG: Record<
  DrawSpeed,
  { base: number; increment: number }
> = {
  fast: { base: 80, increment: 35 },
  medium: { base: 160, increment: 70 },
  slow: { base: 280, increment: 110 },
};

export function getCharacterKey(character: CharacterType) {
  return `${character.name}::${character.type}`;
}

export function SelectionPage() {
  const [highlightedIndexes, setHighlightedIndexes] = useState<number[]>([]);

  const [isSelecting, setIsSelecting] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState<CharacterType[] | null>(
    null,
  );

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [drawCount, setDrawCount] = useState<DrawCount>(3);

  const [drawSpeed, setDrawSpeed] = useState<DrawSpeed>("medium");

  const [bannedCharacters, setBannedCharacters] = useState<Set<string>>(
    new Set(),
  );

  const [individualBans, setIndividualBans] = useState<
    Record<MemberSlot, Set<string>>
  >({
    1: new Set(),
    2: new Set(),
    3: new Set(),
  });

  const charactersWithIndex = useMemo<CharacterWithIndex[]>(
    () =>
      personagens.map((character, index) => ({
        character,
        index,
      })),
    [],
  );

  const availableCharacters = useMemo(
    () =>
      personagens.filter(
        (character) => !bannedCharacters.has(getCharacterKey(character)),
      ),
    [bannedCharacters],
  );

  function handleToggleBan(character: CharacterType) {
    const characterKey = getCharacterKey(character);

    setBannedCharacters((current) => {
      const updated = new Set(current);

      if (updated.has(characterKey)) {
        updated.delete(characterKey);
      } else {
        updated.add(characterKey);
      }

      return updated;
    });
  }

  function handleToggleIndividualBan(
    member: MemberSlot,
    character: CharacterType,
  ) {
    const characterKey = getCharacterKey(character);

    if (bannedCharacters.has(characterKey)) {
      return;
    }

    setIndividualBans((current) => {
      const updatedMemberBans = new Set(current[member]);

      if (updatedMemberBans.has(characterKey)) {
        updatedMemberBans.delete(characterKey);
      } else {
        updatedMemberBans.add(characterKey);
      }

      return {
        ...current,
        [member]: updatedMemberBans,
      };
    });
  }

  function isCharacterAvailableForMember(
    character: CharacterType,
    member: MemberSlot,
  ) {
    const characterKey = getCharacterKey(character);

    if (bannedCharacters.has(characterKey)) {
      return false;
    }

    if (individualBans[member].has(characterKey)) {
      return false;
    }

    return true;
  }

  function shuffle<T>(items: T[]) {
    const shuffled = [...items];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));

      [shuffled[i], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[i],
      ];
    }

    return shuffled;
  }

  function getMemberSlots(): MemberSlot[] {
    return Array.from(
      { length: drawCount },
      (_, index) => (index + 1) as MemberSlot,
    );
  }

  function findValidTeam(randomize: boolean): CharacterWithIndex[] | null {
    const members = getMemberSlots();

    const candidatesByMember = members.map((member) => {
      const candidates = charactersWithIndex.filter(({ character }) =>
        isCharacterAvailableForMember(character, member),
      );

      return randomize ? shuffle(candidates) : candidates;
    });

    const selected: CharacterWithIndex[] = [];

    const usedIndexes = new Set<number>();
    const usedNames = new Set<string>();

    function selectMember(position: number): boolean {
      if (position === members.length) {
        return true;
      }

      const candidates = candidatesByMember[position];

      for (const candidate of candidates) {
        if (usedIndexes.has(candidate.index)) {
          continue;
        }

        if (usedNames.has(candidate.character.name)) {
          continue;
        }

        selected.push(candidate);

        usedIndexes.add(candidate.index);
        usedNames.add(candidate.character.name);

        if (selectMember(position + 1)) {
          return true;
        }

        selected.pop();

        usedIndexes.delete(candidate.index);
        usedNames.delete(candidate.character.name);
      }

      return false;
    }

    if (!selectMember(0)) {
      return null;
    }

    return selected;
  }

  const hasAvailableTeam = useMemo(() => {
    const members = Array.from(
      { length: drawCount },
      (_, index) => (index + 1) as MemberSlot,
    );

    const candidatesByMember = members.map((member) =>
      charactersWithIndex.filter(({ character }) => {
        const characterKey = getCharacterKey(character);

        if (bannedCharacters.has(characterKey)) {
          return false;
        }

        if (individualBans[member].has(characterKey)) {
          return false;
        }

        return true;
      }),
    );

    const usedIndexes = new Set<number>();
    const usedNames = new Set<string>();

    function hasCombination(position: number): boolean {
      if (position === members.length) {
        return true;
      }

      for (const candidate of candidatesByMember[position]) {
        if (usedIndexes.has(candidate.index)) {
          continue;
        }

        if (usedNames.has(candidate.character.name)) {
          continue;
        }

        usedIndexes.add(candidate.index);
        usedNames.add(candidate.character.name);

        if (hasCombination(position + 1)) {
          return true;
        }

        usedIndexes.delete(candidate.index);
        usedNames.delete(candidate.character.name);
      }

      return false;
    }

    return hasCombination(0);
  }, [bannedCharacters, individualBans, drawCount, charactersWithIndex]);

  async function handleSelectCharacter() {
    if (isSelecting || !hasAvailableTeam) {
      return;
    }

    const initialTeam = findValidTeam(true);

    if (!initialTeam) {
      return;
    }

    setIsSelecting(true);

    setSelectedTeam(null);

    const totalSorteios = 10;

    let finalTeam = initialTeam;

    for (let i = 0; i < totalSorteios; i++) {
      const randomTeam = findValidTeam(true);

      if (!randomTeam) {
        break;
      }

      finalTeam = randomTeam;

      setHighlightedIndexes(randomTeam.map((member) => member.index));

      const { base, increment } = DRAW_SPEED_CONFIG[drawSpeed];
      const delay = base + i * increment;

      await new Promise<void>((resolve) => setTimeout(resolve, delay));

      if (i === totalSorteios - 2) {
        await new Promise<void>((resolve) => setTimeout(resolve, delay));
      }
    }

    const team = finalTeam.map(({ character }) => character);

    setTimeout(() => {
      setSelectedTeam(team);

      setIsSelecting(false);

      setHighlightedIndexes([]);
    }, 500);
  }

  function handleCloseModal() {
    setSelectedTeam(null);
  }

  return (
    <>
      <main
        className="
          relative
          flex
          min-h-screen
          w-full
          flex-col
          overflow-x-hidden
          px-4
          py-4
          text-white
        "
        style={{
          backgroundColor: "#11151d",
          backgroundImage:
            "radial-gradient(circle, rgba(148, 163, 184, 0.13) 1.2px, transparent 1.2px)",
          backgroundSize: "20px 20px",
        }}
      >
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          disabled={isSelecting}
          title="Configurações"
          className="
            absolute
            top-4
            left-4
            z-20
            flex
            h-11
            w-11
            cursor-pointer
            items-center
            justify-center
            rounded-xl
            border
            border-slate-700
            bg-slate-800/80
            text-slate-300
            shadow-lg
            backdrop-blur-sm
            transition-all
            duration-200
            hover:border-slate-600
            hover:bg-slate-700
            hover:text-white
            active:scale-95
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />

            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>

        <header
          className="
            mx-auto
            mb-4
            flex
            w-full
            max-w-[1600px]
            flex-col
            items-center
            text-center
          "
        >
          <h1
            className="
              text-3xl
              font-extrabold
              tracking-tight
              text-white
            "
          >
            Sorteador de Times
          </h1>

          <p
            className="
              mt-1
              max-w-2xl
              text-sm
              text-slate-400
            "
          >
            Sorteie de um a três personagens.
          </p>

          <div
            className="
              mt-3
              flex
              flex-wrap
              items-center
              justify-center
              gap-2
            "
          >
            <span
              className="
                rounded-full
                border
                border-slate-700
                bg-slate-800/70
                px-3
                py-1
                text-xs
                font-medium
                text-slate-300
              "
            >
              {availableCharacters.length} personagens disponíveis
            </span>

            <span
              className="
                rounded-full
                border
                border-slate-700
                bg-slate-800/70
                px-3
                py-1
                text-xs
                font-medium
                text-slate-300
              "
            >
              {drawCount}{" "}
              {drawCount === 1
                ? "personagem por sorteio"
                : "personagens por sorteio"}
            </span>

            {drawCount > 1 && (
              <span
                className="
                  rounded-full
                  border
                  border-slate-700
                  bg-slate-800/70
                  px-3
                  py-1
                  text-xs
                  font-medium
                  text-slate-300
                "
              >
                Sem personagens repetidos
              </span>
            )}

            {bannedCharacters.size > 0 && (
              <span
                className="
                  rounded-full
                  border
                  border-red-500/30
                  bg-red-500/10
                  px-3
                  py-1
                  text-xs
                  font-medium
                  text-red-400
                "
              >
                {bannedCharacters.size}{" "}
                {bannedCharacters.size === 1 ? "banido" : "banidos"}
              </span>
            )}
          </div>
        </header>

        <div
          className="
            mx-auto
            mb-4
            h-px
            w-full
            max-w-[1600px]
            bg-slate-700/50
          "
        />

        <section
          className="
            mx-auto
            flex
            w-full
            max-w-[1680px]
            flex-wrap
            justify-center
            gap-0
          "
        >
          {personagens.map((personagem, index) => {
            const isGloballyBanned = bannedCharacters.has(
              getCharacterKey(personagem),
            );

            return (
              <div
                key={getCharacterKey(personagem)}
                className={`
                    relative
                    transition-all
                    duration-200
                    ${isGloballyBanned ? "opacity-25 grayscale" : ""}
                  `}
              >
                <Character
                  name={personagem.name}
                  image={personagem.image}
                  symbol={personagem.symbol}
                  background={personagem.background}
                  imageWidth={personagem.imageWidth}
                  imageHeight={personagem.imageHeight}
                  isHighlighted={highlightedIndexes.includes(index)}
                />

                {isGloballyBanned && (
                  <div
                    className="
                        pointer-events-none
                        absolute
                        inset-0
                        z-20
                        flex
                        items-center
                        justify-center
                      "
                  >
                    <div
                      className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          bg-red-600/80
                          text-white
                          shadow-lg
                        "
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="h-5 w-5"
                      >
                        <circle cx="12" cy="12" r="9" />

                        <path d="m6 6 12 12" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <div
          className="
            mt-auto
            flex
            w-full
            justify-center
            pt-5
            pb-2
          "
        >
          <button
            type="button"
            onClick={handleSelectCharacter}
            disabled={isSelecting || !hasAvailableTeam}
            className={`
              group
              relative
              min-w-[220px]
              overflow-hidden
              rounded-xl
              border
              px-8
              py-3
              text-sm
              font-bold
              uppercase
              tracking-wide
              text-white
              transition-all
              duration-200
              ${
                isSelecting || !hasAvailableTeam
                  ? `
                    cursor-not-allowed
                    border-slate-600
                    bg-slate-700
                    text-slate-300
                  `
                  : `
                    cursor-pointer
                    border-emerald-400/40
                    bg-emerald-600
                    shadow-[0_8px_20px_rgba(16,185,129,0.25)]
                    hover:-translate-y-[2px]
                    hover:bg-emerald-500
                    hover:shadow-[0_10px_26px_rgba(16,185,129,0.4)]
                    active:translate-y-0
                    active:scale-[0.98]
                  `
              }
            `}
          >
            <span className="relative z-10">
              {isSelecting
                ? "Sorteando..."
                : !hasAvailableTeam
                  ? "Configuração impossível"
                  : drawCount === 1
                    ? "Sortear personagem"
                    : "Sortear time"}
            </span>

            {!isSelecting && hasAvailableTeam && (
              <span
                className="
                    absolute
                    inset-0
                    -translate-x-full
                    bg-gradient-to-r
                    from-transparent
                    via-white/10
                    to-transparent
                    transition-transform
                    duration-500
                    group-hover:translate-x-full
                  "
              />
            )}
          </button>
        </div>
      </main>

      {isSettingsOpen && (
        <SettingsModal
          characters={personagens}
          bannedCharacters={bannedCharacters}
          onToggleBan={handleToggleBan}
          individualBans={individualBans}
          onToggleIndividualBan={handleToggleIndividualBan}
          drawCount={drawCount}
          drawSpeed={drawSpeed}
          onDrawCountChange={setDrawCount}
          onDrawSpeedChange={setDrawSpeed}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {selectedTeam && (
        <TeamModal team={selectedTeam} onClose={handleCloseModal} />
      )}
    </>
  );
}
