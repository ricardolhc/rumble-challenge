import { useEffect, useMemo, useState } from "react";

import type {
  MultiplayerRole,
  MultiplayerStatus,
} from "../../multiplayer.types";
import { useTranslation } from "react-i18next";
interface MultiplayerModalProps {
  role: MultiplayerRole;
  status: MultiplayerStatus;
  connectedGuests: number;

  guestOfferCode: string;
  lastHostAnswerCode: string;

  errorMessage: string | null;

  onBecomeHost: () => void;

  onCreateGuestOffer: () => Promise<string>;

  onCreateHostAnswer: (offerCode: string) => Promise<string>;

  onApplyHostAnswer: (answerCode: string) => Promise<void>;

  onLeaveRoom: () => void;

  onClose: () => void;
}

type CopyType = "offer" | "answer" | null;

async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 6 6 18M6 6l12 12"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <rect x="9" y="9" width="11" height="11" rx="2" />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="h-4 w-4"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
      />

      <circle cx="9" cy="7" r="4" />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
      />
    </svg>
  );
}

function RadioIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
    >
      <circle cx="12" cy="12" r="2" />

      <path
        strokeLinecap="round"
        d="M8.46 8.46a5 5 0 0 0 0 7.08M15.54 8.46a5 5 0 0 1 0 7.08"
      />

      <path
        strokeLinecap="round"
        d="M5.64 5.64a9 9 0 0 0 0 12.72M18.36 5.64a9 9 0 0 1 0 12.72"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <span
      className="
        h-4
        w-4
        animate-spin
        rounded-full
        border-2
        border-current
        border-r-transparent
      "
    />
  );
}

interface StepBadgeProps {
  children: React.ReactNode;
  completed?: boolean;
}

function StepBadge({ children, completed = false }: StepBadgeProps) {
  return (
    <div
      className={`
        flex
        h-8
        w-8
        shrink-0
        items-center
        justify-center
        rounded-full
        text-sm
        font-bold

        ${
          completed
            ? "bg-emerald-500 text-white"
            : "bg-blue-500/15 text-blue-400"
        }
      `}
    >
      {completed ? <CheckIcon /> : children}
    </div>
  );
}

interface ConnectionCodeProps {
  value: string;
  copied: boolean;
  disabled?: boolean;
  copyLabel: string;
  onCopy: () => void;
}

function ConnectionCode({
  value,
  copied,
  disabled = false,
  copyLabel,
  onCopy,
}: ConnectionCodeProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      disabled={disabled || !value}
      onClick={onCopy}
      className={`
        mt-4
        flex
        w-full
        items-center
        justify-center
        gap-2
        rounded-xl
        border
        px-4
        py-3
        text-sm
        font-semibold
        transition-all
        duration-200
        active:scale-[0.99]
        disabled:cursor-not-allowed
        disabled:opacity-50

        ${
          copied
            ? `
              border-emerald-500/30
              bg-emerald-500/10
              text-emerald-400
            `
            : `
              border-slate-700
              bg-slate-800
              text-white
              hover:border-slate-600
              hover:bg-slate-700
            `
        }
      `}
    >
      {copied ? (
        <>
          <CheckIcon />
          {t("selection.components.multiplayer.copied")}
        </>
      ) : (
        <>
          <CopyIcon />
          {copyLabel}
        </>
      )}
    </button>
  );
}

export function MultiplayerModal({
  role,
  status,
  connectedGuests,
  guestOfferCode,
  errorMessage,
  onBecomeHost,
  onCreateGuestOffer,
  onCreateHostAnswer,
  onApplyHostAnswer,
  onLeaveRoom,
  onClose,
}: MultiplayerModalProps) {
  const { t } = useTranslation();
  const [participantOffer, setParticipantOffer] = useState("");

  const [hostAnswer, setHostAnswer] = useState("");

  const [generatedAnswer, setGeneratedAnswer] = useState("");

  const [copied, setCopied] = useState<CopyType>(null);

  const [localError, setLocalError] = useState<string | null>(null);

  const guestAlreadyConnected = status === "connected";

  const guestIsConnecting = status === "connecting";

  const creatingOffer = status === "creating-offer";

  const creatingAnswer = status === "creating-answer";

  const visibleError = localError || errorMessage;

  const answerCode = generatedAnswer;

  const hostHasOffer = participantOffer.trim().length > 0;

  const hostHasAnswer = generatedAnswer.length > 0;

  const participantHasAnswer = hostAnswer.trim().length > 0;

  const hostProgress = useMemo(() => {
    if (hostHasAnswer) {
      return 3;
    }

    if (hostHasOffer) {
      return 2;
    }

    return 1;
  }, [hostHasAnswer, hostHasOffer]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  async function handleCopy(value: string, type: Exclude<CopyType, null>) {
    if (!value) {
      return;
    }

    try {
      await copyText(value);

      setCopied(type);

      window.setTimeout(() => {
        setCopied((current) => (current === type ? null : current));
      }, 1600);
    } catch {
      setLocalError(t("selection.components.multiplayer.cannotAutoCopy"));
    }
  }

  async function handleGenerateOffer() {
    setLocalError(null);

    try {
      setHostAnswer("");

      await onCreateGuestOffer();
    } catch {
      setLocalError(t("selection.components.multiplayer.unableToGenerateCode"));
    }
  }

  async function handleGenerateAnswer() {
    if (!participantOffer.trim() || creatingAnswer) {
      return;
    }

    setLocalError(null);
    setGeneratedAnswer("");

    try {
      const answer = await onCreateHostAnswer(participantOffer.trim());

      setGeneratedAnswer(answer);
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : t(
              "selection.components.multiplayer.unableToProcessParticipantCode",
            ),
      );
    }
  }

  async function handleConnectGuest() {
    if (!hostAnswer.trim() || guestAlreadyConnected || guestIsConnecting) {
      return;
    }

    setLocalError(null);

    try {
      await onApplyHostAnswer(hostAnswer.trim());
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : t("unableToConnectToHost"),
      );
    }
  }

  function handleResetHostParticipant() {
    setParticipantOffer("");
    setGeneratedAnswer("");
    setCopied(null);
    setLocalError(null);
  }

  function handleLeave() {
    setParticipantOffer("");
    setHostAnswer("");
    setGeneratedAnswer("");
    setLocalError(null);

    onLeaveRoom();
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[200]
        flex
        items-center
        justify-center
        bg-black/75
        p-4
        backdrop-blur-sm
      "
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="multiplayer-title"
        className="
          max-h-[92vh]
          w-full
          max-w-[760px]
          overflow-y-auto
          rounded-2xl
          border
          border-slate-700/80
          bg-[#161b25]
          shadow-[0_25px_80px_rgba(0,0,0,0.55)]
        "
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* HEADER */}

        <header
          className="
            sticky
            top-0
            z-20
            flex
            items-start
            justify-between
            gap-4
            border-b
            border-slate-800
            bg-[#161b25]/95
            px-6
            py-5
            backdrop-blur-xl
          "
        >
          <div className="flex items-start gap-3">
            <div
              className="
                mt-0.5
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-blue-500/20
                bg-blue-500/10
                text-blue-400
              "
            >
              <RadioIcon />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="multiplayer-title"
                  className="text-xl font-bold text-white"
                >
                  {t("selection.components.multiplayer.multiplayer")}
                </h2>

                {role === "host" && (
                  <span
                    className="
                      rounded-md
                      bg-emerald-500/10
                      px-2
                      py-1
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-emerald-400
                    "
                  >
                    {t("selection.components.multiplayer.host")}
                  </span>
                )}

                {role === "guest" && (
                  <span
                    className="
                      rounded-md
                      bg-blue-500/10
                      px-2
                      py-1
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-blue-400
                    "
                  >
                    {t("selection.components.multiplayer.participant")}
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-slate-400">
                {t(
                  "selection.components.multiplayer.directConectionThroughBrowser",
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Fechar"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition-colors
              hover:bg-slate-800
              hover:text-white
            "
          >
            <CloseIcon />
          </button>
        </header>

        <main className="p-6">
          {visibleError && (
            <div
              className="
                mb-5
                flex
                items-start
                gap-3
                rounded-xl
                border
                border-red-500/20
                bg-red-500/10
                px-4
                py-3
              "
            >
              <div
                className="
                  mt-1
                  h-2
                  w-2
                  shrink-0
                  rounded-full
                  bg-red-400
                "
              />

              <div>
                <p className="text-sm font-semibold text-red-300">
                  {t("selection.components.multiplayer.unableToCompleteAction")}
                </p>

                <p className="mt-0.5 text-sm text-red-300/80">{visibleError}</p>
              </div>
            </div>
          )}

          {/* ====================================================== */}
          {/* ESCOLHA DO PAPEL                                       */}
          {/* ====================================================== */}

          {role === null && (
            <div>
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-white">
                  {t("selection.components.multiplayer.howToParticipate")}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  {t("selection.components.multiplayer.chooseWhoControlsDraw")}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={onBecomeHost}
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-700
                    bg-slate-900/50
                    p-5
                    text-left
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:border-emerald-500/40
                    hover:bg-emerald-500/5
                  "
                >
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      bg-emerald-500/10
                      text-emerald-400
                      transition-transform
                      group-hover:scale-105
                    "
                  >
                    <RadioIcon />
                  </div>

                  <h4 className="mt-4 text-lg font-bold text-white">
                    {t("selection.components.multiplayer.createStream")}
                  </h4>

                  <p className="mt-2 text-sm leading-5 text-slate-400">
                    {t(
                      "selection.components.multiplayer.createStreamDescription",
                    )}
                  </p>

                  <div
                    className="
                      mt-5
                      flex
                      items-center
                      gap-2
                      text-sm
                      font-semibold
                      text-emerald-400
                    "
                  >
                    {t("selection.components.multiplayer.beTheHost")}
                    <span
                      className="
                        transition-transform
                        group-hover:translate-x-1
                      "
                    >
                      →
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={creatingOffer}
                  onClick={() => void handleGenerateOffer()}
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-700
                    bg-slate-900/50
                    p-5
                    text-left
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:border-blue-500/40
                    hover:bg-blue-500/5
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-500/10
                      text-blue-400
                      transition-transform
                      group-hover:scale-105
                    "
                  >
                    <UsersIcon />
                  </div>

                  <h4 className="mt-4 text-lg font-bold text-white">
                    {t("selection.components.multiplayer.participate")}
                  </h4>

                  <p className="mt-2 text-sm leading-5 text-slate-400">
                    {t("selection.components.multiplayer.accompanyDraws")}
                  </p>

                  <div
                    className="
                      mt-5
                      flex
                      items-center
                      gap-2
                      text-sm
                      font-semibold
                      text-blue-400
                    "
                  >
                    {creatingOffer ? (
                      <>
                        <Spinner />
                        {t("selection.components.multiplayer.preparing")}
                      </>
                    ) : (
                      <>
                        {t(
                          "selection.components.multiplayer.enterAsParticipant",
                        )}
                        <span
                          className="
                            transition-transform
                            group-hover:translate-x-1
                          "
                        >
                          →
                        </span>
                      </>
                    )}
                  </div>
                </button>
              </div>

              <div
                className="
                  mt-5
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-900/30
                  px-4
                  py-3
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                {t(
                  "selection.components.multiplayer.notNecessaryToCreateAccount",
                )}
              </div>
            </div>
          )}

          {/* ====================================================== */}
          {/* HOST                                                   */}
          {/* ====================================================== */}

          {role === "host" && (
            <div className="space-y-5">
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  justify-between
                  gap-4
                  rounded-xl
                  border
                  border-emerald-500/20
                  bg-emerald-500/5
                  px-4
                  py-3
                "
              >
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span
                      className="
                        absolute
                        inline-flex
                        h-full
                        w-full
                        animate-ping
                        rounded-full
                        bg-emerald-400
                        opacity-30
                      "
                    />

                    <span
                      className="
                        relative
                        inline-flex
                        h-3
                        w-3
                        rounded-full
                        bg-emerald-400
                      "
                    />
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-emerald-300">
                      {t("selection.components.multiplayer.activeStream")}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {t("selection.components.multiplayer.synchronizedDraws")}
                    </p>
                  </div>
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-lg
                    bg-slate-950/40
                    px-3
                    py-2
                  "
                >
                  <span className="text-white">
                    <UsersIcon />
                  </span>

                  <strong className="text-white">{connectedGuests}</strong>

                  <span className="text-xs text-slate-400">
                    {connectedGuests === 1
                      ? t("selection.components.multiplayer.connected")
                      : t("selection.components.multiplayer.connecteds")}
                  </span>
                </div>
              </div>

              {/* PROGRESSO */}

              <div className="grid grid-cols-3 gap-2">
                {[
                  ["1", t("selection.components.multiplayer.receiveCode")],
                  ["2", t("selection.components.multiplayer.generateResponse")],
                  ["3", t("selection.components.multiplayer.send")],
                ].map(([number, label], index) => {
                  const step = index + 1;

                  const active = hostProgress === step;

                  const complete = hostProgress > step;

                  return (
                    <div
                      key={number}
                      className={`
                        rounded-xl
                        border
                        px-3
                        py-2.5
                        transition-colors

                        ${
                          active
                            ? `
                              border-blue-500/30
                              bg-blue-500/10
                            `
                            : complete
                              ? `
                                border-emerald-500/20
                                bg-emerald-500/5
                              `
                              : `
                                border-slate-800
                                bg-slate-900/30
                              `
                        }
                      `}
                    >
                      <p
                        className={`
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-widest

                          ${
                            complete
                              ? "text-emerald-400"
                              : active
                                ? "text-blue-400"
                                : "text-slate-600"
                          }
                        `}
                      >
                        {t("selection.components.multiplayer.step")} {number}
                      </p>

                      <p
                        className={`
                          mt-1
                          truncate
                          text-xs
                          font-semibold

                          ${
                            active || complete
                              ? "text-slate-200"
                              : "text-slate-600"
                          }
                        `}
                      >
                        {label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {!hostHasAnswer && (
                <section
                  className="
                    rounded-2xl
                    border
                    border-slate-700
                    bg-slate-900/40
                    p-5
                  "
                >
                  <div className="flex gap-3">
                    <StepBadge completed={hostHasOffer}>1</StepBadge>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white">
                        {t(
                          "selection.components.multiplayer.pasteParticipantCode",
                        )}
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        {t(
                          "selection.components.multiplayer.pasteParticipantCodeDescription",
                        )}
                      </p>
                    </div>
                  </div>

                  <textarea
                    value={participantOffer}
                    disabled={creatingAnswer}
                    onChange={(event) => {
                      setParticipantOffer(event.target.value);

                      if (generatedAnswer) {
                        setGeneratedAnswer("");
                      }
                    }}
                    placeholder={t(
                      "selection.components.multiplayer.pasteCodeHere",
                    )}
                    spellCheck={false}
                    className="
                      mt-4
                      h-28
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-slate-700
                      bg-slate-950
                      px-4
                      py-3
                      font-mono
                      text-xs
                      leading-5
                      text-slate-200
                      outline-none
                      transition-colors
                      placeholder:text-slate-700
                      focus:border-blue-500/70
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  />

                  <button
                    type="button"
                    disabled={!hostHasOffer || creatingAnswer}
                    onClick={() => void handleGenerateAnswer()}
                    className="
                      mt-3
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-blue-600
                      px-4
                      py-3
                      font-semibold
                      text-white
                      transition-all
                      hover:bg-blue-500
                      active:scale-[0.99]
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {creatingAnswer ? (
                      <>
                        <Spinner />
                        {t(
                          "selection.components.multiplayer.generatingResponse",
                        )}
                      </>
                    ) : (
                      t("selection.components.multiplayer.generateResponse")
                    )}
                  </button>
                </section>
              )}

              {hostHasAnswer && (
                <section
                  className="
                    rounded-2xl
                    border
                    border-emerald-500/20
                    bg-emerald-500/5
                    p-5
                  "
                >
                  <div className="flex gap-3">
                    <StepBadge completed>2</StepBadge>

                    <div>
                      <h3 className="font-semibold text-white">
                        {t("selection.components.multiplayer.responseReady")}
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        {t(
                          "selection.components.multiplayer.copyAndPasteToSameParticipant",
                        )}
                      </p>
                    </div>
                  </div>

                  <ConnectionCode
                    value={answerCode}
                    copied={copied === "answer"}
                    copyLabel={t(
                      "selection.components.multiplayer.copyResponse",
                    )}
                    onCopy={() => void handleCopy(answerCode, "answer")}
                  />

                  <button
                    type="button"
                    onClick={handleResetHostParticipant}
                    className="
                      mt-3
                      w-full
                      rounded-lg
                      px-3
                      py-2.5
                      text-sm
                      font-semibold
                      text-blue-400
                      transition-colors
                      hover:bg-blue-500/10
                      hover:text-blue-300
                    "
                  >
                    +{" "}
                    {t("selection.components.multiplayer.addOtherParticipant")}
                  </button>
                </section>
              )}

              <button
                type="button"
                onClick={handleLeave}
                className="
                  w-full
                  rounded-xl
                  border
                  border-red-500/15
                  bg-red-500/5
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-red-400
                  transition-colors
                  hover:border-red-500/25
                  hover:bg-red-500/10
                "
              >
                {t("selection.components.multiplayer.doneStream")}
              </button>
            </div>
          )}

          {/* ====================================================== */}
          {/* PARTICIPANTE                                           */}
          {/* ====================================================== */}

          {role === "guest" && (
            <div>
              {guestAlreadyConnected ? (
                /*
                 * Depois de conectado eliminamos todo o ruído
                 * de SDP/códigos.
                 */
                <div>
                  <div
                    className="
                      flex
                      flex-col
                      items-center
                      rounded-2xl
                      border
                      border-emerald-500/20
                      bg-emerald-500/5
                      px-6
                      py-10
                      text-center
                    "
                  >
                    <div
                      className="
                        relative
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-full
                        bg-emerald-500/10
                        text-emerald-400
                      "
                    >
                      <span
                        className="
                          absolute
                          inset-0
                          animate-ping
                          rounded-full
                          border
                          border-emerald-500/20
                        "
                      />

                      <CheckIcon />
                    </div>

                    <h3
                      className="
                        mt-5
                        text-xl
                        font-bold
                        text-white
                      "
                    >
                      {t("selection.components.multiplayer.connectedToHost")}
                    </h3>

                    <p
                      className="
                        mt-2
                        max-w-[440px]
                        text-sm
                        leading-6
                        text-slate-400
                      "
                    >
                      {t(
                        "selection.components.multiplayer.allReadysynchronizedDraws",
                      )}
                    </p>

                    <div
                      className="
                        mt-5
                        flex
                        items-center
                        gap-2
                        rounded-full
                        bg-emerald-500/10
                        px-3
                        py-1.5
                        text-xs
                        font-semibold
                        text-emerald-300
                      "
                    >
                      <span
                        className="
                          h-2
                          w-2
                          rounded-full
                          bg-emerald-400
                        "
                      />
                      {t("selection.components.multiplayer.syncActive")}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLeave}
                    className="
                      mt-5
                      w-full
                      rounded-xl
                      border
                      border-red-500/15
                      bg-red-500/5
                      px-4
                      py-3
                      text-sm
                      font-semibold
                      text-red-400
                      transition-colors
                      hover:border-red-500/25
                      hover:bg-red-500/10
                    "
                  >
                    {t("selection.components.multiplayer.leaveStream")}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {t("selection.components.multiplayer.connectToHost")}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      {t("selection.components.multiplayer.twoOnlySteps")}
                    </p>
                  </div>

                  {/* PASSO 1 */}

                  <section
                    className="
                      rounded-2xl
                      border
                      border-slate-700
                      bg-slate-900/40
                      p-5
                    "
                  >
                    <div className="flex items-start gap-3">
                      <StepBadge completed={Boolean(guestOfferCode)}>
                        1
                      </StepBadge>

                      <div className="min-w-0 flex-1">
                        <div
                          className="
                            flex
                            flex-wrap
                            items-center
                            justify-between
                            gap-3
                          "
                        >
                          <div>
                            <h4 className="font-semibold text-white">
                              {t(
                                "selection.components.multiplayer.sendYourCode",
                              )}
                            </h4>

                            <p className="mt-1 text-sm text-slate-400">
                              {t(
                                "selection.components.multiplayer.sendYourCodeDescription",
                              )}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={creatingOffer}
                              onClick={() => void handleGenerateOffer()}
                              className="
                                flex
                                h-9
                                items-center
                                justify-center
                                gap-2
                                rounded-lg
                                border
                                border-slate-700
                                bg-slate-800
                                px-3
                                text-xs
                                font-semibold
                                text-slate-300
                                transition-colors
                                hover:bg-slate-700
                                hover:text-white
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                              "
                            >
                              {creatingOffer && <Spinner />}

                              {creatingOffer
                                ? t(
                                    "selection.components.multiplayer.generating",
                                  )
                                : guestOfferCode
                                  ? t(
                                      "selection.components.multiplayer.generateAnother",
                                    )
                                  : t(
                                      "selection.components.multiplayer.generateCode",
                                    )}
                            </button>

                            {guestOfferCode && (
                              <button
                                type="button"
                                disabled={creatingOffer}
                                onClick={() =>
                                  void handleCopy(guestOfferCode, "offer")
                                }
                                className={`
                                  flex
                                  h-9
                                  items-center
                                  justify-center
                                  gap-2
                                  rounded-lg
                                  border
                                  px-3
                                  text-xs
                                  font-semibold
                                  transition-colors
                                  disabled:cursor-not-allowed
                                  disabled:opacity-50

                                  ${
                                    copied === "offer"
                                      ? `
                                        border-emerald-500/30
                                        bg-emerald-500/10
                                        text-emerald-400
                                      `
                                      : `
                                        border-slate-700
                                        bg-slate-800
                                        text-white
                                        hover:bg-slate-700
                                      `
                                  }
                                `}
                              >
                                {copied === "offer" ? (
                                  <>
                                    <CheckIcon />
                                    {t(
                                      "selection.components.multiplayer.coppied",
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <CopyIcon />
                                    {t("selection.components.multiplayer.copy")}
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* PASSO 2 */}

                  <section
                    className={`
                      rounded-2xl
                      border
                      p-5
                      transition-colors

                      ${
                        guestOfferCode
                          ? `
                            border-blue-500/20
                            bg-blue-500/5
                          `
                          : `
                            border-slate-800
                            bg-slate-900/20
                            opacity-60
                          `
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <StepBadge>2</StepBadge>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-white">
                          {t("selection.components.multiplayer.pasteResponse")}
                        </h4>

                        <p className="mt-1 text-sm text-slate-400">
                          {t(
                            "selection.components.multiplayer.pasteResponseDescription",
                          )}
                        </p>

                        <textarea
                          value={hostAnswer}
                          disabled={!guestOfferCode || guestIsConnecting}
                          onChange={(event) =>
                            setHostAnswer(event.target.value)
                          }
                          placeholder={t(
                            "selection.components.multiplayer.pasteCodeHere",
                          )}
                          spellCheck={false}
                          className="
                            mt-4
                            h-28
                            w-full
                            resize-none
                            rounded-xl
                            border
                            border-slate-700
                            bg-slate-950
                            px-4
                            py-3
                            font-mono
                            text-xs
                            leading-5
                            text-slate-200
                            outline-none
                            transition-colors
                            placeholder:text-slate-700
                            focus:border-blue-500/70
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        />

                        <button
                          type="button"
                          disabled={
                            !participantHasAnswer ||
                            guestIsConnecting ||
                            !guestOfferCode
                          }
                          onClick={() => void handleConnectGuest()}
                          className="
                            mt-3
                            flex
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-blue-600
                            px-4
                            py-3
                            font-semibold
                            text-white
                            transition-all
                            hover:bg-blue-500
                            active:scale-[0.99]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          {guestIsConnecting ? (
                            <>
                              <Spinner />
                              {t(
                                "selection.components.multiplayer.connectingToHost",
                              )}
                            </>
                          ) : (
                            t("selection.components.multiplayer.connect")
                          )}
                        </button>
                      </div>
                    </div>
                  </section>

                  <button
                    type="button"
                    onClick={handleLeave}
                    className="
                      w-full
                      rounded-xl
                      px-4
                      py-3
                      text-sm
                      font-semibold
                      text-slate-500
                      transition-colors
                      hover:bg-slate-800/50
                      hover:text-red-400
                    "
                  >
                    {t("selection.components.multiplayer.cancel")}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
