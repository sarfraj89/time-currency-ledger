import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trash2, Play, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTemporalFinance } from '@/context/TemporalFinanceContext';
import { CATEGORY_LABELS, TimeEntry } from '@/types/temporal-finance';
import { cn } from '@/lib/utils';

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
};

const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
};

interface DebtItemProps {
  entry: TimeEntry;
  onLiquidate: (entry: TimeEntry) => void;
  onDelete: (id: string) => void;
}

const DebtItem = ({ entry, onLiquidate, onDelete }: DebtItemProps) => {
  const totalOwed = entry.duration + entry.accruedInterest;
  const interestPercent = entry.duration > 0 ? (entry.accruedInterest / entry.duration) * 100 : 0;
  const isUrgent = interestPercent > 20;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      className={cn(
        'group rounded-lg border p-4 transition-all duration-200',
        isUrgent 
          ? 'border-liability/30 bg-liability/5 hover:border-liability/50' 
          : 'border-border/50 bg-card hover:border-border'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {isUrgent && <AlertCircle className="h-4 w-4 text-liability animate-pulse" />}
          <span className="text-sm font-medium text-foreground">
            {CATEGORY_LABELS[entry.category]}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {getTimeAgo(entry.timestamp)}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Principal: {formatTime(entry.duration)}</span>
          {entry.accruedInterest > 0 && (
            <span className="text-interest">
              +{formatTime(entry.accruedInterest)} interest
            </span>
          )}
        </div>
        
        <Progress 
          value={Math.min(interestPercent, 100)} 
          className="h-1.5 bg-muted"
        />
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-mono font-semibold text-liability">
            {formatTime(totalOwed)}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Total Owed
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onLiquidate(entry)}
          className="flex-1 gap-1 text-xs border-primary/50 text-primary hover:bg-primary/10"
        >
          <Play className="h-3 w-3" />
          Liquidate
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(entry.id)}
          className="text-muted-foreground hover:text-liability"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  );
};

interface ActiveDebtsProps {
  onLiquidate: (entry: TimeEntry) => void;
}

export function ActiveDebts({ onLiquidate }: ActiveDebtsProps) {
  const { getActiveDebts, deleteEntry } = useTemporalFinance();
  const activeDebts = getActiveDebts();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Active Debts</h2>
        <span className="text-xs text-muted-foreground">
          {activeDebts.length} outstanding
        </span>
      </div>

      <Card className="glass-card">
        <CardContent className="p-4">
          {activeDebts.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No outstanding debts</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Your temporal portfolio is debt-free
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {activeDebts.map((entry) => (
                  <DebtItem
                    key={entry.id}
                    entry={entry}
                    onLiquidate={onLiquidate}
                    onDelete={deleteEntry}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
