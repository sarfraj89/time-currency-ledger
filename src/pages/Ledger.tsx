import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Filter, Search, Trash2 } from 'lucide-react';
import { TopBar } from '@/components/temporal/TopBar';
import { TransactionDialog } from '@/components/temporal/TransactionDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTemporalFinance } from '@/context/TemporalFinanceContext';
import { CATEGORY_LABELS, EntryType } from '@/types/temporal-finance';
import { cn } from '@/lib/utils';

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function Ledger() {
  const { entries, deleteEntry } = useTemporalFinance();
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | EntryType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = entries
    .filter((entry) => {
      if (filter !== 'all' && entry.type !== filter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          CATEGORY_LABELS[entry.category].toLowerCase().includes(query) ||
          entry.type.includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const totalFiltered = filteredEntries.reduce((acc, entry) => {
    if (entry.type === 'asset') {
      return acc + entry.duration;
    }
    return acc - (entry.duration + entry.accruedInterest);
  }, 0);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <TopBar onNewTransaction={() => setTransactionOpen(true)} />

      <main className="flex-1 p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">
              Transaction Ledger
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Complete history of your temporal transactions
            </p>
          </div>

          {/* Filters */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-card border-border/50"
                  />
                </div>
                <Select value={filter} onValueChange={(v) => setFilter(v as 'all' | EntryType)}>
                  <SelectTrigger className="w-[180px] bg-card border-border/50">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border/50">
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="asset">Assets Only</SelectItem>
                    <SelectItem value="liability">Liabilities Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border/50">
            <div>
              <span className="text-sm text-muted-foreground">
                Showing {filteredEntries.length} transactions
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Net:</span>
              <span className={cn(
                'font-mono font-semibold',
                totalFiltered >= 0 ? 'text-asset' : 'text-liability'
              )}>
                {formatTime(totalFiltered)}
              </span>
            </div>
          </div>

          {/* Transactions Table */}
          <Card className="glass-card overflow-hidden">
            <CardHeader className="border-b border-border/50 py-3">
              <div className="grid grid-cols-12 gap-4 text-xs uppercase tracking-wider text-muted-foreground">
                <div className="col-span-1">Type</div>
                <div className="col-span-3">Category</div>
                <div className="col-span-3">Date</div>
                <div className="col-span-2">Duration</div>
                <div className="col-span-2">Interest</div>
                <div className="col-span-1">Actions</div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredEntries.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">No transactions found</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {filteredEntries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="grid grid-cols-12 gap-4 items-center p-4 hover:bg-accent/50 transition-colors group"
                    >
                      <div className="col-span-1">
                        <div className={cn(
                          'h-8 w-8 rounded-full flex items-center justify-center',
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
                      </div>
                      <div className="col-span-3">
                        <p className="text-sm font-medium text-foreground">
                          {CATEGORY_LABELS[entry.category]}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {entry.type === 'asset' ? 'Investment' : 'Liability'}
                          {entry.isPaidBack && <span className="text-asset ml-1">• Paid</span>}
                        </p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-sm text-foreground">
                          {formatDate(entry.timestamp)}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className={cn(
                          'text-sm font-mono font-medium',
                          entry.type === 'asset' ? 'text-asset' : 'text-liability'
                        )}>
                          {entry.type === 'asset' ? '+' : '-'}{formatTime(entry.duration)}
                        </p>
                      </div>
                      <div className="col-span-2">
                        {entry.type === 'liability' && entry.accruedInterest > 0 && !entry.isPaidBack ? (
                          <p className="text-sm font-mono text-interest">
                            +{formatTime(entry.accruedInterest)}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">—</p>
                        )}
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEntry(entry.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-liability"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <TransactionDialog
        open={transactionOpen}
        onOpenChange={setTransactionOpen}
      />
    </div>
  );
}
