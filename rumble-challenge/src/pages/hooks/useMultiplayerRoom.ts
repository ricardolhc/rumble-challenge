import { useCallback, useEffect, useRef, useState } from "react";

import type {
  ManualAnswerSignal,
  ManualOfferSignal,
  MultiplayerDrawMessage,
  MultiplayerRole,
  MultiplayerStatus,
} from "../multiplayer.types";
import type { CharacterType } from "../selection.types";
import {
  decodeAnswerSignal,
  decodeOfferSignal,
  encodeSignal,
} from "../utils/multiplayer.utils";

interface UseMultiplayerRoomOptions {
  onDrawStart?: () => void;
  onDrawFrame?: (indexes: number[]) => void;
  onDrawResult?: (team: CharacterType[]) => void;
  onDrawClose?: () => void;
}

interface HostPeer {
  peerConnection: RTCPeerConnection;
  dataChannel: RTCDataChannel | null;
}

const RTC_CONFIGURATION: RTCConfiguration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

function waitForIceGatheringComplete(peerConnection: RTCPeerConnection) {
  if (peerConnection.iceGatheringState === "complete") {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    function handleStateChange() {
      if (peerConnection.iceGatheringState !== "complete") {
        return;
      }

      peerConnection.removeEventListener(
        "icegatheringstatechange",
        handleStateChange,
      );

      resolve();
    }

    peerConnection.addEventListener(
      "icegatheringstatechange",
      handleStateChange,
    );
  });
}

export function useMultiplayerRoom({
  onDrawStart,
  onDrawFrame,
  onDrawResult,
  onDrawClose,
}: UseMultiplayerRoomOptions = {}) {
  const callbacksRef = useRef({
    onDrawStart,
    onDrawFrame,
    onDrawResult,
    onDrawClose,
  });

  const hostPeersRef = useRef<Map<string, HostPeer>>(new Map());

  const guestPeerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const guestDataChannelRef = useRef<RTCDataChannel | null>(null);

  const guestPeerIdRef = useRef<string | null>(null);

  /*
   * Impede duas chamadas simultâneas de
   * applyHostAnswer().
   *
   * Isso pode acontecer com clique duplo antes
   * do React atualizar o estado do botão.
   */
  const applyingHostAnswerRef = useRef(false);

  const [role, setRole] = useState<MultiplayerRole>(null);

  const [status, setStatus] = useState<MultiplayerStatus>("idle");

  const [connectedGuests, setConnectedGuests] = useState(0);

  const [guestOfferCode, setGuestOfferCode] = useState("");

  const [lastHostAnswerCode, setLastHostAnswerCode] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    callbacksRef.current = {
      onDrawStart,
      onDrawFrame,
      onDrawResult,
      onDrawClose,
    };
  }, [onDrawStart, onDrawFrame, onDrawResult, onDrawClose]);

  const refreshConnectedGuests = useCallback(() => {
    const connectedCount = Array.from(hostPeersRef.current.values()).filter(
      ({ dataChannel }) => dataChannel?.readyState === "open",
    ).length;

    setConnectedGuests(connectedCount);
  }, []);

  const handleGuestMessage = useCallback((rawMessage: string) => {
    try {
      const message = JSON.parse(rawMessage) as MultiplayerDrawMessage;

      switch (message.type) {
        case "draw:start":
          callbacksRef.current.onDrawStart?.();
          break;

        case "draw:frame":
          callbacksRef.current.onDrawFrame?.(message.indexes);
          break;

        case "draw:result":
          callbacksRef.current.onDrawResult?.(message.team);
          break;

        case "draw:close":
          callbacksRef.current.onDrawClose?.();
          break;
      }
    } catch (error) {
      console.error("Mensagem multiplayer inválida:", error);
    }
  }, []);

  const configureGuestDataChannel = useCallback(
    (dataChannel: RTCDataChannel) => {
      guestDataChannelRef.current = dataChannel;

      dataChannel.onopen = () => {
        setStatus("connected");
        setErrorMessage(null);
      };

      dataChannel.onmessage = (event) => {
        handleGuestMessage(String(event.data));
      };

      dataChannel.onclose = () => {
        setStatus("waiting-answer");
      };

      dataChannel.onerror = () => {
        setStatus("error");

        setErrorMessage("A conexão WebRTC encontrou um erro.");
      };
    },
    [handleGuestMessage],
  );

  const removeHostPeer = useCallback(
    (peerId: string) => {
      const peer = hostPeersRef.current.get(peerId);

      if (!peer) {
        return;
      }

      if (peer.dataChannel) {
        peer.dataChannel.onopen = null;
        peer.dataChannel.onclose = null;
        peer.dataChannel.onerror = null;

        peer.dataChannel.close();
      }

      peer.peerConnection.onconnectionstatechange = null;

      peer.peerConnection.ondatachannel = null;

      peer.peerConnection.close();

      hostPeersRef.current.delete(peerId);

      refreshConnectedGuests();
    },
    [refreshConnectedGuests],
  );

  const configureHostDataChannel = useCallback(
    (peerId: string, dataChannel: RTCDataChannel) => {
      dataChannel.onopen = () => {
        refreshConnectedGuests();
      };

      dataChannel.onclose = () => {
        removeHostPeer(peerId);
      };

      dataChannel.onerror = () => {
        console.error(`Erro no DataChannel do participante ${peerId}.`);
      };
    },
    [refreshConnectedGuests, removeHostPeer],
  );

  const resetGuestConnection = useCallback(() => {
    applyingHostAnswerRef.current = false;

    guestDataChannelRef.current?.close();
    guestPeerConnectionRef.current?.close();

    guestDataChannelRef.current = null;
    guestPeerConnectionRef.current = null;
    guestPeerIdRef.current = null;

    setGuestOfferCode("");
  }, []);

  const leaveRoom = useCallback(() => {
    for (const peerId of Array.from(hostPeersRef.current.keys())) {
      removeHostPeer(peerId);
    }

    resetGuestConnection();

    setRole(null);
    setStatus("idle");
    setConnectedGuests(0);
    setLastHostAnswerCode("");
    setErrorMessage(null);
  }, [removeHostPeer, resetGuestConnection]);

  const becomeHost = useCallback(() => {
    leaveRoom();

    setRole("host");
    setStatus("connected");
  }, [leaveRoom]);

  const createGuestOffer = useCallback(async () => {
    try {
      leaveRoom();

      setRole("guest");
      setStatus("creating-offer");
      setErrorMessage(null);

      const peerId = crypto.randomUUID();

      const peerConnection = new RTCPeerConnection(RTC_CONFIGURATION);

      guestPeerIdRef.current = peerId;

      guestPeerConnectionRef.current = peerConnection;

      /*
       * O PARTICIPANTE cria o DataChannel.
       *
       * Assim o createOffer() possui algo
       * para negociar.
       */
      const dataChannel = peerConnection.createDataChannel("draw-sync", {
        ordered: true,
      });

      configureGuestDataChannel(dataChannel);

      peerConnection.onconnectionstatechange = () => {
        switch (peerConnection.connectionState) {
          case "connected":
            setStatus("connected");
            setErrorMessage(null);
            break;

          case "failed":
            setStatus("error");

            setErrorMessage(
              "Não foi possível estabelecer a conexão direta com o host.",
            );

            break;

          case "disconnected":
          case "closed":
            setStatus("waiting-answer");

            break;
        }
      };

      const offer = await peerConnection.createOffer();

      await peerConnection.setLocalDescription(offer);

      await waitForIceGatheringComplete(peerConnection);

      if (!peerConnection.localDescription) {
        throw new Error("Não foi possível gerar a oferta WebRTC.");
      }

      const signal: ManualOfferSignal = {
        version: 1,
        kind: "offer",
        peerId,

        description: peerConnection.localDescription.toJSON(),
      };

      const code = encodeSignal(signal);

      setGuestOfferCode(code);
      setStatus("waiting-answer");

      return code;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível gerar o código de conexão.";

      setStatus("error");
      setErrorMessage(message);

      throw error;
    }
  }, [configureGuestDataChannel, leaveRoom]);

  const createHostAnswer = useCallback(
    async (offerCode: string) => {
      try {
        if (role !== "host") {
          throw new Error(
            "Ative o modo host antes de adicionar participantes.",
          );
        }

        setStatus("creating-answer");
        setErrorMessage(null);

        const offerSignal = decodeOfferSignal(offerCode);

        if (hostPeersRef.current.has(offerSignal.peerId)) {
          removeHostPeer(offerSignal.peerId);
        }

        const peerConnection = new RTCPeerConnection(RTC_CONFIGURATION);

        hostPeersRef.current.set(offerSignal.peerId, {
          peerConnection,
          dataChannel: null,
        });

        /*
         * O DataChannel foi criado pelo
         * PARTICIPANTE.
         *
         * O host apenas recebe esse canal.
         */
        peerConnection.ondatachannel = (event) => {
          const peer = hostPeersRef.current.get(offerSignal.peerId);

          if (!peer) {
            event.channel.close();
            return;
          }

          peer.dataChannel = event.channel;

          configureHostDataChannel(offerSignal.peerId, event.channel);

          refreshConnectedGuests();
        };

        peerConnection.onconnectionstatechange = () => {
          switch (peerConnection.connectionState) {
            case "connected":
              setStatus("connected");

              refreshConnectedGuests();

              break;

            case "failed":
            case "closed":
              removeHostPeer(offerSignal.peerId);

              break;
          }
        };

        await peerConnection.setRemoteDescription(offerSignal.description);

        const answer = await peerConnection.createAnswer();

        await peerConnection.setLocalDescription(answer);

        await waitForIceGatheringComplete(peerConnection);

        if (!peerConnection.localDescription) {
          throw new Error("Não foi possível gerar a resposta WebRTC.");
        }

        const signal: ManualAnswerSignal = {
          version: 1,
          kind: "answer",

          peerId: offerSignal.peerId,

          description: peerConnection.localDescription.toJSON(),
        };

        const answerCode = encodeSignal(signal);

        setLastHostAnswerCode(answerCode);

        setStatus("connected");

        return answerCode;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível gerar a resposta do host.";

        setStatus("error");
        setErrorMessage(message);

        throw error;
      }
    },
    [configureHostDataChannel, refreshConnectedGuests, removeHostPeer, role],
  );

  const applyHostAnswer = useCallback(async (answerCode: string) => {
    /*
     * Proteção contra clique duplo.
     *
     * Mesmo antes do React redesenhar
     * o botão como disabled, uma segunda
     * chamada pode acontecer.
     */
    if (applyingHostAnswerRef.current) {
      return;
    }

    const peerConnection = guestPeerConnectionRef.current;

    const peerId = guestPeerIdRef.current;

    if (!peerConnection || !peerId) {
      const message = "Gere primeiro um código de participante.";

      setStatus("error");
      setErrorMessage(message);

      throw new Error(message);
    }

    try {
      const answerSignal = decodeAnswerSignal(answerCode);

      if (answerSignal.peerId !== peerId) {
        throw new Error("Essa resposta pertence a outro participante.");
      }

      /*
       * Depois de uma answer ser aplicada:
       *
       * have-local-offer
       *       ↓
       * setRemoteDescription(answer)
       *       ↓
       * stable
       *
       * Portanto, se já estamos em stable
       * e existe uma remoteDescription do
       * tipo answer, essa resposta já foi
       * aplicada.
       */
      if (
        peerConnection.signalingState === "stable" &&
        peerConnection.remoteDescription?.type === "answer"
      ) {
        return;
      }

      if (peerConnection.signalingState === "closed") {
        throw new Error(
          "A conexão WebRTC já foi encerrada. Gere um novo código de participante.",
        );
      }

      if (peerConnection.signalingState !== "have-local-offer") {
        throw new Error(
          `Não é possível aplicar a resposta no estado WebRTC "${peerConnection.signalingState}". Gere um novo código de participante.`,
        );
      }

      applyingHostAnswerRef.current = true;

      setStatus("connecting");
      setErrorMessage(null);

      await peerConnection.setRemoteDescription(answerSignal.description);

      /*
       * O SDP já está correto neste ponto,
       * mas ICE/DataChannel ainda podem
       * precisar de alguns instantes.
       */
      if (
        peerConnection.connectionState === "connected" ||
        guestDataChannelRef.current?.readyState === "open"
      ) {
        setStatus("connected");
      } else {
        setStatus("connecting");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível aplicar a resposta do host.";

      setStatus("error");
      setErrorMessage(message);

      throw error;
    } finally {
      applyingHostAnswerRef.current = false;
    }
  }, []);

  const broadcastMessage = useCallback((message: MultiplayerDrawMessage) => {
    const serializedMessage = JSON.stringify(message);

    for (const { dataChannel } of hostPeersRef.current.values()) {
      if (dataChannel?.readyState === "open") {
        dataChannel.send(serializedMessage);
      }
    }
  }, []);

  const broadcastDrawStart = useCallback(() => {
    broadcastMessage({
      type: "draw:start",
    });
  }, [broadcastMessage]);

  const broadcastDrawFrame = useCallback(
    (indexes: number[]) => {
      broadcastMessage({
        type: "draw:frame",
        indexes,
      });
    },
    [broadcastMessage],
  );

  const broadcastDrawResult = useCallback(
    (team: CharacterType[]) => {
      broadcastMessage({
        type: "draw:result",
        team,
      });
    },
    [broadcastMessage],
  );

  const broadcastDrawClose = useCallback(() => {
    broadcastMessage({
      type: "draw:close",
    });
  }, [broadcastMessage]);

  useEffect(() => {
    return () => {
      for (const {
        dataChannel,
        peerConnection,
      } of hostPeersRef.current.values()) {
        dataChannel?.close();
        peerConnection.close();
      }

      hostPeersRef.current.clear();

      guestDataChannelRef.current?.close();

      guestPeerConnectionRef.current?.close();

      applyingHostAnswerRef.current = false;
    };
  }, []);

  return {
    role,
    status,
    connectedGuests,
    guestOfferCode,
    lastHostAnswerCode,
    errorMessage,

    isHost: role === "host",
    isGuest: role === "guest",
    isInRoom: role !== null,

    isConnected: status === "connected",

    becomeHost,
    createGuestOffer,
    createHostAnswer,
    applyHostAnswer,
    leaveRoom,

    broadcastDrawStart,
    broadcastDrawFrame,
    broadcastDrawResult,
    broadcastDrawClose,
  };
}
