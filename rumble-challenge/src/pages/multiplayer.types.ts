import type { DrawCount, DrawMode } from "./components/settings/settings.types";
import type { CharacterType, RouletteFrame, SlotMachineFrame } from "./selection.types";

export type MultiplayerRole = "host" | "guest" | null;

export type MultiplayerStatus =
  | "idle"
  | "creating-offer"
  | "waiting-answer"
  | "creating-answer"
  | "connecting"
  | "connected"
  | "error";

export type MultiplayerDrawMessage =
  | {
      type: "draw:start";
      drawMode?: DrawMode;
      drawCount?: DrawCount;
    }
  | {
      type: "draw:frame";
      indexes: number[];
      slotMachineFrame?: SlotMachineFrame;
      rouletteFrame?: RouletteFrame;
    }
  | {
      type: "draw:result";
      team: CharacterType[];
    }
  | {
      type: "draw:close";
    };

export interface ManualOfferSignal {
  version: 1;
  kind: "offer";
  peerId: string;
  description: RTCSessionDescriptionInit;
}

export interface ManualAnswerSignal {
  version: 1;
  kind: "answer";
  peerId: string;
  description: RTCSessionDescriptionInit;
}

export type ManualSignal = ManualOfferSignal | ManualAnswerSignal;
