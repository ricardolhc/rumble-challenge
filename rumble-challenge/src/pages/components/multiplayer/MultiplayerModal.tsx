import { useEffect, useMemo, useState } from "react";

import type {
  MultiplayerRole,
  MultiplayerStatus,
} from "../../multiplayer.types";
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
          Copiado!
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
  lastHostAnswerCode,
  errorMessage,
  onBecomeHost,
  onCreateGuestOffer,
  onCreateHostAnswer,
  onApplyHostAnswer,
  onLeaveRoom,
  onClose,
}: MultiplayerModalProps) {
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

  const answerCode = generatedAnswer || lastHostAnswerCode;

  const hostHasOffer = participantOffer.trim().length > 0;

  const hostHasAnswer = answerCode.length > 0;

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
      setLocalError(
        "Não foi possível copiar automaticamente. Selecione o código e copie manualmente.",
      );
    }
  }

  async function handleGenerateOffer() {
    setLocalError(null);

    try {
      setHostAnswer("");

      await onCreateGuestOffer();
    } catch {
      setLocalError("Não foi possível gerar o código de conexão.");
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
          : "Não foi possível processar o código do participante.",
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
        error instanceof Error
          ? error.message
          : "Não foi possível conectar ao host.",
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
                  Multiplayer
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
                    Host
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
                    Participante
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-slate-400">
                Conexão direta entre os navegadores.
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
                  Não foi possível concluir a ação
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
                  Como você quer participar?
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Escolha quem vai controlar o sorteio.
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
                    Criar transmissão
                  </h4>

                  <p className="mt-2 text-sm leading-5 text-slate-400">
                    Controle os sorteios e transmita tudo em tempo real para
                    outras pessoas.
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
                    Ser o host
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
                    Participar
                  </h4>

                  <p className="mt-2 text-sm leading-5 text-slate-400">
                    Acompanhe automaticamente os sorteios realizados pelo host.
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
                        Preparando...
                      </>
                    ) : (
                      <>
                        Entrar como participante
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
                Não é necessário criar conta nem sala. A conexão é realizada
                diretamente entre os navegadores usando WebRTC.
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
                      Transmissão ativa
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Os sorteios deste navegador serão sincronizados.
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
                    conectado{connectedGuests === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              {/* PROGRESSO */}

              <div className="grid grid-cols-3 gap-2">
                {[
                  ["1", "Receber código"],
                  ["2", "Gerar resposta"],
                  ["3", "Enviar"],
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
                        Passo {number}
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
                        Cole o código do participante
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        Peça para a pessoa copiar o código gerado no dispositivo
                        dela.
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
                    placeholder="Cole o código aqui..."
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
                        Processando código...
                      </>
                    ) : (
                      "Gerar resposta"
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
                        Resposta pronta
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        Copie e envie este código para o mesmo participante.
                      </p>
                    </div>
                  </div>

                  <ConnectionCode
                    value={answerCode}
                    copied={copied === "answer"}
                    copyLabel="Copiar resposta"
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
                    + Adicionar outro participante
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
                Encerrar transmissão
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
                      Conectado ao host
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
                      Tudo pronto. Os sorteios e alterações feitas pelo host
                      serão sincronizados automaticamente neste dispositivo.
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
                      Sincronização ativa
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
                    Sair da transmissão
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Conectar ao host
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      São apenas dois passos.
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
                              Envie seu código
                            </h4>

                            <p className="mt-1 text-sm text-slate-400">
                              Gere o código, copie e envie para o host.
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
                                ? "Gerando..."
                                : guestOfferCode
                                  ? "Gerar outro"
                                  : "Gerar código"}
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
                                    Copiado!
                                  </>
                                ) : (
                                  <>
                                    <CopyIcon />
                                    Copiar
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
                          Cole a resposta
                        </h4>

                        <p className="mt-1 text-sm text-slate-400">
                          O host devolverá outro código. Cole ele aqui.
                        </p>

                        <textarea
                          value={hostAnswer}
                          disabled={!guestOfferCode || guestIsConnecting}
                          onChange={(event) =>
                            setHostAnswer(event.target.value)
                          }
                          placeholder="Cole o código aqui..."
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
                              Conectando ao host...
                            </>
                          ) : (
                            "Conectar"
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
                    Cancelar
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
