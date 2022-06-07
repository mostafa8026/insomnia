import { Button } from 'insomnia-components';
import React, { FC, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { isRequest, isWebSocketRequest, WebSocketConnectionStatus, WebSocketRequest } from '../../../models/request';
import { selectActiveRequest } from '../../redux/selectors';

const ConnectionButton: FC<{ request: WebSocketRequest}> = ({
  request: {
    webSocketStuffLol: {
      connection: {
        status,
      },
    },
  },
}) => {
  const disconnect = useCallback(() => {
    // @ts-expect-error TODO
    window.ws.close();
  }, []);

  switch (status) {
    case 'connected':
    case 'connecting':
      return (
        <Button
          variant='contained'
          style={{
            color: 'var(--color-danger)',
          }}
          onClick={disconnect}
        >
          Disconnect
        </Button>
      );

    case 'disconnected':
    case 'fresh':
    default:
      return (
        <Button
          variant='contained'
          style={{
            color: 'var(--color-success)',
          }}
        >
          Connect
        </Button>
      );
  }
};

export const WebSocketConnection: FC = () => {
  const activeRequest = useSelector(selectActiveRequest);

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

  return (
    <div>
      <ConnectionButton request={activeRequest} />
      <div>Connection Status: {status}</div>
    </div>
  );
};

const getConnectionStatusColor = (status: WebSocketConnectionStatus) => {
  switch (status) {
    case 'connected':
    case 'connecting':
      return 'var(--color-success)';

    case 'disconnected':
      return 'var(--color-error)';

    case 'fresh':
    default:
      return null;
  }
};

const getConnectionStatusLabel = (status: WebSocketConnectionStatus) => {
  switch (status) {
    case 'connected':
      return 'Connected';

    case 'connecting':
      return 'Connecting';

    case 'disconnected':
      return 'Disconnected';

    case 'fresh':
    default:
      return 'Connection';
  }
};

export const WebSocketConnectionTab: FC = () => {
  const activeRequest = useSelector(selectActiveRequest);

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

  const color = getConnectionStatusColor(status);

  return (
    <button
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...(color ? { color } : {}),
      }}
    >
      <span
        style={{
          marginRight: 4,
          fontSize: 21,
          lineHeight: 'normal',
        }}
      >
        •
      </span>

      {getConnectionStatusLabel(status)}
    </button>
  );
};
