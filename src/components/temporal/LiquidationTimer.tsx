import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTemporalFinance } from '@/context/TemporalFinanceContext';
import { TimeEntry, CATEGORY_LABELS } from '@/types/temporal-finance';
import { cn } from '@/lib/utils';

interface LiquidationTimerProps {
  entry: TimeEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds

export function LiquidationTimer({ entry, open, onOpenChange }: LiquidationTimerProps) {
  const { payOffDebt } = useTemporalFinance();
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const totalOwed = entry ? entry.duration + entry.accruedInterest : 0;
  const payoffAmount = Math.min(25, totalOwed); // 25 minutes per session

  useEffect(() => {
    if (!open) {
      setTimeLeft(POMODORO_DURATION);
      setIsRunning(false);
      setIsComplete(false);
    }
  }, [open]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleComplete = useCallback(() => {
    if (entry) {
      payOffDebt(entry.id, payoffAmount);
    }
    onOpenChange(false);
  }, [entry, payOffDebt, payoffAmount, onOpenChange]);

  const handleReset = () => {
    setTimeLeft(POMODORO_DURATION);
    setIsRunning(false);
    setIsComplete(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((POMODORO_DURATION - timeLeft) / POMODORO_DURATION) * 100;

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground text-center">
            Liquidation Mode
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Debt Info */}
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">Paying off</p>
            <p className="text-lg font-medium text-foreground">
              {CATEGORY_LABELS[entry.category]}
            </p>
            <p className="text-sm text-liability font-mono">
              {Math.floor(totalOwed / 60)}h {totalOwed % 60}m total debt
            </p>
          </div>

          {/* Timer Circle */}
          <div className="relative flex items-center justify-center">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="hsl(217, 33%, 17%)"
                strokeWidth="8"
                fill="none"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="88"
                stroke={isComplete ? 'hsl(160, 84%, 39%)' : 'hsl(160, 84%, 39%)'}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={553}
                initial={{ strokeDashoffset: 553 }}
                animate={{ strokeDashoffset: 553 - (553 * progress) / 100 }}
                transition={{ duration: 0.5 }}
                className={isComplete ? 'asset-glow' : ''}
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                {isComplete ? (
                  <motion.div
                    key="complete"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                      className="h-16 w-16 rounded-full bg-asset/20 flex items-center justify-center asset-glow"
                    >
                      <Check className="h-8 w-8 text-asset" />
                    </motion.div>
                    <p className="text-sm text-asset mt-2 font-medium">Debt Liquidated!</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="timer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <span className="text-5xl font-mono font-bold text-foreground tracking-tight">
                      {formatTime(timeLeft)}
                    </span>
                    <p className="text-xs text-muted-foreground mt-2">
                      {isRunning ? 'Focus in progress...' : 'Ready to focus'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Payoff Info */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              This session will pay off{' '}
              <span className="text-asset font-medium">{payoffAmount} minutes</span> of debt
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {isComplete ? (
              <Button
                onClick={handleComplete}
                className="gap-2 bg-asset hover:bg-asset/90 text-asset-foreground"
              >
                <Check className="h-4 w-4" />
                Claim Payoff
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleReset}
                  className="border-border/50"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                
                <Button
                  size="lg"
                  onClick={() => setIsRunning(!isRunning)}
                  className={cn(
                    'gap-2 px-8',
                    isRunning
                      ? 'bg-interest hover:bg-interest/90 text-interest-foreground'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  )}
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Start
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="border-border/50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
