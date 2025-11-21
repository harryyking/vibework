// lib/constants.ts
export const HOUR_HEIGHT = 80; // Height of one hour slot in pixels
export const MINUTES_IN_HOUR = 60;
export const PIXELS_PER_MINUTE = HOUR_HEIGHT / MINUTES_IN_HOUR;

// Preset tags and their colors (matching Pomodoro presets)
export const PRESET_TAGS = {
  STUDY: { title: 'Study', colorClass: 'bg-blue-500' },
  FOCUS: { title: 'Focus', colorClass: 'bg-purple-500' },
  READ: { title: 'Read', colorClass: 'bg-green-500' },
  WORK: { title: 'Work', colorClass: 'bg-orange-500' },
  FITNESS: { title: 'Fitness', colorClass: 'bg-red-500' },
} as const;

export type PresetTag = keyof typeof PRESET_TAGS;