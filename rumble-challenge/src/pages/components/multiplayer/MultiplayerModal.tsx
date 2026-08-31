import { useEffect, useState } from "react";

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

async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
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

  const [copied, setCopied] = useState<"offer" | "answer" | null>(null);

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

  async function handleCopy(value: string, type: "offer" | "answer") {
    if (!value) {
      return;
    }

    await copyText(value);

    setCopied(type);

    window.setTimeout(() => {
      setCopied((current) => (current === type ? null : current));
    }, 1500);
  }

  async function handleGenerateAnswer() {
    const answer = await onCreateHostAnswer(participantOffer);

    setGeneratedAnswer(answer);
  }

  async function handleGenerateOffer() {
    await onCreateGuestOffer();

    /*
     * Nova offer exige uma nova answer.
     */
    setHostAnswer("");
  }

  async function handleConnectGuest() {
    /*
     * Evita também no handler uma chamada
     * desnecessária depois de conectado.
     */
    if (status === "connected" || status === "connecting") {
      return;
    }

    await onApplyHostAnswer(hostAnswer);
  }

  const answerCode = generatedAnswer || lastHostAnswerCode;

  const guestAlreadyConnected = status === "connected";

  const guestIsConnecting = status === "connecting";

  return (
    <div
      className="
        fixed
        inset-0
        z-[200]
        flex
        items-center
        justify-center
        bg-black/70
        p-4
        backdrop-blur-sm
      "
      onMouseDown={onClose}
    >
      <div
        className="
          max-h-[90vh]
          w-full
          max-w-[720px]
          overflow-y-auto
          rounded-2xl
          border
          border-slate-700
          bg-[#161b25]
          p-6
          shadow-2xl
        "
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div
          className="
            mb-6
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div>
            <span
              className="
                text-xs
                font-bold
                uppercase
                tracking-widest
                text-blue-400
              "
            >
              WebRTC
            </span>

            <h2
              className="
                mt-1
                text-2xl
                font-bold
                text-white
              "
            >
              Sorteio multiplayer
            </h2>

            <p
              className="
                mt-1
                max-w-[560px]
                text-sm
                text-slate-400
              "
            >
              Conexão direta entre navegadores. Não existe servidor de sala: os
              códigos são trocados manualmente entre o host e cada participante.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-slate-800
              text-xl
              text-slate-400
              transition-colors
              hover:bg-slate-700
              hover:text-white
            "
          >
            ×
          </button>
        </div>

        {errorMessage && (
          <div
            className="
              mb-5
              rounded-xl
              border
              border-red-500/30
              bg-red-500/10
              px-4
              py-3
              text-sm
              text-red-300
            "
          >
            {errorMessage}
          </div>
        )}

        {role === null && (
          <div
            className="
              grid
              gap-4
              md:grid-cols-2
            "
          >
            <section
              className="
                rounded-xl
                border
                border-slate-700
                bg-slate-900/50
                p-5
              "
            >
              <h3
                className="
                  text-lg
                  font-semibold
                  text-white
                "
              >
                Criar transmissão
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  text-slate-400
                "
              >
                Você controla o sorteio e pode adicionar vários participantes,
                um código de cada vez.
              </p>

              <button
                type="button"
                onClick={onBecomeHost}
                className="
                  mt-5
                  w-full
                  rounded-xl
                  bg-blue-600
                  px-4
                  py-3
                  font-semibold
                  text-white
                  transition-colors
                  hover:bg-blue-500
                "
              >
                Ser o host
              </button>
            </section>

            <section
              className="
                rounded-xl
                border
                border-slate-700
                bg-slate-900/50
                p-5
              "
            >
              <h3
                className="
                  text-lg
                  font-semibold
                  text-white
                "
              >
                Assistir sorteio
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  text-slate-400
                "
              >
                Gere um código, envie ao host e cole a resposta recebida.
              </p>

              <button
                type="button"
                disabled={status === "creating-offer"}
                onClick={() => void handleGenerateOffer()}
                className="
                  mt-5
                  w-full
                  rounded-xl
                  border
                  border-slate-600
                  bg-slate-800
                  px-4
                  py-3
                  font-semibold
                  text-white
                  transition-colors
                  hover:bg-slate-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {status === "creating-offer"
                  ? "Gerando..."
                  : "Gerar código de conexão"}
              </button>
            </section>
          </div>
        )}

        {role === "host" && (
          <div className="space-y-5">
            <div
              className="
                flex
                items-center
                justify-between
                rounded-xl
                border
                border-emerald-500/20
                bg-emerald-500/5
                px-4
                py-3
              "
            >
              <div>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-emerald-400
                  "
                >
                  Host ativo
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  Apenas este navegador transmite os estados do sorteio.
                </p>
              </div>

              <div className="text-right">
                <div
                  className="
                    text-2xl
                    font-bold
                    text-white
                  "
                >
                  {connectedGuests}
                </div>

                <div
                  className="
                    text-xs
                    text-slate-400
                  "
                >
                  conectados
                </div>
              </div>
            </div>

            <section
              className="
                rounded-xl
                border
                border-slate-700
                bg-slate-900/50
                p-5
              "
            >
              <h3
                className="
                  font-semibold
                  text-white
                "
              >
                Adicionar participante
              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-400
                "
              >
                Peça para a pessoa gerar o código dela e cole abaixo.
              </p>

              <textarea
                value={participantOffer}
                onChange={(event) => setParticipantOffer(event.target.value)}
                placeholder="Cole aqui o código gerado pelo participante..."
                className="
                  mt-4
                  h-32
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
                  text-slate-200
                  outline-none
                  transition-colors
                  focus:border-blue-500
                "
              />

              <button
                type="button"
                disabled={
                  !participantOffer.trim() || status === "creating-answer"
                }
                onClick={() => void handleGenerateAnswer()}
                className="
                  mt-3
                  w-full
                  rounded-xl
                  bg-blue-600
                  px-4
                  py-3
                  font-semibold
                  text-white
                  transition-colors
                  hover:bg-blue-500
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {status === "creating-answer"
                  ? "Gerando resposta..."
                  : "Gerar resposta para participante"}
              </button>
            </section>

            {answerCode && (
              <section
                className="
                  rounded-xl
                  border
                  border-blue-500/20
                  bg-blue-500/5
                  p-5
                "
              >
                <h3
                  className="
                    font-semibold
                    text-white
                  "
                >
                  Resposta do host
                </h3>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-400
                  "
                >
                  Envie este código de volta para a mesma pessoa.
                </p>

                <textarea
                  readOnly
                  value={answerCode}
                  className="
                    mt-4
                    h-32
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
                    text-slate-300
                    outline-none
                  "
                />

                <button
                  type="button"
                  onClick={() => void handleCopy(answerCode, "answer")}
                  className="
                    mt-3
                    w-full
                    rounded-xl
                    bg-slate-800
                    px-4
                    py-3
                    font-semibold
                    text-white
                    transition-colors
                    hover:bg-slate-700
                  "
                >
                  {copied === "answer" ? "Copiado!" : "Copiar resposta"}
                </button>
              </section>
            )}

            <button
              type="button"
              onClick={onLeaveRoom}
              className="
                w-full
                rounded-xl
                bg-red-500/10
                px-4
                py-3
                font-semibold
                text-red-400
                transition-colors
                hover:bg-red-500/20
              "
            >
              Encerrar transmissão
            </button>
          </div>
        )}

        {role === "guest" && (
          <div className="space-y-5">
            <div
              className={`
                rounded-xl
                border
                px-4
                py-3
                ${
                  guestAlreadyConnected
                    ? `
                      border-emerald-500/20
                      bg-emerald-500/5
                    `
                    : `
                      border-blue-500/20
                      bg-blue-500/5
                    `
                }
              `}
            >
              <p
                className={`
                  text-sm
                  font-semibold
                  ${
                    guestAlreadyConnected ? "text-emerald-300" : "text-blue-300"
                  }
                `}
              >
                {guestAlreadyConnected
                  ? "● Conectado ao host"
                  : guestIsConnecting
                    ? "Conectando ao host..."
                    : "Aguardando resposta do host"}
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-400
                "
              >
                Enquanto estiver como participante, o sorteio é controlado
                somente pelo host.
              </p>
            </div>

            <section
              className="
                rounded-xl
                border
                border-slate-700
                bg-slate-900/50
                p-5
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <div>
                  <h3
                    className="
                      font-semibold
                      text-white
                    "
                  >
                    1. Seu código
                  </h3>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-400
                    "
                  >
                    Envie este código para o host.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={status === "creating-offer"}
                  onClick={() => void handleGenerateOffer()}
                  className="
                    rounded-lg
                    border
                    border-slate-600
                    bg-slate-800
                    px-3
                    py-2
                    text-xs
                    font-semibold
                    text-slate-200
                    hover:bg-slate-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {status === "creating-offer" ? "Gerando..." : "Gerar novo"}
                </button>
              </div>

              <textarea
                readOnly
                value={guestOfferCode}
                className="
                  mt-4
                  h-32
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
                  text-slate-300
                  outline-none
                "
              />

              <button
                type="button"
                disabled={!guestOfferCode}
                onClick={() => void handleCopy(guestOfferCode, "offer")}
                className="
                  mt-3
                  w-full
                  rounded-xl
                  bg-slate-800
                  px-4
                  py-3
                  font-semibold
                  text-white
                  transition-colors
                  hover:bg-slate-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {copied === "offer" ? "Copiado!" : "Copiar meu código"}
              </button>
            </section>

            <section
              className="
                rounded-xl
                border
                border-slate-700
                bg-slate-900/50
                p-5
              "
            >
              <h3
                className="
                  font-semibold
                  text-white
                "
              >
                2. Resposta do host
              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-400
                "
              >
                Depois que o host gerar a resposta, cole aqui.
              </p>

              <textarea
                value={hostAnswer}
                disabled={guestAlreadyConnected}
                onChange={(event) => setHostAnswer(event.target.value)}
                placeholder="Cole aqui a resposta enviada pelo host..."
                className="
                  mt-4
                  h-32
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
                  text-slate-200
                  outline-none
                  transition-colors
                  focus:border-blue-500
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />

              <button
                type="button"
                disabled={
                  !hostAnswer.trim() ||
                  guestIsConnecting ||
                  guestAlreadyConnected
                }
                onClick={() => void handleConnectGuest()}
                className={`
                  mt-3
                  w-full
                  rounded-xl
                  px-4
                  py-3
                  font-semibold
                  text-white
                  transition-colors
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  ${
                    guestAlreadyConnected
                      ? "bg-emerald-600"
                      : `
                        bg-blue-600
                        hover:bg-blue-500
                      `
                  }
                `}
              >
                {guestAlreadyConnected
                  ? "Conectado"
                  : guestIsConnecting
                    ? "Conectando..."
                    : "Conectar ao host"}
              </button>
            </section>

            <button
              type="button"
              onClick={onLeaveRoom}
              className="
                w-full
                rounded-xl
                bg-red-500/10
                px-4
                py-3
                font-semibold
                text-red-400
                transition-colors
                hover:bg-red-500/20
              "
            >
              Sair da transmissão
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
