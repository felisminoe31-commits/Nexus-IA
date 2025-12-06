import { LucideIcon } from 'lucide-react';

export type Language = 'en' | 'pt';

export type ViewState = 'landing' | 'dashboard';

export interface Tool {
  id: number;
  nameKey: string; // Key for translation
  icon: LucideIcon;
  color: string;
  isNew?: boolean;
  isHot?: boolean;
  span?: string; // For bento grid layout (e.g., "col-span-2")
}

export interface Translation {
  [key: string]: {
    [key: string]: string;
  };
}