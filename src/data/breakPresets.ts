import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type BreakPreset = {
  title: string;
  minutesLabel: string;
  icon: IconName;
};

export const BREAK_PRESETS: BreakPreset[] = [
  { title: 'Coffee Break', minutesLabel: '15 min', icon: 'cafe-outline' },
  { title: 'Power Nap', minutesLabel: '20 min', icon: 'bed-outline' },
  { title: 'Relax', minutesLabel: '10 min', icon: 'leaf-outline' },
  { title: 'Watch a Video', minutesLabel: '15 min', icon: 'play-circle-outline' },
  { title: 'Short Walk', minutesLabel: '15 min', icon: 'walk-outline' },
  { title: 'Quick Snack', minutesLabel: '5-10 min', icon: 'fast-food-outline' },
];

export function iconForActivityTitle(title: string): IconName {
  return BREAK_PRESETS.find((p) => p.title === title)?.icon ?? 'time-outline';
}
