import z from 'zod';
import { errorMessages, MAX_CHAR } from '../utils/validation.utils';

export const ProjectLabelSchema = z.object({
  name: z
    .string(errorMessages.invalidType('Label name', 'string'))
    .max(MAX_CHAR, errorMessages.maxChar('Label name', MAX_CHAR))
    .trim(),

  color: z
    .string(errorMessages.invalidType('Label color', 'string'))
    .min(7, 'Hex color is too short')
    .max(7, 'Hex color is too long')
    .startsWith('#', 'Hex color must start with #')
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format. Use #RRGGBB format'),
});

export const DEFAULT_COLOR = '#017DE2';
export type ProjectLabelType = z.input<typeof ProjectLabelSchema>;
