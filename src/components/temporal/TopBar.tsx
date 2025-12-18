import { Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DebtCounter } from './DebtCounter';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface TopBarProps {
  onNewTransaction: () => void;
}

export function TopBar({ onNewTransaction }: TopBarProps) {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <DebtCounter />
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={onNewTransaction}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          <Plus className="h-4 w-4" />
          Log Transaction
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-liability" />
        </Button>
      </div>
    </header>
  );
}
