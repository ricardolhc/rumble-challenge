import type { CharacterType } from "./selection.types";

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
    }
  | {
      type: "draw:frame";
      indexes: number[];
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
