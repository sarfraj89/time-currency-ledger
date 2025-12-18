import { useState } from 'react';
import { motion } from 'framer-motion';
import { TopBar } from '@/components/temporal/TopBar';
import { FinancialSummary } from '@/components/temporal/FinancialSummary';
import { ActiveDebts } from '@/components/temporal/ActiveDebts';
import { RecentTransactions } from '@/components/temporal/RecentTransactions';
import { WeeklyChart } from '@/components/temporal/WeeklyChart';
import { TransactionDialog } from '@/components/temporal/TransactionDialog';
import { LiquidationTimer } from '@/components/temporal/LiquidationTimer';
import { TimeEntry } from '@/types/temporal-finance';

export default function Dashboard() {
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [liquidationEntry, setLiquidationEntry] = useState<TimeEntry | null>(null);
  const [liquidationOpen, setLiquidationOpen] = useState(false);

  const handleLiquidate = (entry: TimeEntry) => {
    setLiquidationEntry(entry);
    setLiquidationOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <TopBar onNewTransaction={() => setTransactionOpen(true)} />
      
      <main className="flex-1 p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">
              Temporal Portfolio Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor your time investments and manage temporal liabilities
            </p>
          </div>

          {/* Chart */}
          <WeeklyChart />

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Financial Summary */}
            <div className="lg:col-span-1">
              <FinancialSummary />
            </div>

            {/* Column 2: Active Debts */}
            <div className="lg:col-span-1">
              <ActiveDebts onLiquidate={handleLiquidate} />
            </div>

            {/* Column 3: Recent Transactions */}
            <div className="lg:col-span-1">
              <RecentTransactions />
            </div>
          </div>
        </motion.div>
      </main>

      <TransactionDialog 
        open={transactionOpen} 
        onOpenChange={setTransactionOpen} 
      />
      
      <LiquidationTimer
        entry={liquidationEntry}
        open={liquidationOpen}
        onOpenChange={setLiquidationOpen}
      />
    </div>
  );
}
