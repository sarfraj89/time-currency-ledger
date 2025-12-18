import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface QuickStatsProps {
  completionPercentage: number;
}

export const QuickStatsWidget = ({ completionPercentage }: QuickStatsProps) => {
  return (
    <Card className="bg-card/50 border-white/5 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Quick Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 rounded-xl bg-card border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground/80">Productivity Score</span>
                <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center gap-4">
                <Progress value={completionPercentage} className="h-2 bg-slate-800" indicatorClassName="bg-green-500" />
                <span className="text-sm font-bold text-white">{completionPercentage}%</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};
