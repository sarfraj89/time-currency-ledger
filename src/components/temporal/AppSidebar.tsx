import { LayoutDashboard, BookOpen, Settings, Clock, TrendingUp } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navigation = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Ledger', url: '/ledger', icon: BookOpen },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 asset-glow">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground tracking-tight">Temporal Finance</h1>
            <p className="text-xs text-muted-foreground">Time Debt Tracker</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-widest text-muted-foreground/70 px-3 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        )}
                      >
                        <item.icon className={cn('h-4 w-4', isActive && 'text-primary')} />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs uppercase tracking-widest text-muted-foreground/70 px-3 mb-2">
            Quick Stats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="glass-card rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Productivity Score</span>
                <TrendingUp className="h-3 w-3 text-asset" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-primary to-asset" />
                </div>
                <span className="text-xs font-mono text-foreground">72%</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50">
            Compound Productivity™
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
