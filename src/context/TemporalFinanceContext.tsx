import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TimeEntry, TemporalStats, DailySnapshot, EntryType, Category } from '@/types/temporal-finance';

interface TemporalFinanceContextType {
  entries: TimeEntry[];
  stats: TemporalStats;
  weeklySnapshots: DailySnapshot[];
  addEntry: (entry: Omit<TimeEntry, 'id' | 'accruedInterest'>) => void;
  payOffDebt: (entryId: string, amount: number) => void;
  deleteEntry: (entryId: string) => void;
  getActiveDebts: () => TimeEntry[];
  calculateInterest: () => void;
}

const TemporalFinanceContext = createContext<TemporalFinanceContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 9);

const DEFAULT_INTEREST_RATE = 1.1; // 10% daily

// Sample data for demo
const generateSampleData = (): TimeEntry[] => {
  const now = new Date();
  const entries: TimeEntry[] = [];
  
  // Past week assets
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Random assets
    if (Math.random() > 0.3) {
      entries.push({
        id: generateId(),
        type: 'asset',
        duration: Math.floor(Math.random() * 120) + 30,
        category: ['deep-work', 'exercise', 'learning'][Math.floor(Math.random() * 3)] as Category,
        timestamp: date,
        interestRate: 1,
        isPaidBack: false,
        accruedInterest: 0,
      });
    }
    
    // Random liabilities
    if (Math.random() > 0.4) {
      const daysOld = i;
      const interestMultiplier = Math.pow(DEFAULT_INTEREST_RATE, daysOld);
      const baseDuration = Math.floor(Math.random() * 90) + 15;
      entries.push({
        id: generateId(),
        type: 'liability',
        duration: baseDuration,
        category: ['social-media', 'streaming', 'gaming', 'procrastination'][Math.floor(Math.random() * 4)] as Category,
        timestamp: date,
        interestRate: DEFAULT_INTEREST_RATE,
        isPaidBack: Math.random() > 0.6,
        accruedInterest: Math.floor(baseDuration * (interestMultiplier - 1)),
      });
    }
  }
  
  return entries;
};

export const TemporalFinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<TimeEntry[]>(() => {
    const saved = localStorage.getItem('temporal-finance-entries');
    if (saved) {
      return JSON.parse(saved, (key, value) => {
        if (key === 'timestamp') return new Date(value);
        return value;
      });
    }
    return generateSampleData();
  });

  useEffect(() => {
    localStorage.setItem('temporal-finance-entries', JSON.stringify(entries));
  }, [entries]);

  const calculateInterest = useCallback(() => {
    const now = new Date();
    setEntries(prevEntries => 
      prevEntries.map(entry => {
        if (entry.type === 'liability' && !entry.isPaidBack) {
          const daysSinceCreation = (now.getTime() - new Date(entry.timestamp).getTime()) / (1000 * 60 * 60 * 24);
          const interestMultiplier = Math.pow(entry.interestRate, daysSinceCreation);
          const accruedInterest = Math.floor(entry.duration * (interestMultiplier - 1));
          return { ...entry, accruedInterest };
        }
        return entry;
      })
    );
  }, []);

  useEffect(() => {
    calculateInterest();
    const interval = setInterval(calculateInterest, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [calculateInterest]);

  const stats: TemporalStats = React.useMemo(() => {
    const assetEntries = entries.filter(e => e.type === 'asset');
    const debtEntries = entries.filter(e => e.type === 'liability' && !e.isPaidBack);
    
    const totalAssets = assetEntries.reduce((sum, e) => sum + e.duration, 0);
    const totalDebt = debtEntries.reduce((sum, e) => sum + e.duration + e.accruedInterest, 0);
    const currentInterestAccrued = debtEntries.reduce((sum, e) => sum + e.accruedInterest, 0);
    
    return {
      totalDebt,
      totalAssets,
      netTimeWorth: totalAssets - totalDebt,
      currentInterestAccrued,
      debtEntries,
      assetEntries,
    };
  }, [entries]);

  const weeklySnapshots: DailySnapshot[] = React.useMemo(() => {
    const snapshots: DailySnapshot[] = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(23, 59, 59, 999);
      
      const dayEntries = entries.filter(e => 
        new Date(e.timestamp) <= date
      );
      
      const assets = dayEntries
        .filter(e => e.type === 'asset')
        .reduce((sum, e) => sum + e.duration, 0);
      
      const debt = dayEntries
        .filter(e => e.type === 'liability' && !e.isPaidBack)
        .reduce((sum, e) => sum + e.duration + e.accruedInterest, 0);
      
      snapshots.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        assets,
        debt,
        netWorth: assets - debt,
      });
    }
    
    return snapshots;
  }, [entries]);

  const addEntry = useCallback((entry: Omit<TimeEntry, 'id' | 'accruedInterest'>) => {
    const newEntry: TimeEntry = {
      ...entry,
      id: generateId(),
      accruedInterest: 0,
    };
    setEntries(prev => [newEntry, ...prev]);
  }, []);

  const payOffDebt = useCallback((entryId: string, amount: number) => {
    setEntries(prev => 
      prev.map(entry => {
        if (entry.id === entryId) {
          const totalOwed = entry.duration + entry.accruedInterest;
          if (amount >= totalOwed) {
            return { ...entry, isPaidBack: true };
          }
          // Partial payment reduces the base duration
          const newDuration = Math.max(0, entry.duration - amount);
          return { ...entry, duration: newDuration };
        }
        return entry;
      })
    );
  }, []);

  const deleteEntry = useCallback((entryId: string) => {
    setEntries(prev => prev.filter(e => e.id !== entryId));
  }, []);

  const getActiveDebts = useCallback(() => {
    return entries
      .filter(e => e.type === 'liability' && !e.isPaidBack)
      .sort((a, b) => (b.duration + b.accruedInterest) - (a.duration + a.accruedInterest));
  }, [entries]);

  return (
    <TemporalFinanceContext.Provider
      value={{
        entries,
        stats,
        weeklySnapshots,
        addEntry,
        payOffDebt,
        deleteEntry,
        getActiveDebts,
        calculateInterest,
      }}
    >
      {children}
    </TemporalFinanceContext.Provider>
  );
};

export const useTemporalFinance = () => {
  const context = useContext(TemporalFinanceContext);
  if (!context) {
    throw new Error('useTemporalFinance must be used within TemporalFinanceProvider');
  }
  return context;
};
