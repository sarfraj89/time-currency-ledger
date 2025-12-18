import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Schedule = Database['public']['Tables']['schedules']['Row'];

export const ICSExport = ({ schedules }: { schedules: Schedule[] }) => {
  const generateICS = () => {
    // Basic ICS structure
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//TemporalFinance//NONSGML v1.0//EN\n";

    // Helper to get next occurrence of day_of_week (0-6)
    const getNextDay = (dayOfWeek: number, timeStr: string) => {
      const d = new Date();
      d.setDate(d.getDate() + (dayOfWeek + 7 - d.getDay()) % 7);
      const [hours, mins] = timeStr.split(':');
      d.setHours(parseInt(hours), parseInt(mins), 0);
      return d;
    };

    const formatDate = (date: Date) => {
       return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    schedules.forEach((event) => {
        const start = getNextDay(event.day_of_week, event.start_time);
        const end = getNextDay(event.day_of_week, event.end_time);

        icsContent += "BEGIN:VEVENT\n";
        icsContent += `DTSTART:${formatDate(start)}\n`;
        icsContent += `DTEND:${formatDate(end)}\n`;
        icsContent += `SUMMARY:${event.title}\n`;
        // Weekly recurrence
        icsContent += "RRULE:FREQ=WEEKLY\n"; 
        icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'my-schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button variant="outline" size="sm" onClick={generateICS} className="gap-2">
      <Download className="h-4 w-4" />
      Export Calendar
    </Button>
  );
};
