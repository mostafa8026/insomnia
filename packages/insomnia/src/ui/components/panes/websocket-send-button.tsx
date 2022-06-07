import React, { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import * as models from '../../../models';
import { isRequest, isWebSocketRequest } from '../../../models/request';
import { selectActiveRequest } from '../../redux/selectors';

export const WebSocketSendButton = () => {
  const activeRequest = useSelector(selectActiveRequest);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!ws.current) {
      return;
    }
    if (!activeRequest?._id) {
      return;
    }
    if (!isRequest(activeRequest)) {
      return;
    }

    if (!isWebSocketRequest(activeRequest)) {
      return;
    }

    ws.current.onopen = () => {
      models.request.update(activeRequest, {
        webSocketStuffLol: {
          ...activeRequest.webSocketStuffLol,
          messages: [],
          connection: {
            ...activeRequest.webSocketStuffLol.connection,
            status: 'connected',
          },
        },
      });
    };

    ws.current.onmessage = (event: MessageEvent) => {
      console.log(event);
      models.request.update(activeRequest, {
        webSocketStuffLol: {
          ...activeRequest.webSocketStuffLol,
          connection: {
            status: 'connected',
          },
          messages: [
            ...activeRequest.webSocketStuffLol.messages,
            {
              direction: 'received',
              text: event.data,
              type: 'Text',
              time: event.timeStamp,
            },
          ],
        },
      });
    };
    ws.current.onerror = console.error;

    console.log(ws.current);

    ws.current.onclose = event => {
      console.log('onClose', event);
      models.request.update(activeRequest, {
        webSocketStuffLol: {
          ...activeRequest.webSocketStuffLol,
          connection: {
            ...activeRequest.webSocketStuffLol.connection,
            status: 'disconnected',
          },
        },
      });
    };

  }, [activeRequest,
    activeRequest.webSocketStuffLol,
    activeRequest.webSocketStuffLol.connection,
    activeRequest.webSocketStuffLol.connection.status,
    activeRequest.webSocketStuffLol.messages,
    activeRequest.webSocketStuffLol.messageType,
  ]);

  const onConnect = useCallback(() => {
    if (!activeRequest?._id) {
      return;
    }
    if (!isRequest(activeRequest)) {
      return;
    }

    if (!isWebSocketRequest(activeRequest)) {
      return;
    }

    const fn = async () => {

      await models.request.update(activeRequest, {
        webSocketStuffLol: {
          ...activeRequest.webSocketStuffLol,
          connection: {
            ...activeRequest.webSocketStuffLol.connection,
            status: 'connecting',
          },
        },
      });

      ws.current = new WebSocket(activeRequest.url);
      window.ws = ws.current;

      // ws.onmessage = () => {
      //   models.request.update(activeRequest, {
      //     webSocketStuffLol: {
      //       ...activeRequest.webSocketStuffLol,
      //       messages: [
      //         ...activeRequest.webSocketStuffLol.messages,
      //         {
      //           direction: 'received',

      //         }
      //       ]
      //     },
      //   });
      // };

    };

    fn();

  }, [activeRequest,
    activeRequest.webSocketStuffLol,
    activeRequest.webSocketStuffLol.connection,
    activeRequest.webSocketStuffLol.connection.status,
    activeRequest.webSocketStuffLol.messages,
    activeRequest.webSocketStuffLol.messageType,
  ]);

  const onSend = useCallback(() => {
    if (!activeRequest?._id) {
      return;
    }
    if (!isRequest(activeRequest)) {
      return;
    }

    if (!isWebSocketRequest(activeRequest)) {
      return;
    }

    const send = activeRequest?.body.text || '';
    console.log({ send });

    window.ws.send(send);
    models.request.update(activeRequest, {
      webSocketStuffLol: {
        ...activeRequest.webSocketStuffLol,
        messages: [
          ...activeRequest.webSocketStuffLol.messages,
          {
            direction: 'sent',
            text: send,
            type: activeRequest.webSocketStuffLol.messageType,
            time: Math.random(),
          },
        ],
      },
    });
  }, [activeRequest]);

  if (activeRequest === null) {
    return null;
  }

  if (!isRequest(activeRequest)) {
    // lol gRPC bites us yet again
    return null;
  }

  if (!isWebSocketRequest(activeRequest)) {
    return null;
  }

  const {
    webSocketStuffLol: {
      connection: {
        status,
      },
    },
  } = activeRequest;

  if (status === 'fresh' || status === 'disconnected') {
    return (
      <button
        className="urlbar__send-btn"
        type="button"
        onClick={onConnect}
      >
        Connect
      </button>
    );
  }

  return (
    <button
      className="urlbar__send-btn"
      type="button"
      onClick={onSend}
    >
      Send
    </button>
  );
};
