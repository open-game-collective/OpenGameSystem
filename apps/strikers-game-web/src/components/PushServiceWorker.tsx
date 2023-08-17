import { ConnectionContext } from '@context/ApplicationProvider';
import { WorldContext } from '@context/WorldProvider';
import { useStore } from '@nanostores/react';
import type { ConnectionEntity } from '@explorers-club/schema';
import { noop } from '@explorers-club/utils';
import { useEntityStoreSelector } from '@hooks/useEntityStoreSelector';
import { FC, useCallback, useContext, useEffect } from 'react';
import { Box } from '@atoms/Box';
import { Button } from '@atoms/Button';

export const PushServiceWorker = () => {
  const { entityStoreRegistry } = useContext(WorldContext);
  const connectionEntity = useStore(entityStoreRegistry.myConnectionEntity);

  const handlePress = useCallback(() => {
    if (connectionEntity && supportsPushNofications()) {
      subscribeToPushNofications(connectionEntity).then(noop);
    }
  }, [connectionEntity]);

  useEffect(() => {}, [connectionEntity]);

  return (
    <Box css={{ zIndex: '100', position: 'fixed', right: '$3', bottom: '$3' }}>
      <Button onClick={handlePress}>Enable Push</Button>
    </Box>
  );
};

// Check if the browser supports push notifications.
const supportsPushNofications = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

const subscribeToPushNofications = async (entity: ConnectionEntity) => {
  navigator.serviceWorker.ready.then(async (swReg) => {
    console.log('subscribe');
    const pushSubscription = await swReg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey:
        'BDf_JKlIbZCDRNB4MoXxdz8BoRF7AC93M79KPJ6wfIjFR59lVYFPeT-ozuaijg4BTAo_AqP30iNJyRuC-IN3YdA',
    });
    console.log(pushSubscription.toJSON());

    entity.send({
      type: 'REGISTER_PUSH_SUBSCRIPTION',
      json: pushSubscription.toJSON(),
    });
  });

  await navigator.serviceWorker.register('/sw.js');
};
