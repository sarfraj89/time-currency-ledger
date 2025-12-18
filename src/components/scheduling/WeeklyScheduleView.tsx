import { useState } from "react";
import { Database } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EditScheduleDialog } from "./EditScheduleDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Schedule = Database['public']['Tables']['schedules']['Row'];
type Completion = Database['public']['Tables']['task_completions']['Row'];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const WeeklyScheduleView = ({ schedules, completions = [] }: { schedules: Schedule[], completions?: Completion[] }) => {
  const currentDayOfWeek = new Date().getDay(); // 0-6
  const todayDateStr = new Date().toISOString().split('T')[0];
  
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Group by day
  const scheduleByDay = schedules.reduce((acc, curr) => {
    const day = curr.day_of_week;
    if (!acc[day]) acc[day] = [];
    acc[day].push(curr);
    return acc;
  }, {} as Record<number, Schedule[]>);

  const handleToggleComplete = async (scheduleId: string, isCompleted: boolean) => {
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) return;

     if (isCompleted) {
        // Mark as done
        const { error } = await supabase.from('task_completions').insert({
            user_id: user.id,
            schedule_id: scheduleId,
            completed_at: todayDateStr
        });
        if (error) toast.error("Failed to mark complete");
        else toast.success("Task completed!");
     } else {
        // Mark as incomplete (undo)
        const { error } = await supabase.from('task_completions')
            .delete()
            .eq('user_id', user.id)
            .eq('schedule_id', scheduleId)
            .eq('completed_at', todayDateStr);
        
        if (error) toast.error("Failed to undo");
     }
  };

  const handleEdit = (schedule: Schedule) => {
      setEditingSchedule(schedule);
      setEditOpen(true);
  };

  const handleDelete = async (id: string) => {
      const { error } = await supabase.from("schedules").delete().eq("id", id);
      if (error) toast.error("Failed to delete schedule");
      else toast.success("Schedule deleted");
  };

  const isCompletedToday = (scheduleId: string) => {
      return completions.some(c => c.schedule_id === scheduleId && c.completed_at === todayDateStr);
  };

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {DAYS.map((dayName, index) => {
        const isToday = index === currentDayOfWeek;
        return (
            <Card key={dayName} className={`h-full ${isToday ? 'border-primary ring-1 ring-primary/20' : ''}`}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg font-medium">{dayName}</CardTitle>
                {isToday && <Badge variant="default" className="text-[10px] h-5">TODAY</Badge>}
            </CardHeader>
            <CardContent className="space-y-2">
                {scheduleByDay[index]?.length > 0 ? (
                scheduleByDay[index].map((item) => {
                    const completed = isCompletedToday(item.id);
                    return (
                        <div key={item.id} className={`group relative p-2 rounded-md text-sm border flex items-start gap-2 transition-colors ${completed ? 'bg-primary/10 border-primary/20 opacity-70' : 'bg-secondary/50 border-border/50'}`}>
                            {isToday && (
                                <Checkbox 
                                    checked={completed} 
                                    onCheckedChange={(checked) => handleToggleComplete(item.id, checked as boolean)}
                                    className="mt-1 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                />
                            )}
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-semibold truncate ${completed ? 'line-through text-muted-foreground' : ''}`}>{item.title}</span>
                                    {item.category && <Badge variant="outline" className="text-xs h-5 px-1">{item.category}</Badge>}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                    {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
                                </div>
                            </div>
                            
                            {/* Actions - visible on hover */}
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-background/80 rounded p-0.5 backdrop-blur-sm">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(item)}>
                                    <Pencil className="h-3 w-3" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive">
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Schedule?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the recurring schedule "{item.title}".
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    );
                })
                ) : (
                <p className="text-xs text-muted-foreground italic">No tasks</p>
                )}
            </CardContent>
            </Card>
        );
      })}
    </div>

    <EditScheduleDialog 
        schedule={editingSchedule} 
        open={editOpen} 
        onOpenChange={setEditOpen} 
    />
    </>
  );
};
