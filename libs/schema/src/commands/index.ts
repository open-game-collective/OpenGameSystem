import { z } from 'zod';

export const MultipleChoiceSelectCommandSchema = z.object({
  type: z.literal('MULTIPLE_CHOICE_SELECT'),
  value: z.string(),
  blockIndex: z.number(),
});

export const ConfirmCommandSchema = z.object({
  type: z.literal('CONFIRM'),
  blockIndex: z.number(),
});
