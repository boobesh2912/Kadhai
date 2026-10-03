// Values must match backend/config.py (STORY_TYPES, LENGTHS, TONES).
export const STORY_TYPES = [
  { value: 'adventure', label: 'Adventure' },
  { value: 'animal', label: 'Animal Friends' },
  { value: 'friendship', label: 'Friendship' },
  { value: 'fairy-tale', label: 'Fairy Tale' },
  { value: 'space', label: 'Space Adventure' },
  { value: 'ocean', label: 'Ocean Adventure' },
];

export const LENGTHS = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' },
];

export const TONES = [
  { value: 'fun', label: 'Fun' },
  { value: 'exciting', label: 'Exciting' },
  { value: 'gentle', label: 'Gentle' },
  { value: 'funny', label: 'Funny' },
  { value: 'magical', label: 'Magical' },
];

export const MAX_TITLE_CHARS = 100;
