export type EntryType = 'asset' | 'liability';

export type Category = 
  | 'deep-work' 
  | 'exercise' 
  | 'learning' 
  | 'creative' 
  | 'social-media' 
  | 'streaming' 
  | 'gaming' 
  | 'procrastination'
  | 'meetings'
  | 'other';

export interface TimeEntry {
  id: string;
  type: EntryType;
  duration: number; // in minutes
  category: Category;
  description?: string;
  timestamp: Date;
  interestRate: number; // multiplier, e.g., 1.1 for 10% daily interest
  isPaidBack: boolean;
  accruedInterest: number; // in minutes
}

export interface TemporalStats {
  totalDebt: number; // in minutes
  totalAssets: number; // in minutes
  netTimeWorth: number; // assets - debt
  currentInterestAccrued: number; // in minutes
  debtEntries: TimeEntry[];
  assetEntries: TimeEntry[];
}

export interface DailySnapshot {
  date: string;
  assets: number;
  debt: number;
  netWorth: number;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  'deep-work': 'Deep Work',
  'exercise': 'Exercise',
  'learning': 'Learning',
  'creative': 'Creative Work',
  'social-media': 'Social Media',
  'streaming': 'Streaming',
  'gaming': 'Gaming',
  'procrastination': 'Procrastination',
  'meetings': 'Meetings',
  'other': 'Other',
};

export const ASSET_CATEGORIES: Category[] = ['deep-work', 'exercise', 'learning', 'creative', 'meetings'];
export const LIABILITY_CATEGORIES: Category[] = ['social-media', 'streaming', 'gaming', 'procrastination', 'other'];
