import { ActorRefFrom, ContextFrom, EventFrom, StateFrom } from 'xstate';
import { createModel } from 'xstate/lib/model';
import { supabaseClient } from '../lib/supabase';
import { AuthActor } from './auth.machine';
import { NavigationActor } from './navigation.machine';
import { PartyActor } from './party.machine';

const appModel = createModel({
  partyActor: {} as PartyActor,
  authActor: {} as AuthActor,
  navigationActor: {} as NavigationActor,
});

export type AppContext = ContextFrom<typeof appModel>;
export type AppEvent = EventFrom<typeof appModel>;

const appMachine = appModel.createMachine(
  {
    id: 'appMachine',
    initial: 'Initializing',
    context: appModel.initialContext,
    states: {
      Initializing: {
        invoke: {
          src: 'initialize',
          onDone: 'Idle',
        },
      },
      Idle: {},
    },
    predictableActionArguments: true,
  },

  {
    guards: {},
    services: {
      initialize: async (context) => {
        console.log('initializing supabase listener...');
        supabaseClient
          .channel('db-changes')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'parties' },
            (payload: unknown) => {
              console.log('NEW EVENT!', payload);
              // appService.run({ partyId: 'foo' });
              // appService.stop({ partyId: 'foo' });
            }
          )
          .subscribe();
        return 'cool';
      },
    },
  }
);

export const createAppMachine = (context: AppContext) =>
  appMachine.withContext(context);

export type AppActor = ActorRefFrom<typeof appMachine>;
export type AppState = StateFrom<typeof appMachine>;
