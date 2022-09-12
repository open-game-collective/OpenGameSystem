import {
  ActorSendEvent,
  ActorEventType,
  ActorEvents,
  ActorInitializeEvent,
} from '@explorers-club/actor';
import { Database } from '@explorers-club/database';
import { PartyEvents, partyMachine } from '@explorers-club/party';
import { PresenceState } from '@supabase/realtime-js/dist/module/RealtimePresence';
import * as crypto from 'crypto';
import { interpret } from 'xstate';
import { supabaseAdmin } from './lib/supabase';

type PartyRow = Database['public']['Tables']['parties']['Row'];

async function bootstrap() {
  const hostId = crypto.randomUUID();
  console.log('Listener for new parties on host ' + hostId);

  supabaseAdmin
    .channel('db-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'parties' },
      async (payload: { new: PartyRow }) => {
        const joinCode = payload.new.join_code;
        const channel = supabaseAdmin.channel(`party-${joinCode}`);
        const partyActor = interpret(partyMachine);
        partyActor.start();

        channel
          .on('presence', { event: 'join' }, async (payload: PresenceState) => {
            const toAdd = payload['newPresences'].map((p) => ({
              userId: p['userId'],
            }));

            for (let i = 0; i < toAdd.length; i++) {
              partyActor.send(PartyEvents.PLAYER_CONNECTED(toAdd[i]));
            }
            const currentState = partyActor.getSnapshot();

            // Broadcast current state whenever someone joins
            await channel.send(
              ActorEvents.INITIALIZE({
                actorId: hostId,
                actorType: 'PARTY_ACTOR',
                state: currentState,
              })
            );
          })
          .on('presence', { event: 'leave' }, (payload: PresenceState) => {
            const toRemove = payload['leftPresences'].map((p) => ({
              userId: p['userId'],
            }));

            for (let i = 0; i < toRemove.length; i++) {
              partyActor.send(PartyEvents.PLAYER_DISCONNECTED(toRemove[i]));
            }
          })
          .on(
            'broadcast',
            { event: ActorEventType.INITIALIZE },
            (payload: ActorInitializeEvent) => {
              console.log('typed init', payload);
            }
          )
          .on(
            'broadcast',
            { event: ActorEventType.SEND },
            (payload: ActorSendEvent) => {
              console.log('typed send!', payload);
            }
          )
          .subscribe(async (status) => {
            if (status !== 'SUBSCRIBED') {
              console.warn(`Channel status ${status} - ${joinCode}`);
            } else {
              console.log(`Connected to channel ${joinCode}`);
            }
          });
      }
    )
    .subscribe();
}

bootstrap();
