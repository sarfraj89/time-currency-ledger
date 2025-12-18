import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTemporalFinance } from '@/context/TemporalFinanceContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const formatTime = (mins: number) => {
      const hours = Math.floor(Math.abs(mins) / 60);
      const minutes = Math.abs(mins) % 60;
      return `${hours}h ${minutes}m`;
    };

    return (
      <div className="glass-card rounded-lg p-3 border border-border/50">
        <p className="text-xs font-medium text-foreground mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground capitalize">
                {entry.name === 'assets' ? 'Assets' : entry.name === 'debt' ? 'Debt' : 'Net Worth'}
              </span>
              <span
                className="text-xs font-mono font-medium"
                style={{ color: entry.color }}
              >
                {formatTime(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function WeeklyChart() {
  const { weeklySnapshots } = useTemporalFinance();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">7-Day Trend</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-asset" />
                <span className="text-xs text-muted-foreground">Assets</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-liability" />
                <span className="text-xs text-muted-foreground">Debt</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklySnapshots} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="assetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="debtGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(350, 89%, 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(350, 89%, 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(217, 33%, 17%)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }}
                  tickFormatter={(value) => `${Math.floor(value / 60)}h`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="assets"
                  stroke="hsl(160, 84%, 39%)"
                  strokeWidth={2}
                  fill="url(#assetGradient)"
                  name="assets"
                />
                <Area
                  type="monotone"
                  dataKey="debt"
                  stroke="hsl(350, 89%, 60%)"
                  strokeWidth={2}
                  fill="url(#debtGradient)"
                  name="debt"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
