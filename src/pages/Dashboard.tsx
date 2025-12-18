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
import { useDashboardData } from '@/hooks/useDashboardData';
import { ScheduleCreator } from '@/components/scheduling/ScheduleCreator';
import { WeeklyScheduleView } from '@/components/scheduling/WeeklyScheduleView';
import { ICSExport } from '@/components/scheduling/ICSExport';
import { WeeklySummaryWidget } from '@/components/analytics/WeeklySummaryWidget';
import { QuickStatsWidget } from '@/components/analytics/QuickStatsWidget';

export default function Dashboard() {
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [liquidationEntry, setLiquidationEntry] = useState<TimeEntry | null>(null);
  const [liquidationOpen, setLiquidationOpen] = useState(false);
  
  const { schedules, loading, profile, completions } = useDashboardData();
  const isEmpty = !loading && schedules.length === 0;

  const handleLiquidate = (entry: TimeEntry) => {
    setLiquidationEntry(entry);
    setLiquidationOpen(true);
  };

  // Calculate Productivity Score (Daily)
  // Logic: Total Tasks Today vs Completed Tasks Today
  const currentDay = new Date().getDay();
  const todayDateStr = new Date().toISOString().split('T')[0];
  
  const tasksToday = schedules.filter(s => s.day_of_week === currentDay);
  const completedToday = completions.filter(c => c.completed_at === todayDateStr && tasksToday.some(t => t.id === c.schedule_id));
  
  const completionPercentage = tasksToday.length > 0 
    ? Math.round((completedToday.length / tasksToday.length) * 100) 
    : 0;

  if (loading) {
     return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

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
          <div className="mb-8 flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {profile?.full_name?.split(' ')[0] || 'User'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                Monitor your time investments and manage temporal liabilities
                </p>
            </div>
            {!isEmpty && <ICSExport schedules={schedules} />}
          </div>

          {isEmpty ? (
             <div className="mb-8 p-6 bg-accent/20 rounded-xl border border-accent">
               <ScheduleCreator />
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Quick Stats Column */}
                 <div className="md:col-span-1 space-y-6">
                    <QuickStatsWidget completionPercentage={completionPercentage} />
                    <WeeklySummaryWidget schedules={schedules} />
                 </div>
                 
                 {/* Schedule Column */}
                 <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-semibold">Your Weekly Schedule</h2>
                    <WeeklyScheduleView schedules={schedules} completions={completions} />
                 </div>
             </div>
          )}

          {/* Original Dashboard Content (kept for context) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12 pt-12 border-t">
             <div className="lg:col-span-3">
                <h3 className="text-lg font-medium mb-4 text-muted-foreground">Legacy Views</h3>
             </div>
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
            
            <div className="lg:col-span-3">
               <WeeklyChart />
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
