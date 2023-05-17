import { createMachine } from 'xstate';

type Event = { type: 'NEXT' };

export const newRoomMachine = createMachine({
  id: 'NewRoomMachine',
  initial: 'SelectingGame',
  schema: {
    events: {} as Event,
  },
  states: {
    EnterName: {
      entry: () => {
        console.log('enter name');
      },
      after: {
        5000: 'ConfirmDetails',
      },
    },
    SelectingGame: {
      invoke: {
        src: () => {
          console.log('invoking!');
          return Promise.resolve(true);
        },
        onDone: 'EnterName',
      },
      on: {
        NEXT: 'ConfirmDetails',
      },
    },
    ConfirmDetails: {
      after: {
        3000: 'Complete',
      },
      on: {
        NEXT: 'EnterName',
      },
    },
    Complete: {
      type: 'final',
    },
  },
});
