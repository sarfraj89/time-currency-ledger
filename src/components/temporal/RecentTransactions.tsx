import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTemporalFinance } from '@/context/TemporalFinanceContext';
import { CATEGORY_LABELS } from '@/types/temporal-finance';
import { cn } from '@/lib/utils';

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
};

const formatDate = (date: Date): string => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function RecentTransactions() {
  const { entries } = useTemporalFinance();
  
  const recentTransactions = [...entries]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
        <span className="text-xs text-muted-foreground">Last 10 entries</span>
      </div>

      <Card className="glass-card">
        <CardContent className="p-0">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No transactions yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Start logging your time investments
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {recentTransactions.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full',
                      entry.type === 'asset' 
                        ? 'bg-asset/10 text-asset' 
                        : 'bg-liability/10 text-liability'
                    )}>
                      {entry.type === 'asset' ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {CATEGORY_LABELS[entry.category]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.type === 'asset' ? 'Time Invested' : 'Time Borrowed'}
                        {entry.isPaidBack && (
                          <span className="ml-2 text-asset">• Paid off</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={cn(
                      'text-sm font-mono font-medium',
                      entry.type === 'asset' ? 'text-asset' : 'text-liability'
                    )}>
                      {entry.type === 'asset' ? '+' : '-'}{formatTime(entry.duration)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(entry.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
