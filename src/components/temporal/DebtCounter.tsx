import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingDown, Clock } from 'lucide-react';
import { useTemporalFinance } from '@/context/TemporalFinanceContext';
import { cn } from '@/lib/utils';

const formatTime = (minutes: number): string => {
  const hours = Math.floor(Math.abs(minutes) / 60);
  const mins = Math.abs(minutes) % 60;
  const sign = minutes < 0 ? '-' : '';
  return `${sign}${hours}h ${mins}m`;
};

export function DebtCounter() {
  const { stats } = useTemporalFinance();
  const [displayedDebt, setDisplayedDebt] = useState(stats.totalDebt);
  const [isIncreasing, setIsIncreasing] = useState(false);
  
  const isHighDebt = stats.totalDebt > 600; // > 10 hours

  useEffect(() => {
    if (stats.totalDebt !== displayedDebt) {
      setIsIncreasing(stats.totalDebt > displayedDebt);
      const timer = setTimeout(() => setDisplayedDebt(stats.totalDebt), 300);
      return () => clearTimeout(timer);
    }
  }, [stats.totalDebt, displayedDebt]);

  return (
    <div className="flex items-center gap-6">
      {/* Debt Counter */}
      <motion.div
        className={cn(
          'flex items-center gap-3 rounded-xl px-4 py-2 transition-all duration-500',
          isHighDebt 
            ? 'bg-liability/10 debt-glow border border-liability/30' 
            : 'bg-card border border-border/50'
        )}
        animate={isHighDebt ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {isHighDebt ? (
          <AlertTriangle className="h-4 w-4 text-liability animate-pulse" />
        ) : (
          <Clock className="h-4 w-4 text-muted-foreground" />
        )}
        
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Current Debt
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={displayedDebt}
              initial={{ y: isIncreasing ? 10 : -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: isIncreasing ? -10 : 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'font-mono text-lg font-semibold tracking-tight',
                isHighDebt ? 'text-liability' : 'text-foreground'
              )}
            >
              {formatTime(displayedDebt)}
            </motion.span>
          </AnimatePresence>
        </div>

        {stats.currentInterestAccrued > 0 && (
          <div className="flex items-center gap-1 ml-2 pl-2 border-l border-border/50">
            <TrendingDown className="h-3 w-3 text-interest" />
            <span className="text-xs font-mono text-interest">
              +{formatTime(stats.currentInterestAccrued)}
            </span>
          </div>
        )}
      </motion.div>

      {/* Net Worth */}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Net Time Worth
        </span>
        <span className={cn(
          'font-mono text-lg font-semibold tracking-tight',
          stats.netTimeWorth >= 0 ? 'text-asset' : 'text-liability'
        )}>
          {formatTime(stats.netTimeWorth)}
        </span>
      </div>

      {/* Status Badge */}
      {isHighDebt && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="rounded-full bg-liability/20 px-3 py-1 border border-liability/30"
        >
          <span className="text-xs font-medium text-liability">
            Temporal Bankruptcy Risk
          </span>
        </motion.div>
      )}
    </div>
  );
}
