import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Percent, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTemporalFinance } from '@/context/TemporalFinanceContext';
import { cn } from '@/lib/utils';

const formatTime = (minutes: number): string => {
  const hours = Math.floor(Math.abs(minutes) / 60);
  const mins = Math.abs(minutes) % 60;
  const sign = minutes < 0 ? '-' : '';
  return `${sign}${hours}h ${mins}m`;
};

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = 'default',
  delay = 0 
}: { 
  title: string; 
  value: string; 
  icon: React.ElementType;
  trend?: string;
  variant?: 'default' | 'asset' | 'liability' | 'interest';
  delay?: number;
}) => {
  const colorClasses = {
    default: 'text-foreground',
    asset: 'text-asset',
    liability: 'text-liability',
    interest: 'text-interest',
  };

  const glowClasses = {
    default: '',
    asset: 'asset-glow',
    liability: 'debt-glow',
    interest: 'interest-glow',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className={cn('glass-card overflow-hidden', glowClasses[variant])}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="stat-label">{title}</CardTitle>
          <Icon className={cn('h-4 w-4', colorClasses[variant])} />
        </CardHeader>
        <CardContent>
          <div className={cn('stat-value', colorClasses[variant])}>
            {value}
          </div>
          {trend && (
            <p className="text-xs text-muted-foreground mt-1">
              {trend}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function FinancialSummary() {
  const { stats } = useTemporalFinance();
  
  const debtRatio = stats.totalAssets > 0 
    ? ((stats.totalDebt / stats.totalAssets) * 100).toFixed(1) 
    : '0';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Financial Summary</h2>
        <span className="text-xs text-muted-foreground">Real-time Portfolio</span>
      </div>

      <div className="grid gap-4">
        <StatCard
          title="Total Assets"
          value={formatTime(stats.totalAssets)}
          icon={TrendingUp}
          trend="Productive hours invested"
          variant="asset"
          delay={0}
        />
        
        <StatCard
          title="Total Liabilities"
          value={formatTime(stats.totalDebt)}
          icon={TrendingDown}
          trend={`${stats.debtEntries.length} active debts`}
          variant="liability"
          delay={0.1}
        />
        
        <StatCard
          title="Accrued Interest"
          value={formatTime(stats.currentInterestAccrued)}
          icon={Percent}
          trend="Compound procrastination cost"
          variant="interest"
          delay={0.2}
        />
        
        <StatCard
          title="Net Time Worth"
          value={formatTime(stats.netTimeWorth)}
          icon={Wallet}
          trend={`Debt-to-Asset Ratio: ${debtRatio}%`}
          variant={stats.netTimeWorth >= 0 ? 'asset' : 'liability'}
          delay={0.3}
        />
      </div>
    </div>
  );
}
