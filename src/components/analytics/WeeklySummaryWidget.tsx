import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Database } from "@/integrations/supabase/types";

type Schedule = Database['public']['Tables']['schedules']['Row'];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const WeeklySummaryWidget = ({ schedules }: { schedules: Schedule[] }) => {
  // Calculate hours per day
  const data = DAYS.map((dayName, index) => {
    const daySchedules = schedules.filter(s => s.day_of_week === index);
    const totalHours = daySchedules.reduce((acc, curr) => {
      const start = parseInt(curr.start_time.split(':')[0]) + parseInt(curr.start_time.split(':')[1]) / 60;
      const end = parseInt(curr.end_time.split(':')[0]) + parseInt(curr.end_time.split(':')[1]) / 60;
      return acc + (end - start);
    }, 0);
    return { name: dayName, hours: totalHours };
  });

  const totalScheduled = data.reduce((acc, curr) => acc + curr.hours, 0);
  const totalFree = (24 * 7) - totalScheduled;
  const utilizationPercentage = Math.min(100, Math.round((totalScheduled / (24 * 7)) * 100));
  
  // Analysis Logic
  let analysisText = "";
  let scoreColor = "text-primary";
  
  if (utilizationPercentage < 10) {
    analysisText = "Low utilization. You have plenty of free time to allocate.";
    scoreColor = "text-blue-500";
  } else if (utilizationPercentage < 40) {
    analysisText = "Balanced. You are maintaining a healthy mix of work and leisure.";
    scoreColor = "text-green-500";
  } else if (utilizationPercentage < 70) {
    analysisText = "High productivity. You are making the most of your time!";
    scoreColor = "text-orange-500";
  } else {
    analysisText = "Overloaded? Make sure to schedule some breaks!";
    scoreColor = "text-red-500";
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Productivity Analysis</CardTitle>
        <CardDescription>Weekly time allocation score</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Score Section */}
        <div className="space-y-2">
            <div className="flex items-end justify-between">
                <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Time Utilization</span>
                    <div className={`text-4xl font-bold ${scoreColor}`}>
                        {utilizationPercentage}%
                    </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                    <span className="block">{totalScheduled.toFixed(1)}h Scheduled</span>
                    <span className="block">{totalFree.toFixed(1)}h Free</span>
                </div>
            </div>
            <Progress value={utilizationPercentage} className="h-2" />
            <p className="text-sm text-muted-foreground pt-1">
                {analysisText}
            </p>
        </div>

        {/* Chart Section */}
        <div className="h-[150px] w-full pt-4 border-t border-border/50">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} width={24}/>
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
              />
              <Bar dataKey="hours" fill="currentColor" radius={[2, 2, 0, 0]} className="fill-primary/60 hover:fill-primary" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

