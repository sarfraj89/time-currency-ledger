import { useForm, Controller } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const ScheduleCreator = () => {
  const { register, handleSubmit, reset, control } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Validate required fields explicitly if needed, though 'required' prop handles some
      if (!data.day_of_week || !data.category) {
        throw new Error("Please select a day and category");
      }

      const { error } = await supabase.from("schedules").insert({
        user_id: user.id,
        title: data.title,
        day_of_week: parseInt(data.day_of_week),
        start_time: data.start_time,
        end_time: data.end_time,
        category: data.category
      });

      if (error) throw error;
      
      toast.success("Schedule added!");
      reset();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto mt-10">
      <CardHeader>
        <CardTitle>Welcome! Let's set up your schedule.</CardTitle>
        <CardDescription>
          You don't have any schedules yet. Add your first weekly task to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input id="title" placeholder="e.g. Deep Work" required {...register("title")} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <Controller
                control={control}
                name="day_of_week"
                defaultValue=""
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                      <SelectItem value="0">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
             <div className="space-y-2">
              <Label>Category</Label>
              <Controller
                control={control}
                name="category"
                defaultValue=""
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input type="time" id="start_time" required {...register("start_time")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input type="time" id="end_time" required {...register("end_time")} />
            </div>
          </div>

          <Button type="submit" className="w-full">Create Schedule</Button>
        </form>
      </CardContent>
    </Card>
  );
};
