import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTemporalFinance } from '@/context/TemporalFinanceContext';
import {
  EntryType,
  Category,
  CATEGORY_LABELS,
  ASSET_CATEGORIES,
  LIABILITY_CATEGORIES,
} from '@/types/temporal-finance';
import { cn } from '@/lib/utils';

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDialog({ open, onOpenChange }: TransactionDialogProps) {
  const { addEntry } = useTemporalFinance();
  const [type, setType] = useState<EntryType>('asset');
  const [duration, setDuration] = useState('30');
  const [category, setCategory] = useState<Category>('deep-work');

  const categories = type === 'asset' ? ASSET_CATEGORIES : LIABILITY_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addEntry({
      type,
      duration: parseInt(duration),
      category,
      timestamp: new Date(),
      interestRate: type === 'liability' ? 1.1 : 1,
      isPaidBack: false,
    });

    setDuration('30');
    setCategory(type === 'asset' ? 'deep-work' : 'social-media');
    onOpenChange(false);
  };

  const handleTypeChange = (newType: EntryType) => {
    setType(newType);
    setCategory(newType === 'asset' ? 'deep-work' : 'social-media');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Log Time Transaction
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Transaction Type
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTypeChange('asset')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border p-4 transition-all',
                  type === 'asset'
                    ? 'border-asset bg-asset/10 text-asset'
                    : 'border-border bg-card text-muted-foreground hover:border-asset/50'
                )}
              >
                <Plus className="h-4 w-4" />
                <span className="font-medium">Time Invested</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTypeChange('liability')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border p-4 transition-all',
                  type === 'liability'
                    ? 'border-liability bg-liability/10 text-liability'
                    : 'border-border bg-card text-muted-foreground hover:border-liability/50'
                )}
              >
                <Minus className="h-4 w-4" />
                <span className="font-medium">Time Borrowed</span>
              </motion.button>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-xs uppercase tracking-wider text-muted-foreground">
              Duration (minutes)
            </Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="480"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="bg-card border-border/50 font-mono text-lg"
            />
            <div className="flex gap-2">
              {[15, 30, 60, 120].map((mins) => (
                <Button
                  key={mins}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDuration(String(mins))}
                  className={cn(
                    'text-xs',
                    duration === String(mins) && 'border-primary text-primary'
                  )}
                >
                  {mins}m
                </Button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Category
            </Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger className="bg-card border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/50">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Interest Warning for Liabilities */}
          {type === 'liability' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-lg border border-interest/30 bg-interest/5 p-3"
            >
              <p className="text-xs text-interest">
                <strong>Interest Warning:</strong> This debt will accrue 10% compound interest daily until liquidated.
              </p>
            </motion.div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className={cn(
              'w-full font-medium',
              type === 'asset'
                ? 'bg-asset hover:bg-asset/90 text-asset-foreground'
                : 'bg-liability hover:bg-liability/90 text-liability-foreground'
            )}
          >
            {type === 'asset' ? 'Record Investment' : 'Record Debt'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
