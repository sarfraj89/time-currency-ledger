import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Percent, Clock, Trash2, AlertTriangle, Briefcase, Palette } from 'lucide-react';
import { TopBar } from '@/components/temporal/TopBar';
import { TransactionDialog } from '@/components/temporal/TransactionDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const { toast } = useToast();
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [interestRate, setInterestRate] = useState([10]);
  const [pomodoroLength, setPomodoroLength] = useState('25');
  const [notifications, setNotifications] = useState(true);
  const [autoInterest, setAutoInterest] = useState(true);
  
  // New Preferences
  const [theme, setTheme] = useState("system");
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("17:00");

  useEffect(() => {
    // Load from Supabase
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('theme_preference, work_hours')
          .eq('id', user.id)
          .single();
        
        if (data) {
          if (data.theme_preference) setTheme(data.theme_preference);
          if (data.work_hours && typeof data.work_hours === 'object') {
            const wh = data.work_hours as any;
            if (wh.start) setWorkStart(wh.start);
            if (wh.end) setWorkEnd(wh.end);
          }
        }
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    // Local Save
    localStorage.setItem('temporal-settings', JSON.stringify({
      interestRate: interestRate[0],
      pomodoroLength,
      notifications,
      autoInterest,
    }));

    // Supabase Save
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('profiles').update({
          theme_preference: theme,
          work_hours: { start: workStart, end: workEnd }
        }).eq('id', user.id);

        if (error) throw error;
      }
      
      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated locally and in the cloud.',
      });
    } catch (error: any) {
      toast({
        title: 'Error saving to cloud',
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleClearData = () => {
    localStorage.removeItem('temporal-finance-entries');
    window.location.reload();
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <TopBar onNewTransaction={() => setTransactionOpen(true)} />

      <main className="flex-1 p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure your temporal finance parameters
            </p>
          </div>

          {/* Personalization Settings (New) */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Personalization
              </CardTitle>
              <CardDescription>
                Customize your dashboard appearance and schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme Preference</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                 <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <Label>Work Hours</Label>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Start</Label>
                        <Input type="time" value={workStart} onChange={(e) => setWorkStart(e.target.value)} />
                    </div>
                    <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">End</Label>
                        <Input type="time" value={workEnd} onChange={(e) => setWorkEnd(e.target.value)} />
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Interest Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-interest" />
                Interest Engine
              </CardTitle>
              <CardDescription>
                Configure how quickly your debts compound over time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Daily Interest Rate</Label>
                  <span className="text-sm font-mono text-interest">
                    {interestRate[0]}%
                  </span>
                </div>
                <Slider
                  value={interestRate}
                  onValueChange={setInterestRate}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Higher rates create urgency but may feel punishing. Default is 10%.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-calculate Interest</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically update accrued interest in real-time
                  </p>
                </div>
                <Switch
                  checked={autoInterest}
                  onCheckedChange={setAutoInterest}
                />
              </div>
            </CardContent>
          </Card>

          {/* Timer Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Liquidation Timer
              </CardTitle>
              <CardDescription>
                Configure your focus session parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pomodoro">Session Length (minutes)</Label>
                <Input
                  id="pomodoro"
                  type="number"
                  min="5"
                  max="90"
                  value={pomodoroLength}
                  onChange={(e) => setPomodoroLength(e.target.value)}
                  className="bg-card border-border/50 font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Standard Pomodoro is 25 minutes. Adjust based on your focus capacity.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Control how the app alerts you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive alerts when debt reaches critical levels
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="glass-card border-liability/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-liability">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions that affect your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="gap-2 border-liability/50 text-liability hover:bg-liability/10">
                    <Trash2 className="h-4 w-4" />
                    Clear All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-card border-border/50">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Declare Temporal Bankruptcy?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your transactions, debts, and assets. 
                      Your temporal portfolio will be reset to zero. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearData}
                      className="bg-liability hover:bg-liability/90"
                    >
                      Declare Bankruptcy
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="w-full gap-2 bg-primary hover:bg-primary/90"
          >
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </motion.div>
      </main>

      <TransactionDialog
        open={transactionOpen}
        onOpenChange={setTransactionOpen}
      />
    </div>
  );
}
